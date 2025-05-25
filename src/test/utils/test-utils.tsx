import React from "react";
import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { faker } from "@faker-js/faker";

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
export const createMockFlashcard = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  question: faker.lorem.sentence(),
  answer: faker.lorem.paragraph(),
  category: faker.lorem.word(),
  difficulty: faker.helpers.arrayElement(["easy", "medium", "hard"]),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides?: Partial<any>) => ({
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
