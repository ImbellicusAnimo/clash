import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number, hour = 18): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.clash.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("Creating users...");
  const userSeeds = [
    { key: "alice", email: "alice@clash.app", name: "Alice Author" },
    { key: "ben", email: "ben@clash.app", name: "Ben Baker" },
    { key: "carla", email: "carla@clash.app", name: "Carla Chen" },
    { key: "dennis", email: "dennis@clash.app", name: "Dennis Duarte" },
    { key: "elena", email: "elena@clash.app", name: "Elena Fischer" },
    { key: "felix", email: "felix@clash.app", name: "Felix Gruber" },
    { key: "greta", email: "greta@clash.app", name: "Greta Hoffmann" },
    { key: "hannah", email: "hannah@clash.app", name: "Hannah Imhof" },
  ];

  const users: Record<string, Awaited<ReturnType<typeof prisma.user.create>>> = {};
  for (const u of userSeeds) {
    users[u.key] = await prisma.user.create({
      data: { email: u.email, name: u.name, passwordHash },
    });
  }

  console.log("Creating venues...");
  const venueSeeds = [
    { key: "yogaLoft", name: "Kreuzberg Yoga Loft", city: "Berlin", address: "Oranienstraße 25, Berlin", lat: 52.4996, lng: 13.4033, owner: "alice" },
    { key: "founders", name: "Founders Coworking Mitte", city: "Berlin", address: "Torstraße 12, Berlin", lat: 52.5244, lng: 13.4105, owner: "ben" },
    { key: "boardGameCafe", name: "Neukölln Board Game Café", city: "Berlin", address: "Weserstraße 40, Berlin", lat: 52.481, lng: 13.4359, owner: "felix" },
    { key: "sternschanze", name: "Sternschanze Café Nord", city: "Hamburg", address: "Schanzenstraße 5, Hamburg", lat: 53.5631, lng: 9.9636, owner: "dennis" },
    { key: "werksviertel", name: "Werksviertel Hub", city: "München", address: "Atelierstraße 8, München", lat: 48.129, lng: 11.6047, owner: "elena" },
  ];

  const venues: Record<string, Awaited<ReturnType<typeof prisma.venue.create>>> = {};
  for (const v of venueSeeds) {
    venues[v.key] = await prisma.venue.create({
      data: {
        name: v.name,
        city: v.city,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        ownerId: users[v.owner].id,
      },
    });
  }

  console.log("Creating clashes...");
  const clashSeeds: {
    key: string;
    title: string;
    description: string;
    host: string;
    venue: string | null;
    lat?: number;
    lng?: number;
    startAt: Date;
    endAt: Date | null;
  }[] = [
    { key: "yogaFlow", title: "Morning Yoga Flow", description: "Gentle vinyasa flow to start the day.", host: "alice", venue: "yogaLoft", startAt: daysFromNow(2, 8), endAt: daysFromNow(2, 9) },
    { key: "hackathon", title: "Hackathon Weekend", description: "48h build sprint, all stacks welcome.", host: "ben", venue: "founders", startAt: daysFromNow(10, 9), endAt: daysFromNow(12, 18) },
    { key: "boardGameNight", title: "Board Game Night: Catan & Co", description: "Bring your favorite board game.", host: "felix", venue: "boardGameCafe", startAt: daysFromNow(5, 19), endAt: daysFromNow(5, 23) },
    { key: "picnic", title: "Picnic & Frisbee in Görlitzer Park", description: "Casual picnic, bring snacks to share.", host: "carla", venue: null, lat: 52.495, lng: 13.446, startAt: daysFromNow(7, 14), endAt: daysFromNow(7, 17) },
    { key: "sunsetRun", title: "Sunset Run along the Spree", description: "5k easy pace along the river.", host: "greta", venue: null, lat: 52.5065, lng: 13.4426, startAt: daysFromNow(3, 19), endAt: null },
    { key: "salsa", title: "Salsa Dancing Evening", description: "Beginner-friendly salsa night.", host: "hannah", venue: "founders", startAt: daysFromNow(-14, 20), endAt: daysFromNow(-14, 23) },
    { key: "codingWorkshop", title: "Coding Workshop: Next.js App Router", description: "Hands-on workshop building with Next.js 16.", host: "ben", venue: "founders", startAt: daysFromNow(-30, 10), endAt: daysFromNow(-30, 16) },
    { key: "hamburgMeetup", title: "Hamburg Founders Meetup", description: "Networking for local founders.", host: "dennis", venue: "sternschanze", startAt: daysFromNow(15, 18), endAt: daysFromNow(15, 21) },
    { key: "muenchenMixer", title: "München Startup Mixer", description: "Drinks & pitches.", host: "elena", venue: "werksviertel", startAt: daysFromNow(20, 18), endAt: daysFromNow(20, 22) },
    { key: "bookClub", title: "Book Club: Sci-Fi Edition", description: "Discussing 'Project Hail Mary'.", host: "alice", venue: "yogaLoft", startAt: daysFromNow(-7, 19), endAt: daysFromNow(-7, 21) },
    { key: "chessTournament", title: "Chess Tournament", description: "Swiss-system, all levels welcome.", host: "felix", venue: "boardGameCafe", startAt: daysFromNow(-21, 14), endAt: daysFromNow(-21, 18) },
    { key: "photoWalk", title: "Street Photography Walk", description: "Golden hour walk through Tiergarten.", host: "hannah", venue: null, lat: 52.5145, lng: 13.3501, startAt: daysFromNow(1, 17), endAt: daysFromNow(1, 19) },
  ];

  const clashes: Record<string, Awaited<ReturnType<typeof prisma.clash.create>>> = {};
  for (const c of clashSeeds) {
    const venue = c.venue ? venues[c.venue] : null;
    clashes[c.key] = await prisma.clash.create({
      data: {
        title: c.title,
        description: c.description,
        lat: venue ? venue.lat : c.lat!,
        lng: venue ? venue.lng : c.lng!,
        startAt: c.startAt,
        endAt: c.endAt,
        venueId: venue ? venue.id : null,
        hostId: users[c.host].id,
      },
    });
  }

  console.log("Creating participations...");
  // Status distribution reflects a realistic mid-life app: mostly accepted,
  // a healthy queue of pending requests, a few rejections, and a couple of
  // self-exits ("left"). Host never participates in their own Clash.
  const participationSeeds: { clash: string; user: string; status: string }[] = [
    { clash: "yogaFlow", user: "ben", status: "accepted" },
    { clash: "yogaFlow", user: "carla", status: "accepted" },
    { clash: "yogaFlow", user: "dennis", status: "pending" },
    { clash: "yogaFlow", user: "elena", status: "rejected" },

    { clash: "hackathon", user: "alice", status: "accepted" },
    { clash: "hackathon", user: "carla", status: "accepted" },
    { clash: "hackathon", user: "felix", status: "accepted" },
    { clash: "hackathon", user: "greta", status: "pending" },
    { clash: "hackathon", user: "hannah", status: "pending" },

    { clash: "boardGameNight", user: "alice", status: "accepted" },
    { clash: "boardGameNight", user: "ben", status: "pending" },
    { clash: "boardGameNight", user: "dennis", status: "accepted" },

    { clash: "picnic", user: "alice", status: "accepted" },
    { clash: "picnic", user: "greta", status: "accepted" },
    { clash: "picnic", user: "hannah", status: "left" },

    { clash: "sunsetRun", user: "elena", status: "accepted" },
    { clash: "sunsetRun", user: "felix", status: "pending" },

    { clash: "salsa", user: "alice", status: "accepted" },
    { clash: "salsa", user: "ben", status: "accepted" },
    { clash: "salsa", user: "carla", status: "rejected" },

    { clash: "codingWorkshop", user: "dennis", status: "accepted" },
    { clash: "codingWorkshop", user: "elena", status: "accepted" },
    { clash: "codingWorkshop", user: "felix", status: "left" },

    { clash: "hamburgMeetup", user: "ben", status: "pending" },
    { clash: "hamburgMeetup", user: "carla", status: "accepted" },

    { clash: "muenchenMixer", user: "felix", status: "accepted" },
    { clash: "muenchenMixer", user: "greta", status: "pending" },
    { clash: "muenchenMixer", user: "hannah", status: "accepted" },

    { clash: "bookClub", user: "ben", status: "accepted" },
    { clash: "bookClub", user: "carla", status: "accepted" },
    { clash: "bookClub", user: "dennis", status: "rejected" },

    { clash: "chessTournament", user: "alice", status: "accepted" },
    { clash: "chessTournament", user: "elena", status: "left" },

    // Greta was previously rejected here and re-requested to join — the
    // existing row (unique per userId+clashId) is reset to "pending"
    // instead of a new row being created.
    { clash: "photoWalk", user: "greta", status: "pending" },
    { clash: "photoWalk", user: "ben", status: "pending" },
  ];

  for (const p of participationSeeds) {
    await prisma.participation.create({
      data: {
        clashId: clashes[p.clash].id,
        userId: users[p.user].id,
        status: p.status,
      },
    });
  }

  console.log("Creating notifications...");
  const randomRead = () => Math.random() > 0.5;
  let notificationCount = 0;

  // Join-request / accepted / rejected notifications, derived from each
  // participation's status (mirrors the trigger rules from the brief).
  for (const p of participationSeeds) {
    const clash = clashes[p.clash];
    if (p.status === "pending") {
      await prisma.notification.create({
        data: { userId: clash.hostId, type: "join_request", clashId: clash.id, isRead: false },
      });
      notificationCount++;
    } else if (p.status === "accepted") {
      await prisma.notification.create({
        data: { userId: users[p.user].id, type: "join_accepted", clashId: clash.id, isRead: randomRead() },
      });
      notificationCount++;
    } else if (p.status === "rejected") {
      await prisma.notification.create({
        data: { userId: users[p.user].id, type: "join_rejected", clashId: clash.id, isRead: randomRead() },
      });
      notificationCount++;
    }
  }

  // New-clash-at-venue notifications: only the venue owner is notified, and
  // only when they aren't the one hosting the Clash themselves.
  for (const c of clashSeeds) {
    if (!c.venue) continue;
    const venue = venues[c.venue];
    const clash = clashes[c.key];
    if (clash.hostId !== venue.ownerId) {
      await prisma.notification.create({
        data: { userId: venue.ownerId, type: "new_clash_at_venue", clashId: clash.id, venueId: venue.id, isRead: randomRead() },
      });
      notificationCount++;
    }
  }

  console.log(
    `Seed complete: ${userSeeds.length} users, ${venueSeeds.length} venues, ${clashSeeds.length} clashes, ${participationSeeds.length} participations, ${notificationCount} notifications.`
  );
  console.log("All sample users share the password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
