import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { getVenues, type VenueSort } from "@/lib/data/venues";
import { PageContainer, PageHeader } from "@/components/page";
import { VenueCard } from "@/components/venues/venue-card";
import { VenueToolbar } from "@/components/venues/venue-toolbar";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Venues",
};

function str(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = str(sp.q);
  const sort = (str(sp.sort) ?? "name") as VenueSort;

  const venues = await getVenues({ q, sort });

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Venues"
        description="Places around Berlin where clashes happen."
      >
        <Button asChild>
          <Link href="/venues/new">
            <Plus className="size-4" />
            New venue
          </Link>
        </Button>
      </PageHeader>

      <VenueToolbar />

      {venues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No venues found"
          description={
            q
              ? "Try a different search."
              : "Add a place that clashes can call home."
          }
        >
          <Button asChild>
            <Link href="/venues/new">
              <Plus className="size-4" />
              New venue
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
