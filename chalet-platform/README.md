# Chalet Booking Platform (Egypt)

Monorepo: `apps/api` (NestJS + Prisma + PostgreSQL) and `apps/web` (Next.js App Router).

See `ARCHITECTURE.md` for the full design doc (schema, API, deployment).

## Quick start

```bash
npm install

# start postgres
docker run --name chalet-db -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:16

# backend
cd apps/api
cp .env.example .env   # fill in DATABASE_URL etc.
npx prisma migrate dev --name init
npm run start:dev

# frontend (new terminal)
cd apps/web
cp .env.local.example .env.local
npm run dev
```

API: http://localhost:3001/api/v1
Web: http://localhost:3000

## Core business rule
Nothing submitted via `POST /listing-requests` is publicly visible. An admin must call
`POST /listing-requests/:id/approve`, which creates a brand-new row in `listings` inside
a transaction — see `apps/api/src/listing-requests/listing-requests.service.ts`.
