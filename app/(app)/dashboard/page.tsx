import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CalendarPlus,
  Check,
  MapPin,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatRelative } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/page";
import { ClashCard } from "@/components/clashes/clash-card";
import { VenueCard } from "@/components/venues/venue-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  join: UserPlus,
  accepted: Check,
  rejected: X,
  venue_clash: CalendarPlus,
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
      >
        <Link href={href}>
          {linkLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { upcomingClashes, popularVenues, recentActivity, stats } =
    await getDashboardData(user.id);

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across Berlin."
      >
        <Button asChild>
          <Link href="/clashes/new">
            <Sparkles className="size-4" />
            New clash
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Upcoming clashes"
          value={stats.upcomingCount}
        />
        <StatCard
          icon={Users}
          label="You're going to"
          value={stats.goingCount}
        />
        <StatCard
          icon={Sparkles}
          label="You're hosting"
          value={stats.hostingCount}
        />
        <StatCard
          icon={MapPin}
          label="Venues in Berlin"
          value={stats.venueCount}
        />
      </div>

      <section className="space-y-4">
        <SectionHeader
          title="Upcoming clashes"
          href="/clashes"
          linkLabel="Browse all"
        />
        {upcomingClashes.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing on the horizon"
            description="Be the first to start a clash in Berlin."
          >
            <Button asChild size="sm">
              <Link href="/clashes/new">Create a clash</Link>
            </Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcomingClashes.map((clash) => (
              <ClashCard key={clash.id} clash={clash} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <SectionHeader
            title="Popular venues"
            href="/venues"
            linkLabel="Browse all"
          />
          {popularVenues.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No venues yet"
              description="Add a spot on the map to host clashes."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {popularVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent activity
          </h2>
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="All quiet"
              description="Activity from your clashes shows up here."
            />
          ) : (
            <Card className="py-0">
              <CardContent className="p-0">
                <ul className="divide-y">
                  {recentActivity.map((n) => {
                    const Icon = ACTIVITY_ICONS[n.type] ?? Bell;
                    const href = n.clashId
                      ? `/clashes/${n.clashId}`
                      : n.venueId
                        ? `/venues/${n.venueId}`
                        : null;
                    const body = (
                      <div className="flex items-start gap-3 px-4 py-3">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Icon className="size-4" />
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-sm leading-snug">{n.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelative(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <li key={n.id}>
                        {href ? (
                          <Link
                            href={href}
                            className="block transition-colors hover:bg-accent/50"
                          >
                            {body}
                          </Link>
                        ) : (
                          body
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
