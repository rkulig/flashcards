import type { APIRoute } from "astro";
import { GenerationService } from "../../lib/services/generation.service";
import { generateFlashCardsSchema } from "../../lib/schemas/generation.schema";
import type { GenerateCreateResponseDto } from "../../types";

export const prerender = false;

// Set timeout for long-running operations (60 seconds)
const GENERATION_TIMEOUT_MS = 60000;

/**
 * POST /api/generations
 *
 * Endpoint for creating new flashcard generation from source text
 * Processes user-provided text through AI and creates flashcard proposals
 *
 * @returns Generation details with created flashcard proposals
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const requestData = await request.json();
    const validationResult = generateFlashCardsSchema.safeParse(requestData);

    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process generation through service with timeout
    const { source_text } = validationResult.data;
    const generationService = new GenerationService(locals.supabase);

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Generation timed out")), GENERATION_TIMEOUT_MS);
    });

    // Race between the generation and timeout
    const result = (await Promise.race([generationService.generateFlashcards(source_text), timeoutPromise])) as {
      generation_id: number;
      generated_count: number;
      flashcards_proposals: { front: string; back: string; source: "ai-full" }[];
    };

    // Return success response
    const response: GenerateCreateResponseDto = {
      generation_id: result.generation_id,
      generated_count: result.generated_count,
      flashcards_proposals: result.flashcards_proposals,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generation process failed:", error);

    // Handle specific error types
    if (error instanceof Error && error.message === "Generation timed out") {
      return new Response(
        JSON.stringify({
          error: "Generation timed out",
          message: "The operation took too long to complete. Please try again with a shorter text.",
        }),
        { status: 504, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return general error response
    return new Response(
      JSON.stringify({
        error: "Failed to generate flashcards",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
