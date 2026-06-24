"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { venueSchema } from "@/lib/validation";
import { getFieldErrors, type FormState } from "@/lib/form";
import type { ActionResult } from "@/app/actions/clashes";

function parseVenueForm(formData: FormData) {
  return venueSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  });
}

function revalidateVenueViews(id?: string) {
  revalidatePath("/venues");
  revalidatePath("/map");
  revalidatePath("/my-venues");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/venues/${id}`);
}

export async function createVenue(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseVenueForm(formData);
  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const venue = await prisma.venue.create({
    data: {
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      creatorId: user.id,
    },
  });

  revalidateVenueViews(venue.id);
  redirect(`/venues/${venue.id}`);
}

export async function updateVenue(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing venue id." };

  const existing = await prisma.venue.findUnique({
    where: { id },
    select: { creatorId: true },
  });
  if (!existing) return { error: "Venue not found." };
  if (existing.creatorId !== user.id) {
    return { error: "You can only edit venues you created." };
  }

  const parsed = parseVenueForm(formData);
  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  await prisma.venue.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  revalidateVenueViews(id);
  redirect(`/venues/${id}`);
}

export async function deleteVenue(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const venue = await prisma.venue.findUnique({
    where: { id },
    select: { creatorId: true },
  });
  if (!venue) return { ok: false, error: "Venue not found." };
  if (venue.creatorId !== user.id) {
    return { ok: false, error: "You can only delete venues you created." };
  }

  // Clashes referencing this venue keep their coordinates (venueId set null).
  await prisma.venue.delete({ where: { id } });
  revalidateVenueViews(id);
  redirect("/venues");
}
