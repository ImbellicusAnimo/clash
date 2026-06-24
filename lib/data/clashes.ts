import { prisma } from "@/lib/prisma";
import { PARTICIPATION_STATUS } from "@/lib/constants";

export type ClashWhen = "upcoming" | "past" | "all";
export type ClashSort = "soonest" | "newest" | "popular";

export type ClashListParams = {
  q?: string;
  when?: ClashWhen;
  sort?: ClashSort;
  creatorId?: string;
  venueId?: string;
};

const listSelect = {
  id: true,
  title: true,
  description: true,
  dateTime: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  creator: { select: { id: true, name: true, avatar: true } },
  venue: { select: { id: true, title: true } },
  _count: {
    select: {
      participations: { where: { status: PARTICIPATION_STATUS.ACCEPTED } },
    },
  },
} as const;

export async function getClashes(params: ClashListParams = {}) {
  const { q, when = "upcoming", sort = "soonest", creatorId, venueId } = params;
  const now = new Date();

  const where = {
    ...(creatorId ? { creatorId } : {}),
    ...(venueId ? { venueId } : {}),
    ...(when === "upcoming"
      ? { dateTime: { gte: now } }
      : when === "past"
        ? { dateTime: { lt: now } }
        : {}),
    ...(q
      ? {
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
        }
      : {}),
  };

  const orderBy =
    sort === "newest"
      ? { createdAt: "desc" as const }
      : sort === "popular"
        ? { participations: { _count: "desc" as const } }
        : { dateTime: "asc" as const };

  const clashes = await prisma.clash.findMany({
    where,
    select: listSelect,
    orderBy,
  });

  return clashes.map((c) => ({
    ...c,
    goingCount: c._count.participations,
  }));
}

export type ClashListItem = Awaited<ReturnType<typeof getClashes>>[number];

export async function getClashById(id: string) {
  const clash = await prisma.clash.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, avatar: true, bio: true } },
      venue: {
        select: { id: true, title: true, latitude: true, longitude: true },
      },
      participations: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!clash) return null;

  const accepted = clash.participations.filter(
    (p) => p.status === PARTICIPATION_STATUS.ACCEPTED,
  );
  const pending = clash.participations.filter(
    (p) => p.status === PARTICIPATION_STATUS.PENDING,
  );

  return { ...clash, accepted, pending };
}

export type ClashDetail = NonNullable<Awaited<ReturnType<typeof getClashById>>>;

export async function getMyClashes(userId: string) {
  return getClashes({ creatorId: userId, when: "all", sort: "soonest" });
}

/** Lightweight list of venues for use in clash forms. */
export async function getVenueOptions() {
  return prisma.venue.findMany({
    select: { id: true, title: true, latitude: true, longitude: true },
    orderBy: { title: "asc" },
  });
}

export type VenueOption = Awaited<ReturnType<typeof getVenueOptions>>[number];
