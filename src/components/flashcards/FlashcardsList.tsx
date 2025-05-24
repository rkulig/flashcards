import React from "react";
import type { FlashcardDto } from "../../types";
import { Button } from "../ui/button";

interface FlashcardsListProps {
  flashcards: FlashcardDto[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const FlashcardsList: React.FC<FlashcardsListProps> = ({ flashcards, onEdit, onDelete }) => {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nie masz jeszcze żadnych fiszek.</p>
        <p>Kliknij &ldquo;Dodaj nową fiszkę&rdquo; aby utworzyć pierwszą.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <div key={flashcard.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Przód:</div>
            <div className="font-medium mb-3">{flashcard.front}</div>

            <div className="text-sm text-gray-500 mb-2">Tył:</div>
            <div className="text-gray-700">{flashcard.back}</div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="text-xs text-gray-400">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded">
                {flashcard.source === "manual" ? "Ręczna" : flashcard.source === "ai-full" ? "AI" : "AI (edytowana)"}
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(flashcard.id)}>
                Edytuj
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(flashcard.id)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Usuń
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashcardsList;
