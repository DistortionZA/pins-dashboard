import { unstable_cache } from "next/cache"
import type { Garment } from "@prisma/client"

import { prisma } from "@/lib/db"
import { CALCULATOR_PROFILE_CODES } from "@/lib/calculator-profiles"

const GARMENT_DIRECTORY_TAG = "garment-directory"

export type GarmentDirectoryItem = Garment & {
  connectedMarkupValue: number | null
}

async function loadGarmentDirectoryData(): Promise<GarmentDirectoryItem[]> {
  const [garments, garmentMarkups] = await Promise.all([
    prisma.garment.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.garmentMarkup.findMany({
      where: {
        calculatorProfile: {
          code: CALCULATOR_PROFILE_CODES.STANDARD_EU,
        },
      },
    }),
  ])

  const markupByType = new Map(
    garmentMarkups.map((markup) => [markup.garmentType, markup.markupValue])
  )

  return garments.map((garment) => ({
    ...garment,
    connectedMarkupValue: markupByType.get(garment.type) ?? null,
  }))
}

export const getGarmentDirectoryData = unstable_cache(
  loadGarmentDirectoryData,
  ["garment-directory-data"],
  { tags: [GARMENT_DIRECTORY_TAG] }
)

export function getGarmentDirectoryTag() {
  return GARMENT_DIRECTORY_TAG
}
