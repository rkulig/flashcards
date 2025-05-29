import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class AuthHelper {
  constructor(private page: Page) {}

  async login(email?: string, password?: string) {
    // Użyj zmiennych środowiskowych lub wartości domyślnych
    const loginEmail = email || process.env.E2E_USERNAME || "test@example.com";
    const loginPassword = password || process.env.E2E_PASSWORD || "password123";

    // Przejdź na stronę logowania
    await this.page.goto("/auth"); // Strona logowania to /auth, nie /login

    // Poczekaj na załadowanie strony logowania
    await this.page.waitForLoadState("networkidle");

    // Upewnij się, że jesteśmy w trybie logowania (nie rejestracji)
    const signInButton = this.page.getByRole("button", { name: "Sign In" }).first();
    if (await signInButton.isVisible()) {
      await signInButton.click(); // Kliknij tab "Sign In" aby być w trybie logowania
    }

    // Poczekaj na formularz logowania
    await expect(this.page.getByLabel(/email/i)).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByLabel(/password/i)).toBeVisible({ timeout: 10000 });

    // Wypełnij formularz logowania
    await this.page.getByLabel(/email/i).fill(loginEmail);
    await this.page.getByLabel(/password/i).fill(loginPassword);

    // Znajdź i kliknij przycisk submit formularza
    // Na podstawie AuthForm.tsx przycisk ma type="submit" i tekst "Sign In" (w trybie login)
    const submitButton = this.page.locator('button[type="submit"]');

    // Upewnij się, że przycisk jest widoczny i kliknij
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Poczekaj na przekierowanie po pomyślnym logowaniu
    // AuthForm przekierowuje do /flashcards
    await this.page.waitForURL(/.*flashcards.*/, { timeout: 15000 });
  }

  async loginIfRequired() {
    // Sprawdź czy jesteśmy na stronie logowania
    const currentUrl = this.page.url();
    if (currentUrl.includes("/auth") || currentUrl.includes("/login")) {
      await this.login();
    }
  }

  async logout() {
    const logoutButton = this.page.getByRole("button", { name: /wyloguj|logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.page.waitForURL(/.*auth.*/, { timeout: 5000 });
    }
  }
}
