# Pins Hub current state (updated 2026-06-16)

## Overview
- Repo: `pins-hub`
- Stack: Next.js 16.2.7 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Prisma 7.8.0, PostgreSQL via `@prisma/adapter-pg` and `pg`.
- App is an internal dark-theme operations hub with red accents and compact tooling surfaces.
- Home route `/` is the hub landing page and already renders the sidebar plus tool navigation cards.

## Actual route surface in code
- `/` -> hub home / tool launcher
- `/hub/calculators`
- `/hub/calculators/eu`
- `/hub/calculators/eu/standard`
- `/hub/calculators/eu/us-clients`
- `/hub/calculators/uk` -> reserved placeholder route
- `/hub/garments`
- `/hub/pk-tax`
- `/hub/referrals`
- `/hub/reference`
- `/ref/[code]`

## Navigation / copy conventions
- Primary back-link copy in current routes is `Back to Hub`.
- EU calculators index uses `Back to Regions`.
- Home navigation card label intentionally remains `Refferals`.
- `src/app/hub/layout.tsx` supplies the shared sidebar layout for hub routes, while `/` uses its own home-shell layout.

## Database / Prisma shape
- PostgreSQL only. `src/lib/db.ts` rejects missing `DATABASE_URL`, rejects `file:` URLs, and blocks localhost DB URLs on Vercel.
- Core models present: `Garment`, `GarmentMarkup`, `CalculatorProfile`, `PrintPrice`, `Order`, `Design`, `DesignPrint`, `Customer`, `Referral`, `LoyaltyTransaction`, plus referral scenario support in schema/client.
- `CALCULATOR_PROFILE_CODES` currently includes `STANDARD_EU` and `US_CLIENTS`.

## Current garment directory state
- Route: `src/app/hub/garments/page.tsx`
- Data loader: `src/app/hub/garments/data.ts` caches directory data and joins garments with markup values from the `STANDARD_EU` calculator profile.
- Server actions: `src/app/hub/garments/actions.ts` handle add/update/delete plus cache/path revalidation.
- UI: `GarmentDirectoryClient` supports search, add modal, edit modal, delete, and shows markup visibility inline.
- Active in-flight schema change: `Garment.gbpPrice` has been added in `prisma/schema.prisma` with migration `prisma/migrations/20260616120000_add_garment_gbp_price/migration.sql`.
- Seed data in `prisma/seed-data.ts` has already been expanded to include `gbpPrice` fields.
- Dirty worktree currently includes garment-related files and the new migration, so treat this area as actively being modified.

## Referral tool state
- Route: `src/app/hub/referrals/page.tsx`
- Current implementation is a planning/simulation tool, not the final live referral system.
- `src/app/hub/referrals/data.ts` is defensive: if the generated Prisma client is behind the schema or the delegate is missing, it returns a setup state instead of crashing.
- Referral UI includes saved scenarios, comparison, summaries, rules, and test-case components.

## Other tool areas
- `pk-tax` is a manual-entry monthly calculator flow.
- `reference` is implemented through `ReferenceClient`.
- Calculator area has live EU routes and a reserved UK route.

## Doc drift to keep in mind
- README route list is broadly right, but current source of truth is the file tree under `src/app`.
- There is no `src/app/hub/page.tsx`; the hub entrypoint is `src/app/page.tsx`.
- Existing AGENTS guidance about Neon/Postgres, VAT 27%, stable calculator logic, and resilient referrals still matches the codebase intent.
