import React from "react";
import { Button } from "../ui/button";

interface AddFlashcardButtonProps {
  onClick: () => void;
}

const AddFlashcardButton: React.FC<AddFlashcardButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick} className="flex items-center gap-2" data-testid="add-flashcard-button">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Dodaj nową fiszkę
    </Button>
  );
};

export default AddFlashcardButton;
