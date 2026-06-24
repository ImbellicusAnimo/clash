import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getVenueOptions } from "@/lib/data/clashes";
import { PageContainer, PageHeader } from "@/components/page";
import { ClashForm } from "@/components/clashes/clash-form";

export const metadata: Metadata = {
  title: "New clash",
};

function num(value: string | string[] | undefined): number | null {
  if (typeof value !== "string") return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function NewClashPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;
  const lat = num(sp.lat);
  const lng = num(sp.lng);
  const initialPoint = lat !== null && lng !== null ? { lat, lng } : null;
  const initialVenueId = str(sp.venue) ?? null;

  const venues = await getVenueOptions();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Create a clash"
        description="Set a time and place, then invite Berlin to join you."
      />
      <ClashForm
        mode="create"
        venues={venues}
        initialPoint={initialPoint}
        initialVenueId={initialVenueId}
      />
    </PageContainer>
  );
}
