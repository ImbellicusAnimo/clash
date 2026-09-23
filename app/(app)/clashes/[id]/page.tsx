import { notFound } from "next/navigation";
import Link from "next/link";
import { getClash, getUser } from "@/lib/dal";
import { deleteClash } from "@/app/actions/clash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EntityMap } from "@/components/map";

export default async function ClashDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [clash, user] = await Promise.all([getClash(id), getUser()]);
  if (!clash) notFound();

  const going = clash.participations.filter((p) => p.status === "accepted");
  const requests = clash.participations.filter((p) => p.status === "pending");
  const isHost = clash.hostId === user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{clash.title}</h1>
          <p className="text-sm text-muted-foreground">
            {clash.startAt.toLocaleString()}
            {clash.endAt ? ` – ${clash.endAt.toLocaleString()}` : ""}
          </p>
        </div>
        {isHost && (
          <div className="flex gap-2">
            <Link href={`/clashes/${clash.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <form action={deleteClash.bind(null, clash.id)}>
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </form>
          </div>
        )}
      </div>

      {clash.description && <p>{clash.description}</p>}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {clash.venue ? (
            <p>
              {clash.venue.name} — {clash.venue.address ?? ""} {clash.venue.city}
            </p>
          ) : (
            <p>
              lat {clash.lat}, lng {clash.lng}
            </p>
          )}
        </CardContent>
        <CardContent>
          <EntityMap
            markers={[
              {
                id: clash.id,
                kind: "clash",
                label: clash.title,
                lat: clash.lat,
                lng: clash.lng,
              },
            ]}
            className="h-64 w-full rounded-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Host</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {clash.host.name} (@{clash.host.username})
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              Going <Badge variant="secondary">{going.length}</Badge>
            </div>
            <ul className="text-sm text-muted-foreground">
              {going.map((p) => (
                <li key={p.id}>{p.user.name}</li>
              ))}
              {going.length === 0 && <li>No one yet.</li>}
            </ul>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              Requests <Badge variant="secondary">{requests.length}</Badge>
            </div>
            <ul className="text-sm text-muted-foreground">
              {requests.map((p) => (
                <li key={p.id}>{p.user.name}</li>
              ))}
              {requests.length === 0 && <li>No open requests.</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
