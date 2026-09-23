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
