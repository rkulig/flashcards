# Plan implementacji widoku "Moje Fiszki"

## 1. Przegląd
Widok "Moje Fiszki" służy do przeglądania, edycji i usuwania zapisanych fiszek przez zalogowanego użytkownika. Umożliwia także dodawanie nowych fiszek (ręcznie tworzonych lub generowanych przez AI).

## 2. Routing widoku
Widok będzie dostępny pod ścieżką:  
• /flashcards

## 3. Struktura komponentów
Proponowana hierarchia komponentów:
1. FlashcardsPage (główny kontener zarządzający stanem widoku i komunikacją z API)
   - FlashcardsList (lista fiszek z przyciskami edycji i usuwania)
   - AddFlashcardButton (przycisk otwierający modal tworzenia nowej fiszki)
   - FlashcardEditModal (modal do edycji istniejącej fiszki)
   - FlashcardCreateModal (modal do tworzenia nowej fiszki)

## 4. Szczegóły komponentów

### 4.1 FlashcardsPage
- Opis: Główny kontener odpowiedzialny za pobieranie danych z API, zarządzanie stanem (np. lista fiszek, paginacja) i wyświetlanie listy oraz modali edycji/tworzenia.
- Główne elementy:
  - Węzeł główny (div lub główny container)
  - Komponent FlashcardsList
  - Komponent AddFlashcardButton
  - Komponent FlashcardEditModal (renderowany warunkowo)
  - Komponent FlashcardCreateModal (renderowany warunkowo)
- Obsługiwane interakcje:
  - Wczytanie widoku → wywołanie GET /api/flashcards
  - Obsługa zdarzeń z listy (edycja/usuwanie)
  - Obsługa zdarzeń z modali (zapis nowej lub zmienionej fiszki)
- Obsługiwana walidacja:
  - Walidacja warstwowa: docelowo na poziomie modali (przód/tył fiszki, source, limit znaków)
- Typy:
  - FlashcardDto (zdefiniowany w src/types.ts)
  - Response z GET /api/flashcards (FlashcardsListResponseDto)
- Propsy: Brak bezpośrednich, komponent jest wywoływany w obrębie ścieżki /flashcards.

### 4.2 FlashcardsList
- Opis: Wyświetla listę fiszek w formie paginowanej. Pozwala na kliknięcie edycji/usuń przy każdej fiszce.
- Główne elementy:
  - Lista elementów (ul, table lub grid) + elementy listy (li, row)
  - Przyciski edycji i usuwania dla każdej fiszki
  - Sekcja paginacji (opcjonalnie stronicowanie)
- Obsługiwane interakcje:
  - Kliknięcie "Edytuj" → otwarcie FlashcardEditModal
  - Kliknięcie "Usuń" → wywołanie DELETE /api/flashcards/{id}, potwierdzenie przed usunięciem
- Obsługiwana walidacja: Brak dodatkowej, podstawowa dostępność i alignment z modelem
- Typy: FlashcardDto (do wypełnienia listy)
- Propsy:
  - flashcards: FlashcardDto[] (lista fiszek)
  - onEdit: (id: number) => void (handler do wywołania modalu edycji)
  - onDelete: (id: number) => void (handler do usuwania fiszki)

### 4.3 AddFlashcardButton
- Opis: Przycisk otwierający modal do dodawania nowej fiszki.
- Główne elementy: <button> z ikonką lub etykietą "Dodaj nową fiszkę"
- Obsługiwane interakcje: onClick otwiera FlashcardCreateModal
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy:
  - onClick: () => void

### 4.4 FlashcardEditModal
- Opis: Modal służący do edycji istniejącej fiszki.
- Główne elementy:
  - Formik lub inny formularz zawierający pola: front, back, source, generation_id
  - Przycisk "Zapisz" (wywołuje PUT /api/flashcards/{id})
  - Przycisk "Anuluj" (zamyka modal)
- Obsługiwane interakcje:
  - onSubmit → walidacja pól → PUT /api/flashcards/{id} → aktualizacja widoku
  - onCancel → zamyka modal bez zapisu
- Warunki walidacji:
  - front: wymagany, min 3 znaki, max 200
  - back: wymagany, min 3 znaki, max 500
  - source: "manual" / "ai-full" / "ai-edited" (jeśli "manual", to generation_id musi być null)
- Typy:
  - FlashcardUpdateDto (częściowe pola front, back, source, generation_id)
- Propsy:
  - isOpen: boolean (czy modal ma być widoczny)
  - flashcardToEdit: FlashcardDto | null
  - onClose: () => void (zamyka modal)
  - onSave: (updated: FlashcardUpdateDto) => Promise<void>

### 4.5 FlashcardCreateModal
- Opis: Modal do tworzenia nowej fiszki ręcznie.
- Główne elementy:
  - Formularz z polami "front" i "back"
  - Wybór source = "manual" (domyślne)
  - Przycisk "Zapisz" (wywołuje POST /api/flashcards)
  - Przycisk "Anuluj"
- Obsługiwane interakcje:
  - onSubmit → walidacja → POST /api/flashcards → odświeżenie listy
  - onCancel → zamyka modal
- Warunki walidacji:
  - front: wymagany, min 3 znaki, max 200
  - back: wymagany, min 3 znaki, max 500
- Typy:
  - FlashcardCreateDto (front, back, source, generation_id)
- Propsy:
  - isOpen: boolean
  - onClose: () => void
  - onCreate: (newCard: FlashcardCreateDto) => Promise<void>

## 5. Typy
1. FlashcardDto (zdefiniowany w src/types.ts)  
   - id: number  
   - front: string  
   - back: string  
   - source: "ai-full" | "ai-edited" | "manual"  
   - generation_id: number | null  
   - created_at: string  
   - updated_at: string  

2. FlashcardCreateDto  
   - front: string  
   - back: string  
   - source: "ai-full" | "ai-edited" | "manual"  
   - generation_id: number | null  

3. FlashcardUpdateDto  
   - front?: string  
   - back?: string  
   - source?: "ai-full" | "ai-edited" | "manual"  
   - generation_id?: number | null  

4. FlashcardsListResponseDto  
   - data: FlashcardDto[]  
   - pagination: { page: number; limit: number; total: number }

## 6. Zarządzanie stanem
- Główny stan przechowywany w FlashcardsPage:  
  - listę fiszek  
  - informacje o paginacji (page, limit, total)  
  - flagi otwarcia modalu edycji i tworzenia  
  - aktualnie wybierana fiszka do edycji  
- Można skorzystać z React.useState do sterowania widocznością modali i React Query lub innej biblioteki do pobierania danych z API i aktualizacji stanu.

## 7. Integracja API
- GET /api/flashcards do pobierania listy fiszek  
  - Odpowiedź typu FlashcardsListResponseDto  
- POST /api/flashcards do tworzenia nowych fiszek (wysyła tablicę z jedną lub wieloma nowymi fiszkami)  
- PUT /api/flashcards/{id} do aktualizacji wybranej fiszki  
- DELETE /api/flashcards/{id} do usuwania fiszki  
- Należy obsłużyć błędy 4xx (np. 400, 404, 401) i 5xx w obszarze frontu.

## 8. Interakcje użytkownika
1. Przegląd listy fiszek przy wejściu na /flashcards.  
2. Dodanie nowej fiszki: klik przycisku "Dodaj nową fiszkę" → otwarcie FlashcardCreateModal → wypełnienie pól → zapis → reload listy.  
3. Edycja istniejącej fiszki: klik "Edytuj" → otwarcie FlashcardEditModal → zmiana pól → zapis → aktualizacja listy.  
4. Usunięcie fiszki: klik "Usuń" → potwierdzenie → wysłanie DELETE → usunięcie fiszki z listy.

## 9. Warunki i walidacja
- Walidacja pól w modalu tworzenia/edycji:  
  - front: 3–200 znaków  
  - back: 3–500 znaków  
  - source: jedna z wartości ["manual", "ai-full", "ai-edited"]  
  - generation_id: null, jeśli source="manual"; wartość liczbowa jeśli "ai-full" lub "ai-edited"  
- Validacja API w razie błędu zwraca 400, co przekładamy na komunikat w formularzu.

## 10. Obsługa błędów
- Błędy 400–422 (niewłaściwe dane) → wyświetlamy użytkownikowi komunikaty w formie walidacji formularza.  
- Błąd 401 (brak autoryzacji) → przekierowanie do logowania lub wyświetlenie komunikatu "Zaloguj się ponownie".  
- Błąd 404 → fiszka nie istnieje; można wyświetlić stosowny komunikat.  
- Błąd 500 → wyświetlamy komunikat o błędzie serwera i sugerujemy ponowienie próby.

## 11. Kroki implementacji
1. Utwórz plik FlashcardsPage.tsx i zaimplementuj główną logikę pobierania listy fiszek (GET /api/flashcards).  
2. Zaimportuj i wyświetl FlashcardsList, przekazując listę fiszek oraz funkcje onEdit, onDelete.  
3. Dodaj przycisk "Dodaj nową fiszkę" (AddFlashcardButton) w FlashcardsPage i obsłuż otwieranie FlashcardCreateModal.  
4. Zaimplementuj FlashcardCreateModal, w tym formularz i logikę POST /api/flashcards. Po sukcesie przeładuj listę fiszek.  
5. Zaimplementuj FlashcardEditModal, wypełniając pola formularza danymi fiszki, a następnie PUT /api/flashcards/{id} po zapisie.  
6. W FlashcardsList dodaj obsługę usuwania (DELETE /api/flashcards/{id}) z potwierdzeniem.  
7. Dodaj obsługę błędów w obrębie modali (wyświetlanie komunikatów) oraz w globalnym try/catch.  
8. Przetestuj przepływy tworzenia, edycji i usuwania fiszek pod kątem poprawności walidacji i spójności z danymi.  
9. Zaimplementuj paginację, jeśli jest wymagana (wykorzystanie parametru page, limit).  
10. Zweryfikuj dostępność (ARIA) przycisków i formularzy.  
11. Opcjonalnie zaimplementuj animacje w modalach i feedback wizualny (np. loader w trakcie ładowania). 