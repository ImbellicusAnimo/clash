import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getVenueById } from "@/lib/data/venues";
import { PageContainer, PageHeader } from "@/components/page";
import { VenueForm } from "@/components/venues/venue-form";

export const metadata: Metadata = {
  title: "Edit venue",
};

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();
  if (venue.creatorId !== user.id) redirect(`/venues/${id}`);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Edit venue"
        description="Update the details for this place."
      />
      <VenueForm
        mode="edit"
        defaultValues={{
          id: venue.id,
          title: venue.title,
          description: venue.description,
          latitude: venue.latitude,
          longitude: venue.longitude,
        }}
      />
    </PageContainer>
  );
}
