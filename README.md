# Projectify

A full-stack project and task management dashboard built with React (Vite) and Express.

## Quick Setup

```bash
# 1) Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 2) Create backend env
# backend/.env
# PORT=5000
# JWT_SECRET=replace_with_a_strong_secret
# DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require

# 3) Run backend
cd backend && npm run dev

# 4) Run frontend (new terminal)
cd frontend && npm run dev
```

App URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Tech Stack

- Frontend: React, Vite, Axios, Tailwind CSS, Recharts
- Backend: Node.js, Express, JWT auth, bcrypt
- Database: Neon PostgreSQL (primary) with local SQLite fallback
- Deployment: Vercel (frontend + serverless backend)

## Monorepo Structure

- `frontend/` - React client app
- `backend/` - Express API server
- `vercel.json` - Vercel routing/build configuration

## Features

- Authentication (register/login with JWT)
- Project management (create, list with pagination, get by id, delete)
- Task management (create, list by project, update, delete)
- Task status filtering (`todo`, `in-progress`, `done`)
- Task sorting by due date
- Project sorting (including due-date sort)
- Dashboard analytics and task progress visuals

## API Overview

### Project APIs

- `POST /api/projects`
- `GET /api/projects?page=1&limit=10`
- `GET /api/projects/{id}`
- `DELETE /api/projects/{id}`

### Task APIs

- `POST /api/projects/{project_id}/tasks`
- `GET /api/projects/{project_id}/tasks?status=todo`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

## API Documentation

Base URL (local): `http://localhost:5000/api`

### 1) Create Project

- **Method:** `POST`
- **Path:** `/projects`
- **Body:**

```json
{
  "name": "Website Revamp",
  "description": "Update landing and dashboard UX",
  "due_date": "2026-05-15",
  "tasks": [
    {
      "title": "Design wireframes",
      "description": "Create responsive dashboard wireframes",
      "status": "todo",
      "priority": "high",
      "due_date": "2026-05-05"
    }
  ]
}
```

- **Success Response:** `201 Created`

```json
{
  "id": 12,
  "name": "Website Revamp",
  "description": "Update landing and dashboard UX",
  "due_date": "2026-05-15",
  "status": "Active",
  "created_tasks": 1
}
```

### 2) Get Projects (Paginated)

- **Method:** `GET`
- **Path:** `/projects?page=1&limit=10&sortBy=created_at&sortOrder=DESC`
- **Success Response:** `200 OK`

```json
{
  "projects": [
    {
      "id": 12,
      "name": "Website Revamp",
      "description": "Update landing and dashboard UX",
      "created_at": "2026-04-14T12:00:00.000Z",
      "task_counts": {
        "todo": 1,
        "in_progress": 0,
        "done": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 2,
    "total": 11
  }
}
```

### 3) Get Project by ID

- **Method:** `GET`
- **Path:** `/projects/{id}`
- **Example:** `/projects/12`
- **Success Response:** `200 OK`

```json
{
  "id": 12,
  "name": "Website Revamp",
  "description": "Update landing and dashboard UX",
  "created_at": "2026-04-14T12:00:00.000Z",
  "task_counts": {
    "todo": 1,
    "in_progress": 0,
    "done": 0
  }
}
```

### 4) Delete Project

- **Method:** `DELETE`
- **Path:** `/projects/{id}`
- **Success Response:** `200 OK`

```json
{
  "message": "Project deleted",
  "id": 12
}
```

### 5) Create Task

- **Method:** `POST`
- **Path:** `/projects/{project_id}/tasks`
- **Body:**

```json
{
  "title": "Implement API docs",
  "description": "Write endpoint examples in README",
  "status": "in-progress",
  "priority": "medium",
  "due_date": "2026-05-10"
}
```

- **Success Response:** `201 Created`

```json
{
  "id": 34,
  "project_id": 12,
  "title": "Implement API docs",
  "description": "Write endpoint examples in README",
  "status": "in-progress",
  "priority": "medium",
  "due_date": "2026-05-10"
}
```

### 6) Get Tasks by Project (Filter + Sort)

- **Method:** `GET`
- **Path:** `/projects/{project_id}/tasks?status=todo`
- **Notes:**
  - `status` is optional: `todo | in-progress | done`
  - sorted by `due_date ASC`
- **Success Response:** `200 OK`

```json
[
  {
    "id": 34,
    "project_id": 12,
    "title": "Implement API docs",
    "description": "Write endpoint examples in README",
    "status": "todo",
    "priority": "medium",
    "due_date": "2026-05-10",
    "created_at": "2026-04-14T12:30:00.000Z"
  }
]
```

### 7) Update Task

- **Method:** `PUT`
- **Path:** `/tasks/{id}`
- **Body (partial update supported):**

```json
{
  "status": "done",
  "priority": "high"
}
```

- **Success Response:** `200 OK`

```json
{
  "message": "Updated",
  "changes": 1
}
```

### 8) Delete Task

- **Method:** `DELETE`
- **Path:** `/tasks/{id}`
- **Success Response:** `200 OK`

```json
{
  "message": "Task deleted",
  "id": 34
}
```

### Error Response Format

Most validation and server errors return:

```json
{
  "error": "Human-readable error message"
}
```

## Local Setup

### 1) Install dependencies

From project root:

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2) Configure environment

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=replace_with_a_strong_secret
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

Notes:
- If `DATABASE_URL` is set, backend uses Neon/PostgreSQL.
- If `DATABASE_URL` is missing, backend falls back to local SQLite.

### 3) Run backend

```bash
cd backend
npm run dev
```

### 4) Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs on Vite dev server, backend on `http://localhost:5000`.

## Deployment (Vercel)

This repository is already configured with `vercel.json`.

### Required Vercel Environment Variables

- `DATABASE_URL` (Neon connection string)
- `JWT_SECRET`

### Deploy steps

1. Push repo to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Project Settings
4. Deploy

Routing behavior:
- `/api/*` -> Express backend (`backend/server.js`)
- `/*` -> Frontend SPA

## Scripts

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Backend

- `npm run start`
- `npm run dev`

## Troubleshooting

- **Backend says fallback SQLite is used**
  - `DATABASE_URL` is missing or not loaded in `backend/.env`
- **Neon connection errors**
  - Verify host/user/password/db in `DATABASE_URL`
  - Keep `sslmode=require`
- **Frontend cannot call API in production**
  - Ensure Vercel env vars are set and deployment logs show backend function healthy

