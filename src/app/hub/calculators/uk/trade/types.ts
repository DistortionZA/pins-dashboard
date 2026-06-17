import type { Prisma } from "@prisma/client"

export const ukTradeGarmentSelect = {
  id: true,
  code: true,
  altCode: true,
  brandName: true,
  name: true,
  color: true,
  gbpPrice: true,
  tags: true,
} satisfies Prisma.GarmentSelect

export type UkTradeGarment = Prisma.GarmentGetPayload<{
  select: typeof ukTradeGarmentSelect
}>
