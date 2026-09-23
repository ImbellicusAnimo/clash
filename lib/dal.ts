import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const payload = await decrypt(session);

  if (!payload?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: payload.userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
});

export type ClashListFilter = "upcoming" | "past" | "all";
export type ClashSortField = "title" | "startAt" | "venue" | "host" | "requests";
export type ClashSortDir = "asc" | "desc";

const ACTIVE_PARTICIPATION_STATUSES = ["pending", "accepted"] as const;

export type ClashListItem = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date | null;
  venue: { id: string; name: string } | null;
  host: { id: string; name: string; username: string };
  requestsCount: number;
};

export const getClashes = cache(
  async (options: {
    search?: string;
    filter?: ClashListFilter;
    sortBy?: ClashSortField;
    sortDir?: ClashSortDir;
  }): Promise<ClashListItem[]> => {
    const { search, filter = "upcoming", sortBy = "startAt", sortDir = "asc" } = options;
    const now = new Date();

    const where: Prisma.ClashWhereInput = {
      ...(search ? { title: { contains: search } } : {}),
      ...(filter === "upcoming" ? { startAt: { gte: now } } : {}),
      ...(filter === "past" ? { startAt: { lt: now } } : {}),
    };

    const orderBy: Prisma.ClashOrderByWithRelationInput =
      sortBy === "venue"
        ? { venue: { name: sortDir } }
        : sortBy === "host"
          ? { host: { name: sortDir } }
          : sortBy === "title"
            ? { title: sortDir }
            : { startAt: sortDir };

    const clashes = await prisma.clash.findMany({
      where,
      orderBy,
      include: {
        venue: { select: { id: true, name: true } },
        host: { select: { id: true, name: true, username: true } },
        _count: {
          select: {
            participations: { where: { status: { in: [...ACTIVE_PARTICIPATION_STATUSES] } } },
          },
        },
      },
    });

    const items: ClashListItem[] = clashes.map((c) => ({
      id: c.id,
      title: c.title,
      startAt: c.startAt,
      endAt: c.endAt,
      venue: c.venue,
      host: c.host,
      requestsCount: c._count.participations,
    }));

    // Prisma can't `orderBy` a filtered relation count, so sort in memory for
    // this one field. Fine at this dataset size; a paginated/larger list
    // would need a different approach (e.g. a denormalized counter column).
    if (sortBy === "requests") {
      items.sort((a, b) =>
        sortDir === "asc" ? a.requestsCount - b.requestsCount : b.requestsCount - a.requestsCount
      );
    }

    return items;
  }
);

export type ClashDetail = Prisma.ClashGetPayload<{
  include: {
    venue: { select: { id: true; name: true; city: true; address: true; lat: true; lng: true } };
    host: { select: { id: true; name: true; username: true; avatarUrl: true } };
    participations: {
      where: { status: { in: ["pending", "accepted"] } };
      select: {
        id: true;
        status: true;
        user: { select: { id: true; name: true; username: true; avatarUrl: true } };
      };
    };
  };
}>;

export const getClash = cache(async (id: string): Promise<ClashDetail | null> => {
  return prisma.clash.findUnique({
    where: { id },
    include: {
      venue: { select: { id: true, name: true, city: true, address: true, lat: true, lng: true } },
      host: { select: { id: true, name: true, username: true, avatarUrl: true } },
      participations: {
        where: { status: { in: [...ACTIVE_PARTICIPATION_STATUSES] } },
        select: {
          id: true,
          status: true,
          user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        },
      },
    },
  });
});

export type VenueOption = { id: string; name: string; city: string; lat: number; lng: number };

/** Simple, unfiltered picker list — used by the Clash form's Venue select. */
export const getVenueOptions = cache(async (): Promise<VenueOption[]> => {
  return prisma.venue.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true, lat: true, lng: true },
  });
});

export type VenueSortField = "name" | "city" | "clashesCount";
export type VenueSortDir = "asc" | "desc";

export type VenueListItem = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  clashesCount: number;
};

export const getVenues = cache(
  async (options: {
    search?: string;
    sortBy?: VenueSortField;
    sortDir?: VenueSortDir;
  }): Promise<VenueListItem[]> => {
    const { search, sortBy = "name", sortDir = "asc" } = options;

    const where: Prisma.VenueWhereInput = search ? { name: { contains: search } } : {};

    // Unlike Clash's "requests" sort, this relation count has no `where`
    // filter, so Prisma's native `orderBy: { clashes: { _count } }` works
    // directly — no in-memory re-sort needed here.
    const orderBy: Prisma.VenueOrderByWithRelationInput =
      sortBy === "city"
        ? { city: sortDir }
        : sortBy === "clashesCount"
          ? { clashes: { _count: sortDir } }
          : { name: sortDir };

    const venues = await prisma.venue.findMany({
      where,
      orderBy,
      include: { _count: { select: { clashes: true } } },
    });

    return venues.map((v) => ({
      id: v.id,
      name: v.name,
      city: v.city,
      address: v.address,
      clashesCount: v._count.clashes,
    }));
  }
);

export type VenueDetail = Prisma.VenueGetPayload<{
  include: {
    owner: { select: { id: true; name: true; username: true } };
    clashes: {
      select: { id: true; title: true; startAt: true };
      orderBy: { startAt: "desc" };
    };
  };
}>;

export const getVenue = cache(async (id: string): Promise<VenueDetail | null> => {
  return prisma.venue.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, username: true } },
      clashes: {
        select: { id: true, title: true, startAt: true },
        orderBy: { startAt: "desc" },
      },
    },
  });
});

export type MapMarker = {
  id: string;
  kind: "venue" | "clash";
  label: string;
  lat: number;
  lng: number;
};

/** All Venues + upcoming Clashes, as plain serializable markers for the map. */
export const getMapMarkers = cache(async (): Promise<MapMarker[]> => {
  const [venues, clashes] = await Promise.all([
    prisma.venue.findMany({
      select: { id: true, name: true, lat: true, lng: true },
    }),
    prisma.clash.findMany({
      where: { startAt: { gte: new Date() } },
      select: { id: true, title: true, lat: true, lng: true },
    }),
  ]);

  return [
    ...venues.map((v) => ({ id: v.id, kind: "venue" as const, label: v.name, lat: v.lat, lng: v.lng })),
    ...clashes.map((c) => ({ id: c.id, kind: "clash" as const, label: c.title, lat: c.lat, lng: c.lng })),
  ];
});

export type MyParticipationItem = {
  id: string;
  status: string;
  clash: {
    id: string;
    title: string;
    startAt: Date;
    venue: { name: string; city: string } | null;
  };
};

/**
 * The current user's own Participations, grouped by status. `left` rows are
 * intentionally excluded — once a user has left a Clash there's nothing
 * left to show them about it.
 */
export const getMyParticipations = cache(
  async (
    userId: string
  ): Promise<{
    going: MyParticipationItem[];
    awaiting: MyParticipationItem[];
    declined: MyParticipationItem[];
  }> => {
    const participations = await prisma.participation.findMany({
      where: { userId, status: { in: ["pending", "accepted", "rejected"] } },
      include: {
        clash: {
          select: {
            id: true,
            title: true,
            startAt: true,
            venue: { select: { name: true, city: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      going: participations.filter((p) => p.status === "accepted"),
      awaiting: participations.filter((p) => p.status === "pending"),
      declined: participations.filter((p) => p.status === "rejected"),
    };
  }
);

export type NotificationItem = {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  clash: { id: string; title: string; venue: { name: string } | null } | null;
};

export const getNotifications = cache(async (userId: string): Promise<NotificationItem[]> => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      isRead: true,
      createdAt: true,
      clash: { select: { id: true, title: true, venue: { select: { name: true } } } },
    },
  });
});

export const getUnreadNotificationCount = cache(async (userId: string): Promise<number> => {
  return prisma.notification.count({ where: { userId, isRead: false } });
});
