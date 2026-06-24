import { prisma } from "@/lib/prisma";
import { getClashes } from "@/lib/data/clashes";
import { getVenues } from "@/lib/data/venues";
import { getNotifications } from "@/lib/data/notifications";
import { PARTICIPATION_STATUS } from "@/lib/constants";

export async function getDashboardData(userId: string) {
  const now = new Date();

  const [
    upcomingClashes,
    popularVenues,
    recentActivity,
    upcomingCount,
    venueCount,
    hostingCount,
    goingCount,
  ] = await Promise.all([
    getClashes({ when: "upcoming", sort: "soonest" }).then((c) =>
      c.slice(0, 6),
    ),
    getVenues({ sort: "popular" }).then((v) => v.slice(0, 4)),
    getNotifications(userId).then((n) => n.slice(0, 6)),
    prisma.clash.count({ where: { dateTime: { gte: now } } }),
    prisma.venue.count(),
    prisma.clash.count({
      where: { creatorId: userId, dateTime: { gte: now } },
    }),
    prisma.participation.count({
      where: {
        userId,
        status: PARTICIPATION_STATUS.ACCEPTED,
        clash: { dateTime: { gte: now } },
      },
    }),
  ]);

  return {
    upcomingClashes,
    popularVenues,
    recentActivity,
    stats: { upcomingCount, venueCount, hostingCount, goingCount },
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
