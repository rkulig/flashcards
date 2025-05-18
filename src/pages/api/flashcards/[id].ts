import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

interface ErrorCause {
  status: number;
  details?: string;
}

/**
 * GET /api/flashcards/[id]
 *
 * Retrieves a single flashcard by ID
 *
 * @returns The flashcard data if found
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id, 10))) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const flashcardId = parseInt(id, 10);
    const flashcardService = new FlashcardService(locals.supabase);

    const flashcard = await flashcardService.getFlashcardById(flashcardId, DEFAULT_USER_ID);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Flashcard retrieval failed for ID ${params.id}:`, error);

    // Handle specific error types with custom status codes
    if (error instanceof Error) {
      const cause = (error as { cause?: ErrorCause }).cause;
      if (cause && cause.status) {
        return new Response(
          JSON.stringify({
            error: error.message,
            details: cause.details || null,
          }),
          { status: cause.status, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Return general error response
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve flashcard",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
