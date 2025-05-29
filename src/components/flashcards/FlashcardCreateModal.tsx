import React, { useState } from "react";
import type { FlashcardCreateDto } from "../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { logger } from "../../lib/utils";

interface FlashcardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newCard: FlashcardCreateDto) => Promise<void>;
}

const FlashcardCreateModal: React.FC<FlashcardCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newCard: FlashcardCreateDto = {
        front: front.trim(),
        back: back.trim(),
        source: "manual",
        generation_id: null,
      };

      await onCreate(newCard);
      resetForm();
    } catch (error) {
      logger.error("Error creating flashcard:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFront("");
      setBack("");
      setErrors({});
      onClose();
    }
  };

  const resetForm = () => {
    setFront("");
    setBack("");
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nową fiszkę</DialogTitle>
          <DialogDescription>
            Wypełnij pola poniżej, aby utworzyć nową fiszkę. Przód fiszki to pytanie, a tył to odpowiedź.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="front" className="text-sm font-medium">
              Przód fiszki
            </label>
            <Input
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Wpisz tekst na przód fiszki..."
              className={errors.front ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.front && <p className="text-sm text-red-500">{errors.front}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="back" className="text-sm font-medium">
              Tył fiszki
            </label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Wpisz tekst na tył fiszki..."
              className={errors.back ? "border-red-500" : ""}
              disabled={isSubmitting}
              rows={3}
            />
            {errors.back && <p className="text-sm text-red-500">{errors.back}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardCreateModal;
