import type { APIRoute } from "astro";
import { flashcardUpdateSchema } from "../../../lib/schemas/flashcard.schema";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import type { FlashcardUpdateDto } from "../../../types";
import { logger } from "../../../lib/utils";

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
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

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

    const flashcard = await flashcardService.getFlashcardById(flashcardId, locals.user.id);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error retrieving flashcard:", error);

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

/**
 * PUT /api/flashcards/{id}
 *
 * Updates a specific flashcard by ID
 * Supports partial updates of flashcard fields
 *
 * @returns Updated flashcard data
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: "ID must be a valid number",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const requestData = (await request.json()) as FlashcardUpdateDto;
    const validationResult = flashcardUpdateSchema.safeParse(requestData);

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

    // Update flashcard through service
    const flashcardService = new FlashcardService(locals.supabase);
    const result = await flashcardService.updateFlashcard(Number(id), validationResult.data, locals.user.id);

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error updating flashcard:", error);

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
        error: "Failed to update flashcard",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * DELETE /api/flashcards/{id}
 *
 * Deletes a specific flashcard by ID
 * Only the owner can delete their flashcards
 *
 * @returns Success confirmation
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: "ID must be a valid number",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete flashcard through service
    const flashcardService = new FlashcardService(locals.supabase);
    await flashcardService.deleteFlashcard(Number(id), locals.user.id);

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Flashcard deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error("Error deleting flashcard:", error);

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
        error: "Failed to delete flashcard",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
