import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Plus } from "lucide-react";
import { getClashes, type ClashSort, type ClashWhen } from "@/lib/data/clashes";
import { PageContainer, PageHeader } from "@/components/page";
import { ClashCard } from "@/components/clashes/clash-card";
import { ClashToolbar } from "@/components/clashes/clash-toolbar";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Clashes",
};

function str(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function ClashesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = str(sp.q);
  const when = (str(sp.when) ?? "upcoming") as ClashWhen;
  const sort = (str(sp.sort) ?? "soonest") as ClashSort;

  const clashes = await getClashes({ q, when, sort });

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Clashes"
        description="Discover what's happening around Berlin and join in."
      >
        <Button asChild>
          <Link href="/clashes/new">
            <Plus className="size-4" />
            New clash
          </Link>
        </Button>
      </PageHeader>

      <ClashToolbar />

      {clashes.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="No clashes found"
          description={
            q
              ? "Try a different search or widen your filters."
              : "Be the first to organise something — create a clash."
          }
        >
          <Button asChild>
            <Link href="/clashes/new">
              <Plus className="size-4" />
              New clash
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clashes.map((clash) => (
            <ClashCard key={clash.id} clash={clash} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
