# API Endpoint Implementation Plan: /api/auth

## 1. Przegląd punktu końcowego
Endpoint `/api/auth` służy do obsługi logowania i rejestracji użytkowników w jednym punkcie końcowym. Na etapie mocka:
- Zawsze zwraca sukces (status 200)
- Nie wykonuje rzeczywistej autentykacji ani operacji na bazie danych
- Komunikuje się wyłącznie przez JSON

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/auth`
- Nagłówki:
  - `Content-Type: application/json`
- Parametry w ciele żądania:
  - **Wymagane:**
    - `email` (string) — poprawny adres e-mail
    - `password` (string) — min. 6 znaków
    - `mode` ("login" | "register") — określa operację


### Przykład ciała żądania
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "mode": "login"

}
```

## 3. Szczegóły odpowiedzi
- Status: 200 OK
- Nagłówek: `Content-Type: application/json`
- Struktura odpowiedzi:
```json
{
  "success": true,
  "data": {
    "userId": "mock-user-id",
    "token": "mock-jwt-token"
  },
  "message": "Mock authentication successful"
}
```

## 4. Przepływ danych
1. Astro Server Endpoint w `src/pages/api/auth.ts`:
   - `export const POST = async ({ request, locals }) => { ... }`
   - `export const prerender = false`
2. Parsowanie i walidacja ciała żądania przy użyciu Zod (zdefiniować w `src/lib/schemas/auth.schema.ts`).
3. Wywołanie `AuthService.authenticate(requestDto)` (serwis w `src/lib/services/auth.service.ts`).
4. Serwis zwraca dane mockowe.
5. Zwrócenie odpowiedzi 200 z obiektem JSON.

## 5. Względy bezpieczeństwa
- Walidacja wszystkich pól wejściowych (Zod)
- Ustawienie nagłówków CORS i CSRF w middleware (jeśli wymagane)
- W przyszłości: rate limiting na endpoint, uwierzytelnianie JWT, ochrona haseł

## 6. Obsługa błędów
- **400 Bad Request**: niepoprawne dane wejściowe (zwrotka z detalami błędów Zod)
- **500 Internal Server Error**: błąd runtime (logowanie stack trace i zwrotka generyczna)
- Logowanie błędów w konsoli (`console.error`) lub do tabeli `error_logs` w Supabase

## 7. Wydajność
- Mockowy endpoint posiada minimalne opóźnienie (brak operacji I/O)
- W przyszłości: cachowanie wyników, przetwarzanie asynchroniczne

## 8. Kroki implementacji
1. Utworzyć schemat walidacji Zod w `src/lib/schemas/auth.schema.ts`.
2. Zaimplementować `AuthService` w `src/lib/services/auth.service.ts` z metodą `authenticate` zwracającą dane mockowe.
3. Stworzyć plik endpointu `src/pages/api/auth.ts` zgodnie z konwencją Astro:
   - `export const prerender = false`
   - `export const POST = async ({ request, locals }) => { ... }`
4. W endpointcie:
   - Parsować JSON z `request.json()`
   - Walidować przy użyciu Zod
   - Wywołać `AuthService.authenticate`
   - Obsłużyć błędy walidacji i runtime
   - Zwrócić strukturę zgodnie ze specyfikacją
