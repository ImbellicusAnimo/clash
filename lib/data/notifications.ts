import { prisma } from "@/lib/prisma";

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: {
      actor: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export type NotificationWithActor = Awaited<
  ReturnType<typeof getNotifications>
>[number];
