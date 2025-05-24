import { z } from "zod";

/**
 * Schema for validating authentication request
 * Validates both login and registration requests
 */
export const authRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  mode: z.enum(["login", "register"], {
    errorMap: () => ({ message: "Mode must be either 'login' or 'register'" }),
  }),
});
