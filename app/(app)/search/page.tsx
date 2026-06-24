import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Search as SearchIcon,
  Zap,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { searchEverything } from "@/lib/data/search";
import { formatDate } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/page";
import { SearchInput } from "@/components/search/search-input";
import { UserAvatar } from "@/components/user-avatar";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchEverything(query) : null;

  const total = results
    ? results.clashes.length + results.venues.length + results.users.length
    : 0;

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <PageHeader
        title="Search"
        description="Find clashes, venues, and people across Berlin."
      />

      <SearchInput initialQuery={query} />

      {!results ? (
        <EmptyState
          icon={SearchIcon}
          title="Search Clash"
          description="Start typing to find clashes, venues, and people."
        />
      ) : total === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No results"
          description={`Nothing matched “${query}”. Try a different search.`}
        />
      ) : (
        <div className="space-y-8">
          {results.clashes.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Clashes
              </h2>
              <Card className="py-0">
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {results.clashes.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/clashes/${c.id}`}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Zap className="size-4" />
                          </span>
                          <span className="flex-1 truncate font-medium">
                            {c.title}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="size-3.5" />
                            {formatDate(c.dateTime)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}

          {results.venues.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Venues
              </h2>
              <Card className="py-0">
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {results.venues.map((v) => (
                      <li key={v.id}>
                        <Link
                          href={`/venues/${v.id}`}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Building2 className="size-4" />
                          </span>
                          <span className="flex-1 truncate font-medium">
                            {v.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}

          {results.users.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                People
              </h2>
              <Card className="py-0">
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {results.users.map((u) => (
                      <li key={u.id}>
                        <Link
                          href={`/users/${u.id}`}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                        >
                          <UserAvatar
                            name={u.name}
                            avatar={u.avatar}
                            className="size-9"
                          />
                          <span className="flex-1 truncate">
                            <span className="block truncate font-medium">
                              {u.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {u.email}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
