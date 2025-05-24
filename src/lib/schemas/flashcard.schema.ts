import { z } from "zod";

/**
 * Schema for validating individual flashcard in creation request
 */
export const flashcardSchema = z.object({
  front: z
    .string()
    .min(3, "Front text must be at least 3 characters")
    .max(200, "Front text cannot exceed 200 characters"),
  back: z.string().min(3, "Back text must be at least 3 characters").max(500, "Back text cannot exceed 500 characters"),
  source: z.enum(["manual", "ai-full", "ai-edited"], {
    errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
  }),
  generation_id: z.number().int().positive().nullable(),
});

/**
 * Schema for validating flashcard update request
 * All fields are optional for partial updates
 */
export const flashcardUpdateSchema = z.object({
  front: z
    .string()
    .min(3, "Front text must be at least 3 characters")
    .max(200, "Front text cannot exceed 200 characters")
    .optional(),
  back: z
    .string()
    .min(3, "Back text must be at least 3 characters")
    .max(500, "Back text cannot exceed 500 characters")
    .optional(),
  source: z
    .enum(["manual", "ai-full", "ai-edited"], {
      errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
    })
    .optional(),
  generation_id: z.number().int().positive().nullable().optional(),
});

/**
 * Schema for validating flashcard creation batch request
 * Enforces business rules:
 * 1. Request must contain at least one flashcard but no more than 50
 * 2. All flashcards in a single request must have the same source type
 * 3. AI-generated flashcards must all have the same generation_id (not null)
 * 4. Manual flashcards must have null generation_id
 */
export const flashcardsCreateSchema = z.object({
  flashcards: z
    .array(flashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(50, "Maximum 50 flashcards per request")
    .refine((cards) => {
      // Check if all flashcards have the same source type
      const sources = new Set(cards.map((card) => card.source));
      return sources.size === 1;
    }, "All flashcards must have the same source type")
    .refine((cards) => {
      // Check if all AI flashcards have the same generation_id and it's not null
      // Or all manual flashcards have null generation_id
      const source = cards[0].source;
      if (source === "manual") {
        return cards.every((card) => card.generation_id === null);
      } else {
        const genIds = new Set(cards.map((card) => card.generation_id));
        return genIds.size === 1 && !genIds.has(null);
      }
    }, "AI-generated flashcards must have the same generation_id, manual flashcards must have null generation_id"),
});
