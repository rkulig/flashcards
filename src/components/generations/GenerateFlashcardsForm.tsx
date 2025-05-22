import { useState } from "react";
import TextAreaInput from "./TextAreaInput";
import GenerateButton from "./GenerateButton";
import FlashcardList from "./FlashcardList";
import SaveFlashcardsPanel from "./SaveFlashcardsPanel";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
import LoadingIndicator from "./LoadingIndicator";
import type {
  FlashcardProposalDto,
  GenerateFlashCardsCommand,
  GenerateCreateResponseDto,
  FlashcardCreateDto,
} from "@/types";

interface FlashcardProposalVM extends FlashcardProposalDto {
  isAccepted: boolean;
  isEdited: boolean;
}

export default function GenerateFlashcardsForm() {
  // State for the form
  const [sourceText, setSourceText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [flashcardProposals, setFlashcardProposals] = useState<FlashcardProposalVM[]>([]);

  // Constants for validation
  const MIN_CHARS = 1000;
  const MAX_CHARS = 10000;

  const isValidTextLength = sourceText.length >= MIN_CHARS && sourceText.length <= MAX_CHARS;

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Handler for generating flashcards
  const handleGenerateFlashcards = async () => {
    if (!isValidTextLength) return;

    clearMessages();
    setIsLoading(true);
    setIsGenerating(true);

    try {
      // Prepare the command for the API
      const command: GenerateFlashCardsCommand = {
        source_text: sourceText,
      };

      // Call the API to generate flashcards
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Handle different response status codes
        if (response.status === 400) {
          throw new Error("Invalid input. Please check your text length.");
        } else if (response.status === 401) {
          throw new Error("You need to be logged in to generate flashcards.");
        } else if (response.status === 504) {
          throw new Error("Request timed out. Try with a shorter text.");
        } else {
          throw new Error("An error occurred while generating flashcards.");
        }
      }

      const data: GenerateCreateResponseDto = await response.json();

      // Map the response to view models with added properties for UI state
      const proposals: FlashcardProposalVM[] = data.flashcards_proposals.map((proposal) => ({
        ...proposal,
        isAccepted: false, // Default to not accepted
        isEdited: false,
      }));

      setGenerationId(data.generation_id);
      setFlashcardProposals(proposals);
      setSuccess(`Successfully generated ${data.generated_count} flashcards.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  // Handlers for flashcard actions
  const handleAcceptFlashcard = (index: number) => {
    clearMessages();
    setFlashcardProposals((prev) =>
      prev.map((proposal, i) => (i === index ? { ...proposal, isAccepted: true } : proposal))
    );
  };

  const handleEditFlashcard = (index: number, front: string, back: string) => {
    clearMessages();
    setFlashcardProposals((prev) =>
      prev.map((proposal, i) =>
        i === index
          ? {
              ...proposal,
              front,
              back,
              source: "ai-full", // Keep as ai-full since it's still AI-generated
              isEdited: true,
              isAccepted: true, // Auto-accept when edited
            }
          : proposal
      )
    );
  };

  const handleRejectFlashcard = (index: number) => {
    clearMessages();
    setFlashcardProposals((prev) =>
      prev.map((proposal, i) => (i === index ? { ...proposal, isAccepted: false } : proposal))
    );
  };

  // Prepare flashcards for saving
  const prepareFlashcardsForSaving = (onlyAccepted = false): FlashcardCreateDto[] => {
    return flashcardProposals
      .filter((proposal) => (onlyAccepted ? proposal.isAccepted : true))
      .map((proposal) => ({
        front: proposal.front,
        back: proposal.back,
        source: proposal.isEdited ? "ai-edited" : "ai-full",
        generation_id: generationId,
      }));
  };

  // Handlers for saving flashcards
  const handleSaveAll = async () => {
    await saveFlashcards(prepareFlashcardsForSaving(false));
  };

  const handleSaveAccepted = async () => {
    await saveFlashcards(prepareFlashcardsForSaving(true));
  };

  // Function to save flashcards to the API
  const saveFlashcards = async (flashcards: FlashcardCreateDto[]) => {
    if (flashcards.length === 0) {
      setError("No flashcards to save.");
      return;
    }

    clearMessages();
    setIsLoading(true);
    setIsSaving(true);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards. Please try again.");
      }

      const count = flashcards.length;
      setSuccess(`Successfully saved ${count} flashcard${count !== 1 ? "s" : ""}.`);

      // Reset the form after successful save
      setSourceText("");
      setFlashcardProposals([]);
      setGenerationId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Text input section */}
      <div className="space-y-4">
        <TextAreaInput value={sourceText} onChange={setSourceText} minChars={MIN_CHARS} maxChars={MAX_CHARS} />

        <div className="flex justify-end">
          <GenerateButton onClick={handleGenerateFlashcards} disabled={!isValidTextLength} isLoading={isGenerating} />
        </div>
      </div>

      {/* Loading indicator (for overall form state) */}
      {isLoading && !isGenerating && !isSaving && (
        <div className="py-8 text-center">
          <LoadingIndicator size="lg" text="Processing..." />
        </div>
      )}

      {/* Error message */}
      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {/* Success message */}
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

      {/* Flashcard proposals list */}
      {flashcardProposals.length > 0 && (
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold">Generated Flashcards</h2>

          <FlashcardList
            proposals={flashcardProposals}
            onAccept={handleAcceptFlashcard}
            onEdit={handleEditFlashcard}
            onReject={handleRejectFlashcard}
          />

          <SaveFlashcardsPanel
            onSaveAll={handleSaveAll}
            onSaveAccepted={handleSaveAccepted}
            flashcards={flashcardProposals}
            isLoading={isSaving}
          />
        </div>
      )}
    </div>
  );
}
