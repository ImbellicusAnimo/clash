import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageContainer, PageHeader } from "@/components/page";
import { VenueForm } from "@/components/venues/venue-form";

export const metadata: Metadata = {
  title: "New venue",
};

function num(value: string | string[] | undefined): number | null {
  if (typeof value !== "string") return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export default async function NewVenuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;
  const lat = num(sp.lat);
  const lng = num(sp.lng);
  const initialPoint = lat !== null && lng !== null ? { lat, lng } : null;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Add a venue"
        description="Mark a place on the map so clashes can be hosted there."
      />
      <VenueForm mode="create" initialPoint={initialPoint} />
    </PageContainer>
  );
}
