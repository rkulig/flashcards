// We don't need to import Database type directly because:
// 1. Tables and TablesInsert types already provide strongly-typed access to table schemas
// 2. These utility types handle extracting Row/Insert types from the Database type internally
// 3. The Database type is mainly used for typing the Supabase client, which is done in env.d.ts
import type { Tables, TablesInsert } from "./db/database.types";
/**
 * Base type aliases extracted from database model definitions
 */
export type Flashcard = Tables<"flashcards">;
export type Generation = Tables<"generations">;
export type GenerationErrorLog = Tables<"generation_error_logs">;

export type FlashcardInsert = TablesInsert<"flashcards">;
export type GenerationInsert = TablesInsert<"generations">;
export type GenerationErrorLogInsert = TablesInsert<"generation_error_logs">;

/**
 * Contains pagination details used in list responses
 */
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

/**
 * Flashcard DTO representing a flashcard returned by the API endpoints (GET /api/flashcards, GET api/flashcards/{id}).
 */
export type FlashcardDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

/**
 * Response DTO for listing flashcards with pagination (GET /api/flashcards)
 */
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

export type Source = "ai-full" | "ai-edited" | "manual";

/**
 * DTO for creating a single flashcard via POST /api/flashcards endpoint.
 * Validations:
 * - front: required, max 200 characters
 * - back: required, max 500 characters
 * - source: required, must be one of: "ai-full", "ai-edited", "manual"
 * - generation_id: optional, must be a valid generation ID if provided
 */
export interface FlashcardCreateDto {
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}

/**
 * Command model for creating flashcards in batch.
 */
export interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}

/**
 * Response DTO for created flashcards.
 */
export interface CreateFlashcardsResponseDto {
  flashcards: FlashcardDto[];
}

/**
 * DTO for updating a flashcard via PUT /api/flashcards/{id} endpoint.
 * Only contains editable fields.
 */
export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}>;

/**
 * Command model for creating a generation session (submits source text).
 * Used in POST /api/generations endpoint.
 */
export interface GenerateFlashCardsCommand {
  source_text: string;
}

/**
 * Generation Detail DTO
 * Provides detailed information for a generation reauest (GET /api/generations/{id})
 * including metadata from the generations table and optionally, the associaced flashcards.
 */
export type GenerationDetailDto = Generation & {
  flashcards?: FlashcardDto[];
};

/**
 * Proposal DTO for AI-generated flashcards.
 * Represents a single flashcard proposal generated from AI, always with source "ai-full"
 */
export interface FlashcardProposalDto {
  front: string;
  back: string;
  source: "ai-full";
}

/**
 * Response DTO for create generation endpoint (POST /api/generations).
 */
export interface GenerateCreateResponseDto {
  generation_id: number;
  generated_count: number;
  flashcards_proposals: FlashcardProposalDto[];
}

/**
 * Error log DTO for generation errors.
 * Used in GET /api/generation_error_logs endpoint.
 */
export type GenerationErrorLogDto = Pick<
  GenerationErrorLog,
  "id" | "error_code" | "error_message" | "model" | "source_text_hash" | "source_text_length" | "created_at" | "user_id"
>;
