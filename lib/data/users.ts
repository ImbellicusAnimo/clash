import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      createdAt: true,
      _count: { select: { clashes: true, venues: true } },
    },
  });
}

export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUserById>>>;
