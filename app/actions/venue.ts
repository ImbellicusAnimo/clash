"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { VenueFormSchema, VenueFormState } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";

function parseVenueForm(formData: FormData) {
  return VenueFormSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    address: formData.get("address"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
  });
}

export async function createVenue(
  state: VenueFormState,
  formData: FormData
): Promise<VenueFormState> {
  const user = await getUser();
  const validatedFields = parseVenueForm(formData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const { name, city, address, lat, lng } = validatedFields.data;

  const venue = await prisma.venue.create({
    data: { name, city, address, lat, lng, ownerId: user.id },
    select: { id: true },
  });

  revalidatePath("/venues");
  redirect(`/venues/${venue.id}`);
}

export async function updateVenue(
  id: string,
  state: VenueFormState,
  formData: FormData
): Promise<VenueFormState> {
  const user = await getUser();

  const existing = await prisma.venue.findUnique({ where: { id }, select: { ownerId: true } });
  if (!existing) notFound();
  if (existing.ownerId !== user.id) {
    return { message: "You are not authorized to edit this Venue." };
  }

  const validatedFields = parseVenueForm(formData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const { name, city, address, lat, lng } = validatedFields.data;

  await prisma.venue.update({
    where: { id },
    data: { name, city, address, lat, lng },
  });

  revalidatePath("/venues");
  revalidatePath(`/venues/${id}`);
  redirect(`/venues/${id}`);
}

export async function deleteVenue(id: string) {
  const user = await getUser();

  const existing = await prisma.venue.findUnique({ where: { id }, select: { ownerId: true } });
  if (!existing) notFound();
  if (existing.ownerId !== user.id) {
    // Defense-in-depth only — the delete button is never rendered for non-owners.
    redirect(`/venues/${id}`);
  }

  // Clashes linked to this venue keep their own copied lat/lng and just
  // lose the link (Clash.venueId onDelete: SetNull) — they are not deleted.
  await prisma.venue.delete({ where: { id } });

  revalidatePath("/venues");
  redirect("/venues");
}
