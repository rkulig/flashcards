# Testowanie w Projekcie Flashcards

Ten projekt wykorzystuje kompleksowe środowisko testowe składające się z testów jednostkowych (Vitest) i testów E2E (Playwright).

## Tech Stack Testowy

### Testy Jednostkowe
- **Vitest** - szybki framework do testów jednostkowych
- **Testing Library React** - testowanie komponentów React z naciskiem na zachowania użytkownika
- **Jest-DOM** - dodatkowe matchery dla elementów DOM
- **MSW (Mock Service Worker)** - mockowanie API w testach
- **Faker.js** - generowanie danych testowych

### Testy E2E
- **Playwright** - testy end-to-end w przeglądarce Chromium
- **Page Object Model** - wzorzec organizacji testów E2E
- **Automatic Database Cleanup** - automatyczne czyszczenie bazy danych po testach

## Struktura Katalogów

```
src/
├── test/
│   ├── setup.ts              # Konfiguracja Vitest
│   ├── mocks/
│   │   ├── handlers.ts       # Handlery MSW
│   │   └── server.ts         # Serwer MSW
│   └── utils/
│       └── test-utils.tsx    # Utilities testowe
├── components/
│   └── *.test.tsx            # Testy komponentów
e2e/
├── *.spec.ts                 # Testy E2E
└── page-objects/
    └── *.ts                  # Page Object Models
```

## Dostępne Skrypty

### Testy Jednostkowe (Vitest)
```bash
# Uruchom testy w trybie watch
npm run test

# Uruchom testy z interfejsem UI
npm run test:ui

# Uruchom testy jednokrotnie
npm run test:run

# Uruchom testy z coverage
npm run test:coverage

# Uruchom testy w trybie watch (explicit)
npm run test:watch
```

### Testy E2E (Playwright)
```bash
# Uruchom testy E2E (z automatycznym czyszczeniem bazy)
npm run test:e2e

# Uruchom testy E2E z interfejsem UI
npm run test:e2e:ui

# Uruchom testy E2E w trybie headed (widoczna przeglądarka)
npm run test:e2e:headed

# Uruchom testy E2E w trybie debug
npm run test:e2e:debug

# Uruchom testy bez teardown (pomija czyszczenie bazy)
npx playwright test --no-deps
```

## Pisanie Testów Jednostkowych

### Przykład testu komponentu

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/utils/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Mockowanie API z MSW

Dodaj nowe handlery w `src/test/mocks/handlers.ts`:

```ts
http.get('/api/new-endpoint', () => {
  return HttpResponse.json({ data: 'mock data' })
})
```

### Generowanie danych testowych

```tsx
import { createMockFlashcard, createMockUser } from '@/test/utils/test-utils'

const mockFlashcard = createMockFlashcard({
  question: 'Custom question',
  difficulty: 'hard'
})
```

## Pisanie Testów E2E

### Przykład testu E2E

```ts
import { test, expect } from '@playwright/test'

test('user can create flashcard', async ({ page }) => {
  await page.goto('/flashcards')
  
  await page.getByRole('button', { name: /add/i }).click()
  await page.getByLabel(/question/i).fill('Test question')
  await page.getByLabel(/answer/i).fill('Test answer')
  await page.getByRole('button', { name: /save/i }).click()
  
  await expect(page.getByText('Test question')).toBeVisible()
})
```

### Używanie Page Object Model

```ts
import { test } from '@playwright/test'
import { FlashcardsPage } from './page-objects/FlashcardsPage'

test('user can manage flashcards', async ({ page }) => {
  const flashcardsPage = new FlashcardsPage(page)
  
  await flashcardsPage.goto()
  await flashcardsPage.addFlashcard('Question', 'Answer')
  await flashcardsPage.expectFlashcardVisible('Question')
})
```

## Konfiguracja

### Vitest (`vitest.config.ts`)
- Środowisko: jsdom
- Setup: automatyczne ładowanie jest-dom matcherów
- Coverage: V8 provider z progami 80%
- TypeScript: włączone sprawdzanie typów

### Playwright (`playwright.config.ts`)
- Przeglądarka: tylko Chromium (Desktop Chrome)
- Retry: 2 próby na CI
- Trace: przy pierwszym retry
- Screenshots: tylko przy błędach
- Video: zachowywane przy błędach

## Best Practices

### Testy Jednostkowe
1. Używaj `vi.fn()` do mockowania funkcji
2. Testuj zachowania, nie implementację
3. Używaj `screen.getByRole()` do znajdowania elementów
4. Grupuj testy w `describe` bloki
5. Używaj `expect.toMatchInlineSnapshot()` dla złożonych asercji

### Testy E2E
1. Używaj Page Object Model dla złożonych interakcji
2. Preferuj `getByRole()` nad selektorami CSS
3. Używaj `data-testid` dla elementów bez semantyki
4. Testuj krytyczne ścieżki użytkownika
5. Unikaj testowania szczegółów implementacji

## Debugowanie

### Vitest
- Użyj `test.only()` do uruchomienia pojedynczego testu
- Użyj `console.log()` lub `screen.debug()` do debugowania
- Uruchom `npm run test:ui` dla wizualnego debugowania

### Playwright
- Użyj `npm run test:e2e:debug` dla interaktywnego debugowania
- Użyj `page.pause()` do zatrzymania testu
- Sprawdź trace viewer dla analizy błędów
- Użyj `--headed` do obserwacji testów w przeglądarce 

## Czyszczenie Bazy Danych (Database Teardown)

Projekt jest skonfigurowany z automatycznym czyszczeniem bazy danych po zakończeniu wszystkich testów E2E.

### Jak to działa

1. **Project Dependencies**: Konfiguracja Playwright włącza teardown po testach
2. **Global Teardown**: `e2e/global.teardown.ts` uruchamia się automatycznie
3. **Selektywne czyszczenie**: Usuwa tylko dane testowego użytkownika z `E2E_USERNAME_ID`
4. **Bezpieczeństwo**: Chroni przed przypadkowym usunięciem danych innych użytkowników

### Czyszczone tabele

- `flashcards` - fiszki utworzone przez testowego użytkownika
- `generations` - generacje AI utworzone podczas testów
- `generation_error_logs` - logi błędów z testów

### Konfiguracja środowiska

Upewnij się, że `.env.test` zawiera:

```env
SUPABASE_URL=your_test_supabase_url
SUPABASE_KEY=your_test_supabase_service_role_key
E2E_USERNAME_ID=test_user_uuid
E2E_USERNAME=test@example.com
E2E_PASSWORD=test_password
```

**Ważne**: Używaj service role key z odpowiednimi uprawnieniami do usuwania danych. 