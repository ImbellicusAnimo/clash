import { prisma } from "@/lib/prisma";
import { PARTICIPATION_STATUS } from "@/lib/constants";

export type ClashMarker = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  dateTime: Date;
  venueTitle: string | null;
  participantCount: number;
};

export type VenueMarker = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  clashCount: number;
};

export type MapMarkers = {
  clashes: ClashMarker[];
  venues: VenueMarker[];
};

export async function getMapMarkers(): Promise<MapMarkers> {
  const [clashes, venues] = await Promise.all([
    prisma.clash.findMany({
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        dateTime: true,
        venue: { select: { title: true } },
        _count: {
          select: {
            participations: {
              where: { status: PARTICIPATION_STATUS.ACCEPTED },
            },
          },
        },
      },
      orderBy: { dateTime: "asc" },
    }),
    prisma.venue.findMany({
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        _count: { select: { clashes: true } },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return {
    clashes: clashes.map((c) => ({
      id: c.id,
      title: c.title,
      latitude: c.latitude,
      longitude: c.longitude,
      dateTime: c.dateTime,
      venueTitle: c.venue?.title ?? null,
      participantCount: c._count.participations,
    })),
    venues: venues.map((v) => ({
      id: v.id,
      title: v.title,
      latitude: v.latitude,
      longitude: v.longitude,
      clashCount: v._count.clashes,
    })),
  };
}
