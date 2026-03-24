# ⬡ TaskFlow — Full-Stack Task Management System

A premium, production-grade task management system built with **React + TypeScript** (frontend) and **Node.js + Express + TypeScript + Sequelize ORM** (backend), using **SQLite** as the database.

---

## ✨ Features

- 🔐 **JWT Authentication** — register, login, protected routes
- ✅ **Full CRUD** on tasks — create, read, update, delete
- 🎯 **Filter & Search** — by status, priority, and keyword
- 📊 **Live Stats Dashboard** — total, todo, in-progress, completed counts
- 🏷️ **Priority Levels** — high / medium / low with color indicators
- 📅 **Due Dates** — with overdue detection
- ⚡ **One-click status cycling** — click a task's status badge to advance it
- 🌙 **Premium dark UI** — Syne + DM Sans fonts, animated cards, glassmorphism modal
- 🔒 **TypeScript everywhere** — both backend and frontend
- 🗃️ **Sequelize ORM** — with model hooks, associations, and validation

---

## 🏗️ Tech Stack

| Layer      | Tech                                              |
|------------|---------------------------------------------------|
| Frontend   | React 18, TypeScript, React Router 6, Axios       |
| Backend    | Node.js, Express.js, TypeScript                   |
| ORM        | Sequelize v6                                      |
| Database   | SQLite (easily swappable to PostgreSQL/MySQL)     |
| Auth       | JWT (jsonwebtoken) + bcryptjs                     |
| Validation | express-validator                                 |
| Deploy     | Netlify (frontend) + Render (backend)             |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── controllers/     # authController.ts, taskController.ts
│   │   ├── middleware/       # auth.ts (JWT), errorHandler.ts
│   │   ├── models/           # User.ts, Task.ts (Sequelize)
│   │   ├── routes/           # auth.ts, tasks.ts
│   │   ├── database/         # connection.ts (Sequelize + SQLite)
│   │   └── index.ts          # Express app entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/              # client.ts (Axios), index.ts (API calls)
    │   ├── components/       # TaskCard, TaskModal, StatsBar
    │   ├── context/          # AuthContext.tsx
    │   ├── hooks/            # useTasks.ts
    │   ├── pages/            # LoginPage, SignupPage, DashboardPage
    │   ├── types/            # index.ts (all TypeScript interfaces)
    │   └── App.tsx
    ├── public/
    │   ├── index.html
    │   └── _redirects        # Netlify SPA routing fix
    ├── .env.example
    └── package.json
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

---

### 1. Clone the repo

```bash
git clone https://gitlab.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env — set a strong JWT_SECRET

# Start dev server (auto-creates SQLite DB and syncs tables)
npm run dev
```

Backend runs on: **http://localhost:5000**

Health check: **http://localhost:5000/health**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Set: REACT_APP_API_URL=http://localhost:5000/api

# Start dev server
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🌐 API Reference

### Auth Endpoints

| Method | Endpoint             | Auth | Description               |
|--------|----------------------|------|---------------------------|
| POST   | /api/auth/register   | ✗    | Register a new user       |
| POST   | /api/auth/login      | ✗    | Login, returns JWT token  |
| GET    | /api/auth/me         | ✓    | Get current user info     |

#### Register Request Body
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Login Request Body
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Auth Response (register & login)
```json
{
  "success": true,
  "message": "Welcome back, john_doe!",
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": 1, "username": "john_doe", "email": "john@example.com" }
  }
}
```

---

### Task Endpoints (all require `Authorization: Bearer <token>`)

| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| GET    | /api/tasks      | Get all tasks (with filters)   |
| GET    | /api/tasks/:id  | Get a single task              |
| POST   | /api/tasks      | Create a new task              |
| PUT    | /api/tasks/:id  | Update a task                  |
| DELETE | /api/tasks/:id  | Delete a task                  |

#### GET /api/tasks — Query Params

| Param     | Values                          |
|-----------|---------------------------------|
| status    | `todo`, `in_progress`, `completed` |
| priority  | `low`, `medium`, `high`        |
| search    | any string (searches title + description) |
| sortBy    | `createdAt`, `title`, `due_date`, `priority` |
| sortOrder | `ASC`, `DESC`                   |

#### Create / Update Task Body
```json
{
  "title": "Design new landing page",
  "description": "Figma mockup first, then implement in React",
  "status": "todo",
  "priority": "high",
  "due_date": "2024-12-31"
}
```

---

## 🗄️ Database Schema

### `users` table
| Column     | Type    | Constraints          |
|------------|---------|----------------------|
| id         | INTEGER | PK, autoincrement    |
| username   | STRING  | unique, not null     |
| email      | STRING  | unique, not null     |
| password   | STRING  | hashed (bcrypt)      |
| createdAt  | DATE    |                      |
| updatedAt  | DATE    |                      |

### `tasks` table
| Column      | Type    | Constraints                        |
|-------------|---------|------------------------------------|
| id          | INTEGER | PK, autoincrement                  |
| user_id     | INTEGER | FK → users.id                      |
| title       | STRING  | not null, max 200                  |
| description | TEXT    | default ''                         |
| status      | ENUM    | todo / in_progress / completed     |
| priority    | ENUM    | low / medium / high                |
| due_date    | DATE    | nullable                           |
| createdAt   | DATE    |                                    |
| updatedAt   | DATE    |                                    |

---

## ☁️ Deployment

### Deploy Backend to Render (Free)

1. Push code to GitLab
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitLab repo
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate a strong random string>
   JWT_EXPIRES_IN=7d
   DB_PATH=./taskflow.db
   FRONTEND_URL=https://your-app.netlify.app
   ```
6. Deploy. Copy the URL (e.g. `https://taskflow-api.onrender.com`)

---

### Deploy Frontend to Netlify

1. In `frontend/.env`, set:
   ```
   REACT_APP_API_URL=https://taskflow-api.onrender.com/api
   ```
2. Run `npm run build` to test locally
3. Go to [netlify.com](https://netlify.com) → **New site from Git**
4. Connect GitLab repo
5. Set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
6. Add environment variable:
   ```
   REACT_APP_API_URL=https://taskflow-api.onrender.com/api
   ```
7. Deploy. The `_redirects` file handles SPA routing.

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (12 salt rounds) via Sequelize model hooks
- **JWT tokens** expire in 7 days
- All task routes are **protected by auth middleware**
- Users can **only access their own tasks** (user_id scoping on all queries)
- Input validation with **express-validator** on all endpoints
- Graceful error handling — never leaks stack traces in production

---

## 📝 Submission Checklist

- [x] ✅ Working signup & login with JWT
- [x] ✅ Dashboard with task list
- [x] ✅ Create task form
- [x] ✅ Edit task functionality
- [x] ✅ Delete task functionality
- [x] ✅ Filter by status (sidebar nav + dropdown)
- [x] ✅ Filter by priority
- [x] ✅ Search tasks
- [x] ✅ SQL database (SQLite via Sequelize ORM)
- [x] ✅ TypeScript (frontend + backend)
- [x] ✅ ORM (Sequelize with associations, hooks, validation)
- [x] ✅ All 6 REST API endpoints implemented
- [x] ✅ JWT middleware protecting routes
- [x] ✅ Error handling (validation, 401, 404, 500)

---

*Built with precision. Designed to impress.*
