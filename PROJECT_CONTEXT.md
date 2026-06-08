# Pins Dashboard Project Context

## Project Summary

`pins-dashboard` is an internal Pins&Knuckles dashboard for merchandise pricing and garment catalog management.

Current hub sections:

- `Pricing Calculator`: live quote calculator.
- `Garment Directory`: searchable garment catalog with add, edit, and delete workflows.
- `Order Management`: placeholder.
- `PK Tax`: placeholder.
- `Refferals`: placeholder. The label is intentionally spelled this way in the Hub UI.
- `US Calculator`: placeholder.

The app is a Next.js App Router project using Prisma with PostgreSQL, prepared for Vercel deployment with Neon Postgres.

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
npm run migrate:deploy
npm run lint
npx prisma validate
npx prisma db seed
```

Current script behavior:

```bash
npm run build         # prisma generate && next build
npm run vercel-build # prisma generate && next build
npm run migrate:deploy # prisma migrate deploy
```

Migrations are intentionally not run inside the Vercel build command. Run `npm run migrate:deploy` separately when the Neon database is reachable.

## Repository Structure

```text
src/app/
  page.tsx                         # Hub page
  layout.tsx
  globals.css
  dashboard/
    loading.tsx                    # Shared dashboard route loading fallback
    calculator/
      page.tsx
      loading.tsx
      data.ts                      # Cached calculator reference data
      CalculatorClient.tsx
    garments/
      page.tsx
      loading.tsx
      data.ts                      # Cached garment directory data
      actions.ts                   # Server actions and cache invalidation
      GarmentDirectoryClient.tsx
src/components/
  DesignCard.tsx                   # Calculator item card and pricing helper types
src/lib/
  db.ts                            # Prisma + pg adapter setup
prisma/
  schema.prisma
  migrations/0_init/migration.sql
  seed.ts
  seed-data.ts
```

## Data Model

Prisma models:

- `Garment`: catalog item with code, alt code, brand, name, color, type, base price, optional extra size cost, and search tags.
- `GarmentMarkup`: per-garment-type markup value.
- `PrintPrice`: print pricing tiers by color count and quantity range.
- `Order`: quote/order container with VAT rate and designs.
- `Design`: garment selection and quantity within an order.
- `DesignPrint`: print position and color count for a design.

Enums:

- `GarmentType`: `TSHIRT`, `LONGSLEEVE`, `HOODIE`
- `PrintPosition`: `FRONT`, `BACK`, `LEFT_SLEEVE`, `RIGHT_SLEEVE`, `NECK`

Seed data creates the garment catalog, garment markups, and print price tiers.

Expected seeded counts:

```text
Garment: 47
GarmentMarkup: 3
PrintPrice: 45
```

## Pricing Calculator Behavior

Server page:

- `src/app/dashboard/calculator/page.tsx`
- Calls `connection()` so the page is dynamic.
- Loads cached reference data through `getCalculatorReferenceData()` in `calculator/data.ts`.

Client behavior:

- `CalculatorClient.tsx` keeps calculator items in React state.
- Each item is rendered by `DesignCard.tsx`.
- VAT is currently hardcoded at `27%`.
- Neck prints use fixed unit price `0.7`.
- Print prices match `colorCount`, `qtyMin`, and `qtyMax`.
- Garment base cost is garment base price times quantity.
- Garment markup is the garment type markup times quantity.

Pins Price includes:

- garment base cost
- Pins print cost
- garment markup
- optional PK Markup
- VAT applied to the subtotal

Production Cost includes:

- garment base cost
- production print cost

Production Cost does not include garment markup or PK Markup.

### PK Markup

Each calculator item has an optional `PK Markup` checkbox.

- The PK Markup amount is entered per unit.
- The textbox only appears when the checkbox is ticked.
- Negative values are allowed so sales can apply a markdown.
- PK Markup affects only Pins Price, not Production Cost.
- The Pins breakdown shows PK Markup as its own line when enabled.
- The copied quote includes PK Markup through the final per-unit Pins price.

### Calculator Layout

The calculator item card and pricing container should not shift size when a garment is selected.

Current layout rules:

- `CalculatorClient` root is `w-full max-w-4xl`.
- `DesignCard` is `w-full min-h-[380px]`.
- The pricing container is always mounted with `min-h-[360px]`.
- Empty pricing state shows zero totals until a garment is selected.
- `handleCopyClick` returns early if no garment is selected.

Do not reintroduce conditional rendering that removes the whole pricing container, because it causes layout shift.

## Garment Directory Behavior

Server page:

- `src/app/dashboard/garments/page.tsx`
- Calls `connection()` so the page is dynamic.
- Loads cached garment directory data through `getGarmentDirectoryData()` in `garments/data.ts`.

Client behavior:

- `GarmentDirectoryClient.tsx` renders the searchable table.
- Search is client-side and memoized with `useMemo`.
- Add/edit/delete are server actions in `garments/actions.ts`.
- Server actions invalidate both:
  - garment directory cache tag
  - calculator reference cache tag

Route loading:

- `src/app/dashboard/garments/loading.tsx` gives immediate feedback while the directory loads.
- `src/app/dashboard/loading.tsx` is a shared fallback for dashboard sections that load data.

## Hub Page

`src/app/page.tsx` is the Hub.

Active links:

- Pricing Calculator: `/dashboard/calculator`
- Garment Directory: `/dashboard/garments`

Placeholder cards:

- Order Management
- PK Tax
- Refferals
- US Calculator

Placeholder cards are inactive and display `Coming Soon`.

## Styling Notes

- The UI uses dark, restrained operational-tool styling.
- The root layout does not use `next/font/google`; this avoids build failures when external font fetching is blocked.
- Global CSS already provides the font fallback stack.
- Back navigation text should say `Back to Hub`, not `Back to Dashboard`.

## Database Setup

`src/lib/db.ts`:

- requires `DATABASE_URL`
- rejects old SQLite `file:` URLs
- rejects localhost database URLs when `VERCEL=1`
- creates a `pg` pool
- passes that pool to Prisma via `PrismaPg`
- caches the Prisma client and pool globally during development

Prisma CLI config is in `prisma.config.ts`.

It:

- loads environment variables with `dotenv/config`
- points Prisma to `prisma/schema.prisma`
- uses `prisma/migrations`
- configures the seed command as `npx ts-node --project tsconfig.seed.json prisma/seed.ts`
- chooses the migration database URL in this order:
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

Do not use `localhost` in Vercel environment variables.

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

That command currently runs:

```bash
prisma generate && next build
```

Deploy migrations separately when the database is reachable:

```bash
npm run migrate:deploy
```

Seed command is not run automatically during Vercel deploy.

For a new production database:

```bash
npx prisma db seed
```

Only run seed against production when it is safe to overwrite seeded catalog/pricing data.

## Migration History

Current active migration:

```text
prisma/migrations/0_init/migration.sql
```

Old SQLite migrations are archived under:

```text
prisma/sqlite-migrations-archive/
```

The tracked SQLite database file was removed. Local database files should not be committed.

## Verification Checklist

Before deploying or handing the project to another assistant, run:

```bash
npx prisma validate
npm run lint
npx tsc --noEmit
npm run vercel-build
```

Notes:

- In this sandbox, `npm run vercel-build` can fail because Turbopack tries to bind a local worker port and the sandbox denies it. This is not the same as the Neon `P1001` error.
- Previously, `next/font/google` could fail local builds when network access was blocked. The project no longer depends on Google font fetching.

## Operational Issues

### Prisma P1001 on Vercel

If Vercel logs show:

```text
Error: P1001: Can't reach database server at `...neon.tech:5432`
```

check:

- `DATABASE_URL` is set in the correct Vercel environment.
- `DIRECT_DATABASE_URL` is set if running migrations.
- Neon project, branch, and endpoint are active.
- The connection string includes `sslmode=require`.
- The deploy is not trying to connect to a deleted or paused endpoint.

The Vercel build no longer runs `prisma migrate deploy`, so P1001 during `npm run vercel-build` should not occur unless another build-time code path touches the database.

### App Loads but No Garments Appear

Usually means the database is migrated but not seeded.

Confirm seeded counts:

```text
Garment: 47
GarmentMarkup: 3
PrintPrice: 45
```

Run seed only when safe:

```bash
npx prisma db seed
```
