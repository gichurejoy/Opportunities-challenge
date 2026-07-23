# 📚 1000 Opportunities - Database & Authentication Guide

Welcome to the **1000 Opportunities Challenge** backend & database documentation. This guide details how the database, user authentication (Email/Password & Google OAuth), and cloud synchronization are structured, how to run the project locally, and how to seamlessly switch to a **live MySQL database** in production.

---

## 🏗️ Architecture Overview

- **Frontend**: Vite + React 19 + TailwindCSS v4
- **Backend API**: Express.js server hosted in `server.ts`
- **Database Layer**: **Prisma ORM**
  - **Local Development**: SQLite (`dev.db` - zero external database server required)
  - **Production Ready**: MySQL / MariaDB (single-line configuration swap)
- **User Authentication**:
  - **Email & Password**: Hashed with `bcryptjs` (salt factor 10)
  - **Google OAuth**: One-click sign-in verified server-side with `google-auth-library`
  - **Sessions**: JSON Web Tokens (JWT) stored securely in browser storage

---

## 🚀 Quickstart: Running Locally

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Variables Setup
Create or update your `.env` file in the root directory:

```env
# Database connection string (SQLite for local development)
DATABASE_URL="file:./dev.db"

# Secret key for JWT session tokens (Change in production!)
JWT_SECRET="your-super-secret-jwt-key"

# (Optional) Google OAuth Client ID for Google Sign-In
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

# Gemini AI API Key for "One More Opportunity" recommendations
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 3. Initialize Database & Push Schema
Run Prisma database sync to create `dev.db` locally:

```bash
npx prisma db push
```

### 4. Start Development Server
Run the unified Express + Vite development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 🔐 How User Authentication & Cloud Sync Works

1. **Guest Mode (No Sign-In)**:
   - Users can use the platform immediately without an account.
   - All logged opportunities, streaks, and visions are stored in browser `localStorage`.

2. **Sign In / Create Account**:
   - Users can click **"Sign In / Sync DB"** in the top navigation bar.
   - Select either **Email/Password** or **"Sign in with Google"**.
   - Upon authentication, a 30-day JWT token is issued.

3. **Database State Persistence**:
   - Once signed in, any new opportunity logged, vision updated, or streak completed automatically syncs to the server database (`UserState` table in SQLite/MySQL).
   - Logging in on a new device or browser automatically pulls the user's saved data from the database.

---

## 🐬 How to Switch to a Live MySQL Database

When you are ready to deploy your live MySQL database, follow these **3 simple steps**:

### Step 1: Update `prisma/schema.prisma`
Open `prisma/schema.prisma` and change `provider = "sqlite"` to `provider = "mysql"`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update `DATABASE_URL` in `.env`
Update your production environment variable with your MySQL database connection string:

```env
DATABASE_URL="mysql://username:password@hostname:3306/database_name"
```

*Example (Local MySQL)*: `DATABASE_URL="mysql://root:secret@localhost:3306/opportunities_db"`  
*Example (Cloud MySQL / PlanetScale / AWS RDS)*: `DATABASE_URL="mysql://admin:P@ssword123@db-instance.us-east-1.rds.amazonaws.com:3306/opportunities"`

### Step 3: Run Database Migration
Push the schema to your live MySQL server:

```bash
npx prisma db push
```

Prisma will automatically construct all necessary tables (`User`, `UserState`) inside your MySQL database.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description | Auth Required |
| font-mono | font-mono | | |
| `POST` | `/api/auth/register` | Create account with Email, Password & Name | No |
| `POST` | `/api/auth/login` | Authenticate with Email & Password | No |
| `POST` | `/api/auth/google` | Authenticate / Sync user via Google ID Token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) |
| `GET` | `/api/state` | Load user's application state from Database | Yes (Bearer Token) |
| `POST` | `/api/state` | Save/sync user's application state to Database | Yes (Bearer Token) |
| `POST` | `/api/one-more` | AI-generated "One More Opportunity" actions | Optional |

---

## 📂 Key File Locations

- **`prisma/schema.prisma`**: Database models (`User`, `UserState`)
- **`server/db.ts`**: Prisma client database connection instance
- **`server/auth.ts`**: Password hashing, JWT token creation & Google OAuth validation
- **`server.ts`**: Express server & REST API endpoints
- **`src/utils/api.ts`**: Frontend API client for auth & cloud sync
- **`src/components/AuthModal.tsx`**: Sign In & Registration modal with Google OAuth button
