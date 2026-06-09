import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"

const CALCULATOR_REFERENCE_TAG = "calculator-reference"

// Shared reference data for the current EU calculator route. Future regional calculators can
// reuse this loader or split out region-specific reference sources as pricing diverges.
async function loadCalculatorReferenceData() {
  const [garments, printPrices, garmentMarkups] = await Promise.all([
    prisma.garment.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.printPrice.findMany({
      orderBy: [{ colorCount: "asc" }, { qtyMin: "asc" }],
    }),
    prisma.garmentMarkup.findMany(),
  ])

  return { garments, printPrices, garmentMarkups }
}

export const getCalculatorReferenceData = unstable_cache(
  loadCalculatorReferenceData,
  ["calculator-reference-data"],
  {
    tags: [CALCULATOR_REFERENCE_TAG],
  }
)

export function getCalculatorReferenceTag() {
  return CALCULATOR_REFERENCE_TAG
}
