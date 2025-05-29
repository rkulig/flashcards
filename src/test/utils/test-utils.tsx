import React from "react";
import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import type { FlashcardDto } from "../../types";

// Interface for test user data
interface TestUser {
  id: string;
  email: string;
  emailConfirmedAt?: string;
}

// Custom render function z providerami
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
  // Wrapper component z providerami (np. context providers)
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <>
        {/* Tutaj można dodać providery jak ThemeProvider, QueryClient, itp. */}
        {children}
      </>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Funkcje pomocnicze do generowania danych testowych
export const createMockFlashcard = (overrides?: Partial<FlashcardDto>): FlashcardDto => ({
  id: faker.number.int(),
  front: faker.lorem.sentence(),
  back: faker.lorem.paragraph(),
  source: faker.helpers.arrayElement(["ai-full", "ai-edited", "manual"]),
  generation_id: faker.number.int(),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides?: Partial<TestUser>): TestUser => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  emailConfirmedAt: faker.date.past().toISOString(),
  ...overrides,
});

// Re-export wszystkich funkcji z testing-library
export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";

// Override render method
export { customRender as render };
