import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyClashes } from "@/lib/data/clashes";
import { isPastDate } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/page";
import { ClashCard } from "@/components/clashes/clash-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import type { ClashListItem } from "@/lib/data/clashes";

export const metadata: Metadata = {
  title: "My clashes",
};

function Section({
  title,
  clashes,
}: {
  title: string;
  clashes: ClashListItem[];
}) {
  if (clashes.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({clashes.length})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clashes.map((clash) => (
          <ClashCard key={clash.id} clash={clash} />
        ))}
      </div>
    </section>
  );
}

export default async function MyClashesPage() {
  const user = await requireUser();
  const clashes = await getMyClashes(user.id);
  const upcoming = clashes.filter((c) => !isPastDate(c.dateTime));
  const past = clashes.filter((c) => isPastDate(c.dateTime));

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="My clashes" description="Clashes you're hosting.">
        <Button asChild>
          <Link href="/clashes/new">
            <Plus className="size-4" />
            New clash
          </Link>
        </Button>
      </PageHeader>

      {clashes.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="You haven't hosted anything yet"
          description="Create your first clash and bring people together."
        >
          <Button asChild>
            <Link href="/clashes/new">
              <Plus className="size-4" />
              New clash
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          <Section title="Upcoming" clashes={upcoming} />
          <Section title="Past" clashes={past} />
        </>
      )}
    </PageContainer>
  );
}
