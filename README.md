# CivicSetu — Hyperlocal Direct Hiring & ₹0-Commission Work Portal

CivicSetu is a full-stack hyperlocal civic work and service portal connecting verified citizens and skilled local workers within residential wards and neighborhood groups. Built with a **₹0-commission** peer-to-peer settlement model, **two-stage location privacy**, and **mutual trust ratings**, the platform enables safe, transparent neighborhood hiring without middleman fees.

---

## Key Features

- **₹0-Commission Direct Hiring & Settlement:** Citizens and local workers negotiate and settle directly with zero platform commission fees, backed by transparent settlement logs (`LedgerEntry`).
- **Two-Stage Location Privacy:** Public job listings (`OFFER` and `REQUEST`) only display an approximate neighborhood/ward (`roughLocation`). The exact street address (`exactAddress`) remains strictly hidden until the job owner explicitly approves a worker (`Hire Worker & Unlock Address`).
- **e-KYC Identity & Ward Verification:** User registration captures ward/locality, phone contact, user intent (`OWNER`, `WORKER`, or `BOTH`), and government ID verification metadata (`AADHAAR`, `VOTER_ID`, or `DIGILOCKER`).
- **End-to-End Booking Lifecycle:** Full state machine covering job application, owner approval/rejection, worker withdrawal, job completion (`COMPLETED`), and bilateral 1–5 star mutual trust reviews (`REVIEWED`).
- **Ward & Neighborhood Groups + Trusted Circle:** Support for locality-based cooperative groups (`CoopGroup`), membership approvals, and trusted peer connections (`Friends` / `TrustedCirclePanel`).
- **Graceful In-Memory Fallback:** Includes an automatic `InMemoryPrismaStore` fallback when no remote PostgreSQL `DATABASE_URL` is configured, allowing zero-config local demonstrations.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 14.2 (App Router), React 18, TypeScript |
| **Styling & Motion** | Tailwind CSS, custom scroll/reveal UI components |
| **Authentication** | NextAuth.js (`SessionProvider`, Credentials / JWT session) |
| **Backend & Services** | Modular TypeScript service layer (`@coop/backend`), Zod schema validation |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM |
| **Monorepo Architecture** | npm Workspaces (`backend` + `frontend`) |

---

## Project Structure

```text
CivicSetu/
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # Chronological PostgreSQL migration history
│   │   └── schema.prisma        # Database models (User, Listing, Booking, Group, Review, LedgerEntry)
│   ├── src/
│   │   ├── server/
│   │   │   ├── auth/            # Authentication service & validation schemas
│   │   │   ├── services/        # Business logic (listings, bookings, dashboard, groups)
│   │   │   ├── validators/      # Zod request/input schemas
│   │   │   └── db.ts            # Prisma singleton + InMemoryPrismaStore fallback
│   │   └── index.ts             # Backend workspace entry exports
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login & e-KYC Registration pages
│   │   │   ├── api/             # Next.js App Router REST endpoints (/auth, /listings, /bookings, /groups, /friends, /dashboard, /profile, /reviews, /ledger)
│   │   │   ├── bookings/        # My Hires & Work lifecycle management
│   │   │   ├── dashboard/       # Citizen/Worker overview & settlement stats
│   │   │   ├── friends/         # Trusted Circle connections
│   │   │   ├── groups/          # Ward & neighborhood groups
│   │   │   ├── listings/        # Browse & post local service offers/requests
│   │   │   ├── profile/         # User profile, skills & verification status
│   │   │   ├── layout.tsx       # Root HTML layout with AuthProvider
│   │   │   └── page.tsx         # Public landing page
│   │   ├── components/          # UI components (animated, dashboard, providers, shared Navbar/Footer)
│   │   ├── lib/                 # Auth configuration & client utilities
│   │   ├── styles/              # Global Tailwind stylesheets
│   │   └── types/               # TypeScript declarations (css.d.ts)
│   ├── next.config.mjs
│   └── tsconfig.json
├── package.json                 # Root npm workspaces configuration
└── tsconfig.base.json           # Shared TypeScript compiler settings
```

---

## Local Development Setup

### 1. Prerequisites
- **Node.js** `v18.18+` or `v20+`
- **npm** `v9+`
- A **PostgreSQL** database URL (e.g., [Neon](https://neon.tech)) — *optional for local demo mode, which automatically uses the built-in in-memory store if no remote `DATABASE_URL` is set.*

### 2. Install Dependencies
From the root `CivicSetu/` directory:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root (and/or `frontend/.env`) based on `.env.example`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-32-character-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Generate Prisma Client & Sync Database
```bash
npx prisma generate --schema=backend/prisma/schema.prisma
npx prisma db push --schema=backend/prisma/schema.prisma
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Deployment (Vercel + Neon)

### Verify Production Build Locally
```bash
npm run build
```
This compiles `@coop/backend` (`tsc`) followed by `@coop/frontend` (`next build`).

### Deploying to Vercel
1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com) with the root directory set to `./`.
3. Configure the **Build & Output Settings**:
   - **Build Command:** `npx prisma generate --schema=backend/prisma/schema.prisma && npm run build`
   - **Output Directory:** `frontend/.next`
4. Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in **Project Settings → Environment Variables**.
5. Deploy.