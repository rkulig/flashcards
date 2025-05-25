# Specyfikacja modułu rejestracji i logowania użytkowników (MVP)

Poniższa specyfikacja opisuje architekturę modułu autentykacji i autoryzacji użytkowników w aplikacji Flashcards, uwzględniając wymagania z pliku `PRD.md` (US-009) oraz stos technologiczny z `tech-stack.md`.

## 1. Architektura interfejsu użytkownika

### 1.1 Strony i layouty

**Publiczne strony (tryb non-auth):**
- `/auth`
  - Plik: `src/pages/auth.astro`
  - Layout: `AuthLayout.astro` (lub dedykowany `PublicLayout.astro` z sekcją auth)
  - Zawartość: komponent React `<AuthPage client:load />` obsługujący formularze logowania i rejestracji.

**Chronione strony (tryb auth):**
- `/flashcards`, `/generations`
  - Pliki: `src/pages/flashcards.astro`, etc.
  - Layout: `ProtectedLayout.astro` z frontmatter:
    ```ts
    export const prerender = false;
    export const ssr = true;
    ```
  - Działanie: podczas SSR wywoływany jest serwis sesji (Supabase) na podstawie cookie; brak ważnej sesji → przekierowanie do `/auth`.

### 1.2 Komponenty React i ich odpowiedzialności

`src/components/auth/AuthPage.tsx` (client:load):
- Stan wewnętrzny: `mode: 'login' | 'register'`.
- Pola formularza:
  - `email: string`
  - `password: string`
  - `confirmPassword: string` (tylko w trybie rejestracji)
- Walidacja po stronie klienta (z wykorzystaniem Zod lub manualnie):
  - `email`: poprawny format adresu e-mail
  - `password`: min. 6 znaków
  - `confirmPassword === password` (tylko register)
- UI:
  - Przełączanie między zakładkami Logowanie/Rejestracja
  - Przycisk submit (`Zaloguj się` lub `Zarejestruj się`), stan loading
  - Pola z walidacją i wyświetlanie komunikatów błędów inline
- Integracja z backendem:
  - Wywołanie fetch POST:
    - `/api/auth/login` (tryb logowania)
    - `/api/auth/register` (tryb rejestracji)
  - Oczekiwana odpowiedź JSON:
    ```json
    { "success": boolean, "message"?: string }
    ```
  - Sukces → `window.location.href = '/dashboard'`
  - Błąd → wyświetlenie zwróconego komunikatu `message`

### 1.3 Obsługa walidacji i komunikatów błędów

**Frontend:**
- Puste pole → „Pole nie może być puste”
- Nieprawidłowy email → „Nieprawidłowy format adresu e-mail”
- Hasło < 6 znaków → „Hasło musi mieć co najmniej 6 znaków”
- Niepasujące hasła → „Hasła muszą być identyczne”
- Błędy zwrócone z API → przekazany w polu `message`

**Główne scenariusze:**
1. Rejestracja nowego użytkownika (poprawne i błędne dane)
2. Logowanie istniejącego użytkownika (poprawne i błędne dane)
3. Brak łączności z API / timeout
4. Próba wejścia na chronioną stronę bez sesji → redirect do `/auth`

## 2. Logika backendowa

### 2.1 Schematy i walidacja danych wejściowych

`src/lib/schemas/auth.schema.ts`:
- `loginSchema`:
  ```ts
  import { z } from 'zod';
  export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  });
  ```
- `registerSchema`: analogiczny jak `loginSchema` (bez confirmPassword)

### 2.2 Struktura endpointów API

Nowa struktura katalogu:
```
src/pages/api/auth/
├─ login.ts      (POST)
├─ register.ts   (POST)
└─ logout.ts     (POST)
```

Każdy endpoint:
- `export const prerender = false;`
- `export const POST: APIRoute = async ({ request, cookies, env }) => { ... }`
- Kolejne kroki:
  1. Parsowanie i walidacja body przy użyciu Zod
  2. Wywołanie odpowiedniej metody w `AuthService`
  3. Ustawienie cookie sesji (`cookies.set('sb:session', ...)`)
  4. Zwrócenie JSON z `success` i ewentualnym `message` oraz danymi user/session

### 2.3 Serwis autentykacji (backend)

`src/lib/services/auth.service.ts`:
```ts
export class AuthService {
  constructor(private supabaseServer: SupabaseClient) {}

  async register(email: string, password: string) { /* supabase.auth.signUp */ }
  async login(email: string, password: string) { /* supabase.auth.signInWithPassword */ }
  async logout() { /* supabase.auth.signOut */ }
  async getSession(cookies) { /* supabase Server Client z cookie */ }
}
```

### 2.4 Obsługa wyjątków i kody HTTP

- 400 Bad Request → błędy walidacji Zod
- 401 Unauthorized → niepoprawne dane logowania lub brak sesji
- 500 Internal Server Error → inne nieoczekiwane błędy

Format odpowiedzi błędu:
```json
{ "success": false, "error": "Opis błędu" }
```

## 3. System autentykacji z Supabase

### 3.1 Konfiguracja środowiska

Plik `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3.3 Integracja i przepływ

1. **Rejestracja/login:**
   - AuthPage → fetch `/api/auth` → `auth.service` → Supabase → cookie + response
   - Po sukcesie klient przekierowuje do `/flashcards`.
2. **Dostęp do chronionych zasobów:**
   - `ProtectedLayout.astro` (SSR) → `getServerSupabase()` → `supabase.auth.getSession()`
   - Brak sesji → redirect do `/auth`.
3. **Wylogowanie:**
   - Przycisk / endpoint `/api/auth/logout` → `supabase.auth.signOut()` → czyszczenie cookie → redirect `/auth`.

---

*Powyższa specyfikacja stanowi plan realizacji modułu autentykacji w architekturze MVP, nie zawiera gotowej implementacji, ale precyzyjnie wskazuje pliki, komponenty, serwisy i kontrakty API.* 