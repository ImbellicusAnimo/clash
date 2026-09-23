"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";

function revalidateNotifications() {
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

// Bare-form button actions (no client state to surface an error message
// to) — a notification a user doesn't own simply isn't marked read.
export async function markNotificationRead(id: string): Promise<void> {
  const user = await getUser();

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!notification || notification.userId !== user.id) return;

  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  revalidateNotifications();
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await getUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidateNotifications();
}
