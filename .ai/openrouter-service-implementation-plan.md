# Plan implementacji usługi OpenRouterService

## 1. Opis usługi
OpenRouterService to moduł odpowiedzialny za komunikację z API OpenRouter (openrouter.ai). Umożliwia:
- Wysyłanie zapytań typu "chat completion" z historią wiadomości.
- Definiowanie wiadomości systemowej i użytkownika.
- Otrzymywanie ustrukturyzowanych odpowiedzi w formacie JSON opartym o zdefiniowany schemat.
- Konfigurację używanego modelu i parametrów (temperatura, liczba tokenów, itp.).
- Obsługę błędów i logowanie.

## 2. Opis konstruktora
```ts
constructor(config: {
  apiKey: string;
  baseUrl?: string;            // np. "https://openrouter.ai/v1"
  defaultModel?: string;       // np. "gpt-4o"
  defaultParams?: Record<string, any>;
  logger?: Logger;
})
```
- `apiKey` (wymagane) – klucz API OpenRouter pobierany z BEZPIECZNEGO źródła (env).
- `baseUrl` – opcjonalny punkt dostępu.
- `defaultModel` – nazwa modelu domyślnego.
- `defaultParams` – zestaw domyślnych parametrów.
- `logger` – instancja loggera (np. SLF4J/Logback lub innego).

## 3. Publiczne metody i pola
1. **metody**  
   1. `chatCompletion(messages: Message[], options?: ChatOptions): Promise<ChatResponse>`  
   2. `getSupportedModels(): Promise<string[]>`  
   3. `setDefaultModel(modelName: string): void`  
   4. `setDefaultParams(params: Record<string, any>): void`  
2. **pola**  
   - `apiKey: string`  
   - `baseUrl: string`  
   - `defaultModel: string`  
   - `defaultParams: Record<string, any>`

## 4. Prywatne metody i pola
1. `buildPayload(messages: Message[], opts: ChatOptions): OpenRouterRequest`  
2. `sendRequest(payload: OpenRouterRequest): Promise<OpenRouterRawResponse>`  
3. `validateResponse(raw: OpenRouterRawResponse): ChatResponse`  
4. `handleError(error: any): never`  
5. Pole `httpClient` – prekonfigurowany klient HTTP (axios/fetch)  
6. Pole `responseValidator` – moduł walidujący zgodność z JSON Schema

## 5. Obsługa błędów
1. **Błąd sieciowy / timeout**  
   • Retry z backoffem (np. 3 próby, rosnący czas oczekiwania).  
2. **Błąd autoryzacji (401/403)**  
   • Rzucenie `AuthenticationError`; brak retry.  
3. **Rate limit (429)**  
   • Odczekanie `Retry-After`; ponowna próba lub eskalacja.  
4. **Błąd serwera (5xx)**  
   • Retry z ograniczeniem prób; jeśli dalej, rzucenie `ServiceUnavailableError`.  
5. **Niepoprawna odpowiedź / schema mismatch**  
   • ValidationError z opisem brakujących/podstawowych pól.  
6. **Błąd parsowania JSON**  
   • SyntaxError; log z surową odpowiedzią.

## 6. Kwestie bezpieczeństwa
- Klucz API przechowywany wyłącznie w zmiennych środowiskowych (np. `OPENROUTER_API_KEY`).
- Komunikacja wyłącznie przez HTTPS.
- Ograniczenie logowania wrażliwych danych (nie logować pełnych wiadomości użytkowników lub API key).
- Weryfikacja i sanitizacja inputu (uniknięcie injection).
- Stosowanie CORS i nagłówków bezpieczeństwa w warstwie HTTP (jeśli używane).
- Ograniczenie liczby requestów na użytkownika (rate limiting).

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska**
   - Utwórz zmienne env:
     • `OPENROUTER_BASE_URL` (opcjonalnie)  
     • `OPENROUTER_DEFAULT_MODEL`  
   - Sprawdź narzędzie do zarządzania sekretami (Vault, GitHub Secrets).

2. **Struktura plików**
   ```
   src/
     services/
       openrouter/
         config.ts
         types.ts
         OpenRouterService.ts
         errors.ts
         validators.ts
         index.ts
   ```

3. **Zdefiniuj typy (src/services/openrouter/types.ts)**
   ```ts
   export interface Message { role: 'system' | 'user' | 'assistant'; content: string }
   export interface ChatOptions {
     responseFormat?: {
       type: 'json_schema';
       json_schema: {
         name: string;
         strict: boolean;
         schema: Record<string, any>;
       };
     };
     modelName?: string;
     params?: Record<string, any>;
   }
   export interface ChatResponse { data: any; raw: any }
   ```

4. **Loader konfiguracji (config.ts)**
   ```ts
   export const config = {
     apiKey: process.env.OPENROUTER_API_KEY!,
     baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/v1',
     defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'gpt-4o',
   };
   ```

5. **Implementacja OpenRouterService (OpenRouterService.ts)**
   - Konstruktor przyjmuje `config` i `logger`.
   - `chatCompletion()`:
     1. Buduje `payload`:
        ```json
        {
          "model": opts.modelName || defaultModel,
          "messages": [
            { "role": "system", "content": "Twój system prompt" },   // przykład #1
            { "role": "user",   "content": "User input content" }     // przykład #2
          ],
          "response_format": {
            "type": "json_schema",
            "json_schema": {
              "name": "chat_response_schema",
              "strict": true,
              "schema": {
                "reply": { "type": "string" },
                "sentiment": { "type": "string", "enum": ["positive","neutral","negative"] }
              }
            }
          },                                                          // przykład #3
          "temperature": 0.7,                                          // przykład #4
          "top_p": 0.9
        }
        ```
     2. Wysyła żądanie `POST /chat/completions`.
     3. Waliduje odpowiedź zgodnie z `schema`.
     4. Zwraca `ChatResponse`.

6. **Walidacja odpowiedzi (validators.ts)**
   - Użyj `ajv` lub innego validatora JSON Schema.
   - Rzuć `ValidationError` przy niezgodnościach.

7. **Obsługa błędów (errors.ts)**
   ```ts
   export class NetworkError extends Error {}
   export class AuthenticationError extends Error {}
   export class RateLimitError extends Error {}
   export class ServiceUnavailableError extends Error {}
   export class ValidationError extends Error {}
   ```

---