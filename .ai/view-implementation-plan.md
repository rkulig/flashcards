# API Endpoint Implementation Plan: GET /api/generations

## 1. Przegląd punktu końcowego
„GET /api/generations” służy do dostarczenia interfejsu użytkownika (UI) do wprowadzenia tekstu źródłowego i uruchomienia generowania fiszek.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- URL: `/api/generations`
- Nagłówki:
  - `Authorization: Bearer <JWT>` (Supabase Auth)
- Parametry:
  - Brak parametrów ścieżki i zapytania
- Request Body: brak

## 3. Szczegóły odpowiedzi
- 200 OK (text/html)
  - Renderowany SSR HTML + osadzony komponent (Astro Island lub React) z:
    - `<textarea name="source_text">`
    - `<button id="generate">Generate flashcards</button>`
    - Skrypt front-endowy wysyłający POST:
      ```ts
      interface GenerateFlashcardsCommand {
        source_text: string;
      }
      ```
- 401 Unauthorized
  - Gdy JWT nieobecny lub nieważny — `WWW-Authenticate: Bearer`
- 404 Not Found
  - Gdy ścieżka nieznaleziona lub feature wyłączony
- 500 Internal Server Error
  - Nieoczekiwane błędy serwera

## 4. Przepływ danych
1. Klient wysyła GET `/api/generations` wraz z nagłówkiem Authorization.
2. Handler SSR w `src/pages/api/generations.ts`:
   - Pobiera instancję Supabase z `context.locals.supabase`.
   - Weryfikuje i dekoduje JWT (z pola `sub → user_id`).
   - Renderuje HTML z formularzem i osadzonym komponentem.
3. Klient:
   - Użytkownik wpisuje `source_text`.
   - Kliknięcie przycisku GenerateButton uruchamia żądanie POST `/api/generations`.

## 5. Względy bezpieczeństwa
- Autoryzacja:
  - Weryfikacja JWT w handlerze GET.

## 6. Obsługa błędów
- 401 Unauthorized:
  - Brak/token nieważny → front-end przekierowuje do `/api/login`.
- 404 Not Found:
  - Domyślny mechanizm Astro.
- 500 Internal Server Error:
  - Logowanie szczegółów błędu w konsoli serwera.
  - Wyświetlenie prostego komunikatu UI „Wystąpił błąd, spróbuj ponownie później.”

## 7. Rozważania dotyczące wydajności
- SSR o niskim narzucie zasobów — pojedyncza strona z małą liczbą komponentów.
- Cache'owanie na poziomie edge (per-user stale-while-revalidate).
- Minimalizacja bundle'u JS (Astro Islands only).

## 8. Kroki implementacji
1. Utworzyć plik `src/pages/api/generations.ts` z:
   - `export const prerender = false;`
   - `export async function GET({ context }) { ... }`
2. W handlerze GET:
   - Odczytać Supabase Client z `context.locals.supabase`.
   - Zweryfikować JWT i pobrać `user_id`.
   - Przygotować i zwrócić SSR Response z HTML.
3. Stworzyć komponent UI (Astro Island lub React) z:
   - `<textarea name="source_text" />`
   - `<button id="generate" />`
   - Logiką front-end do wysyłki POST.
4. Zaimplementować w `package.json` niezbędne zależności (jeśli brak):
   - `@supabase/supabase-js`
   - `zod` (dla POST)
5. Napisać testy integracyjne:
   - GET zwraca 200 + poprawny HTML.
   - Brak JWT → 401.
