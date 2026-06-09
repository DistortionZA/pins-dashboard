# Pins Dashboard Project Context

Canonical location: `docs/ai-context/PROJECT_CONTEXT.md`
Github Repo: https://github.com/DistortionZA/pins-dashboard

`pins-dashboard` is an internal Pins&Knuckles dashboard for merchandise pricing and garment catalog management.

## Product Areas
- `EU Price Calculator`: the current live regional calculator on `/dashboard/calculator`.
- `Garment Directory`: searchable garment catalog with add, edit, and delete workflows.
- `Order Management`: placeholder.
- `PK Tax`: placeholder.
- `Refferals`: placeholder. The Hub label is intentionally spelled this way.
- `US Calculator`: placeholder.

The app is a Next.js App Router project using Prisma with PostgreSQL and is prepared for Vercel deployment with Neon Postgres.

## Tech Stack
- Next.js `16.2.7`
- React `19.2.4`
- TypeScript
- Tailwind CSS 4
- Prisma `7.8.0`
- PostgreSQL via `pg` and `@prisma/adapter-pg`
- Sonner for toast notifications

## Scripts
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
npm run build # prisma generate && next build
npm run vercel-build # prisma generate && next build
npm run migrate:deploy # prisma migrate deploy
```

Migrations are intentionally not run inside the Vercel build command. Run `npm run migrate:deploy` separately when the Neon database is reachable.

## Repository Structure
```text
src/app/
  page.tsx
  layout.tsx
  globals.css
  dashboard/
    loading.tsx
    calculator/
      page.tsx
      loading.tsx
      data.ts
      CalculatorClient.tsx
    garments/
      page.tsx
      loading.tsx
      data.ts
      actions.ts
      GarmentDirectoryClient.tsx
src/components/
  DesignCard.tsx
src/lib/
  db.ts
prisma/
  schema.prisma
  migrations/0_init/migration.sql
  seed.ts
  seed-data.ts
```

## Data Model
Prisma models:
- `Garment`
- `GarmentMarkup`
- `PrintPrice`
- `Order`
- `Design`
- `DesignPrint`

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

Database changes:
- No new database tables or Prisma models were introduced by the EU calculator rename.
- No database changes were introduced by the Box Capacity Guide modal.

## EU Price Calculator
Primary files:
- `src/app/dashboard/calculator/page.tsx`
- `src/app/dashboard/calculator/loading.tsx`
- `src/app/dashboard/calculator/data.ts`
- `src/app/dashboard/calculator/CalculatorClient.tsx`
- `src/components/DesignCard.tsx`

Current state:
- The existing calculator implementation is branded as `EU Price Calculator`.
- The live route remains `/dashboard/calculator`.
- The page metadata is branded for the EU calculator.
- The current pricing logic remains EU-specific.

Pricing logic notes:
- VAT is hardcoded at `27%`.
- Neck prints use a fixed unit price of `0.7`.
- Print prices match `colorCount`, `qtyMin`, and `qtyMax`.
- PK markup is per-unit and feeds the customer price before VAT.
- Delivery helper logic is a sales helper only and must not affect main calculator totals.

Recent functionality:
- The Box Capacity Guide was upgraded from a native `title` tooltip to a clickable modal.
- The modal keeps the existing dark Pins Dashboard styling with red accents.
- The modal closes via close button, outside click, or `Escape`.
- The modal uses dialog semantics and focus containment behavior.
- Copied quote text now starts with `EU Price Calculator Quote`.
- Delivery helper copy now starts with `EU Price Calculator Delivery Helper`.

Future regional calculator direction:
- Keep the current implementation as the EU calculator.
- Do not broadly rename working internals unless a future extraction clearly benefits maintainability.
- When additional regional calculators are introduced, shared pricing helpers should be extracted from `src/app/dashboard/calculator/CalculatorClient.tsx` and `src/components/DesignCard.tsx`, while VAT, currency, shipping assumptions, and regional copy stay local to each calculator.

Recommended future route family:
- `/dashboard/calculators/eu`
- `/dashboard/calculators/us`
- `/dashboard/calculators/uk`
- `/dashboard/calculators/au`

Current route recommendation:
- Keep `/dashboard/calculator` unchanged for now.
- Add redirects to a plural regional route family only when a second regional calculator is actually implemented, so bookmarks and existing cache invalidation logic stay stable.

## Hub Page
`src/app/page.tsx` is the Hub.

Active links:
- `EU Price Calculator`: `/dashboard/calculator`
- `Garment Directory`: `/dashboard/garments`

Placeholder cards:
- `Order Management`
- `PK Tax`
- `Refferals`
- `US Calculator`

Placeholder cards are inactive and display `Coming Soon`.

## Loading and Navigation
- Calculator back navigation text should remain `Back to Hub`.
- `src/app/dashboard/calculator/loading.tsx` exposes `Loading EU Price Calculator...` for accessibility context.
- `src/app/dashboard/loading.tsx` is the shared fallback for dashboard sections that load data.

## UI Conventions
- Preserve the existing dark internal-tool UI with red accents.
- Avoid layout shift in existing calculator surfaces.
- Keep the pricing container mounted and stable.
- Present calculator help/reference content as intentional in-app UI, not browser tooltips, when the interaction looks clickable.
- Keep help modals responsive on mobile and desktop.
- Preserve trigger placement and hover styling when upgrading passive help text into interactive controls.
- Use `Back to Hub` consistently in dashboard navigation.

## Database Setup
`src/lib/db.ts`:
- requires `DATABASE_URL`
- rejects old SQLite `file:` URLs
- rejects localhost database URLs when `VERCEL=1`
- creates a `pg` pool
- passes that pool to Prisma via `PrismaPg`
- caches the Prisma client and pool globally during development

Prisma CLI config is in `prisma.config.ts`. It:
- loads environment variables with `dotenv/config`
- points Prisma to `prisma/schema.prisma`
- uses `prisma/migrations`
- configures the seed command as `npx ts-node --project tsconfig.seed.json prisma/seed.ts`
- chooses the migration database URL
- uses `DIRECT_DATABASE_URL`, if set
- otherwise derives a direct Neon URL from `DATABASE_URL` by removing `-pooler` from the host

## Neon and Vercel Environment Variables
For Vercel with Neon, set:
```text
DATABASE_URL=Neon pooled connection string
DIRECT_DATABASE_URL=Neon direct connection string
```

Use the pooled Neon URL for `DATABASE_URL`. It normally contains `-pooler` in the hostname.

Use the direct Neon URL for `DIRECT_DATABASE_URL`. It normally does not contain `-pooler`.

Do not use `localhost` in Vercel environment variables.

Do not paste real database credentials into documentation or prompts. If a credential is exposed, rotate the Neon password and update Vercel.

Environment variable changes:
- No environment variable changes were introduced by the EU calculator rename.
- No environment variable changes were introduced by the Box Capacity Guide modal.

## Deployment
Vercel build configuration uses:
```bash
npm run vercel-build
```

That currently runs:
```bash
prisma generate && next build
```

Deploy migrations separately when the database is reachable:
```bash
npm run migrate:deploy
```

Seed command is not run automatically during Vercel deploy. For a new production database:
```bash
npx prisma db seed
```

Only run seed against production when it is safe to overwrite seeded catalog/pricing data.

Deployment changes:
- No deployment configuration changes were introduced by the EU calculator rename.
- No deployment configuration changes were introduced by the Box Capacity Guide modal.

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

## Known Issues
- In this sandbox, `npm run vercel-build` can fail because Turbopack tries to bind a local worker port and the sandbox denies it with `Operation not permitted`. This is an environment restriction, not necessarily an app regression.
- Previously, `next/font/google` could fail local builds when network access was blocked. The project no longer depends on Google font fetching.

### Prisma P1001 on Vercel
If Vercel logs show:
```text
Error: P1001: Can't reach database server at `...neon.tech:5432`
```

Check:
- `DATABASE_URL` is set in the correct Vercel environment.
- `DIRECT_DATABASE_URL` is set if running migrations.
- Neon project, branch, and endpoint are active.
- Connection string includes `sslmode=require`.
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
