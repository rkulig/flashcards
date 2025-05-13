# Schemat bazy danych 10x-cards

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### 1.1. flashcards
| Kolumna        | Typ                 | Ograniczenia                                                                                 |
|----------------|---------------------|---------------------------------------------------------------------------------------------|
| id             | BIGSERIAL           | PRIMARY KEY                                                                                 |
| user_id        | UUID                | NOT NULL, FK → auth.users(id) ON DELETE CASCADE                                             |
| generation_id  | BIGINT              | FK → generations(id) ON DELETE CASCADE                                                      |
| front          | VARCHAR(200)        | NOT NULL                                                                                    |
| back           | VARCHAR(500)        | NOT NULL                                                                                    |
| source         | VARCHAR(20)         | NOT NULL, CHECK (source IN ('ai-full','ai-edited','manual'))                                 |
| created_at     | TIMESTAMPTZ         | NOT NULL, DEFAULT now()                                                                     |
| updated_at     | TIMESTAMPTZ         | NOT NULL, DEFAULT now()                                                                     |

### 1.2. generations
| Kolumna                   | Typ          | Ograniczenia                                                                 |
|---------------------------|--------------|-----------------------------------------------------------------------------|
| id                        | BIGSERIAL    | PRIMARY KEY                                                                 |
| user_id                   | UUID         | NOT NULL, FK → auth.users(id) ON DELETE CASCADE                             |
| model                     | VARCHAR(100) | NOT NULL                                                                    |
| generated_count           | INT          | NOT NULL, DEFAULT 0                                                         |
| accepted_unedited_count   | INT          | NULLABLE                                                                    |
| accepted_edited_count     | INT          | NULLABLE                                                                    |
| source_text_hash          | VARCHAR(64)  | NOT NULL                                                                    |
| source_text_length        | INT          | NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)   
| generation_duration       | INT          | NOT NULL              |
| created_at                | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                                                     |
| updated_at                | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                                                     |

### 1.3. generation_error_logs
| Kolumna              | Typ          | Ograniczenia                                                                 |
|----------------------|--------------|-----------------------------------------------------------------------------|
| id                   | BIGSERIAL    | PRIMARY KEY                                                                 |
| user_id              | UUID         | NOT NULL, FK → auth.users(id) ON DELETE CASCADE                             |
| model                | VARCHAR(100) | NOT NULL                                                                    |
| source_text_hash     | VARCHAR(64)  | NOT NULL                                                                    |
| source_text_length   | INT          | NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)                  |
| error_code           | VARCHAR(20)  | NOT NULL                                                                    |
| error_message        | TEXT         | NOT NULL                                                                    |
| created_at           | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                                                     |

---

## 2. Relacje między tabelami

- auth.users (1) ←— (N) flashcards via flashcards.user_id  
- auth.users (1) ←— (N) generations via generations.user_id  
- auth.users (1) ←— (N) generation_error_logs via generation_error_logs.user_id  
- generations (1) ←— (N) flashcards via flashcards.generation_id  
- generations (1) ←— (N) generation_error_logs via generation_error_logs.generation_id  

---

## 4. Zasady RLS (Row-Level Security)

- W tabelach flashcards, generations oraz generation_error_logs wdrozyć polityki RLS, które pozwalają użytkownikowi na dostęp tylko do rekordów, gdzie `user_id` odpowiada identyfikatorowi użytkownika z Supabase Auth.

## 5. Dodatkowe uwagi

- Trigger w tabeli flashcards ma automatycznie aktualziować kolumne `updated_at` przy każdej modyfikacji rekordu.
