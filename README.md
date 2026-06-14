# TravHjälpen - AI-Powered Trotting Assistant

TravHjälpen is a modern fullstack web application built with **Next.js** using the App Router and **TypeScript**. The application works as an AI assistant for Swedish trotting, allowing users to ask questions about races, horses, drivers, betting types and general trotting-related concepts in natural language.

The project demonstrates how Large Language Models (LLMs) can be combined with external data sources, tool calling, semantic search, embeddings, logging and automated answer evaluation in a modern web architecture.

---

## 🌟 Main Features

- **Conversational Interface**  
  Users can ask questions and receive real-time answers based on AI reasoning and available trotting-related data.

- **AI Tool Calling**  
  The assistant can decide when to call specific backend functions to retrieve structured information, such as races by date, track, horse, driver or game type.

- **Semantic FAQ Search**  
  TravHjälpen uses OpenAI embeddings with `text-embedding-3-small` to compare user questions with stored FAQ data. This allows the system to understand the meaning of a question instead of relying only on exact keyword matching.

- **Knowledge Base Retrieval**  
  The application includes a separate knowledge base for more detailed explanations and comparison questions, such as the difference between betting types or how specific trotting concepts work.

- **Knowledge Gaps**  
  If the system cannot find a strong enough match in the knowledge base, the question can be saved as a knowledge gap. This makes it easier to identify missing information and improve the system over time through a controlled feedback loop.

- **Google Sheets Logging**  
  User questions and AI-generated answers can be logged to Google Sheets. This makes it possible to review real user interactions and analyze how the assistant is used.

- **Automated Answer Evaluation**  
  The project includes an automated evaluation script that runs benchmark questions against the assistant, compares the generated answers with reference answers using embeddings and cosine similarity, and returns passed or failed results.

- **Responsive Design**  
  The interface is styled with **Vanilla CSS** and designed to work across different screen sizes.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Next.js 15
- **Language:** TypeScript
- **Backend & API:** Next.js API Routes, server-side logic
- **AI Integration:** OpenAI API for language models and embeddings
- **Embeddings:** `text-embedding-3-small`
- **Database:** PostgreSQL with pgvector
- **Logging:** Google Sheets
- **Observability:** Langfuse
- **Styling:** Vanilla CSS
- **Deployment:** Heroku

---

## 🧠 How the AI Assistant Works

TravHjälpen uses a tool-based AI workflow where the language model can call backend functions when it needs additional information.

The assistant can, for example:

- search the FAQ using semantic similarity
- retrieve information from the knowledge base
- search for races by date or track
- look up horse, driver or race information
- log missing knowledge as knowledge gaps

The purpose of this structure is to make the assistant more reliable than a basic chatbot. Instead of only generating answers from the model's general knowledge, the system can use project-specific data and stored domain knowledge.

---

## ✅ Automated Evaluation

The project includes an automated evaluation flow for testing answer quality.

The evaluation script:

1. Reads predefined benchmark questions.
2. Sends each question to the assistant API.
3. Receives the generated model answer.
4. Creates an embedding for the reference answer.
5. Creates an embedding for the model answer.
6. Calculates cosine similarity between the two embeddings.
7. Marks the test as passed or failed depending on the similarity score.

This makes it possible to test the assistant in a repeatable way and compare answer quality over time.

Example result:

```json
{
  "ok": true,
  "total": 5,
  "passed": 5,
  "failed": 0
}
```

## Installation

1. Clone or download this project to your computer.
2. Install the project dependencies:

   `npm install`

3. Create a .env.local file in the my-app folder and add your OpenAI API key:
   OPENAI_API_KEY=your_actual_api_key_here
4. Start the development server:
   `npm run dev`
5. Open http://localhost:3000 in your browser.
