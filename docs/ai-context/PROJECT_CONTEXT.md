# Pins Hub Project Context

Canonical location: `docs/ai-context/PROJECT_CONTEXT.md`

Github Repo: https://github.com/DistortionZA/pins-hub

`pins-hub` is an internal Pins Hub app for merchandise pricing, garment catalog management, referrals, and related team tools.

## Product Areas
- `Price Calculators`: region-first calculator entry at `/hub/calculators`
- `EU Calculators`: `/hub/calculators/eu`
- `Standard EU Calculator`: `/hub/calculators/eu/standard`
- `US Clients Calculator`: `/hub/calculators/eu/us-clients`
- `UK Calculators`: placeholder route at `/hub/calculators/uk`
- `Garment Directory`: `/hub/garments`
- `PK Tax`: `/hub/pk-tax`
- `Referrals`: `/hub/referrals`

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
npm run build          # prisma generate && next build
npm run vercel-build   # prisma generate && next build
npm run migrate:deploy # prisma migrate deploy
```

## Repository Structure
```text
src/app/
  page.tsx
  layout.tsx
  globals.css
  hub/
    loading.tsx
    calculators/
      page.tsx
      CalculatorPageContent.tsx
      CalculatorClient.tsx
      CalculatorLoading.tsx
      data.ts
      eu/
        page.tsx
        standard/
          page.tsx
          loading.tsx
        us-clients/
          page.tsx
          loading.tsx
      uk/
        page.tsx
    garments/
      page.tsx
      loading.tsx
      data.ts
      actions.ts
      GarmentDirectoryClient.tsx
    pk-tax/
      page.tsx
      PkTaxCalculatorClient.tsx
    referrals/
      page.tsx
      loading.tsx
      data.ts
      actions.ts
      ReferralsClient.tsx
src/components/
  DesignCard.tsx
src/lib/
  db.ts
  calculator-profiles.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
  seed-data.ts
```

## Data Model
Prisma models:
- `Garment`
- `CalculatorProfile`
- `GarmentMarkup`
- `PrintPrice`
- `Order`
- `Design`
- `DesignPrint`
- `Customer`
- `Referral`
- `LoyaltyTransaction`

Calculator profile behavior:
- `STANDARD_EU` powers `/hub/calculators/eu/standard`
- `US_CLIENTS` powers `/hub/calculators/eu/us-clients`

Markup values:
- `STANDARD_EU`: `HOODIE=5`, `TSHIRT=3`, `LONGSLEEVE=3.5`
- `US_CLIENTS`: `HOODIE=4`, `TSHIRT=2`, `LONGSLEEVE=3`

## Calculator Notes
- Calculator pricing logic remains shared.
- VAT is hardcoded at `27%`.
- Neck prints use a fixed unit price of `0.7`.
- PK markup is per-unit and feeds the customer price before VAT.
- Delivery helper logic is separate from calculator totals.
- Pricing and result panels remain hidden until a garment is selected.
- Use `Back to Hub` for hub-level navigation and `Back to Calculators` for calculator drill-down pages where appropriate.

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
- uses `DIRECT_DATABASE_URL` for migrations when available

## Deployment
- Use the Neon pooled URL for `DATABASE_URL`
- Use the direct Neon URL for `DIRECT_DATABASE_URL`
- Do not use `localhost` in Vercel environment variables
- Run `npm run migrate:deploy` separately when the database is reachable
