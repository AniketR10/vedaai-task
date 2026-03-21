# VedaAI — AI Assessment Creator

A full-stack platform where teachers upload content (PDF/text) or describe topics, and the AI generates structured question papers with sections, difficulty levels, and multiple question types all in real-time.

## Architecture

```
Frontend  ──▶  Express API  ──▶  MongoDB
       ▲                     │
       │ WebSocket           ▼
       │              Redis + BullMQ
       │                     │
       └──── Real-time ◀─────┘
              Updates       Worker ──▶ Groq LLM
```

**How it works:**

1. Teacher uploads a PDF or writes instructions + selects question types, marks, and difficulty
2. API validates input (Zod), saves to MongoDB, and enqueues a BullMQ job
3. Worker extracts text from the PDF, builds a structured prompt, and calls Groq LLM
4. AI infers subject, grade, and title from the content and returns structured JSON (sections → questions)
5. Result is cached in Redis (1hr) and saved to MongoDB
6. WebSocket pushes real-time status updates (queued → processing → completed/failed) to the frontend
7. Frontend renders the question paper with sections, difficulty badges, and PDF export

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, TypeScript, Tailwind CSS, Zustand |
| Backend | Express, TypeScript, Zod |
| Database | MongoDB with Mongoose |
| Queue | Redis + BullMQ (bg job processing) |
| Real-time | WebSocket (ws) + Redis Pub/Sub |
| AI | Groq SDK (gpt-oss-120b) |
| File Processing | Multer + pdf-parse |
| PDF Export | html2canvas + jsPDF |

## Setup

### Prerequisites

- Node.js 18+
- Docker (for MongoDB & Redis)
- [Groq API key](https://console.groq.com)

### Install & Run

```bash
# 1. Clone
git clone <repo-url> && cd vedaai-task

# 2. Start Mongodb & Redis
docker compose up -d

# 3. Backend setup
cd backend
cp .env   # then add your GROQ_API_KEY
npm install
npm run dev             # starts api server + worker

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev             # starts Next.js
```

### Environment Variables (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_key_here
CLIENT_URL=http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assignments` | Create assignment + start AI generation |
| `GET` | `/api/assignments` | List all assignments |
| `GET` | `/api/assignments/:id` | Get assignment with generated paper |
| `DELETE` | `/api/assignments/:id` | Delete an assignment |
| `POST` | `/api/assignments/:id/regenerate` | Regenerate with cache invalidation |
| `GET` | `/api/health` | Health check |


## Features

- **AI-powered generation** -> upload a PDF or describe the topic; AI infers subject, grade, title and generates relevant questions
- **Multiple question types** -> MCQ, short answer, long answer, true/false, fill-in-the-blank with configurable counts and marks
- **Real-time status** -> WebSocket updates show live progress (queued → processing → completed)
- **Background processing** -> BullMQ handles generation asynchronously; API responds immediately
- **Redis caching** -> identical configs are served from cache; regeneration invalidates it
- **Structured output** -> questions organized into sections with difficulty badges, not raw AI text
- **PDF export** -> download the formatted question paper as PDF
- **Responsive dashboard** -> sidebar layout with search, filters, and assignment cards

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend + Worker | Render |
| Database | MongoDB Atlas |
| Cache/Queue | Upstash Redis |

## Key Design Decisions

1. **AI infers metadata** -> instead of requiring teachers to manually enter subject/grade/title, the AI extracts this from the uploaded PDF or instructions
2. **Redis Pub/Sub** -> the worker and API server share WebSocket notifications through Redis pub/sub, so the worker (which has no WebSocket connections) can still trigger real-time updates
3. **Embedded worker** -> the BullMQ worker runs in the same process as the API server for simpler deployment
