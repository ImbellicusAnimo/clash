import { beforeEach, describe, expect, it, vi } from "vitest";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { createClash, updateClash } from "@/app/actions/clash";

// The only things replaced are the boundaries to the Next.js request scope:
// who is logged in, and cache revalidation. Actions, Zod validation and
// Prisma (against a migrated throw-away SQLite file) are all real.
const session = vi.hoisted(() => ({ userId: "" }));
vi.mock("@/lib/dal", () => ({
  getUser: async () => ({ id: session.userId }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const DAY_MS = 24 * 60 * 60 * 1000;

/** What <input type="datetime-local"> submits and the edit form prefills. */
function datetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function clashForm(fields: Record<string, string>): FormData {
  const data = new FormData();
  const defaults = {
    title: "Test Clash",
    description: "",
    endAt: "",
    venueId: "",
    lat: "52.5",
    lng: "13.4",
  };
  for (const [key, value] of Object.entries({ ...defaults, ...fields }))
    data.set(key, value);
  return data;
}

/** Runs an action; a thrown Next.js redirect becomes `redirectedTo`. */
async function run<T>(action: () => Promise<T>) {
  try {
    return {
      state: await action(),
      redirectedTo: undefined as string | undefined,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      return { state: undefined, redirectedTo: error.digest.split(";")[2] };
    }
    throw error;
  }
}

let host: { id: string };
let venueOwner: { id: string };

beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.clash.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  host = await prisma.user.create({
    data: { username: "host", name: "Host", passwordHash: "not-a-real-hash" },
  });
  venueOwner = await prisma.user.create({
    data: { username: "owner", name: "Owner", passwordHash: "not-a-real-hash" },
  });
  session.userId = host.id;
});

describe("createClash", () => {
  it("stores a clash hosted by the session user and redirects to it", async () => {
    const start = new Date(Date.now() + 3 * DAY_MS);

    const { redirectedTo } = await run(() =>
      createClash(
        undefined,
        clashForm({ title: "Morning Yoga", startAt: datetimeLocal(start) }),
      ),
    );

    const clashes = await prisma.clash.findMany();
    expect(clashes).toHaveLength(1);
    expect(clashes[0]).toMatchObject({
      title: "Morning Yoga",
      hostId: host.id,
      lat: 52.5,
      lng: 13.4,
    });
    expect(redirectedTo).toBe(`/clashes/${clashes[0].id}`);
  });

  it("copies the venue's coordinates and notifies the venue owner in the same write", async () => {
    const venue = await prisma.venue.create({
      data: {
        name: "Yoga Loft",
        city: "Berlin",
        lat: 52.49,
        lng: 13.42,
        ownerId: venueOwner.id,
      },
    });
    const start = new Date(Date.now() + 3 * DAY_MS);

    await run(() =>
      createClash(
        undefined,
        // The submitted coordinates must lose against the venue's.
        clashForm({
          startAt: datetimeLocal(start),
          venueId: venue.id,
          lat: "1",
          lng: "2",
        }),
      ),
    );

    const clash = await prisma.clash.findFirstOrThrow();
    expect(clash).toMatchObject({ venueId: venue.id, lat: 52.49, lng: 13.42 });
    const notifications = await prisma.notification.findMany();
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      userId: venueOwner.id,
      type: "new_clash_at_venue",
      clashId: clash.id,
      venueId: venue.id,
    });
  });

  // Domain rule: the start of a new Clash must lie in the future.
  it("rejects a start in the past and persists nothing, not even the venue notification", async () => {
    const venue = await prisma.venue.create({
      data: {
        name: "Yoga Loft",
        city: "Berlin",
        lat: 52.49,
        lng: 13.42,
        ownerId: venueOwner.id,
      },
    });
    const past = new Date(Date.now() - 3 * DAY_MS);

    const { state, redirectedTo } = await run(() =>
      createClash(
        undefined,
        clashForm({ startAt: datetimeLocal(past), venueId: venue.id }),
      ),
    );

    expect(state?.errors?.startAt).toBeDefined();
    expect(redirectedTo).toBeUndefined();
    expect(await prisma.clash.count()).toBe(0);
    expect(await prisma.notification.count()).toBe(0);
  });
});

describe("updateClash", () => {
  async function existingClash(start: Date) {
    return prisma.clash.create({
      data: {
        title: "Old Title",
        lat: 52.5,
        lng: 13.4,
        startAt: start,
        hostId: host.id,
      },
    });
  }

  it("lets the host edit other fields of a clash that already started, when the start is unchanged", async () => {
    // Stored with seconds; the edit form prefills minute precision only.
    const past = new Date(Date.now() - 3 * DAY_MS);
    past.setSeconds(30, 0);
    const clash = await existingClash(past);

    await run(() =>
      updateClash(
        clash.id,
        undefined,
        clashForm({ title: "New Title", startAt: datetimeLocal(past) }),
      ),
    );

    const after = await prisma.clash.findUniqueOrThrow({
      where: { id: clash.id },
    });
    // The form only carries minute precision, so compare the minute, not the
    // instant: what matters is that the unchanged start did not block the edit.
    expect(after.title).toBe("New Title");
    expect(datetimeLocal(after.startAt)).toBe(datetimeLocal(past));
  });

  // Domain rule: a clash cannot be rescheduled into the past.
  it("rejects moving the start into the past and leaves the clash untouched", async () => {
    const future = new Date(Date.now() + 3 * DAY_MS);
    future.setSeconds(0, 0);
    const clash = await existingClash(future);
    const past = new Date(Date.now() - 3 * DAY_MS);

    const { state } = await run(() =>
      updateClash(
        clash.id,
        undefined,
        clashForm({ title: "New Title", startAt: datetimeLocal(past) }),
      ),
    );

    expect(state?.errors?.startAt).toBeDefined();
    const after = await prisma.clash.findUniqueOrThrow({
      where: { id: clash.id },
    });
    expect(after.title).toBe("Old Title");
    expect(after.startAt).toEqual(future);
  });

  it("allows moving the start to another future time", async () => {
    const soon = new Date(Date.now() + 3 * DAY_MS);
    soon.setSeconds(0, 0);
    const clash = await existingClash(soon);
    const later = new Date(Date.now() + 5 * DAY_MS);
    later.setSeconds(0, 0);

    await run(() =>
      updateClash(
        clash.id,
        undefined,
        clashForm({ startAt: datetimeLocal(later) }),
      ),
    );

    const after = await prisma.clash.findUniqueOrThrow({
      where: { id: clash.id },
    });
    expect(after.startAt).toEqual(later);
  });
});
