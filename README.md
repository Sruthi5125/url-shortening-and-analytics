# URL Shortener & Analytics

A full-stack URL shortening platform with rich click analytics, QR code generation, bulk import, and shareable public stats — built with Node.js, Express, Prisma (PostgreSQL), React, and Tailwind CSS.

---

## Table of Contents

1. [AI Planning Document](#1-ai-planning-document)
2. [Feature List](#2-feature-list)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Project Structure](#4-project-structure)
5. [Setup Instructions](#5-setup-instructions)
6. [Assumptions Made](#6-assumptions-made)
7. [API Reference](#7-api-reference)

---

## 1. AI Planning Document

### Problem Statement

Users need a reliable way to:
- Shorten long URLs into compact, shareable links.
- Optionally brand those links with custom aliases.
- Set expiry dates so time-sensitive links stop working automatically.
- Understand how their links perform (click counts, device/browser breakdown, trend over time).
- Share link performance publicly without requiring recipients to log in.
- Manage large batches of URLs efficiently via CSV upload.

### AI-Assisted Planning Process

The application was planned using the following steps:

**Step 1 — Domain Modelling**

Three core entities were identified:
- `User` — owns URLs; authenticates with email + password.
- `Url` — the shortened link record (original URL, short code, custom alias, expiry, click count).
- `Visit` — one row per click, capturing IP, user-agent, browser, OS, device type, and referrer for analytics.

A `User → Url → Visit` cascade relationship was chosen so deleting a user removes all their data automatically.

**Step 2 — API Surface Design**

Endpoints were grouped into four concerns:
- **Auth** (`/api/auth`) — stateless JWT, no sessions.
- **URL Management** (`/api/urls`) — CRUD operations protected by JWT.
- **Redirect** (`/r/:shortCode`) — public, server-side redirect with async analytics capture.
- **Public Stats** (`/api/public/:shortCode/stats`) — aggregated stats without exposing PII, no auth required.

**Step 3 — Analytics Strategy**

Two complementary approaches were used:
- A `clickCount` integer on the `Url` row for fast dashboard summaries (O(1) read).
- A `Visit` row per click for detailed history, device/browser breakdowns, and time-series queries.

Both are updated atomically in a single Prisma `$transaction` on every redirect.

**Step 4 — Frontend UX Planning**

The React frontend was planned with three protected pages (Dashboard, Analytics) and two public pages (Login/Signup, Public Stats), using React Router v7 with `AnimatePresence` for smooth page transitions.

The URL table was designed to be responsive — a card list on mobile and a full data table on desktop — with inline editing to avoid full-page navigation for simple updates.

**Step 5 — Bonus Feature Scope**

Seven bonus features were scoped and implemented:
1. QR code generation (server-side via `qrcode` library, downloadable PNG).
2. Link expiry with automatic 410 response on the redirect route.
3. Browser and OS tracking via `ua-parser-js` on every redirect hit.
4. Daily click trend chart (last 30 days) using Recharts `AreaChart`.
5. Device and browser distribution bars on the analytics page.
6. Inline URL editing from the dashboard table.
7. Bulk CSV import via `multer` and `csv-parse`.

---

## 2. Feature List

### Authentication
| # | Feature | Details |
|---|---------|---------|
| 1 | User Registration | Name, email, hashed password (bcryptjs). Returns JWT. |
| 2 | User Login | Email + password validation. Returns JWT. |
| 3 | Protected Routes | All `/api/urls` endpoints require a valid `Authorization: Bearer <token>` header. |
| 4 | Current User Endpoint | `GET /api/auth/me` returns the logged-in user's profile. |

### URL Management
| # | Feature | Details |
|---|---------|---------|
| 5 | Shorten URL | Generates a random 6-character NanoID short code. |
| 6 | Custom Alias | Users can supply their own alias (3–30 alphanumeric chars). Duplicate aliases return HTTP 409. |
| 7 | Link Expiry | Optional `expiresAt` datetime. Expired links return HTTP 410 on redirect. Dashboard shows "Expired" / "Expires soon" badges. |
| 8 | List URLs | Returns all URLs for the authenticated user, newest first. |
| 9 | Delete URL | Ownership-checked delete. Cascades to all visit records. |
| 10 | Inline Edit | PATCH endpoint lets the user update the destination URL without changing the short code. |
| 11 | Bulk CSV Import | Upload a `.csv` file with `originalUrl`, optional `customAlias`, optional `expiresAt`. Partial failures are reported per-row. |

### Redirect & Click Tracking
| # | Feature | Details |
|---|---------|---------|
| 12 | HTTP 302 Redirect | Server-side redirect from `/r/:shortCode` to the original URL. |
| 13 | Async Visit Recording | Analytics capture is fire-and-forget so the redirect itself is not slowed down. |
| 14 | Browser Detection | `ua-parser-js` extracts browser name from the `User-Agent` header. |
| 15 | OS Detection | `ua-parser-js` extracts OS name from the `User-Agent` header. |
| 16 | Device Type Detection | Detects `mobile`, `tablet`, or defaults to `Desktop`. |
| 17 | IP & Referrer Logging | Raw IP and HTTP Referer header are stored on each visit row. |

### Analytics
| # | Feature | Details |
|---|---------|---------|
| 18 | Total Click Count | Fast integer counter on the URL record. |
| 19 | Recent Visit Log | Last 10 visits shown in a table (time, IP, browser, OS/device). |
| 20 | Browser Breakdown | Animated horizontal progress bars showing % per browser. |
| 21 | Device Breakdown | Animated horizontal progress bars showing % per device type. |
| 22 | Daily Click Trend | Area chart (Recharts) of clicks per day for the last 30 days. |
| 23 | Last Visited At | Timestamp of the most recent click. |

### QR Code
| # | Feature | Details |
|---|---------|---------|
| 24 | QR Code Generation | Server generates a base64 PNG via the `qrcode` library. |
| 25 | QR Code Modal | Displayed in an in-page modal overlay with the short URL label. |
| 26 | QR Code Download | "Download PNG" link triggers a browser download of the QR image. |

### Public Stats Sharing
| # | Feature | Details |
|---|---------|---------|
| 27 | Public Stats Page | `/stats/:shortCode` is accessible without login. |
| 28 | Share Stats Button | Copies the public stats URL to clipboard from the dashboard table. |
| 29 | Aggregated Public Data | Shows total clicks, last-7-day clicks, creation date, last visited, link status, chart, device/browser bars. No PII exposed. |

### Frontend UX
| # | Feature | Details |
|---|---------|---------|
| 30 | Dark Theme | Dark navy/violet design system throughout. |
| 31 | Page Transitions | Framer Motion `AnimatePresence` for smooth route changes. |
| 32 | Responsive Table | Card list on mobile; full column table on desktop. |
| 33 | Loading Skeletons | Shimmer placeholder cards while data loads. |
| 34 | Toast Notifications | Success and error toasts for every async action. |
| 35 | Stat Cards | Animated count display for total links, total clicks, active links. |
| 36 | Copy Button | One-click clipboard copy of any short URL. |

---

## 3. Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  BROWSER (Client)                                 |
|                                                                                   |
|   React 19 + Vite + Tailwind CSS + Framer Motion + Recharts                      |
|                                                                                   |
|  +---------------+  +------------------+  +-------------------+  +-------------+ |
|  | /login        |  | /dashboard       |  | /analytics/:id    |  | /stats/:code| |
|  | /signup       |  | UrlForm          |  | AreaChart         |  | PublicStats | |
|  | LoginPage     |  | UrlTable         |  | DeviceBars        |  | Page        | |
|  | SignupPage    |  | QR Modal         |  | BrowserBars       |  |             | |
|  |               |  | Bulk CSV Modal   |  | Visit Log         |  |             | |
|  +---------------+  +------------------+  +-------------------+  +-------------+ |
|                              |                        |                  |        |
|              AuthContext (JWT stored in localStorage) |                  |        |
|                              |                        |                  |        |
+------------------------------|------------------------|------------------|--------+
                                |                        |                  |
                         axios (Bearer token)     axios (Bearer)     fetch (no auth)
                                |                        |                  |
+------------------------------|------------------------|------------------|--------+
|                               v                        v                  v        |
|                          Node.js + Express (PORT 5000)                            |
|                                                                                   |
|  +---------------------+  +------------------+  +-----------------------------+  |
|  | /api/auth            |  | /api/urls        |  | /api/public/:code/stats     |  |
|  |  POST /signup        |  |  GET    /        |  |  No auth, public            |  |
|  |  POST /login         |  |  POST   /        |  |  Aggregated stats only      |  |
|  |  GET  /me            |  |  PATCH  /:id     |  +-----------------------------+  |
|  +---------------------+  |  DELETE /:id     |                                   |
|                            |  GET    /:id/qr  |  +-----------------------------+  |
|  +---------------------+  |  GET    /:id/ana |  | /r/:shortCode               |  |
|  | authMiddleware (JWT) |  |  POST   /bulk    |  |  Public redirect             |  |
|  | validateMiddleware   |  +------------------+  |  Expiry check               |  |
|  | errorMiddleware      |                        |  ua-parser-js               |  |
|  +---------------------+                        |  async recordVisit()        |  |
|                                                  |  302 redirect               |  |
|          Controllers / Services / Validators     +-----------------------------+  |
|                                                                                   |
+--------------------------------------|--------------------------------------------+
                                       |
                                  Prisma ORM
                                       |
+--------------------------------------|--------------------------------------------+
|                       PostgreSQL Database                                         |
|                                                                                   |
|  +------------------+     +--------------------------+     +------------------+  |
|  | users            |     | urls                     |     | visits           |  |
|  |------------------|     |--------------------------|     |------------------|  |
|  | id (PK)          |1   *| id (PK)                  |1   *| id (PK)          |  |
|  | name             |-----| user_id (FK -> users)    |-----| url_id (FK)      |  |
|  | email (unique)   |     | original_url             |     | visited_at       |  |
|  | password_hash    |     | short_code (unique)      |     | ip_address       |  |
|  | created_at       |     | custom_alias (unique)    |     | user_agent       |  |
|  +------------------+     | click_count              |     | referer          |  |
|                            | expires_at               |     | browser          |  |
|                            | created_at               |     | os               |  |
|                            | updated_at               |     | device_type      |  |
|                            +--------------------------+     +------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### Data Flow: Redirect with Analytics

```
User clicks short link (http://localhost:5000/r/abc123)
        |
        v
redirectController.handleRedirect()
        |
        +---> urlService.findByShortCode("abc123")
        |           |
        |           v
        |       DB: SELECT * FROM urls WHERE short_code = "abc123"
        |
        +---> Check expiresAt  -->  expired?  -->  HTTP 410 Gone
        |
        +---> UAParser(User-Agent)  -->  { browser, os, deviceType }
        |
        +---> analyticsService.recordVisit() [fire-and-forget, no await]
        |           |
        |           v
        |       prisma.$transaction([
        |           UPDATE urls SET click_count += 1 WHERE id = url.id,
        |           INSERT INTO visits (url_id, ip, browser, os, deviceType, ...)
        |       ])
        |
        v
HTTP 302 redirect to originalUrl  (user arrives at destination instantly)
```

### Data Flow: Create Short URL

```
POST /api/urls  { originalUrl, customAlias?, expiresAt? }
        |
        v
authMiddleware  -->  verify JWT  -->  attach req.user
        |
        v
validate(createUrlSchema)  -->  Zod validation
        |
        v
urlController.createUrl()
        |
        v
urlService.createUrl()
        |
        +---> customAlias provided?
        |       YES --> check uniqueness in DB, use as shortCode
        |       NO  --> generateShortCode() loop until unique
        |
        v
prisma.url.create({ userId, originalUrl, shortCode, customAlias, expiresAt })
        |
        v
Response 201 { url: { ...record, shortUrl: "http://localhost:5000/r/<code>" } }
```

---

## 4. Project Structure

```
url-shortening-and-analytics/
├── backend/
│   ├── server.js                  # HTTP server entry point
│   ├── .env                       # Environment variables (not committed)
│   ├── package.json
│   ├── nodemon.json
│   ├── prisma/
│   │   ├── schema.prisma          # Database models: User, Url, Visit
│   │   └── migrations/            # Prisma migration history
│   └── src/
│       ├── app.js                 # Express app setup (CORS, routes, error handler)
│       ├── config/
│       │   ├── db.js              # Prisma client singleton
│       │   └── env.js             # Validated environment config
│       ├── controllers/
│       │   ├── authController.js  # signup, login, getMe
│       │   ├── urlController.js   # createUrl, getUserUrls, deleteUrl, getAnalytics, getQrCode, updateUrl, bulkCreateUrl
│       │   └── redirectController.js  # handleRedirect (public)
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT verification, attaches req.user
│       │   ├── errorMiddleware.js # Global error handler
│       │   └── validateMiddleware.js  # Zod schema validation factory
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── urlRoutes.js       # All /api/urls routes with protect middleware
│       │   ├── redirectRoutes.js  # /r/:shortCode public redirect
│       │   └── publicRoutes.js    # /api/public/:shortCode/stats no-auth endpoint
│       ├── services/
│       │   ├── authService.js     # signup, login, getUserById
│       │   ├── urlService.js      # createUrl, getUrlsByUser, updateUrl, deleteUrl, findByShortCode, bulkCreateUrl
│       │   └── analyticsService.js  # recordVisit, getAnalyticsForUrl
│       ├── utils/
│       │   └── generateShortCode.js  # NanoID 6-char code generator
│       └── validators/
│           ├── authValidators.js  # Zod schemas for signup/login
│           └── urlValidators.js   # Zod schemas for create/update URL
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx               # React root mount
        ├── App.jsx                # Router, AuthProvider, ToastProvider
        ├── index.css              # Global styles, dark-card utility, shimmer animations
        ├── api/
        │   ├── authApi.js         # signup, login, getMe calls
        │   └── urlApi.js          # createUrl, getUrls, deleteUrl, getAnalytics, getQrCode, updateUrl, bulkCreateUrl
        ├── context/
        │   └── AuthContext.jsx    # JWT state, login/logout helpers
        ├── components/
        │   ├── Navbar.jsx         # Top navigation bar
        │   ├── UrlForm.jsx        # Create short URL form with date picker
        │   ├── UrlTable.jsx       # Responsive table with QR modal, inline edit, share
        │   ├── ProtectedRoute.jsx # Redirect to /login if unauthenticated
        │   ├── CopyButton.jsx     # Clipboard copy button
        │   ├── Toast.jsx          # Toast notification system
        │   └── ui/                # shadcn-style primitives: Button, Input, Badge
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx  # URL list, stats cards, bulk import modal
        │   ├── AnalyticsPage.jsx  # Charts, device/browser bars, visit log
        │   └── PublicStatsPage.jsx  # Public stats (no login required)
        ├── hooks/
        │   ├── useCountUp.js
        │   └── useTypewriter.js
        ├── lib/
        │   └── utils.js           # cn() tailwind class merger
        └── utils/
            └── formatDate.js      # Locale-aware date formatter
```

---

## 5. Setup Instructions

### Prerequisites

- **Node.js** v18+ (v20 LTS recommended)
- **npm** v9+
- **PostgreSQL** v14+ running locally (or a remote connection string)

---

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd url-shortening-and-analytics
```

---

### Step 2 — Backend Setup

```bash
cd backend
```

**Install dependencies:**

```bash
npm install
```

**Configure environment:**

Create a `.env` file in the `backend/` directory (copy the example below):

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/url_shortener"

# JWT secret - use a long random string in production
JWT_SECRET="your_super_long_random_secret_key_here"

# JWT token validity
JWT_EXPIRES_IN="7d"

# Server port
PORT=5000

# Base URL for constructing short links (must match where backend is hosted)
BASE_URL="http://localhost:5000"

# Frontend origin for CORS
FRONTEND_URL="http://localhost:5173"
```

**Create the database:**

In PostgreSQL, create a database named `url_shortener` (or whatever you set in `DATABASE_URL`):

```sql
CREATE DATABASE url_shortener;
```

**Run database migrations:**

```bash
npm run db:migrate
# When prompted for a migration name, type something like: init
```

This creates the `users`, `urls`, and `visits` tables.

**Generate Prisma client:**

```bash
npm run db:generate
```

**Start the backend dev server:**

```bash
npm run dev
```

The backend will be available at `http://localhost:5000`.

Health check: open `http://localhost:5000/health` — you should see `{"status":"ok"}`.

---

### Step 3 — Frontend Setup

Open a new terminal:

```bash
cd frontend
```

**Install dependencies:**

```bash
npm install
```

**Configure environment:**

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

**Start the frontend dev server:**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### Step 4 — Using the Application

1. Open `http://localhost:5173` in your browser.
2. Click **Sign Up** and create an account.
3. Log in — you will land on the **Dashboard**.
4. Paste any long URL into the form and click **Shorten URL**.
5. Optionally add a **Custom Alias** and/or an **Expiry Date**.
6. Your shortened link appears in the table below.
7. Click the link to trigger a redirect and record a visit.
8. Click the **bar chart icon** to open the **Analytics** page for that link.
9. Click the **QR icon** to view and download the QR code.
10. Click the **share icon** to copy the public stats URL to your clipboard.
11. Use **Bulk Import CSV** (top-right button) to upload many URLs at once.

**Sample CSV format for bulk import:**

```csv
originalUrl,customAlias,expiresAt
https://example.com/long-page,,
https://docs.example.com/getting-started,docs-start,
https://promo.example.com/sale,summer-sale,2026-12-31T23:59:00.000Z
```

---

### Production Build

**Backend (no build step required — Node.js runs directly):**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
# Output is in frontend/dist/ — serve with any static host (Nginx, Vercel, Netlify, etc.)
```

---

### Optional: Prisma Studio (Database GUI)

```bash
cd backend
npm run db:studio
```

Opens a visual database browser at `http://localhost:5555`.

---

## 6. Assumptions Made

| # | Assumption | Rationale |
|---|-----------|-----------|
| 1 | PostgreSQL is the database | Prisma `$queryRaw` with `DATE()` and double-quoted column names targets PostgreSQL syntax specifically. SQLite or MySQL would require query changes. |
| 2 | JWT stored in `localStorage` | Simpler for a hackathon prototype. In production, `httpOnly` cookies would be more secure against XSS. |
| 3 | Short codes are 6 characters (NanoID, alphanumeric) | Provides ~56 billion unique combinations — sufficient for a prototype. No rate limiting is enforced on code generation. |
| 4 | `BASE_URL` in backend `.env` equals the server's public hostname | Short URLs are built as `${BASE_URL}/r/${shortCode}`. If deployed behind a reverse proxy, this value must be updated accordingly. |
| 5 | Device type defaults to "Desktop" when `ua-parser-js` returns `undefined` | Desktop browsers typically do not set a `device.type` in the parsed UA. Mobile and tablet devices do. |
| 6 | Analytics are recorded fire-and-forget | Redirect speed is prioritised over guaranteed analytics delivery. A failed `recordVisit` is logged to `console.error` but does not fail the redirect response. |
| 7 | CSV column names are case-sensitive | The bulk import parser checks for `originalUrl`, `url`, or `Destination` (in that priority order). Files with other column headers will fail row-level processing. |
| 8 | No email verification | User registration immediately activates the account. A real product would send a confirmation email. |
| 9 | Expiry precision is to the minute | The `DatePicker` in the frontend offers 15-minute interval selection. Second-level precision is technically stored but not surfaced in the UI. |
| 10 | CORS is restricted to `FRONTEND_URL` and `localhost:5000` | This is intentional — the API is not meant to be a public API for third-party consumers. |
| 11 | No rate limiting | The redirect and API routes have no rate limits. In production, `express-rate-limit` should be added to prevent abuse. |
| 12 | Prisma migrations are run manually | There is no CI/CD pipeline that auto-migrates. The developer must run `npm run db:migrate` after pulling schema changes. |

---

## 7. API Reference

### Authentication

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/auth/signup` | No | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | JWT | — | `{ user }` |

### URL Management

| Method | Endpoint | Auth | Body / Notes | Response |
|--------|----------|------|------|----------|
| POST | `/api/urls` | JWT | `{ originalUrl, customAlias?, expiresAt? }` | `{ url }` |
| GET | `/api/urls` | JWT | — | `{ urls }` |
| PATCH | `/api/urls/:id` | JWT | `{ originalUrl }` | `{ url }` |
| DELETE | `/api/urls/:id` | JWT | — | `{ message }` |
| GET | `/api/urls/:id/analytics` | JWT | — | `{ analytics }` |
| GET | `/api/urls/:id/qrcode` | JWT | — | `{ qrCode }` (base64 PNG) |
| POST | `/api/urls/bulk` | JWT | `multipart/form-data` field: `csvFile` | `{ createdUrls, errors, totalProcessed }` |

### Redirect

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/r/:shortCode` | No | Redirects (302) to `originalUrl`. Returns 404 if not found, 410 if expired. |

### Public Stats

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/public/:shortCode/stats` | No | `{ shortCode, clickCount, createdAt, last7DaysClicks, isActive, lastVisitedAt, browserBreakdown, deviceBreakdown, dailyClicks }` |

### Health

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/health` | `{ status: "ok" }` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 |
| Frontend build | Vite 8 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion |
| Charts | Recharts |
| HTTP client | Axios |
| Date picker | react-datepicker |
| Icons | Lucide React |
| Backend framework | Node.js + Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL 14+ |
| Authentication | JSON Web Token (jsonwebtoken) |
| Password hashing | bcryptjs |
| Validation | Zod |
| Short code generation | NanoID |
| QR code generation | qrcode |
| User-agent parsing | ua-parser-js |
| CSV parsing | csv-parse |
| File upload | multer |

---

This project is a part of a hackathon run by https://katomaran.com
