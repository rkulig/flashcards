import { test, expect } from "@playwright/test";

test.describe("Flashcards App", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Sprawdź czy strona się załadowała
    await expect(page).toHaveTitle(/Flashcards/i);
  });

  test("should navigate to flashcards page", async ({ page }) => {
    await page.goto("/");

    // Znajdź i kliknij link do flashcards (dostosuj selektor do rzeczywistej struktury)
    const flashcardsLink = page.getByRole("link", { name: /flashcards/i });
    if (await flashcardsLink.isVisible()) {
      await flashcardsLink.click();
      await expect(page).toHaveURL(/.*flashcards.*/);
    }
  });

  test("should display flashcards list", async ({ page }) => {
    await page.goto("/flashcards");

    // Sprawdź czy lista flashcards jest widoczna
    await expect(page.getByTestId("flashcards-list")).toBeVisible();
  });

  test("should create a new flashcard", async ({ page }) => {
    await page.goto("/flashcards");

    // Kliknij przycisk dodawania nowej flashcard
    const addButton = page.getByRole("button", { name: /add|create|new/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Wypełnij formularz
      await page.getByLabel(/question/i).fill("Test question");
      await page.getByLabel(/answer/i).fill("Test answer");

      // Zapisz flashcard
      await page.getByRole("button", { name: /save|submit/i }).click();

      // Sprawdź czy flashcard została dodana
      await expect(page.getByText("Test question")).toBeVisible();
    }
  });

  test("should edit an existing flashcard", async ({ page }) => {
    await page.goto("/flashcards");

    // Znajdź pierwszą flashcard i kliknij edit
    const editButton = page.getByRole("button", { name: /edit/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Zmień pytanie
      const questionInput = page.getByLabel(/question/i);
      await questionInput.clear();
      await questionInput.fill("Updated question");

      // Zapisz zmiany
      await page.getByRole("button", { name: /save|update/i }).click();

      // Sprawdź czy zmiany zostały zapisane
      await expect(page.getByText("Updated question")).toBeVisible();
    }
  });

  test("should delete a flashcard", async ({ page }) => {
    await page.goto("/flashcards");

    // Znajdź przycisk delete i kliknij
    const deleteButton = page.getByRole("button", { name: /delete/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Potwierdź usunięcie jeśli jest modal
      const confirmButton = page.getByRole("button", { name: /confirm|yes|delete/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Sprawdź czy flashcard została usunięta (można sprawdzić komunikat lub brak elementu)
      await expect(page.getByText(/deleted|removed/i)).toBeVisible();
    }
  });
});
