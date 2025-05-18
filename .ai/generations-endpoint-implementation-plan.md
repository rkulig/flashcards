# API Endpoint Implementation Plan: POST /api/generations

## 1. Przegląd punktu końcowego
Endpoint służy do przyjmowania długiego tekstu użytkownika (1000–10000 znaków), wywołania zewnętrznego serwisu AI celem wygenerowania propozycji fiszek, zapisania metadanych sesji generacji i wstępnych fiszek w bazie oraz zwrócenia wyników generacji.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- URL: `/api/generations`
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- Parametry:
  - Wymagane:
    - `source_text` (string): tekst wejściowy o długości 1000–10000 znaków
  - Opcjonalne: brak
- Request Body:
  ```json
  {
    "source_text": "<długa_treść>"
  }
  ```

## 3. Wykorzystywane typy
- Komenda żądania: `GenerateFlashCardsCommand`
- DTO odpowiedzi: `GenerateCreateResponseDto`, `FlashcardProposalDto`
- Typy bazodanowe: `GenerationInsert`, `FlashcardInsert`, `GenerationErrorLogInsert`

## 4. Szczegóły odpowiedzi
- Kod 200 OK
- Ciało odpowiedzi:
  ```json
  {
    "generation_id": 42,
    "generated_count": 10,
    "flashcards_proposals": [
      { "front": "Pytanie?", "back": "Odpowiedź.", "source": "ai-full" }
    ]
  }
  ```

## 5. Przepływ danych
1. **Autoryzacja**: wyciągnięcie `user_id` z tokena przez klienta Supabase z `context.locals.supabase`.
2. **Walidacja**: parsowanie i walidacja JSON przez `zod` (min/max długość `source_text`).
3. **Zapis metadanych generacji**:
   - `supabase.from('generations').insert({ user_id, model, source_text_hash, source_text_length, generated_count: 0, generation_duration: 0 })`
   - Otrzymanie `generation_id` i `created_at`.
4. **Generacja AI**:
   - Wywołanie `GenerationService.generateFlashcards(source_text)`
   - Pomiar czasu wywołania (start/end) -> `generation_duration`
   - Otrzymanie listy propozycji fiszek.
5. **Wstawienie propozycji do bazy**:
   - Mapowanie na tablicę insertów: `{ user_id, generation_id, front, back, source: 'ai-full' }`
   - `supabase.from('flashcards').insert(proposals)`
6. **Aktualizacja sesji generacji**:
   - `supabase.from('generations').update({ generated_count, generation_duration }).eq('id', generation_id)`
7. **Odpowiedź**: zwrócenie DTO `GenerateCreateResponseDto` z `generation_id`, `generated_count`, `flashcards_proposals`.

## 6. Względy bezpieczeństwa
- Wymaganie `Authorization: Bearer <token>`; w razie braku/token nieważny zwrócić 401.
- Użycie RLS w Supabase, aby dane były widoczne tylko dla właściciela.
- Nie przechowywanie wrażliwych danych w prostym tekście (hashowanie `source_text_hash`).

## 7. Obsługa błędów
| Kod | Scenariusz                                     | Działanie                                       |
|-----|-----------------------------------------------|--------------------------------------------------|
| 400 | Niepoprawne/za krótkie/za długie `source_text` | Zwróć 400 z komunikatem walidacji               |
| 401 | Brak/nieważny JWT                              | Zwróć 401 Unauthorized                          |
| 500 | Błąd AI lub błąd bazy                          |
|     | - AI error                                    | 
|     | - Wyjątek w serwisie                          |
|     | - Błąd zapisu do `generations`/`flashcards`   |
|     |                                                | *Zarejestruj w `generation_error_logs` i zwróć 500* |

## 8. Rozważania dotyczące wydajności
- Asynchroniczne wywołanie AI z limitem czasu i timeoutem 60s.
- Indeksowanie kolumn `user_id` i `generation_id` w tabelach.

## 9. Kroki implementacji
1. Utworzyć serwis (np. GenerationService) który:
    - integruje się z zewnętrznym serwisem AI. Na etapie developmentu skorzystamy z mocków zamiast wywolywania serwisu AI. 
    - obsługuje logike zapisu do tabli `generations` oraz rejestracji błędów w `generation_error_logs`.
2. Zdefiniować schemat zod dla `GenerateFlashCardsCommand` w `src/lib/schemas/generation.schema.ts`.
3. Utworzyć plik endpointu: `src/pages/api/generations.ts`:
   - `export const POST: APIRoute`
   - Parsowanie i walidacja via zod
   - Pobranie `user_id` z `locals.supabase`
   - Wywołanie `generationService.generateFlashcards(...)`
