import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email.")),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email.")),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

const coordinate = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const venueSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters."),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters."),
  })
  .and(coordinate);

export const clashSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters."),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters."),
    dateTime: z.coerce.date({ message: "Choose a valid date and time." }),
    venueId: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : null)),
  })
  .and(coordinate);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
export type ClashInput = z.infer<typeof clashSchema>;
