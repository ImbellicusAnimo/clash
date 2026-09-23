"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { SimpleActionState } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";

function revalidateClash(clashId: string) {
  revalidatePath("/clashes");
  revalidatePath(`/clashes/${clashId}`);
  revalidatePath("/participations");
  revalidatePath("/", "layout");
}

export async function joinClash(clashId: string): Promise<SimpleActionState> {
  const user = await getUser();

  const clash = await prisma.clash.findUnique({ where: { id: clashId }, select: { hostId: true } });
  if (!clash) notFound();
  if (clash.hostId === user.id) {
    return { message: "You can't join your own Clash." };
  }

  const existing = await prisma.participation.findUnique({
    where: { userId_clashId: { userId: user.id, clashId } },
    select: { status: true },
  });

  if (existing?.status === "accepted") {
    return { message: "You're already going to this Clash." };
  }
  if (existing?.status === "pending") {
    return { message: "Your request is already pending approval." };
  }

  await prisma.$transaction([
    prisma.participation.upsert({
      where: { userId_clashId: { userId: user.id, clashId } },
      create: { userId: user.id, clashId, status: "pending" },
      update: { status: "pending" },
    }),
    prisma.notification.create({
      data: { userId: clash.hostId, type: "join_request", clashId },
    }),
  ]);

  revalidateClash(clashId);
}

export async function leaveClash(clashId: string): Promise<SimpleActionState> {
  const user = await getUser();

  const existing = await prisma.participation.findUnique({
    where: { userId_clashId: { userId: user.id, clashId } },
    select: { status: true },
  });

  if (!existing || !["pending", "accepted"].includes(existing.status)) {
    return { message: "You have nothing to leave." };
  }

  await prisma.participation.update({
    where: { userId_clashId: { userId: user.id, clashId } },
    data: { status: "left" },
  });

  revalidateClash(clashId);
}

// Accept/Reject are only ever rendered as bare-form buttons on pending
// requests for the host (see the Clash detail page), so — like the
// existing deleteClash pattern — the authorization/state guards below are
// defense-in-depth only; there's no form to surface a message on.
async function decideParticipation(
  participationId: string,
  decision: "accepted" | "rejected"
): Promise<void> {
  const user = await getUser();

  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    select: { userId: true, clashId: true, status: true, clash: { select: { hostId: true } } },
  });
  if (!participation) notFound();
  if (participation.clash.hostId !== user.id) return;
  if (participation.status !== "pending") return;

  await prisma.$transaction([
    prisma.participation.update({
      where: { id: participationId },
      data: { status: decision },
    }),
    prisma.notification.create({
      data: {
        userId: participation.userId,
        type: decision === "accepted" ? "join_accepted" : "join_rejected",
        clashId: participation.clashId,
      },
    }),
  ]);

  revalidateClash(participation.clashId);
}

export async function acceptParticipation(participationId: string): Promise<void> {
  return decideParticipation(participationId, "accepted");
}

export async function rejectParticipation(participationId: string): Promise<void> {
  return decideParticipation(participationId, "rejected");
}
