import FlashcardListItem from "./FlashcardListItem";
import type { FlashcardProposalDto } from "@/types";

interface FlashcardProposalVM extends FlashcardProposalDto {
  isAccepted: boolean;
  isEdited: boolean;
}

interface FlashcardListProps {
  proposals: FlashcardProposalVM[];
  onAccept: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
  onReject: (index: number) => void;
}

export default function FlashcardList({ proposals, onAccept, onEdit, onReject }: FlashcardListProps) {
  // Calculate stats
  const totalCount = proposals.length;
  const acceptedCount = proposals.filter((p) => p.isAccepted).length;
  const editedCount = proposals.filter((p) => p.isEdited).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
          Total: <span className="font-medium">{totalCount}</span>
        </div>
        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
          Accepted: <span className="font-medium">{acceptedCount}</span>
        </div>
        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
          Edited: <span className="font-medium">{editedCount}</span>
        </div>
        <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
          Rejected: <span className="font-medium">{totalCount - acceptedCount}</span>
        </div>
      </div>

      {/* Empty state */}
      {proposals.length === 0 && (
        <div className="text-center p-8 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">No flashcards have been generated yet.</p>
        </div>
      )}

      {/* List of flashcards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" data-testid="flashcard-list">
        {proposals.map((proposal, index) => (
          <FlashcardListItem
            key={`flashcard-${index}`}
            proposal={proposal}
            index={index}
            onAccept={onAccept}
            onEdit={onEdit}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
