import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import crypto from "crypto";
import type { FlashcardProposalDto, GenerationInsert, GenerationErrorLogInsert } from "../../types";
import { OpenRouterService, type Message } from "./openrouter.service";

/**
 * Service responsible for handling AI-powered flashcard generation
 * and related database operations
 */
export class GenerationService {
  private openRouter: OpenRouterService;
  private defaultModel = "gpt-4o-mini";

  constructor(
    private readonly supabase: SupabaseClient,
    openRouter?: OpenRouterService
  ) {
    this.openRouter =
      openRouter ||
      new OpenRouterService({
        apiKey: import.meta.env.OPENROUTER_API_KEY as string,
        baseUrl: (import.meta.env.OPENROUTER_BASE_URL as string) || undefined,
        defaultModel: (import.meta.env.OPENROUTER_DEFAULT_MODEL as string) || this.defaultModel,
      });
  }

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
    const model = (import.meta.env.OPENROUTER_DEFAULT_MODEL as string) || this.defaultModel;

    try {
      // Step 1: Create generation metadata record
      const { data: generationData, error: generationError } = await this.createGeneration({
        user_id: DEFAULT_USER_ID,
        model,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        generated_count: 0,
        generation_duration: 0,
      });

      if (generationError || !generationData || generationData.length === 0) {
        throw new Error(`Failed to create generation record: ${generationError?.message}`);
      }

      const generationId = generationData[0].id;

      // Step 2: Call AI service to generate flashcards
      const flashcardProposals = await this.callAiService(sourceText, model);
      const generatedCount = flashcardProposals.length;

      // Step 3: Update generation record with final metrics (but don't save flashcards to database)
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

      // Step 4: Return response DTO with proposals (but don't save to database)
      return {
        generation_id: generationId,
        generated_count: generatedCount,
        flashcards_proposals: flashcardProposals,
      };
    } catch (error) {
      // Log error and rethrow
      await this.logGenerationError(error, DEFAULT_USER_ID, sourceTextHash, sourceTextLength, model);
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
   * Calls the OpenRouter AI service to generate flashcards from the source text
   */
  private async callAiService(sourceText: string, model: string): Promise<FlashcardProposalDto[]> {
    // Define the flashcard schema for structured output
    const flashcardSchema = {
      name: "flashcards",
      strict: true,
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: {
                  type: "string",
                  description: "The front side of the flashcard (question or concept)",
                },
                back: {
                  type: "string",
                  description: "The back side of the flashcard (answer or explanation)",
                },
              },
              required: ["front", "back"],
              additionalProperties: false,
            },
          },
        },
        required: ["flashcards"],
        additionalProperties: false,
      },
    };

    // Setup the messages for the AI service
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an AI assistant that creates educational flashcards from text. Create concise, clear flashcards that capture key concepts, definitions, and facts from the provided text. Focus on important information that would be valuable to remember.",
      },
      {
        role: "user",
        content: `Create flashcards from the following text. Extract key concepts, definitions, facts, and relationships that would be valuable to remember. Format each flashcard with a clear question or concept on the front and a concise answer or explanation on the back.\n\n${sourceText}`,
      },
    ];

    try {
      // Call the OpenRouter service with JSON schema response format
      const response = await this.openRouter.chatCompletion(messages, {
        modelName: model,
        responseFormat: {
          type: "json_schema",
          json_schema: flashcardSchema,
        },
        params: {
          temperature: 0.5,
          max_tokens: 2000,
        },
      });

      // Process the response
      const data = response.data as { flashcards: { front: string; back: string }[] };

      // Convert to FlashcardProposalDto format
      return data.flashcards.map((card) => ({
        front: card.front,
        back: card.back,
        source: "ai-full" as const,
      }));
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);

      // Fallback approach if JSON schema fails - try without schema
      if (error instanceof Error && error.message.includes("Invalid schema")) {
        console.log("Retrying without JSON schema...");
        return await this.callAiServiceWithoutSchema(sourceText, model);
      }

      throw error;
    }
  }

  /**
   * Fallback method that calls the OpenRouter API without JSON schema
   * This is used when the JSON schema approach fails
   */
  private async callAiServiceWithoutSchema(sourceText: string, model: string): Promise<FlashcardProposalDto[]> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an AI assistant that creates educational flashcards from text. You will respond with a valid JSON array of flashcard objects, each with 'front' and 'back' properties.",
      },
      {
        role: "user",
        content: `Create flashcards from the following text. Extract key concepts, definitions, facts, and relationships that would be valuable to remember. Format your response as a valid JSON array with objects that have 'front' and 'back' properties. The 'front' should contain a clear question or concept, and the 'back' should contain a concise answer or explanation.

Example format:
[
  {
    "front": "Question or concept",
    "back": "Answer or explanation"
  },
  {
    "front": "Another question",
    "back": "Another answer"
  }
]

Source text:
${sourceText}`,
      },
    ];

    const response = await this.openRouter.chatCompletion(messages, {
      modelName: model,
      params: {
        temperature: 0.5,
        max_tokens: 2000,
      },
    });

    try {
      // Try to parse the response as JSON
      const content = response.data as string;
      const flashcards = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

      if (Array.isArray(flashcards)) {
        return flashcards.map((card: { front: string; back: string }) => ({
          front: card.front,
          back: card.back,
          source: "ai-full" as const,
        }));
      } else if (flashcards.flashcards && Array.isArray(flashcards.flashcards)) {
        return flashcards.flashcards.map((card: { front: string; back: string }) => ({
          front: card.front,
          back: card.back,
          source: "ai-full" as const,
        }));
      }
      throw new Error("Invalid response format from AI service");
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse flashcards from AI response");
    }
  }

  /**
   * Logs generation errors to the database
   */
  private async logGenerationError(
    error: unknown,
    userId: string,
    sourceTextHash: string,
    sourceTextLength: number,
    model: string
  ) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLog: GenerationErrorLogInsert = {
      user_id: userId,
      error_code: "GEN_ERROR",
      error_message: errorMessage,
      model,
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
