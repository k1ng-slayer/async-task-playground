# Async Task Playground

Small full-stack app to simulate async task execution with queueing, retries, cancellation, deletion, and live status updates.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Node.js + Express + TypeScript + Socket.IO
- Data/Queue: Redis

## Quick Start

1. Start Redis locally.
2. Backend setup:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

3. Frontend setup:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Env Vars

- `backend/.env`
  - `PORT`
  - `CLIENT`
  - `REDIS_URL`
- `frontend/.env`
  - `VITE_BACKEND_URL`

## Notes

- Tasks are processed by priority with a configurable concurrency limit of 2.
- UI receives live task updates over Socket.IO.
