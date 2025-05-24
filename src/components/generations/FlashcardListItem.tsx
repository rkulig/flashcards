import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalDto } from "@/types";

interface FlashcardProposalVM extends FlashcardProposalDto {
  isAccepted: boolean;
  isEdited: boolean;
}

interface FlashcardListItemProps {
  proposal: FlashcardProposalVM;
  index: number;
  onAccept: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
  onReject: (index: number) => void;
}

export default function FlashcardListItem({ proposal, index, onAccept, onEdit, onReject }: FlashcardListItemProps) {
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(proposal.front);
  const [editedBack, setEditedBack] = useState(proposal.back);

  // Validation limits
  const MAX_FRONT_CHARS = 200;
  const MAX_BACK_CHARS = 500;

  const isFrontValid = editedFront.length > 0 && editedFront.length <= MAX_FRONT_CHARS;
  const isBackValid = editedBack.length > 0 && editedBack.length <= MAX_BACK_CHARS;
  const isValid = isFrontValid && isBackValid;

  // Handle edit complete
  const handleEditComplete = () => {
    if (!isValid) return;

    onEdit(index, editedFront, editedBack);
    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedFront(proposal.front);
    setEditedBack(proposal.back);
    setIsEditing(false);
  };

  // Get status indicator styling
  const getStatusIndicator = () => {
    if (!proposal.isAccepted) {
      return "bg-red-500";
    }
    if (proposal.isEdited) {
      return "bg-blue-500";
    }
    return "bg-green-500";
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all
                    ${proposal.isAccepted ? "border-neutral-300 dark:border-neutral-700" : "border-red-300 dark:border-red-800"}`}
    >
      {/* Status indicator */}
      <div className="flex items-center p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
        <div className={`w-3 h-3 rounded-full mr-2 ${getStatusIndicator()}`} />
        <span className="text-sm font-medium">
          {!proposal.isAccepted ? "Rejected" : proposal.isEdited ? "Edited" : "Accepted"}
        </span>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Front (Question) - {editedFront.length}/{MAX_FRONT_CHARS}
            </label>
            <textarea
              value={editedFront}
              onChange={(e) => setEditedFront(e.target.value)}
              className={`w-full p-2 border rounded resize-y min-h-[80px]
                          focus:ring-2 focus:outline-none
                          ${!isFrontValid ? "border-red-500 focus:ring-red-500" : "border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"}`}
              data-testid="edit-front-input"
            />
            {!isFrontValid && editedFront.length > MAX_FRONT_CHARS && (
              <p className="text-sm text-red-600">Front text must be 200 characters or less</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Back (Answer) - {editedBack.length}/{MAX_BACK_CHARS}
            </label>
            <textarea
              value={editedBack}
              onChange={(e) => setEditedBack(e.target.value)}
              className={`w-full p-2 border rounded resize-y min-h-[120px]
                          focus:ring-2 focus:outline-none
                          ${!isBackValid ? "border-red-500 focus:ring-red-500" : "border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"}`}
              data-testid="edit-back-input"
            />
            {!isBackValid && editedBack.length > MAX_BACK_CHARS && (
              <p className="text-sm text-red-600">Back text must be 500 characters or less</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleCancelEdit} data-testid="cancel-edit-button">
              Cancel
            </Button>
            <Button onClick={handleEditComplete} disabled={!isValid} data-testid="save-edit-button">
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="p-4">
            <h3 className="font-medium mb-1 text-neutral-800 dark:text-neutral-100">Front (Question)</h3>
            <p className="text-neutral-700 dark:text-neutral-300">{proposal.front}</p>
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1 text-neutral-800 dark:text-neutral-100">Back (Answer)</h3>
            <p className="text-neutral-700 dark:text-neutral-300">{proposal.back}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex border-t border-neutral-200 dark:border-neutral-800 divide-x divide-neutral-200 dark:divide-neutral-800">
          <Button
            variant="ghost"
            className={`flex-1 rounded-none py-2 h-auto text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 ${proposal.isAccepted ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => onAccept(index)}
            disabled={proposal.isAccepted}
            data-testid="accept-button"
          >
            Accept
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-none py-2 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={() => setIsEditing(true)}
            data-testid="edit-button"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-none py-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ${!proposal.isAccepted ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => onReject(index)}
            disabled={!proposal.isAccepted}
            data-testid="reject-button"
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
