import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClashFormSchema } from "@/lib/definitions";

// Fixed "now" so every boundary below is a hand-checked literal.
const NOW = "2026-09-25T12:00:00.000Z";

function input(overrides: Record<string, string> = {}) {
  return {
    title: "Morning Yoga",
    description: "",
    startAt: "2026-09-26T08:00:00.000Z",
    endAt: "",
    venueId: "",
    lat: "52.52",
    lng: "13.405",
    ...overrides,
  };
}

/** Field names (top-level path segment) that have at least one issue. */
function failingFields(raw: ReturnType<typeof input>): string[] {
  const result = ClashFormSchema.safeParse(raw);
  return result.success
    ? []
    : result.error.issues.map((issue) => String(issue.path[0]));
}

describe("Clash start time must be in the future", () => {
  beforeEach(() => {
    // Fake only Date: timers and promises must keep working.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(NOW));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("boundary", () => {
    it("rejects a start in the past", () => {
      expect(
        failingFields(input({ startAt: "2026-09-25T11:59:00.000Z" })),
      ).toEqual(["startAt"]);
    });

    it("rejects a start exactly at the current instant", () => {
      expect(failingFields(input({ startAt: NOW }))).toEqual(["startAt"]);
    });

    it("accepts a start one millisecond after the current instant", () => {
      expect(
        failingFields(input({ startAt: "2026-09-25T12:00:00.001Z" })),
      ).toEqual([]);
    });
  });

  describe("input as the browser really sends it", () => {
    // <input type="datetime-local"> submits "YYYY-MM-DDTHH:mm": no seconds, no
    // timezone. The server reads it in its own timezone, so these cases use a
    // margin of more than a day that no UTC offset (-12h..+14h) can flip.
    it("accepts a datetime-local value more than a day ahead", () => {
      expect(failingFields(input({ startAt: "2026-09-27T08:00" }))).toEqual([]);
    });

    it("rejects a datetime-local value more than a day behind", () => {
      expect(failingFields(input({ startAt: "2026-09-23T08:00" }))).toEqual([
        "startAt",
      ]);
    });
  });

  describe("clock", () => {
    it("reads the clock when parsing, not when the module was loaded", () => {
      const raw = input({ startAt: "2026-09-26T08:00:00.000Z" });
      expect(failingFields(raw)).toEqual([]);

      // The same input becomes invalid once time has moved past it.
      vi.setSystemTime(new Date("2026-09-27T00:00:00.000Z"));
      expect(failingFields(raw)).toEqual(["startAt"]);
    });
  });

  describe("interplay with other rules", () => {
    it("still rejects a past start when a valid later end is given", () => {
      const raw = input({
        startAt: "2026-09-25T08:00:00.000Z",
        endAt: "2026-09-25T09:30:00.000Z",
      });
      expect(failingFields(raw)).toEqual(["startAt"]);
    });

    it("accepts a future start together with a later end", () => {
      const raw = input({
        startAt: "2026-09-26T08:00:00.000Z",
        endAt: "2026-09-26T09:30:00.000Z",
      });
      expect(failingFields(raw)).toEqual([]);
    });

    it("keeps reporting an end before a future start on the end field only", () => {
      const raw = input({
        startAt: "2026-09-26T08:00:00.000Z",
        endAt: "2026-09-26T07:00:00.000Z",
      });
      expect(failingFields(raw)).toEqual(["endAt"]);
    });

    it("reports an unparseable start exactly once, without a second future-rule error", () => {
      expect(failingFields(input({ startAt: "not-a-date" }))).toEqual([
        "startAt",
      ]);
    });

    it("reports an empty start exactly once", () => {
      expect(failingFields(input({ startAt: "" }))).toEqual(["startAt"]);
    });
  });
});
