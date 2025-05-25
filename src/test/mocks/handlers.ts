import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock dla API flashcards
  http.get("/api/flashcards", () => {
    return HttpResponse.json([
      {
        id: "1",
        question: "Test question 1",
        answer: "Test answer 1",
        category: "test",
        difficulty: "easy",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        question: "Test question 2",
        answer: "Test answer 2",
        category: "test",
        difficulty: "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post("/api/flashcards", async ({ request }) => {
    const newFlashcard = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: "3",
        ...newFlashcard,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.put("/api/flashcards/:id", async ({ params, request }) => {
    const { id } = params;
    const updatedFlashcard = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id,
      ...updatedFlashcard,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete("/api/flashcards/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ id, deleted: true });
  }),

  // Mock dla autentykacji Supabase
  http.post("*/auth/v1/token", () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        email: "test@example.com",
        email_confirmed_at: new Date().toISOString(),
      },
    });
  }),

  http.get("*/auth/v1/user", () => {
    return HttpResponse.json({
      id: "mock-user-id",
      email: "test@example.com",
      email_confirmed_at: new Date().toISOString(),
    });
  }),
];
