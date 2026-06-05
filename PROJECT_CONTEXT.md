# Pins Dashboard Project Context

This document is intended as high-signal context for AI assistants or collaborators working on this repository.

## Project Summary

`pins-dashboard` is an internal dashboard for Pins&Knuckles merchandise pricing and garment catalog management.

The app currently has two main tools:

- Pricing calculator: builds quotes from garment base cost, print position, color count, quantity tier, garment markup, and VAT.
- Garment directory: searchable garment catalog with add, edit, and delete workflows.

The project is a Next.js App Router application using Prisma with PostgreSQL. It is being prepared for Vercel deployment with Neon Postgres.

## Tech Stack

- Next.js `16.2.7`
- React `19.2.4`
- TypeScript
- Tailwind CSS 4
- Prisma `7.8.0`
- PostgreSQL via `pg` and `@prisma/adapter-pg`
- Sonner for toast notifications

Important package scripts:

```bash
npm run dev
npm run build
npm run vercel-build
npm run lint
npx prisma validate
npx prisma migrate deploy
npx prisma db seed
```

`npm run vercel-build` runs:

```bash
prisma generate && prisma migrate deploy && next build
```

## Repository Structure

```text
src/app/
  page.tsx
  layout.tsx
  globals.css
  dashboard/
    calculator/
      page.tsx
      CalculatorClient.tsx
    garments/
      page.tsx
      GarmentDirectoryClient.tsx
      actions.ts

src/components/
  DesignCard.tsx

src/lib/
  db.ts

prisma/
  schema.prisma
  config via ../prisma.config.ts
  migrations/
    0_init/migration.sql
  seed.ts
  seed-data.ts
```

## Data Model

The Prisma schema models:

- `Garment`: catalog item with code, alt code, brand, name, color, type, base price, optional extra size cost, and search tags.
- `GarmentMarkup`: per-garment-type markup value.
- `PrintPrice`: print pricing tiers by color count and quantity range.
- `Order`: quote/order container with VAT rate and designs.
- `Design`: garment selection and quantity within an order.
- `DesignPrint`: print position and color count for a design.

Enums:

- `GarmentType`: `TSHIRT`, `LONGSLEEVE`, `HOODIE`
- `PrintPosition`: `FRONT`, `BACK`, `LEFT_SLEEVE`, `RIGHT_SLEEVE`, `NECK`

The seed data creates the garment catalog, garment markups, and print price tiers.

## Pricing Calculator Behavior

Relevant files:

- `src/app/dashboard/calculator/page.tsx`
- `src/app/dashboard/calculator/CalculatorClient.tsx`
- `src/components/DesignCard.tsx`

The calculator page is a server component that loads:

- all garments
- all print price tiers
- all garment type markups

The client component manages one or more designs in local React state.

Pricing rules:

- Each design has a quantity, selected garment, and one or more print positions.
- Print prices are selected by matching `colorCount`, `qtyMin`, and `qtyMax`.
- Neck prints use a fixed unit price of `0.7`.
- Garment base cost is multiplied by quantity.
- Garment markup is selected from `GarmentMarkup` by garment type and multiplied by quantity.
- VAT is currently hardcoded at `27%`.
- The UI shows both production cost and Pins customer price.
- The quote copy action formats a customer-facing text quote.

## Garment Directory Behavior

Relevant files:

- `src/app/dashboard/garments/page.tsx`
- `src/app/dashboard/garments/GarmentDirectoryClient.tsx`
- `src/app/dashboard/garments/actions.ts`

The directory page loads all garments from Prisma and passes them to the client component.

Features:

- Search by name, code, alt code, brand, color, and tags.
- Add garment modal.
- Edit garment detail workflow.
- Delete garment workflow.
- Server actions mutate Prisma and revalidate both `/dashboard/garments` and `/dashboard/calculator`.

## Database and Prisma Setup

The app now uses PostgreSQL, not SQLite.

Runtime database access is in:

```text
src/lib/db.ts
```

It:

- requires `DATABASE_URL`
- rejects old SQLite `file:` URLs
- rejects localhost database URLs when `VERCEL=1`
- creates a `pg` pool
- passes that pool to Prisma via `PrismaPg`
- caches the Prisma client and pool globally during development

Prisma CLI config is in:

```text
prisma.config.ts
```

It:

- loads environment variables with `dotenv/config`
- points Prisma to `prisma/schema.prisma`
- uses `prisma/migrations`
- configures the seed command as `npx ts-node --project tsconfig.seed.json prisma/seed.ts`
- chooses the migration database URL with this order:
  - `DIRECT_DATABASE_URL`, if set
  - otherwise derive a direct Neon URL from `DATABASE_URL` by removing `-pooler` from the host

## Neon and Vercel Environment Variables

For Vercel with Neon, set both environment variables:

```text
DATABASE_URL=Neon pooled connection string
DIRECT_DATABASE_URL=Neon direct connection string
```

Use the pooled Neon URL for `DATABASE_URL`. It normally contains `-pooler` in the hostname.

Use the direct Neon URL for `DIRECT_DATABASE_URL`. It normally does not contain `-pooler`.

Do not use `localhost` in Vercel environment variables. Vercel cannot reach a database running on a developer machine. The code now throws a clearer error if `VERCEL=1` and a localhost database URL is configured.

Do not paste real database credentials into documentation or prompts. If a credential is exposed, rotate the Neon password and update Vercel.

## Deployment

Vercel build configuration:

```text
vercel.json
```

The build command is:

```bash
npm run vercel-build
```

This runs Prisma generation, applies pending migrations, then builds Next.js.

The seed command is not run automatically during Vercel deploy. That is intentional because the seed script deletes and recreates catalog/pricing rows.

For a new production database:

```bash
npx prisma db seed
```

Only run this against production when it is safe to overwrite seeded catalog/pricing data.

## Migration History

The current active migration is:

```text
prisma/migrations/0_init/migration.sql
```

Old SQLite migrations were archived under:

```text
prisma/sqlite-migrations-archive/
```

The tracked SQLite database file was removed. Local database files should not be committed.

## Verification Checklist

Before deploying or handing the project to another assistant, run:

```bash
npx prisma validate
npm run lint
npm run vercel-build
```

When using Neon, confirm the database contains seeded catalog data:

```text
Garment: 47
GarmentMarkup: 3
PrintPrice: 45
```

If the app loads but no garments appear, the database is usually migrated but not seeded.

## Known Operational Issues

### Prisma P1001 on Vercel

If Vercel logs show:

```text
Error: P1001: Can't reach database server at `localhost:5432`
```

then one of the Vercel environment variables still points to a local database. Fix Vercel env vars:

- `DATABASE_URL`: Neon pooled URL
- `DIRECT_DATABASE_URL`: Neon direct URL

Redeploy after changing env vars.

### Prisma Advisory Lock Timeout on Neon

If `prisma migrate deploy` times out acquiring an advisory lock, make sure migrations are using the direct Neon URL, not the pooled URL.

This repo handles that in `prisma.config.ts`, but Vercel should still have `DIRECT_DATABASE_URL` set explicitly.

### Missing `@swc/helpers...` in `.next/dev`

This can happen after dependency changes due to stale Turbopack dev cache.

Fix:

```bash
rm -rf .next
npm run dev
```

## Design and UI Notes

The app uses a dark internal-tool aesthetic with red accents. The dashboard home page links to the calculator and garment directory.

This is not a marketing site. UI work should prioritize utility, fast scanning, and safe data editing.

## Current Cautions for Future Changes

- Do not put real database credentials in committed files.
- Do not auto-run the seed script during Vercel deploy unless the destructive behavior is changed.
- Keep `prisma` in production dependencies because Vercel runs migrations during build.
- Keep `@prisma/adapter-pg` and `pg`; Prisma 7 requires a driver adapter for this setup.
- If Next.js APIs are changed, read the local Next docs in `node_modules/next/dist/docs/` first because this project uses Next 16.
