# 10x-cards (Flashcards)

A web application that enables quick creation and management of educational flashcards using AI and a spaced-repetition algorithm. Paste any text to generate suggested Q&A pairs via a large language model, then review, edit, and save only the flashcards you want.

---

## Table of Contents

1. [Tech Stack](#tech-stack)  
2. [Getting Started Locally](#getting-started-locally)  
3. [Available Scripts](#available-scripts)  
4. [Project Scope](#project-scope)  
5. [Project Status](#project-status)  
6. [License](#license)  

---

## Tech Stack

- **Frontend**
  - Astro 5
  - TypeScript 5
  - React 19
  - Tailwind CSS 4
  - Shadcn/ui
- **Backend (BaaS)**
  - Supabase (PostgreSQL, Auth)
- **AI**
  - Openrouter.ai (multi-model LLMs)
- **CI/CD & Hosting**
  - GitHub Actions
  - Docker on DigitalOcean
- **Tooling & Config**
  - Node.js v22.14.0 (managed via NVM)
  - ESLint, Prettier, Husky, lint-staged

---

## Getting Started Locally

1. **Clone the repository**  
   ```bash
   git clone https://github.com/rkulig/flashcards.git
   cd flashcards
   ```

2. **Install Node.js**  
   ```bash
   nvm install
   nvm use
   ```

3. **Install dependencies**  
   ```bash
   npm install
   ```

4. **Configure environment variables**  
   - Copy the example:  
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and set your keys:  
     - `SUPABASE_URL`  
     - `SUPABASE_KEY`  
     - `OPENROUTER_API_KEY`

5. **Run the development server**  
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start Astro development server (hot reload)  |
| `npm run build` | Build the production site                    |
| `npm run preview` | Preview the built site locally             |
| `npm run astro` | Run the Astro CLI                            |
| `npm run lint`  | Run ESLint on all files                      |
| `npm run lint:fix` | Auto-fix ESLint errors                    |
| `npm run format` | Format codebase with Prettier               |

---

## Project Scope

### MVP Features

- **AI-powered flashcard generation**  
  Paste text (1,000–10,000 chars) → Openrouter.ai → suggested Q&A list → accept, edit, or reject.
- **Manual flashcard management**  
  Create, edit, and delete flashcards via form.
- **User authentication**  
  Registration, login, and account deletion.
- **Learning session**  
  Spaced-repetition algorithm to schedule flashcards for review.
- **Statistics**  
  Track number of flashcards generated vs. accepted.
- **GDPR compliance**  
  User data deletion on request.

### Out of Scope (MVP)

- Gamification features
- Mobile applications
- Public REST API
- Import from PDF/DOCX
- Flashcard sharing between users
- Advanced notifications or search

---

## Project Status

Version: **0.0.1** – MVP features implemented and under active development.  
Roadmap: expand AI prompts, add more study modes, improve UI/UX, set up CI badges and deploy workflows.

---

## License

> **TBD** – No license file found. Please add a `LICENSE` in the project root to specify terms.