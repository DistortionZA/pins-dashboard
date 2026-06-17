import { unstable_cache } from "next/cache"

import { prisma } from "@/lib/db"

import { ukTradeGarmentSelect, type UkTradeGarment } from "./types"

const UK_TRADE_GARMENTS_TAG = "uk-trade-garments"

async function loadUkTradeCalculatorGarments(): Promise<UkTradeGarment[]> {
  return prisma.garment.findMany({
    orderBy: { name: "asc" },
    select: ukTradeGarmentSelect,
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
