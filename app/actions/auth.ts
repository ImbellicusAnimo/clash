"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignupFormSchema, LoginFormSchema, FormState } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

// Precomputed bcrypt hash with no matching plaintext, used to keep login
// timing constant whether or not the username exists — otherwise a missing
// user (fast path, no bcrypt.compare) vs. a wrong password (slow path,
// bcrypt.compare) would be distinguishable by response time, leaking which
// usernames are registered.
const DUMMY_PASSWORD_HASH =
  "$2b$10$4wmJ7o5HbJ6rYkN/NzrK3e2bRd7aI0DNCu6Z9HX9A2zU/tcVbo68S";

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

  const user = await prisma.user.findUnique({ where: { username } });

  // Always run bcrypt.compare, even when no user was found, so a missing
  // username and a wrong password take the same amount of time.
  const passwordsMatch = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH
  );

  if (!user || !passwordsMatch) {
    return { message: "Invalid username or password." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
