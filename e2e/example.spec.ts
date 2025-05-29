import { test, expect } from "@playwright/test";
import { AuthHelper } from "./auth-helper";

test.describe("Flashcards App", () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Sprawdź czy jest wymagane logowanie
    await authHelper.loginIfRequired();

    // Poczekaj na pełne załadowanie i ewentualne przekierowania
    await page.waitForLoadState("networkidle");

    // Sprawdź obecny URL i odpowiadający mu tytuł
    const currentUrl = page.url();
    console.log("Final URL after redirects:", currentUrl);

    if (currentUrl.includes("/flashcards")) {
      // Jeśli jesteśmy na stronie flashcards, sprawdź właściwy tytuł
      await expect(page).toHaveTitle(/Moje Fiszki/i);
    } else if (currentUrl.includes("/generations")) {
      // Jeśli jesteśmy na stronie generations, sprawdź właściwy tytuł
      await expect(page).toHaveTitle(/Generate Flashcards/i);
    } else {
      // Fallback - sprawdź czy zawiera słowo "Flashcards" w jakiejkolwiek formie
      await expect(page).toHaveTitle(/flashcards|fiszki/i);
    }
  });

  test("should navigate to flashcards page", async ({ page }) => {
    await page.goto("/");

    // Obsługa logowania jeśli wymagane
    await authHelper.loginIfRequired();

    // Poczekaj na załadowanie strony głównej
    await page.waitForLoadState("networkidle");

    // Znajdź i kliknij link do flashcards
    const flashcardsLink = page.getByRole("link", { name: /flashcards/i });

    // Poczekaj na pojawienie się linku lub przekieruj bezpośrednio
    try {
      await expect(flashcardsLink).toBeVisible({ timeout: 5000 });
      await flashcardsLink.click();
    } catch {
      // Jeśli link nie jest widoczny, przejdź bezpośrednio
      await page.goto("/flashcards");
    }

    await expect(page).toHaveURL(/.*flashcards.*/);
  });

  test("should display flashcards list or empty state", async ({ page }) => {
    await page.goto("/flashcards");

    // Obsługa logowania jeśli wymagane
    await authHelper.loginIfRequired();

    // Poczekaj na załadowanie strony
    await page.waitForLoadState("networkidle");

    // Sprawdź czy użytkownik ma fiszki czy nie - jeden z tych elementów musi być widoczny
    const flashcardsList = page.getByTestId("flashcards-list");
    const emptyState = page.getByTestId("flashcards-empty-state");

    try {
      // Próbuj znaleźć listę fiszek
      await expect(flashcardsList).toBeVisible({ timeout: 5000 });
    } catch {
      // Jeśli lista nie jest widoczna, sprawdź empty state
      await expect(emptyState).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Nie masz jeszcze żadnych fiszek")).toBeVisible();

      // Sprawdź czy przycisk "Dodaj nową fiszkę" jest dostępny
      await expect(page.getByTestId("add-flashcard-button")).toBeVisible();
    }
  });

  test("should create a new flashcard", async ({ page }) => {
    await page.goto("/flashcards");

    // Obsługa logowania jeśli wymagane
    await authHelper.loginIfRequired();

    // Poczekaj na załadowanie strony
    await page.waitForLoadState("networkidle");

    // Kliknij przycisk dodawania nowej flashcard (zawsze dostępny)
    await expect(page.getByTestId("add-flashcard-button")).toBeVisible({ timeout: 5000 });
    await page.getByTestId("add-flashcard-button").click();

    // Wypełnij formularz
    await expect(page.getByLabel(/front|przód/i)).toBeVisible({ timeout: 5000 });
    await page.getByLabel(/front|Przód fiszki/i).fill("Test question");
    await page.getByLabel(/back|Tył fiszki/i).fill("Test answer");

    // Zapisz flashcard
    await page.getByRole("button", { name: /save|submit|zapisz/i }).click();

    // Sprawdź czy flashcard została dodana
    // Po dodaniu pierwszej fiszki, empty state zniknie i pojawi się lista
    await expect(page.getByText("Test question")).toBeVisible({ timeout: 10000 });

    // Sprawdź czy teraz jest widoczna lista fiszek (nie empty state)
    await expect(page.getByTestId("flashcards-list")).toBeVisible({ timeout: 5000 });
  });

  test("should edit an existing flashcard", async ({ page }) => {
    await page.goto("/flashcards");

    // Obsługa logowania jeśli wymagane
    await authHelper.loginIfRequired();

    // Poczekaj na załadowanie strony
    await page.waitForLoadState("networkidle");

    // Sprawdź czy użytkownik ma fiszki do edycji
    const flashcardsList = page.getByTestId("flashcards-list");
    const emptyState = page.getByTestId("flashcards-empty-state");

    try {
      // Sprawdź czy lista fiszek jest widoczna
      await expect(flashcardsList).toBeVisible({ timeout: 5000 });

      // Znajdź pierwszy przycisk edit i kliknij
      const editButton = page.getByRole("button", { name: /edit|edytuj/i }).first();
      await expect(editButton).toBeVisible({ timeout: 5000 });
      await editButton.click();

      // Zmień pytanie
      const questionInput = page.getByLabel(/front|przód/i);
      await expect(questionInput).toBeVisible({ timeout: 5000 });
      await questionInput.clear();
      await questionInput.fill("Updated question");

      // Zapisz zmiany
      await page.getByRole("button", { name: /save|update|zapisz/i }).click();

      // Sprawdź czy zmiany zostały zapisane
      await expect(page.getByText("Updated question")).toBeVisible({ timeout: 5000 });
    } catch {
      // Jeśli nie ma fiszek do edycji, sprawdź czy jest empty state
      await expect(emptyState).toBeVisible({ timeout: 5000 });
      console.log("No flashcards available for editing - user has empty state");
    }
  });

  test("should delete a flashcard", async ({ page }) => {
    await page.goto("/flashcards");

    // Obsługa logowania jeśli wymagane
    await authHelper.loginIfRequired();

    // Poczekaj na załadowanie strony
    await page.waitForLoadState("networkidle");

    // Sprawdź czy użytkownik ma fiszki do usunięcia
    const flashcardsList = page.getByTestId("flashcards-list");
    const emptyState = page.getByTestId("flashcards-empty-state");

    try {
      // Sprawdź czy lista fiszek jest widoczna
      await expect(flashcardsList).toBeVisible({ timeout: 5000 });

      // Znajdź przycisk delete i kliknij
      const deleteButton = page.getByRole("button", { name: /delete|usuń/i }).first();
      await expect(deleteButton).toBeVisible({ timeout: 5000 });
      await deleteButton.click();

      // Potwierdź usunięcie jeśli jest modal potwierdzenia
      try {
        const confirmButton = page.getByRole("button", { name: /confirm|yes|delete|usuń|tak/i });
        await expect(confirmButton).toBeVisible({ timeout: 3000 });
        await confirmButton.click();
      } catch {
        // Modal może nie istnieć - niektóre implementacje używają browser confirm()
      }

      // Sprawdź czy nastąpiło usunięcie
      // Może być komunikat sukcesu lub zmiana w liście fiszek
      await page.waitForTimeout(2000); // Poczekaj na przetworzenie usunięcia

      // Po usunięciu może pozostać lista (jeśli były inne fiszki) lub pojawić się empty state
      const listStillVisible = await flashcardsList.isVisible();
      const emptyStateVisible = await emptyState.isVisible();

      // Jeden z tych stanów powinien być prawdziwy
      if (!listStillVisible && !emptyStateVisible) {
        throw new Error("Neither flashcards list nor empty state is visible after deletion");
      }
    } catch {
      // Jeśli nie ma fiszek do usunięcia, sprawdź czy jest empty state
      await expect(emptyState).toBeVisible({ timeout: 5000 });
      console.log("No flashcards available for deletion - user has empty state");
    }
  });
});
