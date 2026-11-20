# System Architecture Document

## Cooperative Gig Services Platform for Household & Community Services

---

## 1. High-Level Module Architecture

The platform is designed around strict separation between HTTP route handlers and service business logic:

```mermaid
graph TD
    Client[Next.js App Router Frontend] -->|Zod Validated HTTP| RouteHandlers[Route Handlers /api/*]
    RouteHandlers -->|Session & Role Check| Services[Service Layer src/server/services/]
    
    subgraph Services Layer
        AuthService[Auth Service]
        GroupsService[Groups & Membership Service]
        ListingsService[Listings Service]
        BookingsService[Bookings Service]
        LedgerService[Append-Only Ledger Service]
        ReviewsService[Reviews Service]
        DashboardService[Dashboard Aggregator Service]
    end

    Services -->|Prisma ORM| DB[(PostgreSQL / Neon DB)]
    BookingsService -->|Derived Balance Check| LedgerService
    BookingsService -->|Atomic $transaction| DB
```

---

## 2. Booking State Machine

The platform strictly enforces the deterministic state machine in `BookingsService`:

```mermaid
stateDiagram-v2
    [*] --> REQUESTED: Requester creates booking

    REQUESTED --> ACCEPTED: Provider accepts (No overlap)
    REQUESTED --> DECLINED: Provider declines
    REQUESTED --> CANCELLED: Requester cancels

    ACCEPTED --> CANCELLED: Either party cancels
    ACCEPTED --> COMPLETED: Provider completes (after startsAt, atomic ledger transfer)

    COMPLETED --> REVIEWED: Participants submit reviews
    DECLINED --> [*]
    CANCELLED --> [*]
    REVIEWED --> [*]
```

### State Transition Validation Matrix:
| Initial State | Target State | Authorized Actor | Pre-Conditions | Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| `[None]` | `REQUESTED` | Requester | Both parties ACTIVE members of group; requester $\neq$ provider | Creates booking in `REQUESTED` status |
| `REQUESTED` | `ACCEPTED` | Provider | No overlapping `ACCEPTED` booking for provider | Updates status to `ACCEPTED` |
| `REQUESTED` | `DECLINED` | Provider | None | Updates status to `DECLINED` |
| `REQUESTED` | `CANCELLED` | Requester | None | Updates status to `CANCELLED` |
| `ACCEPTED` | `CANCELLED` | Requester OR Provider | None | Updates status to `CANCELLED` |
| `ACCEPTED` | `COMPLETED` | Provider | Current time $\ge$ `startsAt`; Requester has balance $\ge$ creditAmount | Atomically writes `LedgerEntry` & updates status |
| `COMPLETED` | `REVIEWED` | Requester OR Provider | Booking in `COMPLETED` or `REVIEWED`; No prior review by caller | Writes `Review`, sets status to `REVIEWED` |

---

## 3. Data Model (Prisma Schema)

```mermaid
erDiagram
    User ||--o{ Membership : "belongs to"
    CoopGroup ||--o{ Membership : "has"
    User ||--o{ Listing : "owns"
    CoopGroup ||--o{ Listing : "contains"
    Listing ||--o{ Booking : "booked under"
    User ||--o{ Booking : "requests"
    User ||--o{ Booking : "provides"
    Booking ||--o| LedgerEntry : "settles"
    User ||--o{ LedgerEntry : "sends"
    User ||--o{ LedgerEntry : "receives"
    Booking ||--o{ Review : "receives"
    User ||--o{ Review : "writes"
    User ||--o{ Review : "receives"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role "MEMBER | ADMIN"
        datetime createdAt
    }

    CoopGroup {
        string id PK
        string name
        string locality
        datetime createdAt
    }

    Membership {
        string id PK
        string userId FK
        string groupId FK
        enum status "PENDING | ACTIVE | SUSPENDED"
        datetime createdAt
    }

    Listing {
        string id PK
        string ownerId FK
        string groupId FK
        enum type "OFFER | REQUEST"
        string category
        string title
        string description
        int hourlyCredits
        boolean active
        datetime createdAt
    }

    Booking {
        string id PK
        string listingId FK
        string requesterId FK
        string providerId FK
        datetime startsAt
        int durationMinutes
        int creditAmount
        enum status "REQUESTED | ACCEPTED | DECLINED | CANCELLED | COMPLETED | REVIEWED"
        datetime createdAt
    }

    LedgerEntry {
        string id PK
        string groupId FK
        string fromUserId FK
        string toUserId FK
        int amount
        string bookingId UK
        datetime createdAt
    }

    Review {
        string id PK
        string bookingId FK
        string reviewerId FK
        string revieweeId FK
        int rating
        string comment
        datetime createdAt
    }
```

---

## 4. Append-Only Ledger Integrity

- **Derived Balance Formula**:
  $$\text{Balance}(\text{User}, \text{Group}) = \sum \text{LedgerEntry.amount}_{(\text{toUser}=\text{User})} - \sum \text{LedgerEntry.amount}_{(\text{fromUser}=\text{User})}$$
- **Non-Negativity Invariant**:
  $$\text{Balance}(\text{Requester}) - \text{creditAmount} \ge 0$$
- **Atomicity**: Executed inside Prisma's `$transaction(async (tx) => ...)`. If balance verification fails or ledger insertion collides, the entire status transition rolls back cleanly.
- **Idempotency**: `LedgerEntry.bookingId` has a `UNIQUE` constraint, guaranteeing that a booking can never be settled more than once.
