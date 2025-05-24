import React, { useState, useEffect } from "react";
import type { FlashcardDto, FlashcardsListResponseDto, FlashcardCreateDto, FlashcardUpdateDto } from "../../types";
import FlashcardsList from "./FlashcardsList";
import AddFlashcardButton from "./AddFlashcardButton";
import FlashcardEditModal from "./FlashcardEditModal";
import FlashcardCreateModal from "./FlashcardCreateModal";
import { Button } from "../ui/button";

const FlashcardsPage: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [flashcardToEdit, setFlashcardToEdit] = useState<FlashcardDto | null>(null);

  // Load flashcards on component mount
  useEffect(() => {
    loadFlashcards();
  }, [pagination.page]);

  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/flashcards?page=${pagination.page}&limit=${pagination.limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FlashcardsListResponseDto = await response.json();
      setFlashcards(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas ładowania fiszek");
      console.error("Error loading flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const flashcard = flashcards.find((f) => f.id === id);
    if (flashcard) {
      setFlashcardToEdit(flashcard);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove flashcard from local state
      setFlashcards((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas usuwania fiszki");
      console.error("Error deleting flashcard:", err);
    }
  };

  const handleCreate = async (newCard: FlashcardCreateDto) => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: [newCard] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reload flashcards to get updated list
      await loadFlashcards();
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas tworzenia fiszki");
      console.error("Error creating flashcard:", err);
    }
  };

  const handleSave = async (updated: FlashcardUpdateDto) => {
    if (!flashcardToEdit) return;

    try {
      const response = await fetch(`/api/flashcards/${flashcardToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reload flashcards to get updated data
      await loadFlashcards();
      setIsEditModalOpen(false);
      setFlashcardToEdit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas zapisywania fiszki");
      console.error("Error updating flashcard:", err);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    if (pagination.page < totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Ładowanie fiszek...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Moje Fiszki</h1>
        <AddFlashcardButton onClick={() => setIsCreateModalOpen(true)} />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <FlashcardsList flashcards={flashcards} onEdit={handleEdit} onDelete={handleDelete} />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button variant="outline" onClick={handlePreviousPage} disabled={pagination.page === 1}>
            Poprzednia
          </Button>

          <span className="text-sm text-gray-600">
            Strona {pagination.page} z {totalPages}
          </span>

          <Button variant="outline" onClick={handleNextPage} disabled={pagination.page === totalPages}>
            Następna
          </Button>
        </div>
      )}

      <FlashcardCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <FlashcardEditModal
        isOpen={isEditModalOpen}
        flashcardToEdit={flashcardToEdit}
        onClose={() => {
          setIsEditModalOpen(false);
          setFlashcardToEdit(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default FlashcardsPage;
