# Assessment Creator

The app allows teachers to create assignments, configure question types, generate structured question papers using AI, view generated output, regenerate papers, and download clean PDF versions.


## Features

- File upload UI for PDF/images
- Due date validation
- Configurable question types, question counts, and marks
- Additional instructions for AI generation
- Zustand state management
- WebSocket-based real-time generation updates
- Structured AI question generation
- Zod validation before storing LLM output
- MongoDB storage for assignments and generated results
- Redis caching and job state support
- BullMQ background generation worker
- Structured question paper output page
- Regenerate action with loader and WebSocket resubscribe
- Clean A4 PDF export using Puppeteer

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- WebSocket

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Redis
- BullMQ
- WebSocket
- Puppeteer

### AI

- Gemini API using an OpenAI-compatible endpoint
- Structured JSON prompt contract
- Zod parsing and validation
- Semantic validation for MCQ options and answer key format


## Architecture

```txt
Teacher submits assignment form
        ↓
Express API validates request
        ↓
Assignment saved in MongoDB
        ↓
BullMQ job added to Redis
        ↓
Worker calls LLM
        ↓
LLM output parsed and validated with Zod
        ↓
Result saved in MongoDB
        ↓
WebSocket notifies frontend
        ↓
Frontend renders structured question paper
