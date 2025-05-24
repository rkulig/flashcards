import type { APIRoute } from "astro";
import { authRequestSchema } from "../../lib/schemas/auth.schema";
import type { AuthRequestDto } from "../../types";
import { createAuthService } from "../../lib/services/auth.service";

export const prerender = false;

interface ErrorCause {
  status: number;
  details?: string;
}

/**
 * POST /api/auth
 *
 * Handles both user login and registration in a single endpoint.
 * This is a mock implementation that always returns success.
 *
 * Request body:
 * - email: valid email address
 * - password: minimum 6 characters
 * - mode: "login" or "register"
 *
 * @returns Mock authentication response with userId and token
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    const requestData = (await request.json()) as AuthRequestDto;
    const validationResult = authRequestSchema.safeParse(requestData);

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

    // Process authentication through service
    const authService = createAuthService();
    const authResult = await authService.authenticate(validationResult.data);

    // Return success response according to plan specification
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userId: authResult.userId,
          token: authResult.token,
        },
        message: "Mock authentication successful",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Authentication failed:", error);

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
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
