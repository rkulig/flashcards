Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testowanie - Kompleksowe pokrycie testami jednostkowymi i E2E:
- Vitest jako szybki framework do testów jednostkowych, zoptymalizowany dla projektów Vite/Astro
- Testing Library React do testowania komponentów React z naciskiem na testowanie zachowań użytkownika
- Jest-DOM do dodatkowych matcherów ułatwiających testowanie elementów DOM
- Playwright do testów end-to-end, zapewniający testowanie w różnych przeglądarkach
- MSW (Mock Service Worker) do mockowania API w testach, umożliwiając testowanie bez rzeczywistych wywołań zewnętrznych serwisów
- Faker.js do generowania danych testowych

CI/CD i Hosting:
- Github Actions do tworzenia pipeline’ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker