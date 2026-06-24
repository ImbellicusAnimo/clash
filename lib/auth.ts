import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSessionUserId } from "./session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  createdAt: Date;
};

/**
 * Returns the currently authenticated user, or null.
 * Memoized per-request via React `cache`.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      createdAt: true,
    },
  });

  return user;
});

/** Requires an authenticated user, redirecting to /login otherwise. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
