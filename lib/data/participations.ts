import { prisma } from "@/lib/prisma";

export async function getMyParticipations(userId: string) {
  const participations = await prisma.participation.findMany({
    where: { userId },
    include: {
      clash: {
        select: {
          id: true,
          title: true,
          dateTime: true,
          latitude: true,
          longitude: true,
          venue: { select: { id: true, title: true } },
          creator: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
    orderBy: { clash: { dateTime: "asc" } },
  });

  return participations;
}

export type MyParticipation = Awaited<
  ReturnType<typeof getMyParticipations>
>[number];
