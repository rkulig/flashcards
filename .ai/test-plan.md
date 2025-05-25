# Plan testów dla aplikacji Flashcards

## 1. Kontekst projektu
**Stack technologiczny:**
- Frontend: Astro 5 + React 19 + TypeScript 5
- Styling: Tailwind 4 + Shadcn/ui
- Backend: Supabase (PostgreSQL + Auth + BaaS)
- AI: OpenRouter.ai
- CI/CD: GitHub Actions + DigitalOcean

## 2. Analiza wstępna

### 2.1 Architektura aplikacji
```
src/
├── components/     # Komponenty React i Astro
├── pages/         # Strony Astro + API endpoints
├── layouts/       # Layouty Astro
├── lib/          # Serwisy i helpery
├── db/           # Klienty Supabase
├── types.ts      # Typy współdzielone
└── middleware/   # Middleware Astro
```

### 2.2 Kluczowe komponenty
- **Flashcards management** - CRUD operacje na fiszkach
- **AI integration** - Generowanie fiszek przez OpenRouter
- **User authentication** - Supabase Auth
- **Database operations** - Supabase PostgreSQL
- **UI components** - Shadcn/ui + custom components

### 2.3 Punkty integracji
- Supabase Database (PostgreSQL)
- Supabase Authentication
- OpenRouter.ai API
- Astro API endpoints
- React komponenty w Astro

### 2.4 Obecny stan testów
❌ **Brak konfiguracji testowej** - projekt nie ma jeszcze testów

## 3. Strategia testowania

### 3.1 Podsumowanie wykonawcze
**Cel:** Zapewnienie wysokiej jakości aplikacji flashcards z 80%+ pokryciem kodu krytycznych funkcjonalności.

**Zakres:**
- Testy jednostkowe komponentów React
- Testy integracyjne z Supabase
- Testy API endpoints
- Testy E2E głównych flow użytkownika
- Testy accessibility i performance

**Kluczowe ryzyka:**
- Integracja Astro + React w testach
- Mockowanie Supabase w testach jednostkowych
- Testowanie AI integracji (rate limiting, koszty)

### 3.2 Technologie testowe

#### **Testy jednostkowe i komponentów:**
```json
{
  "vitest": "^2.1.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.6.0",
  "@testing-library/user-event": "^14.5.0",
  "jsdom": "^25.0.0"
}
```

#### **Testy E2E:**
```json
{
  "@playwright/test": "^1.48.0"
}
```

#### **Mockowanie i fixtures:**
```json
{
  "msw": "^2.6.0",
  "@faker-js/faker": "^9.2.0"
}
```

### 3.3 Konfiguracja środowisk

#### **Vitest config:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { getViteConfig } from 'astro/config'

export default defineConfig(
  getViteConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        exclude: ['node_modules/', 'dist/', '**/*.d.ts']
      }
    }
  })
)
```

#### **Playwright config:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
})
```

## 4. Szczegółowy plan testów

### 4.1 Testy jednostkowe (Priorytet: WYSOKI)

#### **Komponenty UI:**
```typescript
// src/components/__tests__/FlashcardComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { FlashcardComponent } from '../FlashcardComponent'

describe('FlashcardComponent', () => {
  it('should display question and answer', () => {
    const flashcard = { question: 'Test Q', answer: 'Test A' }
    render(<FlashcardComponent flashcard={flashcard} />)
    
    expect(screen.getByText('Test Q')).toBeInTheDocument()
  })
})
```

#### **Serwisy i utils:**
```typescript
// src/lib/__tests__/flashcard-service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createFlashcard } from '../flashcard-service'

describe('FlashcardService', () => {
  it('should create flashcard with valid data', async () => {
    const mockSupabase = vi.mock('@supabase/supabase-js')
    // Test implementation
  })
})
```

### 4.2 Testy integracyjne (Priorytet: WYSOKI)

#### **Supabase integration:**
```typescript
// src/db/__tests__/flashcards-repository.test.ts
import { createTestSupabaseClient } from '../test-utils'

describe('FlashcardsRepository', () => {
  beforeEach(async () => {
    // Setup test database
  })
  
  it('should save and retrieve flashcard', async () => {
    // Test implementation
  })
})
```

### 4.3 Testy API (Priorytet: WYSOKI)

#### **Astro API endpoints:**
```typescript
// src/pages/api/__tests__/flashcards.test.ts
import { describe, it, expect } from 'vitest'

describe('/api/flashcards', () => {
  it('should return flashcards for authenticated user', async () => {
    // Test implementation
  })
})
```

### 4.4 Testy E2E (Priorytet: ŚREDNI)

#### **Główne flow użytkownika:**
```typescript
// e2e/flashcards-flow.spec.ts
import { test, expect } from '@playwright/test'

test('user can create and study flashcards', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="login-button"]')
  // Complete flow test
})
```

### 4.5 Testy accessibility (Priorytet: ŚREDNI)

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/')
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
```

## 5. CI/CD Integration

### 5.1 GitHub Actions workflow:
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:coverage
```

### 5.2 Package.json scripts:
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

## 6. Metryki i KPI

### 6.1 Cele pokrycia kodu:
- **Komponenty UI:** 85%+
- **Serwisy/Utils:** 90%+
- **API endpoints:** 80%+
- **Ogólne pokrycie:** 80%+

### 6.2 Performance targets:
- **Unit tests:** < 30s
- **E2E tests:** < 5min
- **Flaky tests:** < 2%

### 6.3 Raportowanie:
- Codecov integration dla pokrycia kodu
- Playwright HTML reports dla E2E
- GitHub Actions status checks

## 7. Plan implementacji

### **Faza 1: Infrastruktura (2-3 dni)**
- [ ] Konfiguracja Vitest + Testing Library
- [ ] Setup Playwright
- [ ] Podstawowe CI/CD
- [ ] Test utilities i helpers

### **Faza 2: Testy jednostkowe (3-4 dni)**
- [ ] Testy komponentów Shadcn/ui
- [ ] Testy serwisów flashcards
- [ ] Testy utils i helpers
- [ ] Mockowanie Supabase

### **Faza 3: Testy integracyjne (2-3 dni)**
- [ ] Testy API endpoints
- [ ] Testy Supabase integration
- [ ] Mockowanie OpenRouter API

### **Faza 4: Testy E2E (3-4 dni)**
- [ ] Authentication flow
- [ ] Flashcards CRUD operations
- [ ] AI generation flow
- [ ] Responsive design tests

### **Faza 5: Optymalizacja (1-2 dni)**
- [ ] Performance testing
- [ ] Accessibility audits
- [ ] Documentation
- [ ] Team training

## 8. Wyzwania i rozwiązania

### 8.1 Testowanie Astro + React
**Wyzwanie:** Komponenty React w kontekście Astro
**Rozwiązanie:** Dedykowane test utilities dla renderowania komponentów

### 8.2 Mockowanie Supabase
**Wyzwanie:** Kompleksowe API Supabase
**Rozwiązanie:** MSW + custom Supabase mocks

### 8.3 Testowanie AI integracji
**Wyzwanie:** Koszty i rate limiting OpenRouter
**Rozwiązanie:** Mockowanie w testach + dedykowane testy integracyjne

### 8.4 Środowisko testowe bazy danych
**Wyzwanie:** Izolacja testów bazodanowych
**Rozwiązanie:** Test containers lub dedykowana test database

**Szacowany nakład:** 11-16 dni roboczych dla pełnej implementacji
