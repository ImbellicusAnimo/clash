import { prisma } from "@/lib/prisma";

export type VenueSort = "name" | "popular" | "newest";

export type VenueListParams = {
  q?: string;
  sort?: VenueSort;
  creatorId?: string;
};

const listSelect = {
  id: true,
  title: true,
  description: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  creator: { select: { id: true, name: true, avatar: true } },
  _count: { select: { clashes: true } },
} as const;

export async function getVenues(params: VenueListParams = {}) {
  const { q, sort = "name", creatorId } = params;

  const where = {
    ...(creatorId ? { creatorId } : {}),
    ...(q
      ? {
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
        }
      : {}),
  };

  const orderBy =
    sort === "popular"
      ? { clashes: { _count: "desc" as const } }
      : sort === "newest"
        ? { createdAt: "desc" as const }
        : { title: "asc" as const };

  const venues = await prisma.venue.findMany({
    where,
    select: listSelect,
    orderBy,
  });

  return venues.map((v) => ({ ...v, clashCount: v._count.clashes }));
}

export type VenueListItem = Awaited<ReturnType<typeof getVenues>>[number];

export async function getVenueById(id: string) {
  return prisma.venue.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, avatar: true, bio: true } },
      _count: { select: { clashes: true } },
    },
  });
}

export type VenueDetail = NonNullable<Awaited<ReturnType<typeof getVenueById>>>;

export async function getMyVenues(userId: string) {
  return getVenues({ creatorId: userId, sort: "newest" });
}
