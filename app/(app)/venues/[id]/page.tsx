import { notFound } from "next/navigation";
import Link from "next/link";
import { getVenue, getUser } from "@/lib/dal";
import { deleteVenue } from "@/app/actions/venue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [venue, user] = await Promise.all([getVenue(id), getUser()]);
  if (!venue) notFound();

  const isOwner = venue.ownerId === user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{venue.name}</h1>
          <p className="text-sm text-muted-foreground">
            {venue.address ? `${venue.address}, ` : ""}
            {venue.city}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/venues/${venue.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <form action={deleteVenue.bind(null, venue.id)}>
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </form>
          </div>
        )}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          lat {venue.lat}, lng {venue.lng}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {venue.owner.name} (@{venue.owner.username})
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Clashes at this venue <Badge variant="secondary">{venue.clashes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground">
            {venue.clashes.map((clash) => (
              <li key={clash.id}>
                <Link href={`/clashes/${clash.id}`} className="hover:underline">
                  {clash.title}
                </Link>{" "}
                — {clash.startAt.toLocaleString()}
              </li>
            ))}
            {venue.clashes.length === 0 && <li>No Clashes hosted here yet.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
