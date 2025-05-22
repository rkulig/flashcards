# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI
Interfejs oparty o bibliotekę komponentów Shadcn/ui, React, responsywy design oparty na Tailwind, z centralną nawigacją w postaci górnego paska `NavigationMenu`, Aplikacja składa się z pięciu głównych widoków, wzajemnie powiązanych przez routing i zarządzanych przez React.

## 2. Lista widoków

### 2.1 Widok Logowania
- Ścieżka: `/login`
- Cel: uwierzytelnienie użytkownika istniejącymi danymi
- Kluczowe informacje: pola `email`, `password`, stan błędu logowania
- Kluczowe komponenty: Formularz logowania, komponent walidacji, przyciski, komunikaty błędów
- UX & dostępność: aria-label na polach, focus-visible, komunikaty o błędach
- Bezpieczeństwo: walidacja front-end, obsługa 401 → przekierowanie na `/login`

### 2.2 Widok Rejestracji
- Ścieżka: `/register`
- Cel: utworzenie nowego konta użytkownika. 
- Kluczowe informacje: pola `email`, `password`, potwierdzenie hasła, walidacja
- Kluczowe komponenty: Formularz rejestracji, komponent walidacji, przyciski, komunikaty błędów
- UX & dostępność: walidacja w locie, aria-live dla komunikatów
- Bezpieczeństwo: zabezpieczenie hasła, komunikat o sukcesie i zalogowanie po rejestracji

### 2.3 Widok Generowania fiszek
- Ścieżka: `/generations`
- Cel: automatyczne tworzenie propozycji fiszek na podstawie tekstu. Jest to domyslny widok po zalogowaniu.
- Kluczowe informacje: 
  - `TextArea` z licznikiem znaków (1000–10000) i przyciskiem generuj fiszki
  - stan ładowania po wysłaniu żądania
  - lista propozycji fiszek z akcjami: `zatwierdź`, `edytuj`, `odrzuć` dla każdej
- Kluczowe komponenty: Komponent wejścia tekstowego, przycisk `generuj fiszki`, lista fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), wskaźnik ładowania (skeleton), komunikaty o błędach
- UX & dostępność: aria-live dla loadera, czytelne komunikaty inline o błędach API
- Bezpieczeństwo: weryfikacja długości tekstu, obsługa 401 → przekierowanie

### 2.4 Widok Moje Fiszki
- Ścieżka: `/flashcards`
- Cel: przegląd, edycja i usuwanie zapisanych fiszek
- Kluczowe informacje: 
  - paginowana lista (limit 20 na stronę)
  - metadata: front, back
- Kluczowe komponenty: Lista elementów, komponent modal edycji, przyciski usuwania, potwierdzenie operacji.
- UX & dostępność: role `grid` i `gridcell`, focus management w modalach
- Bezpieczeństwo: RLS po stronie backendu, token JWT w nagłówkach

### 2.5 Modal edycji fiszek
- Ścieżka: wyswietlany nad widokiem listy fiszek 
- Cel: umożliwienie edycji fiszek z walidacją danych bez zapisu w czasie rzeczywistym
- Kluczowe informacje: formularz edycji fiszki, pola "Przód" oraz "Tył", komunikaty walidacyjne
- Kluczowe komponenty: Modal z formularzem, przyciski "Zapisz" i "Anuluj"
- UX & dostępność: intuicyjny modal, dostepność dla czytników ekranu, walidacja danych po stronie klienta
- Bezpieczeństwo: RLS po stronie backendu, token JWT w nagłówkach

### 2.6 Widok Sesji Nauki
- Ścieżka: `/session`
- Cel: sesja powtórek z fiszkami w kolejności rekomendowanej przez AI
- Kluczowe informacje: 
  - pojedyncza fiszka (`FlashcardView`) z animacją flip
  - przyciski oceny: `Znam`, `Nie znam`
- Kluczowe komponenty: `FlashcardView`, `ButtonGroup`, stan sesji w `StudyContext`
- UX & dostępność: aria-live dla zmiany fiszki, obsługa klawiszy strzałek lub skrótów
- Bezpieczeństwo: ochrona trasy, obsługa 401

### 2.7 Widok Profilu Użytkownika
- Ścieżka: `/dasboard`
- Cel: wyświetlenie danych użytkownika i wylogowanie
- Kluczowe informacje: `username/email`, przycisk `Wyloguj się`, ewentualna opcja `Usuń konto`
- Kluczowe komponenty: `Card`, `Button`, `ConfirmationDialog`
- UX & dostępność: aria-modal w dialogach, potwierdzenie akcji
- Bezpieczeństwo: zapytanie DELETE `/api/users/{id}`, RLS, odświeżenie stanu kontekstu

## 3. Mapa podróży użytkownika
1. Nowy użytkownik trafia na `/register` → po sukcesie przekierowanie na `/generations`.
2. Istniejący użytkownik loguje się na `/login` → przekierowanie na `/generations`.
3. Na `/generations` wkleja tekst → widzi loader → propozycje fiszek → dokonuje akcji `zatwierdź/edytuj/odrzuć` → zapisuje do bazy.
4. Przechodzi do `/flashcards` → przegląda paginowaną listę → edytuje lub usuwa wybrane fiszki.
5. Przechodzi do `/session` → rozpoczyna sesję powtórek → ocenia fiszki → po zakończeniu może wrócić do `/flashcards` lub `/profile`.
6. Na `/profile` może wylogować się lub usunąć konto → przekierowanie na `/login`.

## 4. Układ i struktura nawigacji
- Górny pasek `NavigationMenu` widoczny na wszystkich chronionych trasach.
- Linki: `Generuj` → `/generations`, `Moje fiszki` → `/flashcards`, `Nauka` → `/session`, `Profil` → `/profile`.
- Po lewej logo/aplikacja, po prawej menu użytkownika z dropdownem na `Wyloguj się`.
- Na stronach niezalogowanych: uproszczony topbar z linkami `Logowanie`, `Rejestracja`.
- Responsywny układ z hamburger menu dla mniejszych ekranów.

## 5. Kluczowe komponenty
- Formularze uwierzytelniania: komponenty logowania i rejestracji z obsługą walidacji.
- Komponent generowania fiszek: z polem tekstowym i przyciskiem uruchamiającym proces generacji, z wskaźnikiem ładowania.
- Lista fiszek: interaktywny komponent wyświetlający listę fiszek z opcjami edycji i usuwania.
- Modal edycji: komponent umożlwiający edycję fiszek z walidacją danych przed zatwierdzeniem.
- Toast notifications: komponent do wyświeltania komunikatów o sukcesach oraz błędach.
- Menu nawigacji: Elementy nawigacyjne ułatwiające przemieszczanie się między widokami.
- Komponent sesji powtórek: Interaktywny układ wyświetlania fiszek podczas sesji nauki z mechanizmem oceny.