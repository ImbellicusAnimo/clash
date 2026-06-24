import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getClashById, getVenueOptions } from "@/lib/data/clashes";
import { PageContainer, PageHeader } from "@/components/page";
import { ClashForm } from "@/components/clashes/clash-form";

export const metadata: Metadata = {
  title: "Edit clash",
};

export default async function EditClashPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const clash = await getClashById(id);
  if (!clash) notFound();
  if (clash.creatorId !== user.id) redirect(`/clashes/${id}`);

  const venues = await getVenueOptions();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Edit clash"
        description="Update the details and let participants know what changed."
      />
      <ClashForm
        mode="edit"
        venues={venues}
        defaultValues={{
          id: clash.id,
          title: clash.title,
          description: clash.description,
          dateTime: clash.dateTime,
          latitude: clash.latitude,
          longitude: clash.longitude,
          venueId: clash.venueId,
        }}
      />
    </PageContainer>
  );
}
