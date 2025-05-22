# Plan implementacji widoku generowania fiszek

## 1. Przegląd
Widok generowania fiszek umożliwia wklejenie tekstu (od 1000 do 10 000 znaków), wysłanie go do serwera w celu wygenerowania propozycji fiszek przez model AI oraz zarządzanie nimi jeszcze przed zapisaniem w bazie.Następnie użytkownik może przeglądać, zatwierdzać, edytować ich treść lub odrzucić wygenerowane propozcyje fiszek. Na koniec może zapisać do bazy danych wszystkie bądź tylko zaakceptowane fiszki.

## 2. Routing widoku
- Ścieżka: `/generations`   
Widok powinien być dostępny tylko po zalogowaniu użytkownika (sesja użytkownika wymagana).

## 3. Struktura komponentów
Poniżej przedstawiono główne komponenty tworzące widok:

1. GenerationsPage (strona główna widoku)  
   ├─ TextAreaInput (pole tekstowe z licznikiem znaków)  
   ├─ GenerateButton (przycisk "Generuj fiszki")  
   ├─ LoadingIndicator (pokazywany w trakcie oczekiwania na odpowiedź API)  
   └─ FlashcardList (lista propozycji fiszek):  
       ├─ FlashcardListItem (pojedyncza propozycja fiszki)  
       └─ FlashcardActions (akceptuj, edytuj, odrzuć)  

2. SaveFlashcardsPanel (obsługuje zapis zaakceptowanych fiszek)  
   ├─ SaveAllButton  
   └─ SaveAcceptedButton  

## 4. Szczegóły komponentów

### 4.1 GenerationsPage
- Opis:  
  Komponent stanowiący główny widok. Zawiera pole do wprowadzenia tekstu, przycisk generowania, wskaźnik ładowania oraz listę wygenerowanych propozycji fiszek. Odpowiada też za podstawową walidację długości tekstu (1000–10000 znaków).

- Główne elementy:  
  - TextAreaInput: obsługuje wprowadzanie tekstu i liczenie znaków.  
  - GenerateButton: wywołuje akcję żądania do API.  
  - LoadingIndicator: pokazuje stan ładowania podczas komunikacji z serwerem.  
  - FlashcardList: prezentuje listę propozycji fiszek po stronie frontendowej.  

- Obsługiwane interakcje:  
  - Kliknięcie przycisku "Generuj fiszki": wysłanie zapytania do endpointu POST /api/generations.  
  - Walidacja długości tekstu wprowadzonego przez użytkownika (zablokowanie przycisku generowania, gdy liczba znaków < 1000 lub > 10000).

- Obsługiwana walidacja:  
  - Liczba znaków w polu TextAreaInput (przed wywołaniem fetch do API).  
  - Obsługa błędów zwracanych z API (np. 400, 504, 500).  

- Typy (DTO i ViewModel) wymagane przez komponent:  
  - GenerateFlashCardsCommand (zdefiniowany w pliku types.ts) do wysyłania danych do endpointu.  
  - GenerateCreateResponseDto (z pliku types.ts) do parsowania odpowiedzi API.  

- Propsy:  
  - Ten komponent będzie raczej stroną wyższego poziomu, bez zewnętrznych propsów. Większość danych pobiera z kontekstu (np. session) lub zarządza samodzielnie (tekst i stan ładowania).

### 4.2 TextAreaInput
- Opis komponentu:  
  Pole do wprowadzania tekstu, z licznikiem znaków i obsługą zdarzeń onChange.  
- Główne elementy:  
  - Znacznik <textarea> z atrybutami do obsługi liczby znaków i wyświetlania licznika.  
- Obsługiwane interakcje:  
  - onChange: aktualizuje stan licznika i treść tekstu.  
- Obsługiwana walidacja:  
  - Maksymalna i minimalna długość tekstu (1000–10000 znaków).  
- Typy:  
  - Może korzystać z wewnętrznego stanu typu string.  
- Propsy:  
  - value: aktualna wartość tekstu,  
  - onChange: funkcja do przekazania zmian w tekście do rodzica,  
  - minChars, maxChars: wartości do walidacji (1000 i 10000).

### 4.3 GenerateButton
- Opis komponentu:  
  Przycisk wywołujący akcję generowania fiszek.  
- Główne elementy:  
  - <button> z obsługą onClick.  
- Obsługiwane interakcje:  
  - onClick: inicjuje wysłanie żądania do API (o ile walidacja długości tekstu jest spełniona).  
- Walidacja:  
  - Disabled, jeśli tekst nie spełnia warunków.  
- Typy:  
  - Nie wymaga osobnego DTO, przyjmuje callback z rodzica.  
- Propsy:  
  - onClick: callback do akcji generowania.  
  - disabled: boolean decydujący, czy można kliknąć.

### 4.4 FlashcardList
- Opis komponentu:  
  Wyświetla listę propozycji fiszek zwróconych przez serwer. Pozwala użytkownikowi na akcje: akceptacja, edycja i odrzucenie.  
- Główne elementy:  
  - Kontener listy (ul lub div).  
  - FlashcardProposalItem jako element listy.  
- Obsługiwane interakcje:  
  - Brak bezpośrednich, poza przekazywaniem do FlashcardProposalItem.  
- Walidacja:  
  - Nie dotyczy, bo tu tylko prezentacja i przekazanie eventów.  
- Typy:  
  - Wymaga tablicy FlashcardProposalDto (pole: front, back, source).  
- Propsy:  
  - proposals: FlashcardProposalDto[]  
  - onAccept, onEdit, onReject: metody przesyłane do obsługi akcji w pojedynczych elementach.

### 4.5 FlashcardListItem
- Opis komponentu:  
  Pojedyncza propozycja fiszki wyświetlona w liście. Zawiera przyciski do akceptacji, edycji i odrzucenia.  
- Główne elementy:  
  - Tekst front oraz back.  
  - Przyciski: Akceptuj, Edytuj, Odrzuć.  
- Obsługiwane interakcje:  
  - onAccept: ustawia fiszkę jako zaakceptowaną.  
  - onEdit: wywołuje tryb edycji.  
  - onReject: usuwa propozycję z listy.  
- Walidacja:  
  - W momencie edycji użytkownik wprowadza zmiany w front/back – można ponownie użyć podobnej walidacji, np. max 200 znaków na front i 500 na back.  
- Typy:  
  - FlashcardProposalDto (front, back, source = "ai-full").  
- Propsy:  
  - proposal: FlashcardProposalDto.  
  - onAccept, onEdit, onReject: callbacki.

### 4.6 SaveFlashcardsPanel
- Opis komponentu:  
  Wyświetla przyciski "Zapisz wszystkie" lub "Zapisz zaakceptowane". Po kliknięciu wysyła batch do /api/flashcards.  
- Główne elementy:  
  - Dwa przyciski: SaveAllButton, SaveAcceptedButton.  
- Obsługiwane interakcje:  
  - onClick obu przycisków – wysłanie fiszek do bazy.  
- Walidacja:  
  - Sprawdzenie, czy istnieje w ogóle jakaś lista do zapisania.  
- Typy:  
  - Wymaga tablicy FlashcardCreateDto, która jest docelowo wysyłana do /api/flashcards.  
- Propsy:  
  - onSaveAll, onSaveAccepted: metody do obsługi zapisu.  
  - flashcards: tablica z danymi (zaakceptowane i/lub wszystkie).

## 5. Typy
Przy wdrożeniu widoku opieramy się głównie na już istniejących DTO i typach z pliku types.ts:

1. GenerateFlashCardsCommand  
   - { source_text: string }  

2. FlashcardProposalDto  
   - { front: string; back: string; source: "ai-full" }  

3. GenerateCreateResponseDto  
   - { generation_id: number; generated_count: number; flashcards_proposals: FlashcardProposalDto[]; }  

4. FlashcardCreateDto  
   - { front: string; back: string; source: "ai-full" | "ai-edited" | "manual"; generation_id: number | null; }  

Dodatkowo, w widoku można zdefiniować typ ViewModel do przechowywania stanu akceptacji fiszek:  
```ts
interface FlashcardProposalVM extends FlashcardProposalDto {
  isAccepted: boolean;
  isEdited: boolean;
}
```
Dzięki temu możemy łatwo śledzić, które fiszki zostały przekształcone.

## 6. Zarządzanie stanem
- Główny stan (tekst w polu, lista wygenerowanych propozycji) będzie przechowywany w komponencie GenerationsPage za pomocą useState (React).  
- Po wysłaniu zapytania do /api/generations i otrzymaniu listy propozycji, zapisujemy je w stanie (np. proposalsState).  
- Dodatkowo, można przechowywać informację, które fiszki są edytowane, zaakceptowane lub odrzucone (FlashcardProposalVM).  
- Obsługa spinnera (loading) w state, np. setLoading(true/false).  

## 7. Integracja API
- Generowanie fiszek:  
  - Endpoint: POST /api/generations  
  - Żądanie: { source_text: string }  
  - Odpowiedź: { generation_id, generated_count, flashcards_proposals[] }  
- Zapis fiszek:  
  - Endpoint: POST /api/flashcards  
  - Żądanie: { flashcards: FlashcardCreateDto[] }  
  - Odpowiedź: { flashcards: FlashcardDto[] }

## 8. Interakcje użytkownika
1. Użytkownik wkleja lub pisze tekst w polu TextAreaInput.  
2. Odblokowanie przycisku generowania dopiero, gdy tekst ma >=1000 znaków.  
3. Kliknięcie "Generuj fiszki" → wywołanie POST /api/generations → loading = true.  
4. Po sukcesie: wyświetlenie listy propozycji z przyciskami (akceptacja/edycja/odrzucenie).  
5. Użytkownik może edytować tytuł front/back i zmieniać source na "ai-edited" (opcjonalnie w logice).  
6. Kliknięcie "Zapisz wszystkie" lub "Zapisz zaakceptowane" → wywołanie POST /api/flashcards → skopiowanie propozycji do docelowego formatu.  

## 9. Warunki i walidacja
- Walidacja minimalnej liczby znaków (1000) i maksymalnej (10000) w polu input.  
- Walidacja ewentualnego limitu znaków w front/back (200/500) przy edycji.  
- Sprawdzenie, czy użytkownik jest zalogowany (poziom aplikacji).  
- Przechwytywanie błędów 400, 401, 500, 504;  
  - 400 – np. gdy tekst nie przeszedł walidacji.  
  - 401 – brak autoryzacji, przekierowanie do logowania.  
  - 500/504 – błąd serwera lub timeout. Wyświetlenie stosownego komunikatu.

## 10. Obsługa błędów
- W przypadku nieudanej odpowiedzi z /api/generations:  
  - Wyświetlenie komunikatu typu toast lub inline (np. "Nie udało się wygenerować fiszek").  
- W przypadku problemów z /api/flashcards (zapis):  
  - Wyświetlenie informacji, że zapis się nie powiódł. Spróbować ponownie.  
- Timeout 504: komunikat, aby spróbować z krótszym tekstem.

## 11. Kroki implementacji
1. Utworzenie pliku widoku GenerationsPage w katalogu zgodnie ze strukturą (np. /src/pages/generations.astro lub /src/pages/generations.jsx).  
2. Zaimplementowanie TextAreaInput z licznikiem znaków i minimalną/maksymalną długością.  
3. Dodanie przycisku GenerateButton z logiką walidującą i wysyłającą zapytanie do /api/generations.  
4. Zaimplementowanie stanu loading, który wyświetla LoadingIndicator (np. spinner) do czasu uzyskania odpowiedzi.  
5. Utworzenie listy FlashcardList, która renderuje kolekcję FlashcardListItem.  
6. W komponencie FlashcardListItem dodać przyciski akcji (Accept/Edit/Reject), a w edycji uwzględnić walidację front/back.  
7. Utworzenie lub dołączenie SaveFlashcardsPanel, który będzie miał przyciski do masowego zapisu fiszek (wywołania /api/flashcards).  
8. Testy integracyjne (np. w pliku .test.tsx), sprawdzenie obsługi ścieżki `/generations`, walidacji i interakcji z userem.  
9. Przegląd i refactor – upewnienie się, że kod jest zgodny z konwencjami i jest zoptymalizowany pod względem wydajności i czytelności.  
10. Wdrożenie w środowisku testowym/preview i ostateczne sprawdzenie poprawności działania.  