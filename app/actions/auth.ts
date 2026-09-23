"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { SignupFormSchema, LoginFormSchema, FormState } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import {
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
  consumeRateLimit,
} from "@/lib/rate-limit";

// Precomputed bcrypt hash with no matching plaintext, used to keep login
// timing constant whether or not the username exists — otherwise a missing
// user (fast path, no bcrypt.compare) vs. a wrong password (slow path,
// bcrypt.compare) would be distinguishable by response time, leaking which
// usernames are registered.
const DUMMY_PASSWORD_HASH =
  "$2b$10$4wmJ7o5HbJ6rYkN/NzrK3e2bRd7aI0DNCu6Z9HX9A2zU/tcVbo68S";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const SIGNUP_MAX_ATTEMPTS = 5;
const SIGNUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function retryMessage(action: string, retryAfterSeconds: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Too many ${action} attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

async function clientIp() {
  const headersList = await headers();
  // Best-effort: only set when behind a proxy/load balancer that adds this
  // header. In local dev (no proxy) every request falls into one "unknown"
  // bucket — a known limitation, not a bug, for this demo's scope.
  return headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function signup(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, username, password } = validatedFields.data;

  const ip = await clientIp();
  const signupRateLimitKey = `signup:${ip}`;
  const signupRateLimit = consumeRateLimit(
    signupRateLimitKey,
    SIGNUP_MAX_ATTEMPTS,
    SIGNUP_WINDOW_MS
  );
  if (signupRateLimit.limited) {
    return { message: retryMessage("registration", signupRateLimit.retryAfterSeconds) };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: { username, name, passwordHash },
      select: { id: true },
    });
    userId = user.id;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      // Deliberately generic: confirming "this username is taken" turns
      // registration into an oracle for enumerating existing usernames.
      return { message: "Registration failed. Please try a different username." };
    }
    throw error;
  }

  await createSession(userId);
  redirect("/dashboard");
}

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { username, password } = validatedFields.data;

  const loginRateLimitKey = `login:${username.toLowerCase()}`;
  const loginRateLimit = isRateLimited(loginRateLimitKey, LOGIN_MAX_ATTEMPTS);
  if (loginRateLimit.limited) {
    return { message: retryMessage("login", loginRateLimit.retryAfterSeconds) };
  }

  const user = await prisma.user.findUnique({ where: { username } });

  // Always run bcrypt.compare, even when no user was found, so a missing
  // username and a wrong password take the same amount of time.
  const passwordsMatch = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH
  );

  if (!user || !passwordsMatch) {
    recordFailedAttempt(loginRateLimitKey, LOGIN_WINDOW_MS);
    return { message: "Invalid username or password." };
  }

  clearAttempts(loginRateLimitKey);
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
