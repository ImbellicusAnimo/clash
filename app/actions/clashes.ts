"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { clashSchema } from "@/lib/validation";
import { getFieldErrors, type FormState } from "@/lib/form";
import { createNotification } from "@/lib/notify";
import { NOTIFICATION_TYPE, PARTICIPATION_STATUS } from "@/lib/constants";

export type ActionResult = { ok: boolean; error?: string };

function parseClashForm(formData: FormData) {
  return clashSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    dateTime: formData.get("dateTime"),
    venueId: formData.get("venueId"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  });
}

function revalidateClashViews(id?: string) {
  revalidatePath("/clashes");
  revalidatePath("/map");
  revalidatePath("/my-clashes");
  revalidatePath("/participations");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/clashes/${id}`);
}

export async function createClash(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseClashForm(formData);
  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error) };
  }

  const data = parsed.data;

  // If attached to a venue, ensure it exists.
  const venueId = data.venueId;
  if (venueId) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true, title: true, creatorId: true },
    });
    if (!venue) {
      return { fieldErrors: { venueId: "That venue no longer exists." } };
    }
  }

  const clash = await prisma.clash.create({
    data: {
      title: data.title,
      description: data.description,
      dateTime: data.dateTime,
      latitude: data.latitude,
      longitude: data.longitude,
      venueId: venueId ?? null,
      creatorId: user.id,
    },
    include: { venue: { select: { title: true, creatorId: true } } },
  });

  if (clash.venue && clash.venueId) {
    await createNotification({
      userId: clash.venue.creatorId,
      actorId: user.id,
      type: NOTIFICATION_TYPE.VENUE_CLASH,
      message: `${user.name} scheduled "${clash.title}" at your venue ${clash.venue.title}.`,
      clashId: clash.id,
      venueId: clash.venueId,
    });
  }

  revalidateClashViews(clash.id);
  redirect(`/clashes/${clash.id}`);
}

export async function updateClash(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing clash id." };

  const existing = await prisma.clash.findUnique({
    where: { id },
    select: { creatorId: true },
  });
  if (!existing) return { error: "Clash not found." };
  if (existing.creatorId !== user.id) {
    return { error: "You can only edit clashes you created." };
  }

  const parsed = parseClashForm(formData);
  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  if (data.venueId) {
    const venue = await prisma.venue.findUnique({
      where: { id: data.venueId },
      select: { id: true },
    });
    if (!venue) {
      return { fieldErrors: { venueId: "That venue no longer exists." } };
    }
  }

  await prisma.clash.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      dateTime: data.dateTime,
      latitude: data.latitude,
      longitude: data.longitude,
      venueId: data.venueId ?? null,
    },
  });

  revalidateClashViews(id);
  redirect(`/clashes/${id}`);
}

export async function deleteClash(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const clash = await prisma.clash.findUnique({
    where: { id },
    select: { creatorId: true },
  });
  if (!clash) return { ok: false, error: "Clash not found." };
  if (clash.creatorId !== user.id) {
    return { ok: false, error: "You can only delete clashes you created." };
  }

  await prisma.clash.delete({ where: { id } });
  revalidateClashViews(id);
  redirect("/clashes");
}

export async function joinClash(clashId: string): Promise<ActionResult> {
  const user = await requireUser();
  const clash = await prisma.clash.findUnique({
    where: { id: clashId },
    select: { id: true, title: true, creatorId: true },
  });
  if (!clash) return { ok: false, error: "Clash not found." };
  if (clash.creatorId === user.id) {
    return { ok: false, error: "You host this clash — you're already in." };
  }

  const existing = await prisma.participation.findUnique({
    where: { clashId_userId: { clashId, userId: user.id } },
  });
  if (existing) {
    return { ok: false, error: "You've already requested to join this clash." };
  }

  await prisma.participation.create({
    data: {
      clashId,
      userId: user.id,
      status: PARTICIPATION_STATUS.PENDING,
    },
  });

  await createNotification({
    userId: clash.creatorId,
    actorId: user.id,
    type: NOTIFICATION_TYPE.JOIN,
    message: `${user.name} asked to join "${clash.title}".`,
    clashId: clash.id,
  });

  revalidateClashViews(clashId);
  return { ok: true };
}

export async function leaveClash(clashId: string): Promise<ActionResult> {
  const user = await requireUser();
  const participation = await prisma.participation.findUnique({
    where: { clashId_userId: { clashId, userId: user.id } },
  });
  if (!participation) {
    return { ok: false, error: "You're not part of this clash." };
  }

  await prisma.participation.delete({ where: { id: participation.id } });
  revalidateClashViews(clashId);
  return { ok: true };
}

async function reviewRequest(
  participationId: string,
  decision:
    | typeof PARTICIPATION_STATUS.ACCEPTED
    | typeof PARTICIPATION_STATUS.REJECTED,
): Promise<ActionResult> {
  const user = await requireUser();
  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    include: {
      clash: { select: { id: true, title: true, creatorId: true } },
      user: { select: { id: true, name: true } },
    },
  });
  if (!participation) return { ok: false, error: "Request not found." };
  if (participation.clash.creatorId !== user.id) {
    return { ok: false, error: "Only the host can review requests." };
  }
  if (participation.status !== PARTICIPATION_STATUS.PENDING) {
    return { ok: false, error: "This request has already been reviewed." };
  }

  await prisma.participation.update({
    where: { id: participationId },
    data: { status: decision },
  });

  await createNotification({
    userId: participation.userId,
    actorId: user.id,
    type:
      decision === PARTICIPATION_STATUS.ACCEPTED
        ? NOTIFICATION_TYPE.ACCEPTED
        : NOTIFICATION_TYPE.REJECTED,
    message:
      decision === PARTICIPATION_STATUS.ACCEPTED
        ? `${user.name} accepted you into "${participation.clash.title}".`
        : `${user.name} declined your request to join "${participation.clash.title}".`,
    clashId: participation.clash.id,
  });

  revalidateClashViews(participation.clash.id);
  return { ok: true };
}

export async function acceptRequest(participationId: string) {
  return reviewRequest(participationId, PARTICIPATION_STATUS.ACCEPTED);
}

export async function rejectRequest(participationId: string) {
  return reviewRequest(participationId, PARTICIPATION_STATUS.REJECTED);
}
