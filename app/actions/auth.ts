"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignupFormSchema, LoginFormSchema, FormState } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

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
      return { message: "This username is already taken." };
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
  if (!user) {
    return { message: "Invalid username or password." };
  }

  const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordsMatch) {
    return { message: "Invalid username or password." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
