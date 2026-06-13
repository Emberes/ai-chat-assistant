# Intro-Project

This project is under development.

## What exists right now?

### 1) Race data from ATG

An API route that fetches data from ATG’s calendar API and can:

- return the **full raw payload** (exactly what ATG returns)
- return an **AI-friendly** simplified view (`view=ai`)

### 2) AI Q&A (OpenAI + function calling)

An API route that accepts a question and uses function calling to:

- resolve the date (e.g. “tomorrow”)
- fetch relevant data from `/api/race`

---

## Setup 🪛

### Environment variables

Create a `.env.local` in `my-app/` and add:

```env
OPENAI_API_KEY =

ATG_API_URL = https://www.atg.se/services/racinginfo/v1/api/calendar/day/
```

### How to install the right proportic

cd my-app
npm install
npm run dev

## End points

### GET :

Fetch all info: http://localhost:3000/api/race

Fetch all info for a specific date: http://localhost:3000/api/race?date=2026-01-30

Note: date must be in YYYY-MM-DD format.

### POST :

Ask OpenAI questions about races: http://localhost:3000/api/askAI

Send JSON like this:
{
"question": "Går det något race på lördag?"
}
