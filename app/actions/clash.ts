"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ClashFormSchema, ClashFormState } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";

function parseClashForm(formData: FormData) {
  return ClashFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    venueId: formData.get("venueId"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
  });
}

/** Resolves the authoritative lat/lng: copied from the Venue when linked, otherwise the submitted values. */
async function resolveCoordinates(venueId: string | undefined, lat: number, lng: number) {
  if (!venueId) return { lat, lng, venueId: undefined as string | undefined };
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true, lat: true, lng: true },
  });
  if (!venue) {
    return { error: "The selected venue no longer exists." as const };
  }
  return { lat: venue.lat, lng: venue.lng, venueId: venue.id };
}

export async function createClash(
  state: ClashFormState,
  formData: FormData
): Promise<ClashFormState> {
  const user = await getUser();
  const validatedFields = parseClashForm(formData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const { title, description, startAt, endAt, venueId, lat, lng } = validatedFields.data;

  const resolved = await resolveCoordinates(venueId, lat, lng);
  if ("error" in resolved) return { message: resolved.error };

  const clash = await prisma.clash.create({
    data: {
      title,
      description,
      startAt,
      endAt,
      lat: resolved.lat,
      lng: resolved.lng,
      venueId: resolved.venueId,
      hostId: user.id, // host is always the session user, never a form field
    },
    select: { id: true },
  });

  revalidatePath("/clashes");
  redirect(`/clashes/${clash.id}`);
}

export async function updateClash(
  id: string,
  state: ClashFormState,
  formData: FormData
): Promise<ClashFormState> {
  const user = await getUser();

  const existing = await prisma.clash.findUnique({ where: { id }, select: { hostId: true } });
  if (!existing) notFound();
  if (existing.hostId !== user.id) {
    return { message: "You are not authorized to edit this Clash." };
  }

  const validatedFields = parseClashForm(formData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const { title, description, startAt, endAt, venueId, lat, lng } = validatedFields.data;

  const resolved = await resolveCoordinates(venueId, lat, lng);
  if ("error" in resolved) return { message: resolved.error };

  await prisma.clash.update({
    where: { id },
    data: {
      title,
      description,
      startAt,
      endAt,
      lat: resolved.lat,
      lng: resolved.lng,
      venueId: resolved.venueId ?? null, // explicit null clears the FK when venue is removed
    },
  });

  revalidatePath("/clashes");
  revalidatePath(`/clashes/${id}`);
  redirect(`/clashes/${id}`);
}

export async function deleteClash(id: string) {
  const user = await getUser();

  const existing = await prisma.clash.findUnique({ where: { id }, select: { hostId: true } });
  if (!existing) notFound();
  if (existing.hostId !== user.id) {
    // Defense-in-depth only — the delete button is never rendered for non-hosts.
    redirect(`/clashes/${id}`);
  }

  await prisma.clash.delete({ where: { id } });

  revalidatePath("/clashes");
  redirect("/clashes");
}
