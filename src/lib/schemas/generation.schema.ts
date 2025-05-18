import { z } from "zod";

/**
 * Schema for validating generation request payload
 * Enforces the source_text length constraints (1000-10000 characters)
 */
export const generateFlashCardsSchema = z.object({
  source_text: z
    .string({
      required_error: "Source text is required",
      invalid_type_error: "Source text must be a string",
    })
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

export type GenerateFlashCardsSchema = z.infer<typeof generateFlashCardsSchema>;
