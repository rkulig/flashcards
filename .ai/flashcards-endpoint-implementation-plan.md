# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Przegląd punktu końcowego
Endpoint umożliwia tworzenie pojedynczych lub wielu fiszek jednocześnie, zarówno manualnie wprowadzonych przez użytkownika, jak i wygenerowanych przez AI (w formie niezmienionej lub zmodyfikowanej). Endpoint przeprowadza walidację danych wejściowych i zapisuje fiszki w bazie danych.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards`
- Nagłówki:
  - `Content-Type: application/json`
- Request Body:
  ```json
  {
    "flashcards": [
      {
        "front": "Question text 1",
        "back": "Answer text 1",
        "source": "manual", // lub "ai-full" lub "ai-edited"
        "generation_id": null // wymagany dla fiszek AI, null dla manualnych
      },
      {
        "front": "Question text 2",
        "back": "Answer text 2",
        "source": "manual",
        "generation_id": null
      }
    ]
  }
  ```

## 3. Wykorzystywane typy
1. **FlashcardCreateDto**:
   ```typescript
   interface FlashcardCreateDto {
     front: string;
     back: string;
     source: "manual" | "ai-full" | "ai-edited";
     generation_id: number | null;
   }
   ```

2. **FlashcardsCreateCommand**:
   ```typescript
   interface FlashcardsCreateCommand {
     flashcards: FlashcardCreateDto[];
   }
   ```

3. **FlashcardInsert**:
   ```typescript
   interface FlashcardInsert {
     front: string;
     back: string;
     source: "manual" | "ai-full" | "ai-edited";
     generation_id: number | null;
     user_id: string;
   }
   ```

4. **CreateFlashcardsResponseDto**:
   ```typescript
   interface CreateFlashcardsResponseDto {
     flashcards: FlashcardDto[];
   }
   ```

5. **Zod Schema dla walidacji**:
   ```typescript
   const flashcardSchema = z.object({
     front: z.string().min(3).max(200),
     back: z.string().min(3).max(500),
     source: z.enum(["manual", "ai-full", "ai-edited"]),
     generation_id: z.number().int().positive().nullable()
   });

   export const flashcardsCreateSchema = z.object({
     flashcards: z.array(flashcardSchema)
       .min(1, "At least one flashcard is required")
       .max(50, "Maximum 50 flashcards per request")
       .refine(cards => {
         // Sprawdzenie czy wszystkie fiszki mają ten sam typ źródła
         const sources = new Set(cards.map(card => card.source));
         return sources.size === 1;
       }, "All flashcards must have the same source type")
       .refine(cards => {
         // Sprawdzenie czy wszystkie fiszki AI mają to samo generation_id
         const source = cards[0].source;
         if (source === "manual") {
           return cards.every(card => card.generation_id === null);
         } else {
           const genIds = new Set(cards.map(card => card.generation_id));
           return genIds.size === 1 && genIds.has(null) === false;
         }
       }, "AI-generated flashcards must have the same generation_id, manual flashcards must have null generation_id")
   });
   ```

## 4. Szczegóły odpowiedzi
- Kod statusu: 201 Created
- Nagłówki:
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "flashcards": [
      {
        "id": 123,
        "front": "Question text 1",
        "back": "Answer text 1",
        "source": "manual",
        "generation_id": null,
        "created_at": "2023-07-15T14:23:45Z",
        "updated_at": "2023-07-15T14:23:45Z"
      },
      {
        "id": 124,
        "front": "Question text 2",
        "back": "Answer text 2",
        "source": "manual",
        "generation_id": null,
        "created_at": "2023-07-15T14:23:45Z",
        "updated_at": "2023-07-15T14:23:45Z"
      }
    ]
  }
  ```

## 5. Przepływ danych
1. Odbiór żądania i parsowanie JSON
2. Walidacja struktury żądania za pomocą schematu Zod
3. Pobranie informacji o użytkowniku z tokenu Supabase
4. Jeśli `generation_id` jest podane, sprawdzenie czy istnieje i należy do aktualnego użytkownika
5. Przygotowanie danych do zapisu (dodanie `user_id`)
6. Wykonanie operacji INSERT do tabeli `flashcards` w bazie danych
7. Pobranie utworzonych fiszek z ID i timestampami
8. Przygotowanie i wysłanie odpowiedzi

## 6. Względy bezpieczeństwa
2. **Walidacja danych wejściowych**:
   - Limitowanie długości pól `front` (3-200 znaków) i `back` (3-500 znaków)
   - Ograniczenie liczby fiszek w pojedynczym żądaniu (max 50)
   - Walidacja `source` jako jednej z dozwolonych wartości
   - Walidacja zgodności `generation_id` z typem źródła
3. **Relacja typu fiszki i generation_id**:
   - Wszystkie fiszki w żądaniu muszą mieć ten sam typ źródła
   - Dla fiszek AI, sprawdzenie czy generation_id istnieje i należy do użytkownika

## 7. Obsługa błędów
1. **400 Bad Request**:
   - Nieprawidłowa struktura JSON
   - Nieprawidłowe dane wejściowe (nie spełniają wymagań walidacji)
   - Mieszane typy źródeł w jednym żądaniu
   - Niespójne generation_id dla fiszek AI
2. **401 Unauthorized**:
   - Brak tokenu JWT lub nieprawidłowy token
3. **404 Not Found**:
   - Podane generation_id nie istnieje
4. **403 Forbidden**:
   - Próba użycia generation_id, które należy do innego użytkownika
5. **500 Internal Server Error**:
   - Problemy z bazą danych
   - Nieoczekiwane błędy serwera

## 8. Wydajność
1. **Transakcje bazodanowe**:
   - Użycie transakcji do zapewnienia atomowości operacji tworzenia wielu fiszek
2. **Batch Processing**:
   - Obsługa wielu fiszek w jednym żądaniu dla zminimalizowania liczby zapytań HTTP
3. **Indeksowanie**:
   - Wykorzystanie indeksów bazy danych dla szybkiego wyszukiwania generation_id
4. **Walidacja**:
   - Wczesna walidacja danych przed interakcją z bazą danych

## 9. Kroki implementacji
1. **Utworzenie schematu walidacji**:
   - Zdefiniowanie `flashcardsCreateSchema` w `src/lib/schemas/flashcard.schema.ts`

2. **Implementacja serwisu dla fiszek**:
   - Utworzenie `FlashcardService` w `src/lib/services/flashcard.service.ts`
   - Implementacja metody `createFlashcards` obsługującej logikę biznesową

3. **Implementacja endpointu**:
   - Utworzenie `src/pages/api/flashcards.ts` z obsługą metody POST
   - Parsowanie i walidacja żądania za pomocą schematu Zod
   - Przekazanie danych do FlashcardService
   - Zwrócenie odpowiedniej odpowiedzi