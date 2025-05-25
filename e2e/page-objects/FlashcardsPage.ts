import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class FlashcardsPage {
  readonly page: Page;
  readonly flashcardsList: Locator;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcardsList = page.getByTestId("flashcards-list");
    this.addButton = page.getByRole("button", { name: /add|create|new/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.categoryFilter = page.getByRole("combobox", { name: /category/i });
  }

  async goto() {
    await this.page.goto("/flashcards");
  }

  async addFlashcard(question: string, answer: string, category?: string) {
    await this.addButton.click();

    await this.page.getByLabel(/question/i).fill(question);
    await this.page.getByLabel(/answer/i).fill(answer);

    if (category) {
      await this.page.getByLabel(/category/i).fill(category);
    }

    await this.page.getByRole("button", { name: /save|submit/i }).click();
  }

  async editFlashcard(index: number, newQuestion: string, newAnswer?: string) {
    const editButtons = this.page.getByRole("button", { name: /edit/i });
    await editButtons.nth(index).click();

    const questionInput = this.page.getByLabel(/question/i);
    await questionInput.clear();
    await questionInput.fill(newQuestion);

    if (newAnswer) {
      const answerInput = this.page.getByLabel(/answer/i);
      await answerInput.clear();
      await answerInput.fill(newAnswer);
    }

    await this.page.getByRole("button", { name: /save|update/i }).click();
  }

  async deleteFlashcard(index: number) {
    const deleteButtons = this.page.getByRole("button", { name: /delete/i });
    await deleteButtons.nth(index).click();

    // Potwierdź usunięcie jeśli jest modal
    const confirmButton = this.page.getByRole("button", { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }

  async searchFlashcards(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press("Enter");
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.click();
    await this.page.getByRole("option", { name: category }).click();
  }

  async getFlashcardCount(): Promise<number> {
    const flashcards = this.page.getByTestId("flashcard-item");
    return await flashcards.count();
  }

  async expectFlashcardVisible(question: string) {
    await expect(this.page.getByText(question)).toBeVisible();
  }

  async expectFlashcardNotVisible(question: string) {
    await expect(this.page.getByText(question)).not.toBeVisible();
  }

  async expectFlashcardsListVisible() {
    await expect(this.flashcardsList).toBeVisible();
  }
}
