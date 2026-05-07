# AzurePrep AI

Generate Azure certification practice tests with an AI model (Google Gemini) and take them in a simple quiz UI.

## Features

- Choose a **test type** from a predefined list (see `app/lib/prompt.ts`)
- Configure **difficulty mix** by percentage (**Easy / Medium / Hard**, must sum to 100)
- Configure **number of questions**
- Generate questions using **Google Gemini** on the server
- Take the quiz in the browser with:
  - per-question multiple choice
  - submit-all + explanations
  - optional timer

## Tech Stack

- Next.js (project-specific version; see `AGENTS.md`)
- React (App directory)
- TypeScript
- Tailwind CSS (based on class usage in components)
- Google Gemini via `@google/genai`

## Project Structure (key files)

- `app/components/Home.tsx`  
  Client UI: test settings (test type, count, difficulty mix) + quiz rendering.

- `app/components/QuestionCard.tsx`  
  Renders a single question. Supports `options` as either:
  - `string[]`, or
  - `{ A: string; B: string; C: string; D: string }` (normalized internally)

- `app/interfaces/Question.ts`  
  Shared question type.

- `app/lib/prompt.ts`  
  Prompt builder:
  - `TEST_TYPES` list
  - `buildAzureTestPrompt({ testType, difficultyMix, count })`

- `app/lib/googleClient.ts`  
  Server-only Gemini client (reads `process.env.GEMINI_API_KEY`).

- `app/api/generate-test/route.ts`  
  Server endpoint that builds the prompt, calls Gemini, and returns questions.

## Requirements

- Node.js (use the version required by your repo/tooling)
- A Google Gemini API key

## Setup

1) Install dependencies

```bash
npm install
# or: pnpm install / yarn
```

2) Configure environment variables

Create a `.env` file in the project root:

```bash
# .env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

> Do **not** commit `.env`.

3) Run the dev server

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Usage

1. Select a **Test type**
2. Set **Number of questions**
3. Set **difficulty percentages** for Easy/Medium/Hard (must total 100%)
4. Click **Generate Test**
5. Answer questions and click **Submit all** to see explanations

## API

### `POST /api/generate-test`

Request body:

```json
{
  "testType": "Exam AI-900: Microsoft Azure AI Fundamentals",
  "difficultyMix": { "Easy": 34, "Medium": 33, "Hard": 33 },
  "count": 10
}
```

Response:

```json
{
  "items": [
    {
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "correctAnswer": "A",
      "explanation": "string",
      "difficulty": "Easy"
    }
  ]
}
```

Notes:
- The server normalizes some model responses and also accepts legacy JSON shapes.
- The UI can render `options` in either array or `{A,B,C,D}` map form.

## Custom Next.js Version Notice

This repo includes `AGENTS.md` which notes that this Next.js version may differ from standard Next.js docs/conventions. If you change routing, forms, server actions, or API handlers, consult:

- `node_modules/next/dist/docs/`

## Troubleshooting

### `Missing GEMINI_API_KEY`
- Ensure `.env` is at the project root
- Restart `npm run dev` after editing env files
- The Gemini client is server-only; don’t import it from `"use client"` modules

### `You're importing a module that depends on "server-only" into a React Client Component`
- Ensure Gemini calls happen in server code (e.g. `app/api/generate-test/route.ts`)
- Client code should call the server via `fetch("/api/generate-test", ...)`

## License

Add your license info here.