import { z } from "zod";

export const SignupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long." }),
  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters long." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username may only contain letters, numbers, and underscores.",
    }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
});

export const LoginFormSchema = z.object({
  username: z.string().trim().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        username?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const ClashFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: "Title is required." })
      .max(120, { message: "Title must be at most 120 characters long." }),
    description: z
      .string()
      .trim()
      .max(2000, { message: "Description must be at most 2000 characters long." })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    // z.coerce.date() (not z.string().datetime()) because <input type="datetime-local">
    // produces "2026-09-23T14:30" — no seconds, no timezone — which fails strict ISO-8601
    // validation but parses correctly via `new Date(...)`.
    startAt: z.coerce.date({ message: "A valid start date and time is required." }),
    endAt: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.date().optional()
    ),
    venueId: z.preprocess(
      (v) => (v === "" || v === "none" ? undefined : v),
      z.string().min(1).optional()
    ),
    lat: z.coerce
      .number({ message: "Latitude must be a number." })
      .min(-90, { message: "Latitude must be between -90 and 90." })
      .max(90, { message: "Latitude must be between -90 and 90." }),
    lng: z.coerce
      .number({ message: "Longitude must be a number." })
      .min(-180, { message: "Longitude must be between -180 and 180." })
      .max(180, { message: "Longitude must be between -180 and 180." }),
  })
  .refine((data) => !data.endAt || data.endAt > data.startAt, {
    message: "End time must be after the start time.",
    path: ["endAt"],
  });

export type ClashFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        startAt?: string[];
        endAt?: string[];
        venueId?: string[];
        lat?: string[];
        lng?: string[];
      };
      message?: string;
    }
  | undefined;
