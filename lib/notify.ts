import "server-only";
import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: string;
  type: string;
  message: string;
  clashId?: string | null;
  venueId?: string | null;
  actorId?: string | null;
};

/**
 * Create an in-app notification. No-ops when the recipient is the actor
 * (users never get notified about their own actions).
 */
export async function createNotification(input: CreateNotificationInput) {
  if (input.actorId && input.actorId === input.userId) return;
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      clashId: input.clashId ?? null,
      venueId: input.venueId ?? null,
      actorId: input.actorId ?? null,
    },
  });
}
