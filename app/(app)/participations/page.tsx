import Link from "next/link";
import { getMyParticipations, getUser, MyParticipationItem } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ParticipationList({ items }: { items: MyParticipationItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing here.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li key={p.id} className="text-sm">
          <Link href={`/clashes/${p.clash.id}`} className="font-medium hover:underline">
            {p.clash.title}
          </Link>
          <p className="text-muted-foreground">
            {p.clash.startAt.toLocaleString()}
            {p.clash.venue ? ` — ${p.clash.venue.name}, ${p.clash.venue.city}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function ParticipationsPage() {
  const user = await getUser();
  const { going, awaiting, declined } = await getMyParticipations(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Participations</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Going <Badge variant="secondary">{going.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipationList items={going} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Awaiting Approval <Badge variant="secondary">{awaiting.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipationList items={awaiting} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Declined <Badge variant="secondary">{declined.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipationList items={declined} />
        </CardContent>
      </Card>
    </div>
  );
}
