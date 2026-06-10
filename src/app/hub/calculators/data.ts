import { unstable_cache } from "next/cache"

import { prisma } from "@/lib/db"
import type { CalculatorProfileCode } from "@/lib/calculator-profiles"

const CALCULATOR_REFERENCE_TAG = "calculator-reference"

async function loadCalculatorReferenceData(calculatorCode: CalculatorProfileCode) {
  const [garments, printPrices, calculatorProfile] = await Promise.all([
    prisma.garment.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.printPrice.findMany({
      orderBy: [{ colorCount: "asc" }, { qtyMin: "asc" }],
    }),
    prisma.calculatorProfile.findUnique({
      where: { code: calculatorCode },
      include: { garmentMarkups: true },
    }),
  ])

  if (!calculatorProfile) {
    throw new Error(`Calculator profile "${calculatorCode}" was not found.`)
  }

  return {
    garments,
    printPrices,
    garmentMarkups: calculatorProfile.garmentMarkups,
  }
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
