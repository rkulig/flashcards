# REST API Plan

## 1. Resources

- **User / Auth**: Supabase Auth for user registration, login, JWT issuance, and session management.
- **Flashcards**: Individual flashcards created manually or accepted from AI proposals; maps to table `flashcards`.
- **Generations**: AI generation sessions storing metadata; maps to table `generations`.
- **GenerationErrorLogs**: Records errors during AI generation; maps to table `generation_error_logs`.

## 2. Endpoints

### 2.2 Flashcards

#### GET /api/flashcards
- Description: Retrieve paginated list of the authenticated user's flashcards.
- Query Params:
  - `page` (integer, default 1)
  - `limit` (integer, default 20)
  - `sort` (string, e.g. `created_at.desc`)
- Response 200:
  ```json
  {
    "data": [
      { "id": 1, "front": "Q?", "back": "A.", "source": "manual", "created_at": "...", "updated_at": "..." }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- Errors:
  - 401 Unauthorized

#### GET /api/flashcards/{id}
- Description: Retrieve a single flashcard by ID (must belong to user).
- Path Parameter: `id` (integer)
- Response 200:
  ```json
  { "id": 1, "front": "Q?", "back": "A.", "source": "ai-full", "created_at": "...", "updated_at": "..." }
  ```
- Errors:
  - 401 Unauthorized
  - 404 Not Found

#### POST /api/flashcards
- Description: Create one or more flashcards (manual or AI-generated).
- Validation:
  - `flashcards` array must not be empty and must contain at most 50 items
  - `front` must be between 3 and 200 characters
  - `back` must be between 3 and 500 characters
  - `source` must be one of: "manual", "ai-full", "ai-edited"
  - `generation_id` must be null for manual source, and must be a valid bigint for AI sources
  - all flashcards in a batch must have the same source type
  - all AI-generated flashcards in a batch must reference the same generation_id
- Request Body:
  ```json
  {
    "flashcards": [
      {
        "front": "Question text 1",
        "back": "Answer text 1",
        "source": "manual", // or "ai-full" or "ai-edited"
        "generation_id": null // bigint required for AI-generated cards, null for manual
      },
      {
        "front": "Question text 2",
        "back": "Answer text 2",
        "source": "manual",
        "generation_id": null
      }
    ]
  }
  ```
- Response 201:
  ```json
  {
    "flashcards": [
      {
        "id": 123,
        "front": "Question text 1",
        "back": "Answer text 1",
        "source": "manual",
        "generation_id": null,
        "created_at": "...",
        "updated_at": "..."
      },
      {
        "id": 124,
        "front": "Question text 2",
        "back": "Answer text 2",
        "source": "manual",
        "generation_id": null,
        "created_at": "...",
        "updated_at": "..."
      }
    ]
  }
  ```
- Errors:
  - 400 Bad Request (validation failure)
  - 401 Unauthorized
  - 404 Generation Not Found (when generation_id is provided but doesn't exist)

#### PUT /api/flashcards/{id}
- Description: Update an existing flashcard (manual or AI-generated).
- Path Parameter: `id`
- Request Body:
  ```json
  {
    "front": "Updated Q?",
    "back": "Updated A.",
    "source": "manual", // or "ai-full" or "ai-edited"
    "generation_id": null // bigint required for AI-generated cards, null for manual
  }
  ```
- Validation:
  - `front`: required, string, min 3 chars, max 200 chars
  - `back`: required, string, min 3 chars, max 500 chars
  - `source`: required, enum ("manual", "ai-full", "ai-edited")
  - `generation_id`: required if source is "ai-full" or "ai-edited", must be null if source is "manual"
  - if `generation_id` is provided, it must reference an existing generation owned by the user
  - if source is "ai-full" or "ai-edited", all cards in the same batch must reference the same generation_id
- Response 200:
  ```json
  {
    "id": 123,
    "front": "Updated Q?",
    "back": "Updated A.",
    "source": "manual",
    "generation_id": null,
    "created_at": "...",
    "updated_at": "..."
  }
  ```
- Errors:
  - 400 Bad Request (validation failure)
  - 401 Unauthorized
  - 404 Not Found (flashcard or referenced generation not found)

#### DELETE /api/flashcards/{id}
- Description: Delete a flashcard permanently.
- Path Parameter: `id`
- Response 204 No Content
- Errors:
  - 401 Unauthorized
  - 404 Not Found

### 2.3 Generations

#### POST /api/generations
- Description: Submit text to AI model to generate flashcard proposals.
- Request Body:
  ```json
  {
    "source_text": "Long input between 1000 and 10000 characters"
  }
  ```
- Response 200:
  ```json
  {
    "generation_id": 42,
    "generated_count": 10,
    "flashcards_proposals": [
      {
        "id": 123,
        "front": "Q?",
        "back": "A.",
        "source": "ai-full"
      }
    ]
  }
  ```
- Business Logic:
  - Store generation metadata in generations table
  - Store generated flashcards proposals with source="ai-full"
  - Track generation duration and card counts
  - Handle and log any AI model errors
- Errors:
  - 400 Bad Request (text length)
  - 401 Unauthorized
  - 500 Internal Server Error (AI failure)

#### GET /api/generations
- Description: A view that allows you to accept text from the user and enable the generation of flashcards using the "Generate flashcards" button, which invokes the POST /api/generations method
- Errors:
  - 404 Not Found

#### GET /api/generations/{id}
- Description: Retrieve detailed information about a specific generation, including its flashcards.
- Path Parameter: `id`
- Response: Generation details and associated flashcards.
- Errors:
  - 404 Not Found

#### GET /api/generation-error-logs
- Description: List all AI generation error logs for the authenticated user.
- Response 200: Returns an array of error log entries containing error codes, messages, and timestamps, sorted by creation date in descending order.
  ```


## 3. Authentication and Authorization

- Use Supabase Auth JWTs passed in `Authorization: Bearer <token>` header.
- Enforce row-level security on tables (`flashcards`, `generations`, `generation_error_logs`) so users can access only their own records.
- Validate JWT claim `sub` as the user's UUID for all write and read operations.

## 4. Validation and Business Logic

- Input validation:
  - `text` length: 1000–10000 characters (as per generation schema).
  - `front`: non-empty, max 200 chars.
  - `back`: non-empty, max 500 chars.
  - `source` enum: one of [`ai-full`,`ai-edited`,`manual`].
- Business rules:
  - On generation success, increment `generations.generated_count` and store session metadata.
  - On batch accept, insert records into `flashcards` with correct `generation_id`, update `accepted_unedited_count`/`accepted_edited_count`.
  - On AI errors, insert into `generation_error_logs`.
