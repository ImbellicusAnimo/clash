import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbFile = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbFile}` });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = "test";

const users = [
  {
    name: "Anna Schmidt",
    email: "anna.schmidt@example.com",
    bio: "Frontend engineer who loves React, maps, and flat whites. Always up for a hacknight.",
  },
  {
    name: "Lukas Müller",
    email: "lukas.mueller@example.com",
    bio: "Backend developer and open-source maintainer. Berlin by way of Munich.",
  },
  {
    name: "Sophie Weber",
    email: "sophie.weber@example.com",
    bio: "Product designer focused on delightful, accessible interfaces.",
  },
  {
    name: "Max Fischer",
    email: "max.fischer@example.com",
    bio: null,
  },
  {
    name: "Emma Wagner",
    email: "emma.wagner@example.com",
    bio: "Data scientist exploring geospatial machine learning.",
  },
  {
    name: "Leon Becker",
    email: "leon.becker@example.com",
    bio: "Startup founder, coffee enthusiast, and weekend cyclist.",
  },
  {
    name: "Mia Hoffmann",
    email: "mia.hoffmann@example.com",
    bio: null,
  },
  {
    name: "Noah Schneider",
    email: "noah.schneider@example.com",
    bio: "Computer vision researcher. I build things that see.",
  },
];

const venues = [
  {
    title: "Tempelhofer Feld",
    description:
      "A vast former airfield turned public park — endless open space for picnics, kites, and large gatherings.",
    latitude: 52.473,
    longitude: 13.403,
  },
  {
    title: "Mauerpark",
    description:
      "Popular public park famous for its Sunday flea market and open-air karaoke.",
    latitude: 52.5419,
    longitude: 13.4029,
  },
  {
    title: "Holzmarkt 25",
    description:
      "A creative riverside community on the Spree with workshops, a club, and event spaces.",
    latitude: 52.5103,
    longitude: 13.4267,
  },
  {
    title: "Silent Green",
    description:
      "A cultural venue inside a former crematorium, hosting concerts, talks, and exhibitions.",
    latitude: 52.5503,
    longitude: 13.364,
  },
  {
    title: "MotionLab Berlin",
    description:
      "A hardware and innovation hub with maker spaces, prototyping labs, and event halls.",
    latitude: 52.488,
    longitude: 13.469,
  },
  {
    title: "Factory Berlin",
    description:
      "A startup campus and community bringing together founders, makers, and creatives.",
    latitude: 52.4995,
    longitude: 13.44,
  },
  {
    title: "Futurium",
    description:
      "A museum and event venue dedicated to the future — science, technology, and society.",
    latitude: 52.5258,
    longitude: 13.377,
  },
  {
    title: "Urban Spree",
    description:
      "A creative event location for art, music, and culture along the Spree in Friedrichshain.",
    latitude: 52.5075,
    longitude: 13.449,
  },
];

// title -> venue title; offsets in days/hours from now.
// A few entries use a negative inDays on purpose, so seed data always has a
// mix of past and upcoming clashes and both UI states render out of the box.
const clashes = [
  {
    title: "Open Source Hacknight",
    description:
      "Casual evening of contributing to open-source together. All experience levels welcome.",
    venue: "Holzmarkt 25",
    inDays: -18,
    hour: 18,
  },
  {
    title: "Berlin Data Science Clash",
    description:
      "Talks and discussions on data science, ML pipelines, and analytics in production.",
    venue: "Silent Green",
    inDays: -9,
    hour: 19,
  },
  {
    title: "Summer Picnic at Tempelhofer Feld",
    description:
      "A relaxed community picnic on the field, with snacks, frisbees, and good vibes.",
    venue: "Tempelhofer Feld",
    inDays: -3,
    hour: 14,
  },
  {
    title: "React Berlin Clash",
    description:
      "Monthly meetup for the Berlin React community. Talks on Server Components, performance, and more.",
    venue: "Factory Berlin",
    inDays: 3,
    hour: 19,
  },
  {
    title: "AI Builders Clash",
    description:
      "Hands-on sessions for people building with LLMs and agents. Bring your projects and questions.",
    venue: "MotionLab Berlin",
    inDays: 5,
    hour: 18,
  },
  {
    title: "Startup Networking Clash",
    description:
      "Meet founders, operators, and investors from the Berlin startup ecosystem.",
    venue: "Factory Berlin",
    inDays: 9,
    hour: 19,
  },
  {
    title: "Computer Vision Clash",
    description:
      "Deep dive into modern computer vision: detection, segmentation, and real-time inference.",
    venue: "Futurium",
    inDays: 12,
    hour: 18,
  },
  {
    title: "Geospatial Community Clash",
    description:
      "For everyone working with maps, GIS, and location data. OpenStreetMap, PostGIS, and beyond.",
    venue: "MotionLab Berlin",
    inDays: 17,
    hour: 18,
  },
  {
    title: "Urban Spree Sessions",
    description:
      "An evening of casual demos and lightning talks from the local dev scene, hosted at Urban Spree.",
    venue: "Urban Spree",
    inDays: 21,
    hour: 20,
  },
];

function daysFromNow(days: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Clearing existing data…");
  await prisma.notification.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.clash.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users…");
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        bio: u.bio,
      },
    });
    createdUsers.push(user);
  }
  const userByEmail = Object.fromEntries(createdUsers.map((u) => [u.email, u]));

  console.log("Creating venues…");
  const createdVenues = [];
  for (let i = 0; i < venues.length; i++) {
    const v = venues[i];
    const creator = createdUsers[i % createdUsers.length];
    const venue = await prisma.venue.create({
      data: {
        title: v.title,
        description: v.description,
        latitude: v.latitude,
        longitude: v.longitude,
        creatorId: creator.id,
      },
    });
    createdVenues.push(venue);
  }
  const venueByTitle = Object.fromEntries(
    createdVenues.map((v) => [v.title, v]),
  );

  console.log("Creating clashes…");
  const createdClashes = [];
  for (let i = 0; i < clashes.length; i++) {
    const c = clashes[i];
    const venue = venueByTitle[c.venue];
    const creator = createdUsers[(i + 2) % createdUsers.length];
    const clash = await prisma.clash.create({
      data: {
        title: c.title,
        description: c.description,
        dateTime: daysFromNow(c.inDays, c.hour),
        latitude: venue.latitude,
        longitude: venue.longitude,
        venueId: venue.id,
        creatorId: creator.id,
      },
    });
    createdClashes.push(clash);
  }

  console.log("Creating participations…");
  const statuses = ["accepted", "pending", "rejected"] as const;
  for (let i = 0; i < createdClashes.length; i++) {
    const clash = createdClashes[i];
    const isPast = clash.dateTime < new Date();
    // Pick several users who are not the creator.
    const attendees = createdUsers.filter((u) => u.id !== clash.creatorId);
    // Rotate the starting index so each clash has a different mix.
    for (let j = 0; j < 4; j++) {
      const user = attendees[(i + j) % attendees.length];
      const rawStatus = statuses[j % statuses.length];
      // A finished clash shouldn't still have pending join requests.
      const status = isPast && rawStatus === "pending" ? "accepted" : rawStatus;
      await prisma.participation.upsert({
        where: { clashId_userId: { clashId: clash.id, userId: user.id } },
        update: { status },
        create: { clashId: clash.id, userId: user.id, status },
      });
    }
  }

  console.log("Creating notifications…");
  // Anchor the seeded notifications to an upcoming clash so they read
  // sensibly (a finished clash shouldn't have a pending join request).
  const firstClash =
    createdClashes.find((c) => c.dateTime > new Date()) ?? createdClashes[0];
  const someUser = userByEmail["anna.schmidt@example.com"];
  const otherUser = userByEmail["lukas.mueller@example.com"];
  await prisma.notification.createMany({
    data: [
      {
        userId: firstClash.creatorId,
        actorId: someUser.id,
        type: "join",
        message: `${someUser.name} requested to join "${firstClash.title}".`,
        clashId: firstClash.id,
      },
      {
        userId: someUser.id,
        actorId: firstClash.creatorId,
        type: "accepted",
        message: `Your request to join "${firstClash.title}" was accepted.`,
        clashId: firstClash.id,
        read: true,
      },
      {
        userId: otherUser.id,
        actorId: firstClash.creatorId,
        type: "rejected",
        message: `Your request to join "${firstClash.title}" was declined.`,
        clashId: firstClash.id,
      },
    ],
  });

  console.log(
    `Seed complete: ${createdUsers.length} users, ${createdVenues.length} venues, ${createdClashes.length} clashes.`,
  );
  console.log(`All users can log in with password "${SEED_PASSWORD}".`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
