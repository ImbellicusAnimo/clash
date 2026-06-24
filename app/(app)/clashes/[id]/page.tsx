import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getClashById } from "@/lib/data/clashes";
import { formatDateTime, formatRelative, isPastDate } from "@/lib/format";
import { PageContainer } from "@/components/page";
import { Map } from "@/components/map/map";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JoinLeaveControl } from "@/components/clashes/join-leave-control";
import { RequestActions } from "@/components/clashes/request-actions";
import { DeleteClashButton } from "@/components/clashes/delete-clash-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const clash = await getClashById(id);
  return { title: clash?.title ?? "Clash" };
}

function PersonRow({
  user,
  meta,
  action,
}: {
  user: { id: string; name: string; avatar: string | null };
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <Link
        href={`/users/${user.id}`}
        className="flex min-w-0 items-center gap-3"
      >
        <UserAvatar name={user.name} avatar={user.avatar} className="size-9" />
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          {meta && (
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          )}
        </div>
      </Link>
      {action}
    </li>
  );
}

export default async function ClashDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const clash = await getClashById(id);
  if (!clash) notFound();

  const isCreator = clash.creatorId === user.id;
  const myParticipation = clash.participations.find(
    (p) => p.userId === user.id,
  );
  const myStatus = (myParticipation?.status ?? "none") as
    | "none"
    | "pending"
    | "accepted"
    | "rejected";

  const past = isPastDate(clash.dateTime);
  const goingCount = clash.accepted.length + 1; // + host

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
          All clashes
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {clash.title}
            </h1>
            {past && <Badge variant="secondary">Past</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDateTime(clash.dateTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {clash.venue ? (
                <Link
                  href={`/venues/${clash.venue.id}`}
                  className="hover:text-foreground hover:underline"
                >
                  {clash.venue.title}
                </Link>
              ) : (
                "Custom location"
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              {goingCount} going
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isCreator ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/clashes/${clash.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <DeleteClashButton clashId={clash.id} title={clash.title} />
            </>
          ) : (
            !past && <JoinLeaveControl clashId={clash.id} status={myStatus} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About this clash</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {clash.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="going">
                <TabsList>
                  <TabsTrigger value="going">Going ({goingCount})</TabsTrigger>
                  {isCreator && (
                    <TabsTrigger value="requests">
                      Requests ({clash.pending.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="going">
                  <ul className="divide-y">
                    <PersonRow user={clash.creator} meta="Host" />
                    {clash.accepted.map((p) => (
                      <PersonRow
                        key={p.id}
                        user={p.user}
                        meta={`Joined ${formatRelative(p.createdAt)}`}
                      />
                    ))}
                  </ul>
                </TabsContent>

                {isCreator && (
                  <TabsContent value="requests">
                    {clash.pending.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No pending requests right now.
                      </p>
                    ) : (
                      <ul className="divide-y">
                        {clash.pending.map((p) => (
                          <PersonRow
                            key={p.id}
                            user={p.user}
                            meta={`Requested ${formatRelative(p.createdAt)}`}
                            action={<RequestActions participationId={p.id} />}
                          />
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden py-0">
            <div className="h-56 w-full">
              <Map
                center={{ lat: clash.latitude, lng: clash.longitude }}
                zoom={15}
                point={{ lat: clash.latitude, lng: clash.longitude }}
                pointVariant="clash"
                interactive={false}
                scrollWheelZoom={false}
              />
            </div>
            <CardContent className="space-y-2 pb-5">
              <p className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-primary" />
                {clash.venue ? clash.venue.title : "Custom location"}
              </p>
              <p className="text-xs text-muted-foreground">
                {clash.latitude.toFixed(5)}, {clash.longitude.toFixed(5)}
              </p>
              {clash.venue && (
                <Button asChild variant="outline" size="sm" className="mt-1">
                  <Link href={`/venues/${clash.venue.id}`}>View venue</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Host</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/users/${clash.creator.id}`}
                className="flex items-center gap-3"
              >
                <UserAvatar
                  name={clash.creator.name}
                  avatar={clash.creator.avatar}
                  className="size-11"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{clash.creator.name}</p>
                  {clash.creator.bio && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {clash.creator.bio}
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            Created {formatRelative(clash.createdAt)}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
