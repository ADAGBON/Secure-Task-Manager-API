# Secure Task Manager API

A RESTful API for managing personal tasks, built with Node.js, Express, and MongoDB. Authentication is handled via JWT (stored in httpOnly cookies) with optional Google OAuth 2.0 sign-in.

---

## Features

- User signup and login with bcrypt password hashing
- Google OAuth 2.0 sign-in via Passport.js
- JWT authentication delivered through secure, httpOnly cookies
- Per-user task isolation — users can only access their own tasks
- Security hardening: Helmet headers, NoSQL injection prevention, XSS sanitization, and login rate limiting

---

## Tech Stack

| Layer | Package |
|---|---|
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | jsonwebtoken, bcryptjs, Passport.js |
| OAuth | passport-google-oauth20 |
| Security | helmet, express-mongo-sanitize, xss-clean, express-rate-limit |
| Config | dotenv |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A Google Cloud project with OAuth 2.0 credentials (for Google login)

### Installation

```bash
git clone <repo-url>
cd secure-task-manager-api
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://localhost:27017/task-manager

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Running the Server

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000` by default.

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/signup` | Register a new user | No |
| POST | `/login` | Log in with email and password | No |
| GET | `/logout` | Clear the JWT cookie | No |
| GET | `/google` | Redirect to Google OAuth | No |
| GET | `/google/callback` | Google OAuth callback | No |

#### POST `/api/auth/signup`

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response `201`:**
```json
{
  "status": "success",
  "data": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

#### POST `/api/auth/login`

Rate limited to **10 requests per 15 minutes**.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response `200`:** Same shape as signup. A `jwt` httpOnly cookie is set automatically.

#### GET `/api/auth/logout`

Clears the `jwt` cookie.

**Response `200`:**
```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```

---

### Task Routes — `/api/tasks`

All task routes require a valid JWT cookie (set on login or signup).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all tasks for the authenticated user |
| POST | `/` | Create a new task |
| DELETE | `/:id` | Delete a task by ID |

#### GET `/api/tasks`

**Response `200`:**
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "...",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "owner": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### POST `/api/tasks`

**Request body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response `201`:**
```json
{
  "status": "success",
  "data": { "_id": "...", "title": "Buy groceries", "completed": false, "owner": "..." }
}
```

#### DELETE `/api/tasks/:id`

**Response `204`:** No content.

---

## Project Structure

```
secure-task-manager-api/
├── server.js               # Entry point — connects DB and starts server
└── src/
    ├── app.js              # Express app setup and middleware
    ├── config/
    │   ├── db.js           # MongoDB connection
    │   └── passport.js     # Google OAuth strategy
    ├── controllers/
    │   ├── authController.js
    │   └── taskController.js
    ├── middleware/
    │   ├── verifyToken.js  # JWT cookie guard
    │   └── errorHandler.js # Centralized error responses
    ├── models/
    │   ├── User.js
    │   └── Task.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── taskRoutes.js
    └── utils/
        ├── AppError.js     # Custom error class
        └── catchAsync.js   # Async error wrapper
```

---

## Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds) before storage.
- JWTs are sent as **httpOnly, SameSite=Strict** cookies — inaccessible to JavaScript.
- The cookie is set to **Secure** automatically in production.
- Login endpoint is rate-limited to mitigate brute-force attacks.
- Request bodies are sanitized against **NoSQL injection** and **XSS** on every route.
- HTTP security headers are set by **Helmet**.
- Request body size is capped at **10 kb**.
