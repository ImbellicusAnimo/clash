import Link from "next/link";
import { getClashes, ClashListFilter, ClashSortField, ClashSortDir } from "@/lib/dal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const FILTERS: { value: ClashListFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

const COLUMNS: { field: ClashSortField; label: string }[] = [
  { field: "title", label: "Title" },
  { field: "startAt", label: "Start" },
  { field: "venue", label: "Venue" },
  { field: "host", label: "Host" },
  { field: "requests", label: "Requests" },
];

export default async function ClashesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const filter = (
    ["upcoming", "past", "all"].includes(params.filter ?? "") ? params.filter : "upcoming"
  ) as ClashListFilter;
  const sort = (
    COLUMNS.some((c) => c.field === params.sort) ? params.sort : "startAt"
  ) as ClashSortField;
  const dir = (params.dir === "desc" ? "desc" : "asc") as ClashSortDir;

  const clashes = await getClashes({ search: q || undefined, filter, sortBy: sort, sortDir: dir });

  function buildUrl(
    overrides: Partial<{ q: string; filter: ClashListFilter; sort: ClashSortField; dir: ClashSortDir }>
  ) {
    const next = new URLSearchParams();
    const nq = overrides.q ?? q;
    const nfilter = overrides.filter ?? filter;
    const nsort = overrides.sort ?? sort;
    const ndir = overrides.dir ?? dir;
    if (nq) next.set("q", nq);
    if (nfilter !== "upcoming") next.set("filter", nfilter);
    if (nsort !== "startAt") next.set("sort", nsort);
    if (ndir !== "asc") next.set("dir", ndir);
    const qs = next.toString();
    return qs ? `/clashes?${qs}` : "/clashes";
  }

  function sortHref(field: ClashSortField) {
    const nextDir: ClashSortDir = sort === field && dir === "asc" ? "desc" : "asc";
    return buildUrl({ sort: field, dir: nextDir });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clashes</h1>
        <Link href="/clashes/new">
          <Button>New Clash</Button>
        </Link>
      </div>

      <form action="/clashes" method="GET" className="flex gap-2">
        <input type="hidden" name="filter" value={filter} />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <Input type="search" name="q" placeholder="Search by title…" defaultValue={q} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f.value} href={buildUrl({ filter: f.value })}>
            <Button variant={filter === f.value ? "secondary" : "outline"} size="sm">
              {f.label}
            </Button>
          </Link>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((c) => (
              <TableHead key={c.field}>
                <Link href={sortHref(c.field)} className="flex items-center gap-1 hover:underline">
                  {c.label}
                  {sort === c.field && (dir === "asc" ? " ↑" : " ↓")}
                </Link>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clashes.map((clash) => (
            <TableRow key={clash.id}>
              <TableCell>
                <Link href={`/clashes/${clash.id}`} className="hover:underline">
                  {clash.title}
                </Link>
              </TableCell>
              <TableCell>{clash.startAt.toLocaleString()}</TableCell>
              <TableCell>{clash.venue?.name ?? "—"}</TableCell>
              <TableCell>{clash.host.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{clash.requestsCount}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {clashes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No Clashes found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
