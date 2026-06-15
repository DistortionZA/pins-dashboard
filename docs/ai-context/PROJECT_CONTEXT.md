# Pins Hub Project Context

## Overview

`pins-hub` is an internal operations app for Pins & Knuckles. It combines pricing calculators, garment reference data, PK Tax calculations, referral planning tools, and a Quick Reference copy surface.

The product direction is now a compact internal SaaS UI, not a marketing-style layout. The app remains dark in both supported themes.

## Active Routes

- `/`
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

## Navigation And Theme

- The hub uses a compact sidebar navigation in `src/components/HubSidebar.tsx`.
- Only usable routes are shown in the sidebar.
- `Order Management` is still unimplemented and should stay hidden from sidebar navigation.
- The app has two persistent local themes:
  - `brand`
  - `classic`
- Theme state is managed by `src/components/theme/HubThemeProvider.tsx`.
- Theme selection is stored in local browser `localStorage` under `pins-hub-theme`.
- The visible theme control is a compact switch in `src/components/theme/ThemeToggle.tsx`.

## Current UI Direction

- Main styling lives in `src/app/globals.css`.
- Shared header density is standardized with:
  - `.hub-page-stack`
  - `.hub-page-header`
  - `.hub-page-header-title`
  - `.hub-page-header-copy`
- Shared cards use `NavigationCard.tsx`.
- Global spacing was tightened so more information is visible above the fold.
- Avoid re-expanding layouts into marketing-style whitespace.

## Home

- Route: `/`
- File: `src/app/page.tsx`
- Main cards:
  - `Price Calculators`
  - `Garment Directory`
  - `PK Tax`
  - `Refferals`
  - `Quick Reference`
- `Order Management` remains a disabled placeholder card on the home page only.

## Calculators

### Route Structure

- `src/app/hub/calculators/page.tsx`
- `src/app/hub/calculators/eu/page.tsx`
- `src/app/hub/calculators/CalculatorPageContent.tsx`
- `src/app/hub/calculators/CalculatorClient.tsx`
- `src/app/hub/calculators/copyFormatters.ts`
- `src/app/hub/calculators/data.ts`

### Important Active Calculator Routes

- `/hub/calculators/eu/standard`
- `/hub/calculators/eu/us-clients`

`US Clients Calculator` is implemented and must remain visible in calculator navigation.

### Pricing Rules

- `VAT` is hardcoded at `27%`.
- `PK Markup` is per-unit and feeds customer pricing before VAT.
- Delivery helper logic must stay separate from main calculator totals.
- Do not refactor working quote logic unless explicitly requested.

### Data Rules

- `getCalculatorReferenceData()` loads garments, print prices, and calculator-profile markups server-side.
- `NECK` prints use fixed unit price `0.7`.
- Valid color counts are `1` to `9`.

## Garment Directory

- Route: `/hub/garments`
- Files:
  - `src/app/hub/garments/page.tsx`
  - `src/app/hub/garments/GarmentDirectoryClient.tsx`
  - `src/app/hub/garments/data.ts`
  - `src/app/hub/garments/actions.ts`

Notes:

- Directory data is cached behind the `garment-directory` tag.
- Garment mutations revalidate garment directory and calculator reference surfaces.

## PK Tax

- Route: `/hub/pk-tax`
- Files:
  - `src/app/hub/pk-tax/page.tsx`
  - `src/app/hub/pk-tax/PkTaxCalculatorClient.tsx`

Notes:

- Manual-entry monthly calculator.
- Not a Netsuite or Monday sync.
- Keep payout and shared-pool logic unchanged unless explicitly requested.

## Referrals

- Route: `/hub/referrals`
- Files:
  - `src/app/hub/referrals/page.tsx`
  - `src/app/hub/referrals/ReferralsClient.tsx`
  - `src/app/hub/referrals/data.ts`
  - `src/app/hub/referrals/actions.ts`
  - `src/app/hub/referrals/constants.ts`

Rules:

- Keep the route resilient if Prisma or referral tables are missing.
- Loyalty changes must flow through `LoyaltyTransaction`.
- Reward logic triggers when status becomes `REWARDED`.
- `/ref/[code]` is structure-only and remains QR-ready.

## Quick Reference

- Route: `/hub/reference`
- Main file: `src/app/hub/reference/ReferenceClient.tsx`
- Static data file: `src/app/hub/reference/referenceData.ts`

Current features:

- Billing, delivery, and import copy blocks
- Search and category filters inside the main Quick Reference header card
- `Custom Message` accordion
- Local browser-only saved messages
- Supplier and logistics email accordion with one-click copy and copy-all

Saved messages:

- storage key: `pins-hub-reference-saved-messages`
- type:

```ts
type SavedMessage = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}
```

Implementation notes:

- Saved messages are stored only in browser `localStorage`.
- Snapshot stability for `useSyncExternalStore` is important.
- The empty snapshot must use a stable shared array reference.

## Database And Runtime

- Prisma schema: `prisma/schema.prisma`
- Database is PostgreSQL only.
- `src/lib/db.ts` requires `DATABASE_URL` and rejects `file:` URLs.
- On Vercel, `DATABASE_URL` must be the Neon pooled URL and not localhost.
- Use `DIRECT_DATABASE_URL` for direct migration access when available.

## Seed State

- Seed files:
  - `prisma/seed.ts`
  - `prisma/seed-data.ts`
- Current calculator profiles:
  - `STANDARD_EU`
  - `US_CLIENTS`

## Key Wording Constraints

Preserve these labels:

- `Back to Hub`
- `Back to Calculators`
- `Back to Regions`
- `Refferals` remains misspelled on the home card for consistency with existing app wording.

## Verification Commands

```bash
npm run lint
npx tsc --noEmit
npm run vercel-build
```
