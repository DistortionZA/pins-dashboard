# Pins Hub

Internal Pins Hub app for calculators, garment reference data, referral planning, PK Tax, and quick sales reference copy.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL / Neon

## Current Hub Routes

- `/` - Hub home
- `/hub/calculators`
- `/hub/calculators/eu`
- `/hub/calculators/eu/standard`
- `/hub/calculators/eu/us-clients`
- `/hub/calculators/uk`
- `/hub/garments`
- `/hub/pk-tax`
- `/hub/referrals`
- `/hub/reference`
- `/ref/[code]`

## UI Notes

- The hub supports two persistent local themes:
  - `Brand` theme is the official Pins & Knuckles brand-guidelines theme
  - `Classic` theme preserves the previous internal dashboard look
- Theme selection is stored in browser `localStorage`.
- Hub navigation uses a compact sidebar with only usable routes shown.
- Spacing was tightened globally to keep the app denser and more SaaS-like without reducing control hit areas.

## Quick Reference

`/hub/reference` includes:

- Static billing, delivery, and import reference items
- Local browser-only saved custom messages using `localStorage`
- Supplier and logistics email reference with per-email copy and copy-all support

Saved message storage key:

```ts
pins-hub-reference-saved-messages
```

## Database Setup

Pins Hub uses Prisma with PostgreSQL only.

1. Create a PostgreSQL or Neon database.
2. Set `DATABASE_URL` in `.env`.
3. For Neon/Vercel:
   - use the pooled Neon URL for `DATABASE_URL`
   - use the direct Neon URL for `DIRECT_DATABASE_URL` when running Prisma migrations
4. Apply schema:

```bash
npx prisma migrate deploy
```

5. Seed reference data:

```bash
npx prisma db seed
```

## Common Commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run vercel-build
```

## Important Constraints

- Do not reintroduce SQLite.
- `src/lib/db.ts` rejects `file:` database URLs.
- Do not change calculator pricing logic unless explicitly requested.
- `VAT` is currently hardcoded at `27%`.
- `PK Markup` is per-unit and feeds customer pricing before VAT.
- Keep wording consistent:
  - `Back to Hub`
  - `Back to Calculators`
  - `Back to Regions`
