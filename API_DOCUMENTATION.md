# Projectify API Documentation

## Base URL

- Local: `http://localhost:5000/api`
- Production (Vercel): `https://<your-domain>/api`

## Content Type

For all `POST` and `PUT` requests:

- Header: `Content-Type: application/json`
- Body format: raw JSON

## Authentication APIs

### Register User

- **Method:** `POST`
- **Path:** `/auth/register`
- **Body:**

```json
{
  "name": "Vinay",
  "email": "vinay@example.com",
  "password": "123456"
}
```

- **Success:** `201`

```json
{
  "message": "User created"
}
```

- **Validation Errors:** `400`
  - `name, email and password are required`
  - `User already exists`

---

### Login User

- **Method:** `POST`
- **Path:** `/auth/login`
- **Body:**

```json
{
  "email": "vinay@example.com",
  "password": "123456"
}
```

- **Success:** `200`

```json
{
  "token": "<jwt_token>",
  "user": {
    "name": "Vinay",
    "email": "vinay@example.com"
  }
}
```

- **Errors:** `400`
  - `email and password are required`
  - `User not found`
  - `Invalid credentials`

## Project APIs

### Create Project

- **Method:** `POST`
- **Path:** `/projects`
- **Body:**

```json
{
  "name": "Website Revamp",
  "description": "Dashboard redesign sprint",
  "priority": 3,
  "due_date": "2026-05-20",
  "remaining_work": "Finalize QA",
  "tasks": [
    {
      "title": "Design wireframes",
      "description": "Create all screens",
      "status": "todo",
      "priority": "high",
      "due_date": "2026-05-10"
    }
  ]
}
```

- **Success:** `201`

```json
{
  "id": 1,
  "name": "Website Revamp",
  "description": "Dashboard redesign sprint",
  "priority": 3,
  "due_date": "2026-05-20",
  "remaining_work": "Finalize QA",
  "status": "Active",
  "created_tasks": 1
}
```

- **Validation Errors:** `400`
  - `Name is required`
  - `due_date must be in YYYY-MM-DD format`

---

### Get Projects (Paginated)

- **Method:** `GET`
- **Path:** `/projects?page=1&limit=10&sortBy=created_at&sortOrder=DESC`

#### Query Params

- `page` (optional, default `1`)
- `limit` (optional, default `6`)
- `sortBy` (optional): `priority | date | due_date | name | id`
- `sortOrder` (optional): `ASC | DESC`
- `status` (optional): project status filter

- **Success:** `200`

```json
{
  "projects": [
    {
      "id": 1,
      "name": "Website Revamp",
      "description": "Dashboard redesign sprint",
      "priority": 3,
      "due_date": "2026-05-20T00:00:00.000Z",
      "status": "Active",
      "created_at": "2026-04-14T10:00:00.000Z",
      "task_counts": {
        "todo": 1,
        "in_progress": 0,
        "done": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 1,
    "total": 1
  },
  "stats": {
    "active": 1,
    "pending": 0,
    "completed": 0,
    "onHold": 0
  }
}
```

- **Validation Errors:** `400`
  - `page and limit must be positive integers`

---

### Get Project by ID

- **Method:** `GET`
- **Path:** `/projects/{id}`
- **Example:** `/projects/1`

- **Success:** `200`

```json
{
  "id": 1,
  "name": "Website Revamp",
  "description": "Dashboard redesign sprint",
  "priority": 3,
  "due_date": "2026-05-20T00:00:00.000Z",
  "status": "Active",
  "created_at": "2026-04-14T10:00:00.000Z",
  "task_counts": {
    "todo": 1,
    "in_progress": 0,
    "done": 0
  }
}
```

- **Errors:**
  - `400`: `Project id must be a positive integer`
  - `404`: `Project #{id} not found`

---

### Update Project Status / Remaining Work

- **Method:** `PUT`
- **Path:** `/projects/{id}`
- **Body (one or both):**

```json
{
  "status": "Completed",
  "remaining_work": "None"
}
```

- **Allowed status values:** `Active | Pending | Completed | On Hold`

- **Success:** `200`

```json
{
  "message": "Update successful",
  "id": 1,
  "status": "Completed",
  "remaining_work": "None"
}
```

- **Errors:**
  - `400`: `Invalid status value`
  - `400`: `No fields to update`
  - `404`: `Project #1 not found`

---

### Delete Project

- **Method:** `DELETE`
- **Path:** `/projects/{id}`

- **Success:** `200`

```json
{
  "message": "Project deleted",
  "id": 1
}
```

- **Errors:**
  - `404`: `Project #{id} not found`

## Task APIs

### Create Task

- **Method:** `POST`
- **Path:** `/projects/{project_id}/tasks`
- **Body:**

```json
{
  "title": "Implement API docs",
  "description": "Add endpoint examples",
  "status": "todo",
  "priority": "medium",
  "due_date": "2026-05-15"
}
```

- **Allowed status:** `todo | in-progress | done`
- **Allowed priority:** `low | medium | high`

- **Success:** `201`

```json
{
  "id": 10,
  "project_id": 1,
  "title": "Implement API docs",
  "description": "Add endpoint examples",
  "status": "todo",
  "priority": "medium",
  "due_date": "2026-05-15"
}
```

- **Errors:**
  - `400`: `project_id must be a positive integer`
  - `400`: `Task title is required`
  - `400`: `Invalid task status`
  - `400`: `Invalid task priority`
  - `400`: `due_date must be in YYYY-MM-DD format`
  - `404`: `Project #{project_id} not found`

---

### Get Tasks by Project

- **Method:** `GET`
- **Path:** `/projects/{project_id}/tasks`
- **Optional filter:** `/projects/{project_id}/tasks?status=todo`

#### Query Params

- `status` (optional): `todo | in-progress | done`

Sorting:
- Returns tasks ordered by `due_date ASC`, then `created_at DESC`.

- **Success:** `200`

```json
[
  {
    "id": 10,
    "project_id": 1,
    "title": "Implement API docs",
    "description": "Add endpoint examples",
    "status": "todo",
    "priority": "medium",
    "due_date": "2026-05-15T00:00:00.000Z",
    "created_at": "2026-04-14T11:00:00.000Z"
  }
]
```

- **Errors:**
  - `400`: `project_id must be a positive integer`
  - `400`: `Invalid status filter`

---

### Update Task

- **Method:** `PUT`
- **Path:** `/tasks/{id}`
- **Body (partial update):**

```json
{
  "status": "done",
  "priority": "high"
}
```

- **Success:** `200`

```json
{
  "message": "Updated",
  "changes": 1
}
```

- **Errors:**
  - `400`: `Task id must be a positive integer`
  - `400`: `Invalid task status`
  - `400`: `Invalid task priority`
  - `400`: `due_date must be in YYYY-MM-DD format`
  - `400`: `No fields provided for update`
  - `404`: `Task #{id} not found`

---

### Delete Task

- **Method:** `DELETE`
- **Path:** `/tasks/{id}`

- **Success:** `200`

```json
{
  "message": "Task deleted",
  "id": 10
}
```

- **Errors:**
  - `400`: `Task id must be a positive integer`
  - `404`: `Task #{id} not found`

## Common Error Format

Most backend errors are returned as:

```json
{
  "error": "Human-readable error message"
}
```

