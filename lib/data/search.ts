import { prisma } from "@/lib/prisma";

export type SearchResults = {
  clashes: { id: string; title: string; dateTime: Date }[];
  venues: { id: string; title: string }[];
  users: { id: string; name: string; email: string; avatar: string | null }[];
};

/** Global search across clashes, venues, and users. SQLite LIKE is
 * case-insensitive for ASCII, so `contains` suffices. */
export async function searchEverything(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 1) {
    return { clashes: [], venues: [], users: [] };
  }

  const [clashes, venues, users] = await Promise.all([
    prisma.clash.findMany({
      where: { title: { contains: q } },
      select: { id: true, title: true, dateTime: true },
      orderBy: { dateTime: "asc" },
      take: 6,
    }),
    prisma.venue.findMany({
      where: { title: { contains: q } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
      take: 6,
    }),
    prisma.user.findMany({
      where: {
        OR: [{ name: { contains: q } }, { email: { contains: q } }],
      },
      select: { id: true, name: true, email: true, avatar: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
  ]);

  return { clashes, venues, users };
}
