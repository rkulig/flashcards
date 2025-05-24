## 1. Przegląd
Niniejszy plan dotyczy implementacji nawigacji w aplikacji opartej na Astro z wykorzystaniem React, TypeScript, Tailwind oraz biblioteki Shadcn/ui. Głównym celem nawigacji jest umożliwienie użytkownikom (zarówno zalogowanym, jak i niezalogowanym) przełączania się między widokami: "Flashcards", "Generations" oraz modułem logowania/rejestracji (dla użytkowników niezalogowanych) lub wylogowania (dla zalogowanych).

## 2. Routing nawigacji
- Aplikacja będzie korzystała z wbudowanych mechanizmów routingu Astro.
- Dla obsługi linków między widokami możliwe jest wykorzystanie komponentów React (np. <a> lub dedykowanych komponentów do nawigacji).
- Główne ścieżki URL:
  - "/flashcards" – widok z listą fiszek.
  - "/generations" – widok generowania.
  - "/auth" – widok rejestracji/logowania.
  - Mechanizm wylogowania może być dostępny w ramach przycisku w nawigacji i prowadzić do "/auth" z dodatkowym efektem wyczyszczenia tokenu/autentykacji.

## 3. Struktura komponentów
Poniżej przedstawiono ogólną hierarchię komponentów związanych z nawigacją:

- Layout główny ( Astro Layout lub plik .astro )  
  └─ Komponent "Navbar" (React)  
     ├─ Logo / Nagłówek aplikacji  
     ├─ Link do widoku "Flashcards"  
     ├─ Link do widoku "Generations"  
     └─ Link do widoku "Logowanie/Rejestracja" lub "Wyloguj"  

## 4. Szczegóły komponentów

### Navbar
- Opis komponentu:  
  Komponent odpowiedzialny za wyświetlanie menu głównego w aplikacji. Zawiera odnośniki do kluczowych widoków: Flashcards, Generations, Auth (logowanie/rejestracja) lub wylogowanie.  
- Główne elementy:  
  - Logo lub nazwa aplikacji (np. "10x-cards")  
  - Lista przycisków/odnośników: Flashcards, Generations, Auth/Logout  
- Obsługiwane interakcje:  
  - Kliknięcie linku/ikony → przeniesienie użytkownika do wybranego widoku  
  - Kliknięcie "Wyloguj" → wywołanie akcji wylogowania (usunięcie danych sesji/ tokenu)  
- Propsy:  
  - isAuthenticated (bool) – określa, czy użytkownik jest zalogowany  
  - onLogout? (func) – funkcja obsługująca proces wylogowania  

## 6. Zarządzanie stanem
- Informacja o zalogowaniu użytkownika będzie przechowywana w stanie globalnym (np. w astro.locals, w kontekście React czy w Supabase session).  
- Komponent Navbar będzie pobierał tę informację lub otrzymywał przez prop isAuthenticated.  
- W momencie kliknięcia przycisku "Wyloguj", stan należy zresetować (usunięcie danych sesji/tokenu supabase).  

## 7. Integracja API
- Punkt wylogowania nie ma dedykowanego endpointu, jednakże może wykorzystywać supabase.auth.signOut() lub podobną funkcję do unieważnienia tokenu.  
- Dla logowania/rejestracji wykorzystywany jest endpoint "/api/auth" (metoda POST) lub natywne metody supabase.  
- Dodatkowe widoki ("Flashcards", "Generations") korzystają z endpointów:  
  - GET/POST "/api/flashcards"  
  - GET/POST "/api/generations"  
  Wszystkie te akcje dzieją się w widokach docelowych – sam navbar jedynie przekierowuje.  

## 8. Interakcje użytkownika
- Użytkownik niezalogowany:  
  - Widzi linki do "Flashcards" i "Generations" (mogą przekierować do /auth, jeśli wymagane jest zalogowanie do przeglądania).  
  - Widzi link "Zaloguj / Zarejestruj" prowadzący do widoku /auth.  
- Użytkownik zalogowany:  
  - Widzi linki do "Flashcards" i "Generations" (przenoszą bezpośrednio do widoków).  
  - Widzi przycisk "Wyloguj" → wyczyszczenie tokenu i przekierowanie do /auth, by umożliwić ponowne logowanie.  

## 11. Kroki implementacji
1. Stworzenie pliku komponentu Navbar (React), zawierającego strukturę UI (np. ul/li, linki).  
2. Pobranie stanu zalogowania (props isAuthenticated) w komponencie Navbar i warunkowe generowanie linku "Auth" lub "Wyloguj".  
3. Implementacja obsługi przycisku "Wyloguj":  
   - Wywołanie funkcji onLogout (może to być np. supabase.auth.signOut())  
   - Przekierowanie użytkownika do "/auth"  
4. Umieszczenie Navbar w głównym layoucie Astro, tak aby pojawiał się we wszystkich widokach.  
5. Dodanie plików .astro lub .tsx z routingiem do poszczególnych widoków:  
   - "Flashcards" → /flashcards  
   - "Generations" → /generations  
   - "Auth" → /auth  
6. Upewnienie się, że linki spełniają warunki dostępności (ARIA, focus states, itp.) i są wystylizowane zgodnie z Tailwind/Shadcn/ui.  
