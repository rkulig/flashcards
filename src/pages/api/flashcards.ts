import type { APIRoute } from "astro";
import { flashcardsCreateSchema } from "../../lib/schemas/flashcard.schema";
import { FlashcardService } from "../../lib/services/flashcard.service";
import type { FlashcardsCreateCommand } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

interface ErrorCause {
  status: number;
  details?: string;
}

/**
 * GET /api/flashcards
 *
 * Retrieves a paginated list of user's flashcards
 * Supports query parameters for pagination:
 * - page: page number (1-based, default: 1)
 * - limit: items per page (default: 20, max: 50)
 *
 * @returns Paginated list of flashcards
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    // Parse pagination parameters with defaults and constraints
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) || 1 : 1;
    const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10))) || 20 : 20;

    // Retrieve flashcards
    const flashcardService = new FlashcardService(locals.supabase);
    const result = await flashcardService.getFlashcards(DEFAULT_USER_ID, page, limit);

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Flashcard retrieval failed:", error);

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
        error: "Failed to retrieve flashcards",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * POST /api/flashcards
 *
 * Creates single or multiple flashcards at once.
 * Supports both manually created flashcards and AI-generated ones.
 *
 * @returns The created flashcards with their IDs and timestamps
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const requestData = (await request.json()) as FlashcardsCreateCommand;
    const validationResult = flashcardsCreateSchema.safeParse(requestData);

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

    // Process flashcard creation through service
    const flashcardService = new FlashcardService(locals.supabase);
    const result = await flashcardService.createFlashcards(validationResult.data.flashcards, DEFAULT_USER_ID);

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Flashcard creation failed:", error);

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
        error: "Failed to create flashcards",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
