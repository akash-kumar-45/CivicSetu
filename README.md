# Cooperative Gig Services Platform for Household & Community Services

An egalitarian time-credit cooperative platform built with Next.js (App Router), React, TypeScript strict mode, Prisma, and PostgreSQL. Members of autonomous, isolated cooperative groups (such as neighborhoods, hostels, or housing societies) exchange services (cooking, cleaning, repairs, tutoring, babysitting) using **Time Credits**, where **1 hour of labor = 1 time credit**, regardless of skill. No real money, payment gateways, or currency speculation are involved.

---

## Architecture Highlights & Visual Identity

- **Color Scheme**: Midnight Black (`#050505` / `#06080C`), Pure White (`#FFFFFF`), Lime Green (`#00FF66` / `#39FF14`).
- **UI/UX Interactions**:
  - **Layered Parallax**: Multi-depth background grid and geometry translating across scroll velocities.
  - **Pinned Heading 3D Card Zooms**: Sticky viewport section with 3D perspective card zoom on scroll.
  - **Line-by-Line Reveal**: Staggered typography entrance animations.
  - **Sideways Text Marquee**: Continuous sideways animated skill ticker.
  - **3D Card Arc Carousel**: Rotational perspective carousel showcasing community listings.
  - **Fixed 3D Interactive Model**: Three.js WebGL interactive 3D time-credit token with mouse-tracking and glowing particle orbit.
  - **Stacking Cards**: Scroll-driven sticky stacked cards covering platform core protocols.
  - **Focus Frame Sliders**: Interactive slider comparing traditional fee-heavy gig platforms against cooperative time banks.
  - **Scroll-Triggered Demo**: 5-step interactive walkthrough of the booking state machine.

---

## Directory Structure

The repository maintains an explicit separation between `frontend` and `backend`:

```text
se-project/
├── frontend/                      # Next.js App Router Client & Presentation
│   ├── src/
│   │   ├── app/                   # App Router pages and API handlers
│   │   │   ├── (auth)/            # Login & Register views
│   │   │   ├── api/               # Thin route handlers delegating to backend services
│   │   │   ├── bookings/          # State machine booking tracker
│   │   │   ├── dashboard/         # Group statistics & personal ledger audit
│   │   │   ├── groups/            # Cooperative groups catalog & admin controls
│   │   │   ├── listings/          # Service catalog & booking request modal
│   │   │   └── page.tsx           # Landing page with 3D models & animations
│   │   ├── components/
│   │   │   ├── 3d/                # Three.js 3D TimeCreditToken & floating particles
│   │   │   ├── animated/          # Parallax, Arc Carousel, Stacking Cards, etc.
│   │   │   └── shared/            # Navbar, Footer
│   │   └── styles/                # Tailwind CSS with custom neon lime palettes
├── backend/                       # Core Business Logic Services, Ledger & Prisma
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL data model
│   │   └── migrations/            # Versioned SQL migrations committed to git
│   ├── src/
│   │   ├── server/
│   │   │   ├── db.ts              # Prisma singleton
│   │   │   ├── auth/              # Bcrypt password hashing
│   │   │   ├── services/          # Unit-testable business logic services
│   │   │   └── validators/        # Zod validation schemas
│   │   └── tests/                 # Vitest test suites (50 unit tests across 7 suites)
├── e2e/                           # Playwright End-to-End Test Suite
│   └── full-flow.spec.ts          # Complete 10-step lifecycle validation test
├── docs/
│   ├── ARCHITECTURE.md            # Module diagram, Prisma models, state machine
│   └── LIMITATIONS.md             # Project report limitations and future work
└── .env.example                   # Environment configuration template
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm**
- **PostgreSQL**: Local PostgreSQL instance or a serverless [Neon](https://neon.tech) database.

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the required variables:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `NEXTAUTH_SECRET`: A secure random 32-character string.
- `NEXTAUTH_URL`: `http://localhost:3000` (in development).

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Prisma Client Generation
```bash
# Generate the Prisma Client
npm run prisma:generate

# Apply migrations to your PostgreSQL database
npm run prisma:migrate
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running the Tests

### Unit Tests (Vitest)
Unit tests cover all business rules across auth, groups, listings, bookings state machine, balance arithmetic, and reviews:
```bash
npm test
```
All 50 unit tests across 7 test suites run in isolation.

### End-to-End Test (Playwright)
Validates the full lifecycle (registration $\rightarrow$ group creation $\rightarrow$ join request $\rightarrow$ admin approval $\rightarrow$ listing creation $\rightarrow$ booking request $\rightarrow$ acceptance $\rightarrow$ atomic completion & ledger settlement $\rightarrow$ mutual review):
```bash
npx playwright test
```

### Production Build
Verifies TypeScript strict mode and Next.js optimization:
```bash
npm run build
```

---

## Booking State Machine Rules

1. `requested` $\rightarrow$ `accepted` $\rightarrow$ `completed` $\rightarrow$ `reviewed`
2. `requested` $\rightarrow$ `declined`
3. `requested` or `accepted` $\rightarrow$ `cancelled`

- Only the provider can accept or decline.
- Only the requester can cancel a `requested` booking; either party can cancel an `accepted` booking.
- Providers cannot hold two overlapping `accepted` bookings.
- Completion can only occur after `startsAt` has passed and executes an atomic `$transaction` that verifies requester balance and writes the `LedgerEntry`.

---

## Deployment to Vercel with Neon Database

1. Create a serverless PostgreSQL database on [Neon](https://neon.tech).
2. Set `DATABASE_URL` in your Vercel project environment settings.
3. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (your production URL).
4. Run `npx prisma migrate deploy` in your build command or Neon console to apply migrations.
5. Deploy repository directly to Vercel.
