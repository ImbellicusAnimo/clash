import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserById } from "@/lib/data/users";
import { getClashes } from "@/lib/data/clashes";
import { getVenues } from "@/lib/data/venues";
import { formatDate } from "@/lib/format";
import { PageContainer } from "@/components/page";
import { UserAvatar } from "@/components/user-avatar";
import { ClashCard } from "@/components/clashes/clash-card";
import { VenueCard } from "@/components/venues/venue-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getUserById(id);
  return { title: profile?.name ?? "Profile" };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireUser();
  const { id } = await params;
  const profile = await getUserById(id);
  if (!profile) notFound();

  const [clashes, venues] = await Promise.all([
    getClashes({ creatorId: id, when: "all", sort: "soonest" }),
    getVenues({ creatorId: id, sort: "newest" }),
  ]);

  return (
    <PageContainer className="space-y-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
      >
        <Link href="/clashes">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <UserAvatar
          name={profile.name}
          avatar={profile.avatar}
          className="size-20 text-xl"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.name}
            {profile.id === me.id && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (you)
              </span>
            )}
          </h1>
          {profile.bio && (
            <p className="max-w-prose text-sm text-muted-foreground">
              {profile.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {profile._count.clashes} clashes hosted
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {profile._count.venues} venues added
            </span>
            <span>Joined {formatDate(profile.createdAt)}</span>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Clashes hosted ({clashes.length})
        </h2>
        {clashes.length === 0 ? (
          <EmptyState
            title="No clashes yet"
            description={`${profile.name} hasn't hosted any clashes.`}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clashes.map((clash) => (
              <ClashCard key={clash.id} clash={clash} />
            ))}
          </div>
        )}
      </section>

      {venues.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Venues added ({venues.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
