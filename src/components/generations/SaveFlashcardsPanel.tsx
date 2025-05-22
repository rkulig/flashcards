import { Button } from "@/components/ui/button";
import type { FlashcardProposalDto } from "@/types";

interface FlashcardProposalVM extends FlashcardProposalDto {
  isAccepted: boolean;
  isEdited: boolean;
}

interface SaveFlashcardsPanelProps {
  flashcards: FlashcardProposalVM[];
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  isLoading: boolean;
}

export default function SaveFlashcardsPanel({
  flashcards,
  onSaveAll,
  onSaveAccepted,
  isLoading,
}: SaveFlashcardsPanelProps) {
  // Check if we have any flashcards to save
  const hasFlashcards = flashcards.length > 0;
  const hasAcceptedFlashcards = flashcards.some((f) => f.isAccepted);

  // Get counts
  const totalCount = flashcards.length;
  const acceptedCount = flashcards.filter((f) => f.isAccepted).length;

  return (
    <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4 mt-8 -mx-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        {hasFlashcards ? (
          <>
            <span className="font-medium">{acceptedCount}</span> of <span className="font-medium">{totalCount}</span>{" "}
            flashcards ready to save
          </>
        ) : (
          <>No flashcards to save</>
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onSaveAccepted}
          disabled={!hasAcceptedFlashcards || isLoading}
          className="min-w-[180px]"
          data-testid="save-accepted-button"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            `Save Accepted (${acceptedCount})`
          )}
        </Button>

        <Button
          onClick={onSaveAll}
          disabled={!hasFlashcards || isLoading}
          className="min-w-[180px]"
          data-testid="save-all-button"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            `Save All (${totalCount})`
          )}
        </Button>
      </div>
    </div>
  );
}
