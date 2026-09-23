import Link from "next/link";
import { getVenues, VenueSortField, VenueSortDir } from "@/lib/dal";
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

const COLUMNS: { field: VenueSortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "city", label: "City" },
  { field: "clashesCount", label: "Clashes" },
];

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const sort = (
    COLUMNS.some((c) => c.field === params.sort) ? params.sort : "name"
  ) as VenueSortField;
  const dir = (params.dir === "desc" ? "desc" : "asc") as VenueSortDir;

  const venues = await getVenues({ search: q || undefined, sortBy: sort, sortDir: dir });

  function buildUrl(overrides: Partial<{ q: string; sort: VenueSortField; dir: VenueSortDir }>) {
    const next = new URLSearchParams();
    const nq = overrides.q ?? q;
    const nsort = overrides.sort ?? sort;
    const ndir = overrides.dir ?? dir;
    if (nq) next.set("q", nq);
    if (nsort !== "name") next.set("sort", nsort);
    if (ndir !== "asc") next.set("dir", ndir);
    const qs = next.toString();
    return qs ? `/venues?${qs}` : "/venues";
  }

  function sortHref(field: VenueSortField) {
    const nextDir: VenueSortDir = sort === field && dir === "asc" ? "desc" : "asc";
    return buildUrl({ sort: field, dir: nextDir });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Venues</h1>
        <Link href="/venues/new">
          <Button>New Venue</Button>
        </Link>
      </div>

      <form action="/venues" method="GET" className="flex gap-2">
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <Input type="search" name="q" placeholder="Search by name…" defaultValue={q} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

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
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell>
                <Link href={`/venues/${venue.id}`} className="hover:underline">
                  {venue.name}
                </Link>
              </TableCell>
              <TableCell>{venue.city}</TableCell>
              <TableCell>
                <Badge variant="secondary">{venue.clashesCount}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {venues.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No Venues found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
