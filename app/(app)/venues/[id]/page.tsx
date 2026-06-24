import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, MapPin, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getVenueById } from "@/lib/data/venues";
import { getClashes } from "@/lib/data/clashes";
import { formatRelative } from "@/lib/format";
import { PageContainer } from "@/components/page";
import { Map } from "@/components/map/map";
import { UserAvatar } from "@/components/user-avatar";
import { ClashCard } from "@/components/clashes/clash-card";
import { EmptyState } from "@/components/empty-state";
import { DeleteVenueButton } from "@/components/venues/delete-venue-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);
  return { title: venue?.title ?? "Venue" };
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();

  const isCreator = venue.creatorId === user.id;
  const clashes = await getClashes({
    venueId: id,
    when: "all",
    sort: "soonest",
  });

  return (
    <PageContainer className="space-y-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
      >
        <Link href="/venues">
          <ArrowLeft className="size-4" />
          All venues
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {venue.title}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {venue.latitude.toFixed(5)}, {venue.longitude.toFixed(5)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild>
            <Link href={`/clashes/new?venue=${venue.id}`}>
              <CalendarPlus className="size-4" />
              Host a clash here
            </Link>
          </Button>
          {isCreator && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/venues/${venue.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <DeleteVenueButton
                venueId={venue.id}
                title={venue.title}
                clashCount={venue._count.clashes}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About this venue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {venue.description}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Clashes here ({clashes.length})
            </h2>
            {clashes.length === 0 ? (
              <EmptyState
                icon={CalendarPlus}
                title="No clashes here yet"
                description="Be the first to host something at this venue."
              >
                <Button asChild>
                  <Link href={`/clashes/new?venue=${venue.id}`}>
                    <CalendarPlus className="size-4" />
                    Host a clash here
                  </Link>
                </Button>
              </EmptyState>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {clashes.map((clash) => (
                  <ClashCard key={clash.id} clash={clash} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden py-0">
            <div className="h-56 w-full">
              <Map
                center={{ lat: venue.latitude, lng: venue.longitude }}
                zoom={15}
                point={{ lat: venue.latitude, lng: venue.longitude }}
                pointVariant="venue"
                interactive={false}
                scrollWheelZoom={false}
              />
            </div>
            <CardContent className="space-y-1 pb-5">
              <p className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-chart-2" />
                {venue.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {venue.latitude.toFixed(5)}, {venue.longitude.toFixed(5)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Added by</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/users/${venue.creator.id}`}
                className="flex items-center gap-3"
              >
                <UserAvatar
                  name={venue.creator.name}
                  avatar={venue.creator.avatar}
                  className="size-11"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{venue.creator.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelative(venue.createdAt)}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
