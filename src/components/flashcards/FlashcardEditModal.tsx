import React, { useState, useEffect } from "react";
import type { FlashcardDto, FlashcardUpdateDto, Source } from "../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface FlashcardEditModalProps {
  isOpen: boolean;
  flashcardToEdit: FlashcardDto | null;
  onClose: () => void;
  onSave: (updated: FlashcardUpdateDto) => Promise<void>;
}

const FlashcardEditModal: React.FC<FlashcardEditModalProps> = ({ isOpen, flashcardToEdit, onClose, onSave }) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [source, setSource] = useState<Source>("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  // Populate form when flashcard changes
  useEffect(() => {
    if (flashcardToEdit) {
      setFront(flashcardToEdit.front);
      setBack(flashcardToEdit.back);
      setSource(flashcardToEdit.source as Source);
      setErrors({});
    }
  }, [flashcardToEdit]);

  const validateForm = () => {
    const newErrors: { front?: string; back?: string } = {};

    if (!front.trim()) {
      newErrors.front = 'Pole "Przód" jest wymagane';
    } else if (front.trim().length < 3) {
      newErrors.front = 'Pole "Przód" musi mieć co najmniej 3 znaki';
    } else if (front.trim().length > 200) {
      newErrors.front = 'Pole "Przód" może mieć maksymalnie 200 znaków';
    }

    if (!back.trim()) {
      newErrors.back = 'Pole "Tył" jest wymagane';
    } else if (back.trim().length < 3) {
      newErrors.back = 'Pole "Tył" musi mieć co najmniej 3 znaki';
    } else if (back.trim().length > 500) {
      newErrors.back = 'Pole "Tył" może mieć maksymalnie 500 znaków';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !flashcardToEdit) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updated: FlashcardUpdateDto = {
        front: front.trim(),
        back: back.trim(),
        source,
        generation_id: source === "manual" ? null : flashcardToEdit.generation_id,
      };

      await onSave(updated);
    } catch (error) {
      console.error("Error updating flashcard:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!flashcardToEdit) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-front" className="text-sm font-medium">
              Przód fiszki
            </label>
            <Input
              id="edit-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Wpisz tekst na przód fiszki..."
              className={errors.front ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.front && <p className="text-sm text-red-500">{errors.front}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-back" className="text-sm font-medium">
              Tył fiszki
            </label>
            <Textarea
              id="edit-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Wpisz tekst na tył fiszki..."
              className={errors.back ? "border-red-500" : ""}
              disabled={isSubmitting}
              rows={3}
            />
            {errors.back && <p className="text-sm text-red-500">{errors.back}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-source" className="text-sm font-medium">
              Źródło
            </label>
            <Select value={source} onValueChange={(value) => setSource(value as Source)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz źródło" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Ręczna</SelectItem>
                <SelectItem value="ai-full">AI</SelectItem>
                <SelectItem value="ai-edited">AI (edytowana)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardEditModal;
