import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import crypto from "crypto";
import type { FlashcardInsert, FlashcardProposalDto, GenerationInsert, GenerationErrorLogInsert } from "../../types";

/**
 * Service responsible for handling AI-powered flashcard generation
 * and related database operations
 */
export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Generates flashcards from the provided source text using AI
   * Handles the entire generation process including:
   * - Storing generation metadata
   * - Calling AI service
   * - Persisting generated flashcards
   * - Error handling and logging
   *
   * @param sourceText The text to generate flashcards from (1000-10000 characters)
   * @returns Object containing generation_id, generated_count, and flashcards_proposals
   */
  async generateFlashcards(sourceText: string) {
    // Setup generation metrics
    const startTime = performance.now();
    const sourceTextHash = this.hashSourceText(sourceText);
    const sourceTextLength = sourceText.length;

    try {
      // Step 1: Create generation metadata record
      const { data: generationData, error: generationError } = await this.createGeneration({
        user_id: DEFAULT_USER_ID,
        model: "mock-ai-model", // Using mock model for development
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        generated_count: 0,
        generation_duration: 0,
      });

      if (generationError || !generationData || generationData.length === 0) {
        throw new Error(`Failed to create generation record: ${generationError?.message}`);
      }

      const generationId = generationData[0].id;

      // Step 2: Call AI service to generate flashcards (using mock for now)
      const flashcardProposals = await this.callAiService(sourceText);
      const generatedCount = flashcardProposals.length;

      // Step 3: Insert flashcard proposals into database
      const flashcardInserts: FlashcardInsert[] = flashcardProposals.map((proposal) => ({
        user_id: DEFAULT_USER_ID,
        generation_id: generationId,
        front: proposal.front,
        back: proposal.back,
        source: proposal.source,
      }));

      const { error: flashcardsError } = await this.supabase.from("flashcards").insert(flashcardInserts);

      if (flashcardsError) {
        throw new Error(`Failed to insert flashcards: ${flashcardsError.message}`);
      }

      // Step 4: Update generation record with final metrics
      const generationDuration = Math.round(performance.now() - startTime);
      const { error: updateError } = await this.supabase
        .from("generations")
        .update({
          generated_count: generatedCount,
          generation_duration: generationDuration,
        })
        .eq("id", generationId);

      if (updateError) {
        throw new Error(`Failed to update generation record: ${updateError.message}`);
      }

      // Step 5: Return response DTO
      return {
        generation_id: generationId,
        generated_count: generatedCount,
        flashcards_proposals: flashcardProposals,
      };
    } catch (error) {
      // Log error and rethrow
      await this.logGenerationError(error, DEFAULT_USER_ID, sourceTextHash, sourceTextLength);
      throw error;
    }
  }

  /**
   * Creates a new generation record in the database
   */
  private async createGeneration(generation: GenerationInsert) {
    return this.supabase.from("generations").insert(generation).select("id, created_at");
  }

  /**
   * Mocks the AI service call during development
   * To be replaced with actual AI service integration
   */
  private async callAiService(sourceText: string): Promise<FlashcardProposalDto[]> {
    // Mock implementation for development
    // This would be replaced with actual AI service integration
    console.log(`Mock AI service called with text of length: ${sourceText.length}`);

    // Simulate AI processing time (between 1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    // Base flashcards that are always returned
    const baseFlashcards: FlashcardProposalDto[] = [
      {
        front: "What is the capital of France?",
        back: "Paris",
        source: "ai-full",
      },
      {
        front: "Who wrote 'Romeo and Juliet'?",
        back: "William Shakespeare",
        source: "ai-full",
      },
      {
        front: "What is the chemical symbol for water?",
        back: "H2O",
        source: "ai-full",
      },
    ];

    // Add some flashcards based on text length to simulate dynamic generation
    if (sourceText.length > 3000) {
      baseFlashcards.push({
        front: "What is the largest planet in our solar system?",
        back: "Jupiter",
        source: "ai-full",
      });
    }

    if (sourceText.length > 5000) {
      baseFlashcards.push({
        front: "Who developed the theory of relativity?",
        back: "Albert Einstein",
        source: "ai-full",
      });
    }

    return baseFlashcards;
  }

  /**
   * Logs generation errors to the database
   */
  private async logGenerationError(error: unknown, userId: string, sourceTextHash: string, sourceTextLength: number) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLog: GenerationErrorLogInsert = {
      user_id: userId,
      error_code: "GEN_ERROR",
      error_message: errorMessage,
      model: "mock-ai-model",
      source_text_hash: sourceTextHash,
      source_text_length: sourceTextLength,
    };

    await this.supabase.from("generation_error_logs").insert(errorLog);
  }

  /**
   * Creates an MD5 hash of the source text for storage and comparison
   */
  private hashSourceText(sourceText: string): string {
    return crypto.createHash("md5").update(sourceText).digest("hex");
  }
}
