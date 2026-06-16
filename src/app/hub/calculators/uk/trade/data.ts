import { unstable_cache } from "next/cache"

import type { Garment } from "@prisma/client"

import { prisma } from "@/lib/db"

const UK_TRADE_GARMENTS_TAG = "uk-trade-garments"

async function loadUkTradeCalculatorGarments(): Promise<Garment[]> {
  return prisma.garment.findMany({
    orderBy: { name: "asc" },
  })
}

export const getUkTradeCalculatorGarments = unstable_cache(
  loadUkTradeCalculatorGarments,
  ["uk-trade-calculator-garments"],
  { tags: [UK_TRADE_GARMENTS_TAG] },
)

export function getUkTradeGarmentsTag() {
  return UK_TRADE_GARMENTS_TAG
}
