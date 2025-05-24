## 1. Przegląd
Widok autoryzacji ma umożliwić zarówno logowanie, jak i rejestrację w ramach jednej strony. Użytkownik może przełączać się między dwoma trybami: "Zaloguj się" oraz "Zarejestruj się". Całość powinna korzystać z endpointu /api/auth, który obsługuje oba tryby w zależności od przekazanego pola mode ("login" lub "register").

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką:
- /api/auth

Ta ścieżka będzie prezentować pojedynczy widok, w którym użytkownik może przejść do logowania lub rejestracji.

## 3. Struktura komponentów
1. AuthPage (strona główna widoku):
   - AuthSwitcher (przełącznik trybów logowania i rejestracji)
   - AuthForm (formularz dynamicznie dostosowujący się do trybu)
     - EmailInput
     - PasswordInput
     - (opcjonalnie) ConfirmPasswordInput (pojawia się wyłącznie w trybie rejestracji)
     - ErrorMessage
     - SubmitButton

## 4. Szczegóły komponentów

### AuthPage
- Opis komponentu: Kontener widoku, który decyduje, czy użytkownik aktualnie chce się zalogować czy zarejestrować. 
- Główne elementy: 
  - Nagłówek lub krótki opis, np. "Witaj, zaloguj się lub zarejestruj".
  - Komponent `AuthSwitcher` umożliwiający przełączanie między trybami.
  - Komponent `AuthForm` renderowany warunkowo w zależności od wybranego trybu.
- Obsługiwane zdarzenia:
  - onModeChange (zmiana z "login" na "register" i odwrotnie).
- Warunki walidacji:
  - Brak bezpośrednich (authPage jedynie zarządza stanem trybu).
- Typy:
  - Mode: "login" | "register"
- Propsy:
  - Brak istotnych; komponent ten jest wejściem w routing, więc wszystko zarządzane jest wewnątrz.

### AuthSwitcher
- Opis komponentu: Prosty przełącznik (np. dwie zakładki lub przyciski), pozwala zmienić tryb formularza.
- Główne elementy: 
  - Dwa przyciski (np. "Zaloguj się", "Zarejestruj się").
- Obsługiwane zdarzenia:
  - onLoginClick: ustawia tryb na "login"
  - onRegisterClick: ustawia tryb na "register"
- Warunki walidacji:
  - Brak, to tylko przełącznik.
- Typy:
  - Brak złożonych typów; można użyć typu "login" | "register".
- Propsy:
  - currentMode: "login" | "register" (warunek zaznaczenia aktywnej karty/przycisku).
  - onModeChange: (mode: "login" | "register") => void

### AuthForm
- Opis komponentu: Formularz, który w zależności od trybu zbiera i wysyła dane logowania lub rejestracji. 
- Główne elementy:
  - EmailInput (<input type="email" />)
  - PasswordInput (<input type="password" />)
  - ConfirmPasswordInput (<input type="password" />) – wyświetlany wyłącznie, gdy mode = "register".
  - ErrorMessage – wyświetlany warunkowo w razie problemów (np. niepoprawne dane, błąd API).
  - SubmitButton
- Obsługiwane zdarzenia:
  - onSubmit (wysyła dane do /api/auth).
  - onChange pól email, password, confirmPassword (aktualizacja stanu).
- Warunki walidacji:
  - email: musi być poprawnym adresem e-mail.
  - password: co najmniej 6 znaków.
  - confirmPassword: równe password tylko w trybie "register".
- Typy:
  - AuthFormState: { email: string; password: string; confirmPassword?: string }
  - AuthRequestDto: { email: string; password: string; mode: "login" | "register" }
- Propsy:
  - mode: "login" | "register"
  - onSuccess?: () => void
  - onError?: (errorMessage: string) => void

### EmailInput
- Opis komponentu: Pole wprowadzania adresu e-mail wraz z minimalną walidacją formatu.
- Główne elementy: <input type="email" />
- Obsługiwane zdarzenia:
  - onChange: aktualizacja e-mail w stanie.
- Warunki walidacji:
  - Sprawdzenie, czy pole nie jest puste i czy zawiera znak @.
- Typy:
  - Standardowe interfejsy dla eventu input w React (ChangeEvent<HTMLInputElement>).
- Propsy:
  - value: string
  - onChange: (e: ChangeEvent<HTMLInputElement>) => void

### PasswordInput
- Opis komponentu: Pole wprowadzania hasła, maskowane na ekranie.
- Główne elementy: <input type="password" />
- Obsługiwane zdarzenia:
  - onChange: aktualizacja password w stanie.
- Warunki walidacji:
  - Musi zawierać przynajmniej 6 znaków.
- Typy:
  - Standardowe interfejsy dla eventu input w React.
- Propsy:
  - value: string
  - onChange: (e: ChangeEvent<HTMLInputElement>) => void

### ConfirmPasswordInput
- Opis komponentu: Dodatkowe pole do potwierdzenia hasła (tryb rejestracji).
- Główne elementy: <input type="password" />
- Obsługiwane zdarzenia:
  - onChange: aktualizacja confirmPassword w stanie.
- Warunki walidacji:
  - Musi być identyczne jak password.
- Typy:
  - Standardowe interfejsy dla eventu input.
- Propsy:
  - value: string
  - onChange: (e: ChangeEvent<HTMLInputElement>) => void

### ErrorMessage
- Opis komponentu: Prezentuje informację o błędzie logowania/rejestracji.
- Główne elementy: <div> z treścią błędu.
- Obsługiwane zdarzenia:
  - Brak.
- Warunki walidacji:
  - Brak.
- Typy:
  - Brak złożonych; wystarczy string z komunikatem.
- Propsy:
  - content: string

### SubmitButton
- Opis komponentu: Przyciski "Zaloguj się" / "Zarejestruj się" (tekst może się zmieniać zależnie od trybu).
- Główne elementy: <button type="submit" />
- Obsługiwane zdarzenia:
  - onClick natywnie wykonywany przez formularz (type="submit").
- Warunki walidacji:
  - Nie dotyczy bezpośrednio; walidacje są w logice formularza.
- Typy:
  - Brak.
- Propsy:
  - label: string (np. "Zaloguj się" lub "Zarejestruj się").

## 5. Typy
1. AuthRequestDto (z pliku src/types.ts)  
   - email: string  
   - password: string  
   - mode: "login" | "register"

2. AuthResponseDto (z pliku src/types.ts)  
   - success: true  
   - data: { userId: string; token: string }  
   - message: string

3. AuthFormState (lokalny typ stanu):  
   - email: string  
   - password: string  
   - confirmPassword?: string  

4. Mode (tryb widoku):  
   - "login" | "register"  

## 6. Zarządzanie stanem
- W `AuthPage` znajduje się stan `mode` (przechowuje aktualny tryb).  
- W `AuthForm` utrzymywany jest stan pól (email, password, confirmPassword).  
- Po pomyślnej autoryzacji w komponencie `AuthForm` można zapisać w globalnym kontekście (np. token) i przekierować użytkownika, jeśli onSuccess jest zdefiniowane.

## 7. Integracja API
- Wysyłamy żądanie POST na /api/auth z body typu AuthRequestDto.
- mode jest ustawiany w zależności od wybranego trybu ("login" lub "register").
- Jeśli API zwróci status 200, otrzymujemy AuthResponseDto. 
- Po odebraniu tokena i userId można je zapisać w localStorage lub context, a następnie przekierować do widoku domyślnego (np. /generations).

## 8. Interakcje użytkownika
1. Użytkownik wybiera tryb w `AuthSwitcher` (login / register).  
2. Użytkownik wypełnia pola email, password i ewentualnie confirmPassword.  
3. Po wciśnięciu przycisku "Zaloguj się" lub "Zarejestruj się" formularz wykonuje walidację front-end.  
4. Jeśli wszystko jest poprawne, wysyła się żądanie do /api/auth.  
5. W razie sukcesu przenosi użytkownika do widoku /generations (lub innego wskazanego).  
6. W razie błędu użytkownik widzi komunikat w `ErrorMessage`.

## 9. Warunki i walidacja
- email: nie może być pusty, format e-mail.  
- password: minimum 6 znaków.  
- confirmPassword (tryb rejestracji): musi się zgadzać z password.  
- Błędy API (np. 400, 401) należy obsłużyć i wyświetlić użytkownikowi.

## 10. Obsługa błędów
- Walidacja front-end zapobiega wysłaniu niepoprawnych danych.  
- Przechwytywanie statusów HTTP:  
  - 400 (niepoprawne dane) → komunikat "Niepoprawne dane".  
  - 401 (błędne hasło lub brak uprawnień) → komunikat "Nieprawidłowe dane logowania".  
  - 500 (błąd serwera) → komunikat "Wystąpił błąd, spróbuj ponownie później".

## 11. Kroki implementacji
1. Utwórz plik `AuthPage` i zarejestruj trasę /api/auth.  
2. Zaimplementuj `AuthSwitcher` do zmiany `mode` w stanie `AuthPage`.  
3. Zaimplementuj `AuthForm` z polami email, password i confirmPassword (wyświetlane tylko w trybie "register").  
4. Dodaj walidację front-end (e-mail, długość hasła, zgodność pól w trybie rejestracji).  
5. Po kliknięciu "submit" wywołaj `fetch("/api/auth", { method: "POST", ... })` z body typu AuthRequestDto.  
6. Obsłuż odpowiedź API: zapisz token i userId, przekieruj w razie sukcesu, wyświetl błąd w razie niepowodzenia.  
7. Przetestuj wskaźniki błędów, scenariusze rejestracji i logowania, weryfikację hasła oraz obsługę stanów w `AuthSwitch` i `AuthForm`.
