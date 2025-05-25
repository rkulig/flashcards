# Diagram architektury UI - Moduł autentykacji i zarządzania fiszkami

Ten diagram przedstawia architekturę komponentów UI dla aplikacji 10x-cards, ze szczególnym uwzględnieniem modułu autentykacji oraz głównych funkcjonalności aplikacji.

```mermaid
flowchart TD
    %% Strony publiczne
    A["/auth - Strona Autentykacji"] --> B["AuthPage (React)"]
    B --> C["AuthSwitcher"]
    B --> D["AuthForm"]
    
    %% Komponenty AuthForm
    D --> E["Walidacja Formularza"]
    D --> F["Obsługa Błędów"]
    D --> G["Stan Loading"]
    
    %% API i przepływ danych
    D --> H["/api/auth Endpoint"]
    H --> I["AuthService"]
    I --> J["Walidacja Zod"]
    I --> K["Supabase Auth"]
    
    %% Przekierowania po autentykacji
    K --> L["Sukces Logowania"]
    L --> M["Przekierowanie do /flashcards"]
    
    %% Layout i nawigacja
    N["Layout.astro"] --> O["Navbar (React)"]
    O --> P["Stan Autentykacji"]
    O --> Q["Linki Nawigacyjne"]
    O --> R["Przycisk Wylogowania"]
    
    %% Chronione strony
    subgraph "Chronione Strony"
        S["/flashcards - Moje Fiszki"]
        T["/generations - Generowanie"]
    end
    
    %% Komponenty strony fiszek
    S --> U["FlashcardsPage (React)"]
    U --> V["FlashcardsList"]
    U --> W["AddFlashcardButton"]
    U --> X["FlashcardEditModal"]
    U --> Y["FlashcardCreateModal"]
    
    %% Komponenty strony generowania
    T --> Z["GenerateFlashcardsForm (React)"]
    Z --> AA["TextAreaInput"]
    Z --> BB["GenerateButton"]
    Z --> CC["FlashcardList"]
    Z --> DD["SaveFlashcardsPanel"]
    
    %% Komponenty listy fiszek generowanych
    CC --> EE["FlashcardListItem"]
    EE --> FF["Akcje Fiszki"]
    FF --> GG["Akceptuj"]
    FF --> HH["Edytuj"]
    FF --> II["Odrzuć"]
    
    %% Panel zapisu
    DD --> JJ["SaveAllButton"]
    DD --> KK["SaveAcceptedButton"]
    
    %% API endpoints
    Z --> LL["/api/generations"]
    U --> MM["/api/flashcards"]
    
    %% Middleware i ochrona tras
    NN["Middleware"] --> OO["Sprawdzanie Sesji"]
    OO --> PP["Supabase Client"]
    OO --> QQ["Przekierowanie do /auth"]
    
    %% Serwisy
    subgraph "Serwisy Backend"
        I
        RR["GenerationService"]
        SS["FlashcardService"]
    end
    
    %% Schematy walidacji
    subgraph "Walidacja Danych"
        J
        TT["Generation Schema"]
        UU["Flashcard Schema"]
    end
    
    %% Typy i interfejsy
    subgraph "Typy TypeScript"
        VV["AuthRequestDto"]
        WW["FlashcardDto"]
        XX["GenerateFlashCardsCommand"]
    end
    
    %% Połączenia z API
    LL --> RR
    MM --> SS
    RR --> TT
    SS --> UU
    
    %% Przepływ autentykacji
    M --> NN
    S --> NN
    T --> NN
    
    %% Stylowanie komponentów
    classDef publicPage fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef protectedPage fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef reactComponent fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef apiEndpoint fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef service fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef middleware fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class A publicPage
    class S,T protectedPage
    class B,D,U,Z,O reactComponent
    class H,LL,MM apiEndpoint
    class I,RR,SS service
    class NN,OO middleware
```

## Opis głównych modułów

### Moduł Autentykacji
- **AuthPage**: Główny komponent zarządzający stanem trybu (login/register)
- **AuthSwitcher**: Przełącznik między trybami logowania i rejestracji
- **AuthForm**: Formularz z walidacją, obsługą błędów i komunikacją z API
- **AuthService**: Serwis backendowy obsługujący autentykację z Supabase

### Moduł Fiszek
- **FlashcardsPage**: Zarządzanie listą fiszek użytkownika
- **FlashcardsList**: Wyświetlanie i paginacja fiszek
- **Modals**: Tworzenie i edycja fiszek

### Moduł Generowania
- **GenerateFlashcardsForm**: Główny formularz do generowania fiszek przez AI
- **FlashcardList**: Lista propozycji z możliwością akceptacji/edycji/odrzucenia
- **SaveFlashcardsPanel**: Panel do zapisu wybranych fiszek

### Ochrona Tras
- **Middleware**: Sprawdzanie sesji użytkownika
- **Layout**: Zarządzanie nawigacją i stanem autentykacji
- **Navbar**: Dynamiczna nawigacja zależna od stanu logowania

### Przepływ Danych
1. Użytkownik loguje się przez AuthForm
2. Po sukcesie przekierowanie do chronionych stron
3. Middleware sprawdza sesję dla każdego żądania
4. Komponenty React komunikują się z API endpoints
5. Serwisy backend obsługują logikę biznesową 