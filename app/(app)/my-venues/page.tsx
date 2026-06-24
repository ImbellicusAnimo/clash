import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyVenues } from "@/lib/data/venues";
import { PageContainer, PageHeader } from "@/components/page";
import { VenueCard } from "@/components/venues/venue-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My venues",
};

export default async function MyVenuesPage() {
  const user = await requireUser();
  const venues = await getMyVenues(user.id);

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="My venues" description="Places you've added.">
        <Button asChild>
          <Link href="/venues/new">
            <Plus className="size-4" />
            New venue
          </Link>
        </Button>
      </PageHeader>

      {venues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="You haven't added any venues"
          description="Add a place so you and others can host clashes there."
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
