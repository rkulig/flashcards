import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateFlashcardsResponseDto,
  FlashcardCreateDto,
  FlashcardDto,
  FlashcardInsert,
  FlashcardsListResponseDto,
  FlashcardUpdateDto,
} from "../../types";
import { logger } from "../utils";

/**
 * Service responsible for flashcard operations
 */
export class FlashcardService {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Validates if generation exists and belongs to the user
   * @param generationId The ID of the generation to validate
   * @param userId The ID of the current user
   * @throws Error if generation doesn't exist or doesn't belong to the user
   */
  private async validateGeneration(generationId: number, userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("generations")
      .select("id")
      .eq("id", generationId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") {
        throw new Error(`Generation with ID ${generationId} not found`, { cause: { status: 404 } });
      }
      throw new Error(`Generation with ID ${generationId} does not belong to this user`, {
        cause: { status: 403 },
      });
    }
  }

  /**
   * Creates multiple flashcards in a single transaction
   * @param flashcards Array of flashcard DTOs to create
   * @param userId Current user ID
   * @returns The created flashcards with their IDs and timestamps
   */
  async createFlashcards(flashcards: FlashcardCreateDto[], userId: string): Promise<CreateFlashcardsResponseDto> {
    // Early validation to avoid starting a transaction if there are no flashcards
    if (flashcards.length === 0) {
      throw new Error("No flashcards to create", { cause: { status: 400 } });
    }

    // Check if generation_id needs validation (non-manual flashcards)
    const source = flashcards[0].source;
    const generationId = flashcards[0].generation_id;

    if (source !== "manual" && generationId !== null) {
      await this.validateGeneration(generationId, userId);
    }

    // Prepare data for insertion
    const flashcardsToInsert: FlashcardInsert[] = flashcards.map((flashcard) => ({
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      generation_id: flashcard.generation_id,
      user_id: userId,
    }));

    // Insert flashcards
    const { data, error } = await this.supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("id, front, back, source, generation_id, created_at, updated_at");

    if (error) {
      logger.error("Error creating flashcards:", error);
      throw new Error("Failed to create flashcards", {
        cause: { status: 500, details: error.message },
      });
    }

    return {
      flashcards: data as FlashcardDto[],
    };
  }

  /**
   * Retrieves a paginated list of user's flashcards
   * @param userId User ID to fetch flashcards for
   * @param page Page number (1-based)
   * @param limit Number of items per page
   * @returns Paginated list of flashcards
   */
  async getFlashcards(userId: string, page = 1, limit = 20): Promise<FlashcardsListResponseDto> {
    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;

    // Get total count first
    const { count, error: countError } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      logger.error("Error counting flashcards:", countError);
      throw new Error("Failed to retrieve flashcards count", {
        cause: { status: 500, details: countError.message },
      });
    }

    // Fetch flashcards with pagination
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Error retrieving flashcards:", error);
      throw new Error("Failed to retrieve flashcards", {
        cause: { status: 500, details: error.message },
      });
    }

    return {
      data: data as FlashcardDto[],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Retrieves a single flashcard by ID
   * @param flashcardId Flashcard ID to retrieve
   * @param userId User ID for authorization check
   * @returns The flashcard if found and belongs to the user
   * @throws Error if flashcard is not found or doesn't belong to the user
   */
  async getFlashcardById(flashcardId: number, userId: string): Promise<FlashcardDto> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(`Flashcard with ID ${flashcardId} not found`, { cause: { status: 404 } });
      }
      logger.error("Error retrieving flashcard:", error);
      throw new Error("Failed to retrieve flashcard", {
        cause: { status: 500, details: error.message },
      });
    }

    if (!data) {
      throw new Error(`Flashcard with ID ${flashcardId} not found`, { cause: { status: 404 } });
    }

    return data as FlashcardDto;
  }

  /**
   * Updates a flashcard by ID
   * @param flashcardId Flashcard ID to update
   * @param updateData Partial flashcard data to update
   * @param userId User ID for authorization check
   * @returns The updated flashcard
   * @throws Error if flashcard is not found or doesn't belong to the user
   */
  async updateFlashcard(flashcardId: number, updateData: FlashcardUpdateDto, userId: string): Promise<FlashcardDto> {
    // First check if flashcard exists and belongs to user
    await this.getFlashcardById(flashcardId, userId);

    // If updating generation_id, validate it exists and belongs to user
    if (updateData.generation_id !== undefined && updateData.generation_id !== null) {
      await this.validateGeneration(updateData.generation_id, userId);
    }

    // Update the flashcard
    const { data, error } = await this.supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .single();

    if (error) {
      logger.error("Error updating flashcard:", error);
      throw new Error("Failed to update flashcard", {
        cause: { status: 500, details: error.message },
      });
    }

    if (!data) {
      throw new Error(`Flashcard with ID ${flashcardId} not found`, { cause: { status: 404 } });
    }

    return data as FlashcardDto;
  }

  /**
   * Deletes a flashcard by ID
   * @param flashcardId Flashcard ID to delete
   * @param userId User ID for authorization check
   * @throws Error if flashcard is not found or doesn't belong to the user
   */
  async deleteFlashcard(flashcardId: number, userId: string): Promise<void> {
    // First check if flashcard exists and belongs to user
    await this.getFlashcardById(flashcardId, userId);

    // Delete the flashcard
    const { error } = await this.supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", userId);

    if (error) {
      logger.error("Error deleting flashcard:", error);
      throw new Error("Failed to delete flashcard", {
        cause: { status: 500, details: error.message },
      });
    }
  }
}
