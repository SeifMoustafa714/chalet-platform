# Chalet Booking Platform — Egypt (North Coast / Ain Sokhna / Marsa Matrouh / Sharm)

Production architecture for a moderated marketplace connecting customers with brokers/owners of vacation chalets, with **mandatory admin approval** before any listing goes public.

---

## 1. Architecture Overview

**Pattern:** Monorepo, two deployable apps sharing a types package.

```
Next.js (App Router, TS, Tailwind)  <---->  NestJS API (TS)  <---->  PostgreSQL (Prisma)
        Vercel                                  Railway/AWS ECS         Railway/AWS RDS
                                                       |
                                                  S3 (images)
```

- **Frontend (Next.js)**: public marketplace, user dashboard ("My Requests"), admin dashboard. Server Components for public listing pages (SEO), client components for interactive forms/calendars.
- **Backend (NestJS)**: modular — `auth`, `users`, `listing-requests`, `listings`, `bookings`, `payments`, `availability`, `pricing`, `reviews`, `uploads`. REST API, JWT auth, RBAC guards, Zod-based DTO validation (via `nestjs-zod` or `class-validator` — Zod chosen per spec).
- **Database**: PostgreSQL via Prisma. `ListingRequest` and `Listing` are **separate tables**, linked 1:1 after approval, preserving an audit trail.
- **Storage**: S3 (or DigitalOcean Spaces) for images, served through CloudFront/CDN. Presigned upload URLs issued by the API so large files never pass through the Node process.
- **Auth**: JWT access + refresh tokens, role claims (`USER`, `BROKER`, `ADMIN`) checked by a `RolesGuard`.

### Why separate `ListingRequest` and `Listing`?
This is the core business rule: nothing a user/broker submits is visible until an admin **converts** it. Keeping them as separate tables (rather than a `status` flag on one table) means:
- Public queries (`GET /listings`) never risk exposing unapproved data even via a bug — there's no unapproved row in that table to leak.
- Admin edits during review don't mutate the user's original submission — full audit trail of "what they submitted" vs "what went live."
- A request can be resubmitted/edited and re-reviewed without touching a live listing.

---

## 2. Prisma Schema

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  BROKER
  ADMIN
}

enum RequestStatus {
  pending_review
  approved
  rejected
}

enum BookingStatus {
  pending
  confirmed
  rejected
  cancelled
}

enum PaymentMethod {
  vodafone_cash
  instapay
  bank_transfer
  cash
}

enum PaymentStatus {
  submitted
  verified
  rejected
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  phone         String?  @unique
  passwordHash  String
  fullName      String
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  listingRequests ListingRequest[] @relation("SubmittedBy")
  reviewedRequests ListingRequest[] @relation("ReviewedBy")
  approvedListings  Listing[]       @relation("ApprovedBy")
  bookings          Booking[]
  reviews           Review[]

  @@map("users")
}

model ListingRequest {
  id             String        @id @default(uuid())
  userId         String
  user           User          @relation("SubmittedBy", fields: [userId], references: [id])

  title          String
  description    String
  location       String        // e.g. "North Coast - Marassi"
  region         String        // enum-ish string: north_coast | ain_sokhna | marsa_matrouh | sharm
  amenities      String[]
  maxGuests      Int
  images         String[]      // S3 keys/URLs
  priceMin       Decimal?      @db.Decimal(10, 2)
  priceMax       Decimal?      @db.Decimal(10, 2)
  contactPhone   String
  contactWhatsapp String?
  availabilityNote String?

  status         RequestStatus @default(pending_review)
  adminNotes     String?
  rejectionReason String?

  reviewedById   String?
  reviewedBy     User?         @relation("ReviewedBy", fields: [reviewedById], references: [id])
  reviewedAt     DateTime?

  listing        Listing?      // 1:1 once approved

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@map("listing_requests")
  @@index([status])
}

model Listing {
  id               String   @id @default(uuid())
  sourceRequestId  String   @unique
  sourceRequest    ListingRequest @relation(fields: [sourceRequestId], references: [id])

  title            String
  description      String
  location         String
  region           String
  amenities        String[]
  maxGuests        Int
  images           String[]

  approvedById     String
  approvedBy       User     @relation("ApprovedBy", fields: [approvedById], references: [id])
  verifiedFlag     Boolean  @default(true)
  isActive         Boolean  @default(true)

  pricing          Pricing?
  availability     Availability[]
  bookings         Booking[]
  reviews          Review[]

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("listings")
  @@index([region])
  @@index([isActive])
}

model Pricing {
  id             String   @id @default(uuid())
  listingId      String   @unique
  listing        Listing  @relation(fields: [listingId], references: [id])

  basePrice      Decimal  @db.Decimal(10, 2)
  weekendPrice   Decimal? @db.Decimal(10, 2)
  seasonalPrice  Decimal? @db.Decimal(10, 2)
  customPrices   Json?    // { "2026-08-15": 5500, ... }

  updatedAt      DateTime @updatedAt

  @@map("pricing")
}

model Availability {
  id         String   @id @default(uuid())
  listingId  String
  listing    Listing  @relation(fields: [listingId], references: [id])
  date       DateTime @db.Date
  isBlocked  Boolean  @default(false)
  note       String?

  @@map("availability")
  @@unique([listingId, date])
}

model Booking {
  id           String        @id @default(uuid())
  listingId    String
  listing      Listing       @relation(fields: [listingId], references: [id])
  userId       String
  user         User          @relation(fields: [userId], references: [id])

  checkIn      DateTime      @db.Date
  checkOut     DateTime      @db.Date
  guests       Int
  quotedPrice  Decimal?      @db.Decimal(10, 2)

  status       BookingStatus @default(pending)
  adminNotes   String?

  payment      Payment?

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@map("bookings")
  @@index([status])
}

model Payment {
  id              String        @id @default(uuid())
  bookingId       String        @unique
  booking         Booking       @relation(fields: [bookingId], references: [id])

  method          PaymentMethod
  transactionRef  String
  amount          Decimal       @db.Decimal(10, 2)
  status          PaymentStatus @default(submitted)
  verifiedAt      DateTime?

  createdAt       DateTime      @default(now())

  @@map("payments")
}

model Review {
  id         String   @id @default(uuid())
  listingId  String
  listing    Listing  @relation(fields: [listingId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])

  rating     Int      // 1-5
  comment    String?
  createdAt  DateTime @default(now())

  @@map("reviews")
}
```

---

## 3. API Design

Base URL: `/api/v1`. Auth via `Authorization: Bearer <jwt>`. Roles noted per endpoint.

### Auth
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | creates USER |
| POST | `/auth/login` | public | returns access + refresh token |
| POST | `/auth/refresh` | public | rotate token |

### Listing Requests
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/listing-requests` | USER, BROKER | creates request, status `pending_review` |
| GET | `/listing-requests/mine` | USER, BROKER | own submissions + status |
| GET | `/listing-requests` | ADMIN | filter by `status`, paginated |
| GET | `/listing-requests/:id` | ADMIN, owner | detail view |
| PATCH | `/listing-requests/:id` | ADMIN | edit any field pre-approval |
| POST | `/listing-requests/:id/approve` | ADMIN | creates `Listing`, sets `reviewedBy/At` |
| POST | `/listing-requests/:id/reject` | ADMIN | body: `{ reason }`, notifies user |

### Listings (public)
| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/listings` | public | filters: region, guests, price range, dates |
| GET | `/listings/:id` | public | full detail + availability + pricing |

### Availability / Pricing
| Method | Path | Role |
|---|---|---|
| GET | `/listings/:id/availability` | public |
| PATCH | `/listings/:id/availability` | ADMIN, BROKER (own) |
| PATCH | `/listings/:id/pricing` | ADMIN, BROKER (own) |

### Bookings
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/bookings` | USER | status `pending` |
| GET | `/bookings/mine` | USER | |
| GET | `/bookings` | ADMIN | all, filterable |
| PATCH | `/bookings/:id/confirm` | ADMIN | sets `confirmed`, optional `quotedPrice` |
| PATCH | `/bookings/:id/reject` | ADMIN | |

### Payments
| Method | Path | Role |
|---|---|---|
| POST | `/bookings/:id/payment` | USER (submits ref + method) |
| PATCH | `/payments/:id/verify` | ADMIN |

### Uploads
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/uploads/presign` | USER, BROKER, ADMIN | returns S3 presigned PUT URL |

---

## 4. Folder Structure

```
chalet-platform/
├── apps/
│   ├── web/                          # Next.js
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx                  # homepage/listings
│   │   │   │   └── listings/[id]/page.tsx
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (user)/
│   │   │   │   ├── submit-listing/page.tsx
│   │   │   │   └── my-requests/page.tsx
│   │   │   └── (admin)/
│   │   │       ├── listing-requests/page.tsx
│   │   │       └── listing-requests/[id]/page.tsx
│   │   ├── components/
│   │   ├── lib/api.ts                 # typed fetch client
│   │   └── tailwind.config.ts
│   │
│   └── api/                          # NestJS
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── listing-requests/
│       │   │   ├── listing-requests.controller.ts
│       │   │   ├── listing-requests.service.ts
│       │   │   └── dto/
│       │   ├── listings/
│       │   ├── bookings/
│       │   ├── payments/
│       │   ├── availability/
│       │   ├── pricing/
│       │   ├── uploads/
│       │   ├── common/
│       │   │   ├── guards/ (jwt-auth.guard.ts, roles.guard.ts)
│       │   │   └── decorators/roles.decorator.ts
│       │   └── main.ts
│       └── prisma/schema.prisma
│
└── packages/
    └── shared-types/                  # DTOs/enums shared FE<->BE
```

---

## 5. Key Code Snippets

### RBAC guard + decorator (NestJS)
```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!roles) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return roles.includes(user.role);
  }
}
```

### Listing Requests — approve flow (the critical business rule)
```typescript
// listing-requests/listing-requests.service.ts
async approve(requestId: string, adminId: string) {
  return this.prisma.$transaction(async (tx) => {
    const request = await tx.listingRequest.findUniqueOrThrow({ where: { id: requestId } });

    if (request.status !== 'pending_review') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const listing = await tx.listing.create({
      data: {
        sourceRequestId: request.id,
        title: request.title,
        description: request.description,
        location: request.location,
        region: request.region,
        amenities: request.amenities,
        maxGuests: request.maxGuests,
        images: request.images,
        approvedById: adminId,
        verifiedFlag: true,
      },
    });

    await tx.listingRequest.update({
      where: { id: requestId },
      data: { status: 'approved', reviewedById: adminId, reviewedAt: new Date() },
    });

    return listing;
  });
}

async reject(requestId: string, adminId: string, reason: string) {
  return this.prisma.listingRequest.update({
    where: { id: requestId },
    data: {
      status: 'rejected',
      rejectionReason: reason,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
  });
  // fire notification (email/whatsapp) with `reason` to request.user
}
```

### Zod validation DTO
```typescript
// listing-requests/dto/create-listing-request.dto.ts
import { z } from 'zod';

export const CreateListingRequestSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  location: z.string(),
  region: z.enum(['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm']),
  amenities: z.array(z.string()).default([]),
  maxGuests: z.number().int().positive(),
  images: z.array(z.string().url()).min(1),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  contactPhone: z.string().min(8),
  contactWhatsapp: z.string().optional(),
});

export type CreateListingRequestDto = z.infer<typeof CreateListingRequestSchema>;
```

### Admin review panel — Next.js (client component, condensed)
```tsx
// app/(admin)/listing-requests/[id]/page.tsx
'use client';

export default function ReviewRequestPage({ params }: { params: { id: string } }) {
  const { data: request, mutate } = useSWR(`/listing-requests/${params.id}`, fetcher);
  const [draft, setDraft] = useState(request);

  async function handleApprove() {
    await api.patch(`/listing-requests/${params.id}`, draft); // save edits first
    await api.post(`/listing-requests/${params.id}/approve`);
    router.push('/admin/listing-requests');
  }

  async function handleReject(reason: string) {
    await api.post(`/listing-requests/${params.id}/reject`, { reason });
    router.push('/admin/listing-requests');
  }

  if (!request) return <Spinner />;

  return (
    <EditableRequestForm
      value={draft}
      onChange={setDraft}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
}
```

### Public listing price display (indicative range rule)
```tsx
function PriceRange({ pricing }: { pricing: Pricing }) {
  const min = pricing.basePrice;
  const max = pricing.seasonalPrice ?? pricing.weekendPrice ?? pricing.basePrice * 1.3;
  return (
    <p className="text-sm text-gray-500">
      {min.toLocaleString()}–{max.toLocaleString()} EGP
      <span className="ml-1 italic">(indicative — confirmed before payment)</span>
    </p>
  );
}
```

---

## 6. Step-by-Step Setup

```bash
# 1. Scaffold monorepo
mkdir chalet-platform && cd chalet-platform
npx create-turbo@latest .   # or plain npm workspaces

# 2. Backend
cd apps/api
npx @nestjs/cli new . --skip-git
npm i @prisma/client prisma @nestjs/jwt @nestjs/passport passport-jwt zod bcrypt @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npx prisma init
# paste schema.prisma from Section 2
npx prisma migrate dev --name init
npx prisma generate

# 3. Frontend
cd ../../apps/web
npx create-next-app@latest . --typescript --tailwind --app
npm i swr axios

# 4. Env files
# apps/api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/chalet
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too
AWS_S3_BUCKET=chalet-images
AWS_REGION=eu-central-1

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# 5. Run locally
docker run --name chalet-db -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:16
cd apps/api && npm run start:dev
cd apps/web && npm run dev
```

---

## 7. Deployment Guide

**Frontend → Vercel**
1. Import repo, set root directory to `apps/web`.
2. Env var: `NEXT_PUBLIC_API_URL` = production API URL.
3. Enable ISR/on-demand revalidation for `/listings` so new approvals appear without full rebuilds.

**Backend + DB → Railway (or AWS ECS + RDS)**
1. New Railway project → Add PostgreSQL plugin (gives `DATABASE_URL`).
2. Deploy `apps/api` as a service (root `apps/api`, build `npm run build`, start `npm run start:prod`).
3. Run `npx prisma migrate deploy` as a release step.
4. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `AWS_*`.

**Storage → S3**
1. Create bucket, enable public-read on an `images/` prefix or front with CloudFront.
2. IAM user scoped to `PutObject`/`GetObject` on that bucket only; use presigned URLs — never expose the AWS secret to the frontend.

**CI/CD**
- GitHub Actions: on push to `main`, run `prisma migrate deploy`, then trigger Vercel + Railway deploys (both support auto-deploy on push — this is largely automatic once connected).

**Post-launch checklist**
- Rate limit `/auth/login` and `/listing-requests` (e.g. `@nestjs/throttler`).
- Backups: enable automated PostgreSQL snapshots.
- Monitoring: Sentry on both apps; Railway/Vercel logs for infra.
