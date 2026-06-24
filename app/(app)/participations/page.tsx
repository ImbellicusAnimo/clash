import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getMyParticipations,
  type MyParticipation,
} from "@/lib/data/participations";
import { formatDateTime, isPastDate } from "@/lib/format";
import { PARTICIPATION_STATUS } from "@/lib/constants";
import { PageContainer, PageHeader } from "@/components/page";
import { EmptyState } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JoinLeaveControl } from "@/components/clashes/join-leave-control";

export const metadata: Metadata = {
  title: "My participations",
};

function ParticipationRow({ p }: { p: MyParticipation }) {
  const past = isPastDate(p.clash.dateTime);
  const status = p.status as "pending" | "accepted" | "rejected";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/clashes/${p.clash.id}`}
              className="font-semibold hover:underline"
            >
              {p.clash.title}
            </Link>
            {past && <Badge variant="secondary">Past</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDateTime(p.clash.dateTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {p.clash.venue ? p.clash.venue.title : "Custom location"}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 text-sm text-muted-foreground">
            <UserAvatar
              name={p.clash.creator.name}
              avatar={p.clash.creator.avatar}
              className="size-5"
            />
            <span>
              Hosted by{" "}
              <span className="text-foreground">{p.clash.creator.name}</span>
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {past ? (
            <Badge variant="outline" className="capitalize">
              {status}
            </Badge>
          ) : (
            <JoinLeaveControl clashId={p.clash.id} status={status} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: MyParticipation[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({items.length})
      </h2>
      <div className="space-y-3">
        {items.map((p) => (
          <ParticipationRow key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

export default async function ParticipationsPage() {
  const user = await requireUser();
  const participations = await getMyParticipations(user.id);

  const accepted = participations.filter(
    (p) => p.status === PARTICIPATION_STATUS.ACCEPTED,
  );
  const pending = participations.filter(
    (p) => p.status === PARTICIPATION_STATUS.PENDING,
  );
  const rejected = participations.filter(
    (p) => p.status === PARTICIPATION_STATUS.REJECTED,
  );

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="My participations"
        description="Clashes you've asked to join or been accepted into."
      />

      {participations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="You haven't joined anything yet"
          description="Find a clash that interests you and request to join."
        >
          <Button asChild>
            <Link href="/clashes">Browse clashes</Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          <Section title="Going" items={accepted} />
          <Section title="Awaiting approval" items={pending} />
          <Section title="Declined" items={rejected} />
        </>
      )}
    </PageContainer>
  );
}
