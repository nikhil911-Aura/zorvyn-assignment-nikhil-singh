# Finance Dashboard

A production-quality finance dashboard system with role-based access control (RBAC), JWT authentication, and clean backend architecture. Built with Next.js, Prisma, and PostgreSQL.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Demo Credentials](#demo-credentials)
- [Frontend Pages & Routing](#frontend-pages--routing)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Soft Delete](#soft-delete)
- [Safety Guardrails](#safety-guardrails)
- [Rate Limiting](#rate-limiting)
- [Testing](#testing)
- [Data Models](#data-models)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Available Scripts](#available-scripts)
- [Assumptions & Trade-offs](#assumptions--trade-offs)

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js 16 (App Router), React 19  |
| Backend        | Next.js API Routes                  |
| Database       | PostgreSQL (Neon / local)           |
| ORM            | Prisma 7                            |
| Authentication | JWT (jsonwebtoken + bcryptjs)       |
| Validation     | Zod 4                               |
| Testing        | Vitest                              |
| Language       | JavaScript                          |

---

## Project Structure

```
finance-dashboard/
│
├── app/                                # Next.js App Router
│   ├── layout.js                       # Root layout (AuthProvider, fonts, metadata)
│   ├── page.js                         # / — redirects to /dashboard or /login
│   ├── globals.css                     # Global stylesheet
│   │
│   ├── login/
│   │   └── page.js                     # /login — login page
│   │
│   ├── (dashboard)/                    # Route group — shared layout for authenticated pages
│   │   ├── layout.js                   # Sidebar + AuthGuard wrapper
│   │   ├── dashboard/
│   │   │   └── page.js                 # /dashboard — summary & analytics
│   │   ├── records/
│   │   │   └── page.js                 # /records — financial records CRUD
│   │   └── users/
│   │       └── page.js                 # /users — user management (ADMIN only)
│   │
│   ├── api/                            # API route handlers
│   │   ├── auth/
│   │   │   ├── login/route.js          # POST /api/auth/login
│   │   │   └── me/route.js            # GET  /api/auth/me
│   │   ├── dashboard/
│   │   │   ├── route.js                # GET  /api/dashboard
│   │   │   ├── aggregates/route.js     # GET  /api/dashboard/aggregates
│   │   │   ├── categories/route.js     # GET  /api/dashboard/categories
│   │   │   ├── monthly/route.js        # GET  /api/dashboard/monthly
│   │   │   └── weekly/route.js         # GET  /api/dashboard/weekly
│   │   ├── records/
│   │   │   ├── route.js                # GET/POST /api/records
│   │   │   └── [id]/route.js           # GET/PUT/DELETE /api/records/:id
│   │   └── users/
│   │       ├── route.js                # GET/POST /api/users
│   │       └── [id]/route.js           # GET/PUT/DELETE /api/users/:id
│   │
│   ├── components/                     # React UI components
│   │   ├── auth-guard.js               # Route protection + role gate
│   │   ├── sidebar.js                  # Navigation sidebar with Link + usePathname
│   │   ├── login-page.js               # Login form
│   │   ├── dashboard-view.js           # Dashboard cards & tables
│   │   ├── records-view.js             # Records table + filters + CRUD modal
│   │   └── users-view.js               # Users table + CRUD modal
│   │
│   ├── context/
│   │   └── auth-context.js             # React Context for auth state
│   │
│   └── lib/
│       └── api-client.js               # Fetch wrapper with auto JWT injection
│
├── src/                                # Backend business logic (clean architecture)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js      # Handles login request/response
│   │   │   └── auth.service.js         # Password verification, token generation
│   │   │
│   │   ├── user/
│   │   │   ├── user.controller.js      # Handles user CRUD requests
│   │   │   ├── user.service.js         # Business logic (hashing, uniqueness checks)
│   │   │   └── user.repository.js      # Prisma queries for users
│   │   │
│   │   ├── financial-record/
│   │   │   ├── record.controller.js    # Handles record CRUD + filter requests
│   │   │   ├── record.service.js       # Business logic + filter building
│   │   │   └── record.repository.js    # Prisma queries, aggregations, groupBy
│   │   │
│   │   └── dashboard/
│   │       └── dashboard.controller.js # Aggregation endpoints
│   │
│   ├── lib/
│   │   ├── prisma.js                   # Prisma client singleton (PrismaPg adapter)
│   │   └── jwt.js                      # signToken / verifyToken helpers
│   │
│   ├── middleware/
│   │   ├── auth.js                     # requireAuth, requireRole middleware
│   │   └── rate-limit.js               # IP-based rate limiting middleware
│   │
│   └── utils/
│       ├── api-response.js             # Standardized response builders
│       └── validation.js               # Zod schemas + validate helper
│
├── prisma/
│   ├── schema.prisma                   # Database schema (models, enums, relations)
│   └── seed.js                         # Seed script with demo data
│
├── tests/                              # Test suites
│   └── unit/                           # Unit tests (Vitest)
│       ├── validation.test.js          # Zod schema validation tests
│       ├── api-response.test.js        # Response helper tests
│       ├── jwt.test.js                 # JWT sign/verify tests
│       ├── rate-limit.test.js          # Rate limiter tests
│       ├── user-service.test.js        # User business logic tests
│       └── record-service.test.js      # Record business logic tests
│
├── vitest.config.js                    # Test configuration
├── prisma.config.ts                    # Prisma config (datasource URL, migration path)
├── package.json                        # Dependencies & scripts
├── next.config.mjs                     # Next.js configuration
├── jsconfig.json                       # Path alias (@/*)
└── .env                                # Environment variables (not committed)
```

---

## Architecture Overview

The backend follows **clean architecture** with strict separation of concerns:

```
API Route (app/api/...)
  │
  ▼
Controller (src/modules/*/controller.js)
  │  Handles HTTP request/response, calls service methods,
  │  validates input with Zod, returns standardized responses.
  │
  ▼
Service (src/modules/*/service.js)
  │  Contains business logic — password hashing, uniqueness checks,
  │  data transformations. Throws errors with status codes.
  │
  ▼
Repository (src/modules/*/repository.js)
     Direct database interaction using Prisma ORM.
     Handles queries, pagination, aggregations, and groupBy operations.
```

**Why this pattern?**
- API routes stay thin — just wire auth middleware to controllers.
- Business logic is testable independently of HTTP concerns.
- Database queries are centralized and reusable.
- Swapping the ORM or database only requires changing the repository layer.

### Middleware Flow

```
Incoming Request
  │
  ▼
Rate Limiter (optional)       ← IP-based request throttling (e.g., login: 20/15min)
  │
  ▼
requireAuth(request)          ← Extracts Bearer token, verifies JWT,
  │                              fetches user from DB, checks isActive
  ▼
requireRole(['ADMIN'])        ← Checks user.role against allowed roles
  │
  ▼
Controller                    ← Processes the request
```

---

## Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **PostgreSQL** database — either:
  - Local PostgreSQL installation
  - Cloud-hosted (e.g., [Neon](https://neon.tech), Supabase, Railway)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd finance-dashboard

# Install dependencies
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Secret key for signing JWT tokens (use a strong random string in production)
JWT_SECRET="your-secret-key-change-this"

# Token expiration duration
JWT_EXPIRES_IN="24h"
```

| Variable       | Required | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string. Supports local and cloud DBs.  |
| `JWT_SECRET`   | Yes      | Secret used to sign and verify JWT tokens.                   |
| `JWT_EXPIRES_IN` | No     | Token expiry duration (default: `24h`). Accepts `1h`, `7d`, etc. |

---

## Database Setup

Run these commands in order:

```bash
# 1. Generate Prisma client from schema
npm run db:generate

# 2. Push schema to your PostgreSQL database (creates tables)
npm run db:push

# 3. Seed the database with demo users and sample financial data
npm run db:seed
```

The seed script creates:
- **3 demo users** (admin, analyst, viewer) with hashed passwords
- **~65 financial records** spanning 12 months with realistic data:
  - Monthly salary income ($5,000–$7,000)
  - Occasional freelance/bonus/investment income
  - 3–5 expense entries per month across categories (Rent, Groceries, Utilities, Transport, Entertainment, Healthcare)

---

## Running the App

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

| Email                 | Password      | Role      | Access Level                          |
|-----------------------|---------------|-----------|---------------------------------------|
| `admin@example.com`   | `password123` | **ADMIN**   | Full access — CRUD everything         |
| `analyst@example.com` | `password123` | **ANALYST** | Read records + detailed analytics     |
| `viewer@example.com`  | `password123` | **VIEWER**  | Read-only dashboard & records         |

---

## Frontend Pages & Routing

The app uses Next.js **App Router** with a `(dashboard)` route group for authenticated pages:

| Route        | Page                  | Auth Required | Role Required | Description                                |
|--------------|-----------------------|---------------|---------------|--------------------------------------------|
| `/`          | Redirect              | No            | —             | Redirects to `/dashboard` or `/login`      |
| `/login`     | Login                 | No            | —             | Login form with email/password             |
| `/dashboard` | Dashboard             | Yes           | Any           | Summary cards, category breakdown, monthly trends, recent transactions |
| `/records`   | Financial Records     | Yes           | Any           | Filterable table with pagination. ADMIN sees Create/Edit/Delete buttons. |
| `/users`     | User Management       | Yes           | ADMIN         | User table with Create/Edit/Delete. Non-admins see "permission denied". |

### Route Group: `(dashboard)/`

All authenticated pages share a common layout ([app/(dashboard)/layout.js](app/(dashboard)/layout.js)) that renders:
- **AuthGuard** — redirects to `/login` if not authenticated
- **Sidebar** — navigation links using Next.js `Link` with active state via `usePathname`
- **Main content** area — renders the matched page component

### Role-Based UI Behavior

The frontend adapts based on the logged-in user's role:
- **Sidebar navigation** hides links the user cannot access (e.g., "User Management" hidden from non-admins)
- **Action buttons** (Create, Edit, Delete) are only rendered for users with write permissions
- **Page-level guards** show a "permission denied" message for unauthorized access

---

## API Endpoints

### Authentication

| Method | Endpoint            | Auth | Description                                |
|--------|---------------------|------|--------------------------------------------|
| `POST` | `/api/auth/login`   | No   | Authenticate and receive a JWT token       |
| `GET`  | `/api/auth/me`      | Yes  | Get the currently authenticated user       |

**POST /api/auth/login**
```json
// Request body
{ "email": "admin@example.com", "password": "password123" }

// Response (200)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "uuid", "name": "Admin User", "email": "admin@example.com", "role": "ADMIN" }
  }
}
```

---

### Users

| Method   | Endpoint            | Roles          | Description            |
|----------|---------------------|----------------|------------------------|
| `GET`    | `/api/users`        | ADMIN, ANALYST | List users (paginated, searchable) |
| `POST`   | `/api/users`        | ADMIN          | Create a new user      |
| `GET`    | `/api/users/:id`    | ADMIN          | Get user by ID         |
| `PUT`    | `/api/users/:id`    | ADMIN          | Update user            |
| `DELETE` | `/api/users/:id`    | ADMIN          | Soft delete (deactivate) user |

**GET /api/users — Query Parameters:**

| Parameter | Type   | Default | Description                              |
|-----------|--------|---------|------------------------------------------|
| `page`    | number | 1       | Page number                              |
| `limit`   | number | 20      | Users per page                           |
| `search`  | string | —       | Search by name or email (case-insensitive) |

Example: `GET /api/users?search=john&page=1`

**POST /api/users** (create)
```json
// Request body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepass",
  "role": "ANALYST"        // optional, defaults to VIEWER
}
```

**PUT /api/users/:id** (update — all fields optional)
```json
{ "name": "Jane Smith", "role": "ADMIN", "isActive": false }
```

---

### Financial Records

| Method   | Endpoint              | Roles | Description                  |
|----------|-----------------------|-------|------------------------------|
| `GET`    | `/api/records`        | Any   | List records with filtering  |
| `POST`   | `/api/records`        | ADMIN | Create a new record          |
| `GET`    | `/api/records/:id`    | Any   | Get record by ID             |
| `PUT`    | `/api/records/:id`    | ADMIN | Update record                |
| `DELETE` | `/api/records/:id`    | ADMIN | Soft delete record                |

**GET /api/records — Query Parameters:**

| Parameter   | Type   | Default | Description                                          |
|-------------|--------|---------|------------------------------------------------------|
| `page`      | number | 1       | Page number for pagination                           |
| `limit`     | number | 20      | Records per page (max 100)                           |
| `type`      | string | —       | Filter by `INCOME` or `EXPENSE`                      |
| `category`  | string | —       | Filter by category (case-insensitive)                |
| `search`    | string | —       | Search across category and note (case-insensitive)   |
| `startDate` | string | —       | Filter records on or after this date                 |
| `endDate`   | string | —       | Filter records on or before this date                |

Example: `GET /api/records?type=EXPENSE&search=rent&startDate=2025-01-01&page=1&limit=10`

**POST /api/records** (create)
```json
{
  "amount": 1500.00,
  "type": "EXPENSE",
  "category": "Rent",
  "date": "2025-03-01",
  "note": "March rent payment"     // optional
}
```

---

### Dashboard & Analytics

| Method | Endpoint                      | Roles          | Description                                |
|--------|-------------------------------|----------------|--------------------------------------------|
| `GET`  | `/api/dashboard`              | Any            | Full summary (totals + categories + monthly + weekly + recent) |
| `GET`  | `/api/dashboard/aggregates`   | ADMIN, ANALYST | Total income, expenses, and net balance    |
| `GET`  | `/api/dashboard/categories`   | ADMIN, ANALYST | Totals grouped by category and type        |
| `GET`  | `/api/dashboard/monthly`      | ADMIN, ANALYST | Monthly income/expense/net breakdown       |
| `GET`  | `/api/dashboard/weekly`       | ADMIN, ANALYST | Weekly income/expense/net trends           |

**GET /api/dashboard — Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 76387.68,
    "totalExpenses": 21488.66,
    "netBalance": 54899.02,
    "categoryTotals": [
      { "category": "Salary", "type": "INCOME", "total": 68500.00 },
      { "category": "Rent", "type": "EXPENSE", "total": 18000.00 }
    ],
    "monthlySummary": [
      { "month": "2025-01", "income": 6200.00, "expenses": 2100.50, "net": 4099.50 }
    ],
    "weeklySummary": [
      { "week": "2025-02-23", "income": 5500.00, "expenses": 890.50, "net": 4609.50 }
    ],
    "recentTransactions": [
      {
        "id": "uuid",
        "amount": 5500.00,
        "type": "INCOME",
        "category": "Salary",
        "date": "2025-03-01T00:00:00.000Z",
        "note": "Monthly salary",
        "creator": { "id": "uuid", "name": "Admin User" }
      }
    ]
  }
}
```

**GET /api/dashboard/aggregates** supports optional date filtering:
```
GET /api/dashboard/aggregates?startDate=2025-01-01&endDate=2025-03-31
```

---

## Authentication Flow

```
1. User submits email + password on /login
        │
        ▼
2. POST /api/auth/login
   └─ authService.login() verifies credentials with bcrypt
   └─ Returns JWT token + user object
        │
        ▼
3. Token stored in localStorage
   └─ AuthContext updates user state
   └─ Redirect to /dashboard
        │
        ▼
4. Subsequent API requests
   └─ api-client.js auto-attaches Authorization: Bearer <token>
   └─ Server middleware verifies token on every request
        │
        ▼
5. On logout
   └─ Token removed from localStorage
   └─ AuthGuard detects null user → redirects to /login
```

**Token structure (JWT payload):**
```json
{ "userId": "uuid", "role": "ADMIN", "iat": 1234567890, "exp": 1234654290 }
```

---

## Role-Based Access Control (RBAC)

### Roles

| Role      | Description                                              |
|-----------|----------------------------------------------------------|
| `VIEWER`  | Read-only access to dashboard and financial records      |
| `ANALYST` | Read access + detailed analytics (aggregates, categories, monthly) |
| `ADMIN`   | Full access — CRUD on records, CRUD on users, all analytics |

### Permission Matrix

| Action                           | VIEWER | ANALYST | ADMIN |
|----------------------------------|--------|---------|-------|
| View dashboard summary           | Yes    | Yes     | Yes   |
| View financial records           | Yes    | Yes     | Yes   |
| Filter & paginate records        | Yes    | Yes     | Yes   |
| View detailed analytics          | No     | Yes     | Yes   |
| Create financial records         | No     | No      | Yes   |
| Edit financial records           | No     | No      | Yes   |
| Delete financial records         | No     | No      | Yes   |
| View user list                   | No     | Yes     | Yes   |
| Create users                     | No     | No      | Yes   |
| Edit users (role, status)        | No     | No      | Yes   |
| Delete users                     | No     | No      | Yes   |
| Access /users page               | No     | No      | Yes   |

### How RBAC is Enforced

**Backend (API layer):** Each API route calls `requireAuth()` or `requireRole([...])` middleware before reaching the controller. Unauthorized requests receive `401` or `403` responses.

**Frontend (UI layer):** Components use the `hasRole()` function from AuthContext to conditionally render navigation items, buttons, and pages. The `AuthGuard` component wraps protected routes and pages.

---

## Soft Delete

Both users and financial records use **soft delete** instead of permanent removal:

| Entity           | Mechanism                                              |
|------------------|--------------------------------------------------------|
| **Users**        | `DELETE /api/users/:id` sets `isActive = false`. Auth middleware blocks inactive users from logging in. |
| **Financial Records** | `DELETE /api/records/:id` sets `isDeleted = true`. All queries filter out `isDeleted: true` records automatically. |

This preserves data integrity and audit trails — deleted data can be recovered if needed.

---

## Safety Guardrails

The backend enforces business rules to prevent destructive edge cases:

| Guardrail                  | Behavior                                                     |
|----------------------------|--------------------------------------------------------------|
| **Self-deletion prevention** | Admins cannot delete their own account (`400: Cannot delete your own account`) |
| **Last admin protection**    | Cannot delete, demote, or deactivate the last remaining admin (`400: Cannot delete the last admin user`) |
| **Email uniqueness**         | Creating or updating a user with an existing email returns `400: Email already in use` |
| **Deactivated account block** | Inactive users receive `403: Account is deactivated` on login or any API call |

---

## Rate Limiting

The login endpoint is protected with IP-based rate limiting to prevent brute-force attacks:

| Endpoint           | Window   | Max Requests | Response on Exceed |
|--------------------|----------|--------------|--------------------|
| `POST /api/auth/login` | 15 minutes | 20 requests | `429 Too Many Requests` |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 17
X-RateLimit-Reset: 1711234567
```

The rate limiter uses an in-memory store with automatic cleanup of expired entries.

---

## Testing

The project includes **61 unit tests** using Vitest, covering:

| Test Suite             | Tests | What It Covers                                           |
|------------------------|-------|----------------------------------------------------------|
| `validation.test.js`   | 25    | All Zod schemas — valid input, invalid input, edge cases |
| `api-response.test.js` | 7     | Response helpers — status codes, body structure          |
| `jwt.test.js`          | 3     | Token signing, verification, tamper detection            |
| `rate-limit.test.js`   | 4     | Request counting, IP isolation, blocking, headers        |
| `user-service.test.js` | 10    | User CRUD, soft delete, self-delete/last-admin guards    |
| `record-service.test.js` | 12  | Record CRUD, soft delete, filter building, search        |

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Data Models

### User

| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| id         | UUID     | Primary key (auto-generated)         |
| name       | String   | User's display name                  |
| email      | String   | Unique email address                 |
| password   | String   | bcrypt-hashed password (12 rounds)   |
| role       | Enum     | VIEWER, ANALYST, or ADMIN            |
| isActive   | Boolean  | Account active status (default: true)|
| createdAt  | DateTime | Auto-set on creation                 |
| updatedAt  | DateTime | Auto-updated on modification         |

### FinancialRecord

| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| id         | UUID     | Primary key (auto-generated)         |
| amount     | Float    | Transaction amount (must be positive)|
| type       | Enum     | INCOME or EXPENSE                    |
| category   | String   | Category label (e.g., Salary, Rent)  |
| date       | DateTime | Transaction date                     |
| note       | String?  | Optional description                 |
| createdBy  | UUID     | Foreign key to User.id               |
| isDeleted  | Boolean  | Soft delete flag (default: false)    |
| createdAt  | DateTime | Auto-set on creation                 |
| updatedAt  | DateTime | Auto-updated on modification         |

### Relationships

```
User (1) ──────── (*) FinancialRecord
     └── createdBy foreign key
```

---

## Validation

All API inputs are validated using **Zod** schemas before processing. Invalid requests return `400 Bad Request` with detailed error messages.

| Schema               | Used In                | Validates                                           |
|----------------------|------------------------|-----------------------------------------------------|
| `loginSchema`        | POST /api/auth/login   | email (valid format), password (min 6 chars)        |
| `createUserSchema`   | POST /api/users        | name (min 2), email, password (min 6), role (optional) |
| `updateUserSchema`   | PUT /api/users/:id     | name, email, role, isActive (all optional)          |
| `createRecordSchema` | POST /api/records      | amount (positive number), type, category, date, note |
| `updateRecordSchema` | PUT /api/records/:id   | All record fields (optional)                        |
| `recordFilterSchema` | GET /api/records       | type, category, search, date range, page, limit     |

**Validation error response (400):**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "status": 400,
    "details": [
      { "field": "email", "message": "Invalid email address" },
      { "field": "password", "message": "Password must be at least 6 characters" }
    ]
  }
}
```

---

## Error Handling

All API responses follow a consistent structure:

**Success responses:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error responses:**
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "status": 400,
    "details": [...]    // optional — present for validation errors
  }
}
```

### HTTP Status Codes

| Code | Meaning       | When Used                                          |
|------|---------------|----------------------------------------------------|
| 200  | OK            | Successful read, update, or delete                 |
| 201  | Created       | Successful creation of user or record              |
| 400  | Bad Request   | Validation failure or duplicate email              |
| 401  | Unauthorized  | Missing/invalid/expired JWT token                  |
| 403  | Forbidden     | Valid token but insufficient role, or deactivated account |
| 404  | Not Found     | User or record does not exist                      |
| 429  | Too Many Requests | Rate limit exceeded (login endpoint)           |
| 500  | Server Error  | Unexpected server-side error                       |

---

## Available Scripts

| Script           | Command                    | Description                                  |
|------------------|----------------------------|----------------------------------------------|
| `npm run dev`    | `next dev`                 | Start development server with hot reload     |
| `npm run build`  | `next build`               | Create production build                      |
| `npm start`      | `next start`               | Start production server                      |
| `npm run lint`   | `eslint`                   | Run ESLint                                   |
| `npm run db:generate` | `npx prisma generate` | Generate Prisma client from schema           |
| `npm run db:migrate`  | `npx prisma migrate dev` | Create and apply a new migration           |
| `npm run db:push`     | `npx prisma db push`    | Push schema changes directly (no migration) |
| `npm run db:seed`     | `npx tsx prisma/seed.js` | Seed database with demo data               |
| `npm test`           | `vitest run`              | Run all unit tests                          |
| `npm run test:watch` | `vitest`                  | Run tests in watch mode                     |

---

## Assumptions & Trade-offs

| Decision | Rationale | Production Recommendation |
|----------|-----------|---------------------------|
| **JWT stored in localStorage** | Simple to implement for a demo. Accessible from JavaScript. | Use `httpOnly` cookies to prevent XSS token theft. |
| **No refresh tokens** | Single 24h token keeps auth flow simple. | Implement refresh token rotation for better security. |
| **Client-side auth guards** | UI hides unauthorized content; API enforces real security. | Add Next.js middleware for server-side route protection. |
| **Prisma 7 PrismaPg adapter** | Prisma 7 removed `url` from schema; requires adapter-based connections. | Standard for Prisma 7+. No change needed. |
| **In-memory rate limiter** | Simple, zero-dependency rate limiting on login. | Use Redis-backed rate limiter for multi-instance deployments. |
| **Soft delete approach** | Users are deactivated, records are flagged `isDeleted`. Data is preserved. | Add a scheduled cleanup job or admin UI to purge old soft-deleted records. |
| **bcrypt 12 rounds** | Good balance of security and performance. | Sufficient for production use. |
| **Password not returned in API** | User repository uses `select` to exclude password from all queries. | Correct approach. No change needed. |
| **Seed script deletes existing data** | Ensures clean state for demos. | Remove `deleteMany` calls for production seeds. |
