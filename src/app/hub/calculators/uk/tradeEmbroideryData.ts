export const UK_TRADE_EMBROIDERY_SETUP_PER_ITEM = 30

export const UK_TRADE_EMBROIDERY_QUANTITY_TIERS = [
  50,
  100,
  200,
  500,
  1000,
  2500,
] as const

export const UK_TRADE_EMBROIDERY_STITCH_ROWS = [
  7000,
  8000,
  9000,
  10000,
  11000,
  12000,
  13000,
  14000,
  15000,
] as const

export const UK_TRADE_EMBROIDERY_EXTRA_1000_STITCHES_KEY =
  "EXTRA_1000_STITCHES"

export const UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT = 7000
export const UK_TRADE_EMBROIDERY_MAX_BASE_STITCH_COUNT = 15000

export type UkTradeEmbroideryQuantityTier =
  (typeof UK_TRADE_EMBROIDERY_QUANTITY_TIERS)[number]

export type UkTradeEmbroideryStitchRow =
  (typeof UK_TRADE_EMBROIDERY_STITCH_ROWS)[number]

type UkTradeEmbroideryPriceRow = {
  stitchCount:
    | UkTradeEmbroideryStitchRow
    | typeof UK_TRADE_EMBROIDERY_EXTRA_1000_STITCHES_KEY
  pricesByTier: Record<UkTradeEmbroideryQuantityTier, number>
}

export const ukTradeEmbroideryPrices: readonly UkTradeEmbroideryPriceRow[] = [
  {
    stitchCount: 7000,
    pricesByTier: {
      50: 2.15,
      100: 2.04,
      200: 1.87,
      500: 1.82,
      1000: 1.82,
      2500: 1.82,
    },
  },
  {
    stitchCount: 8000,
    pricesByTier: {
      50: 2.37,
      100: 2.27,
      200: 2.1,
      500: 2.04,
      1000: 2.03,
      2500: 2.03,
    },
  },
  {
    stitchCount: 9000,
    pricesByTier: {
      50: 2.59,
      100: 2.49,
      200: 2.32,
      500: 2.27,
      1000: 2.24,
      2500: 2.24,
    },
  },
  {
    stitchCount: 10000,
    pricesByTier: {
      50: 2.82,
      100: 2.71,
      200: 2.54,
      500: 2.49,
      1000: 2.46,
      2500: 2.46,
    },
  },
  {
    stitchCount: 11000,
    pricesByTier: {
      50: 3.04,
      100: 2.93,
      200: 2.76,
      500: 2.71,
      1000: 2.67,
      2500: 2.67,
    },
  },
  {
    stitchCount: 12000,
    pricesByTier: {
      50: 3.26,
      100: 3.16,
      200: 2.99,
      500: 2.93,
      1000: 2.88,
      2500: 2.88,
    },
  },
  {
    stitchCount: 13000,
    pricesByTier: {
      50: 3.48,
      100: 3.38,
      200: 3.21,
      500: 3.16,
      1000: 3.09,
      2500: 3.09,
    },
  },
  {
    stitchCount: 14000,
    pricesByTier: {
      50: 3.71,
      100: 3.6,
      200: 3.43,
      500: 3.38,
      1000: 3.3,
      2500: 3.3,
    },
  },
  {
    stitchCount: 15000,
    pricesByTier: {
      50: 3.93,
      100: 3.82,
      200: 3.65,
      500: 3.6,
      1000: 3.52,
      2500: 3.52,
    },
  },
  {
    stitchCount: UK_TRADE_EMBROIDERY_EXTRA_1000_STITCHES_KEY,
    pricesByTier: {
      50: 0.21,
      100: 0.2,
      200: 0.19,
      500: 0.18,
      1000: 0.17,
      2500: 0.16,
    },
  },
] as const

function getUkTradeEmbroideryQuantityTier(
  quantity: number,
): UkTradeEmbroideryQuantityTier | null {
  return (
    [...UK_TRADE_EMBROIDERY_QUANTITY_TIERS]
      .reverse()
      .find((tier) => quantity >= tier) ?? null
  )
}

function getEmbroideryRowUnitPrice(
  stitchCount:
    | UkTradeEmbroideryStitchRow
    | typeof UK_TRADE_EMBROIDERY_EXTRA_1000_STITCHES_KEY,
  quantityTier: UkTradeEmbroideryQuantityTier,
) {
  const row = ukTradeEmbroideryPrices.find(
    (priceRow) => priceRow.stitchCount === stitchCount,
  )

  return row?.pricesByTier[quantityTier] ?? 0
}

export function normalizeUkTradeEmbroideryStitchCount(stitchCount: number) {
  if (!Number.isFinite(stitchCount)) return UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT

  return Math.max(
    UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT,
    Math.ceil(stitchCount),
  )
}

export function getUkTradeEmbroideryPrice(
  quantity: number,
  stitchCount: number,
) {
  const quantityTier = getUkTradeEmbroideryQuantityTier(quantity)

  if (quantityTier === null) {
    return {
      quantityTier: null,
      pricingStitchCount: null,
      extraStitchBlocks: 0,
      unitPrice: null,
    }
  }

  const normalizedStitchCount =
    normalizeUkTradeEmbroideryStitchCount(stitchCount)

  const pricingStitchCount =
    normalizedStitchCount > UK_TRADE_EMBROIDERY_MAX_BASE_STITCH_COUNT
      ? UK_TRADE_EMBROIDERY_MAX_BASE_STITCH_COUNT
      : (UK_TRADE_EMBROIDERY_STITCH_ROWS.find(
          (row) => normalizedStitchCount <= row,
        ) ?? UK_TRADE_EMBROIDERY_MAX_BASE_STITCH_COUNT)

  const extraStitchBlocks =
    normalizedStitchCount > UK_TRADE_EMBROIDERY_MAX_BASE_STITCH_COUNT
      ? Math.ceil(
          (normalizedStitchCount -
            UK_TRADE_EMBROIDERY_MAX_BASE_STITCH_COUNT) /
            1000,
        )
      : 0

  const baseUnitPrice = getEmbroideryRowUnitPrice(
    pricingStitchCount,
    quantityTier,
  )
  const extraUnitPrice = getEmbroideryRowUnitPrice(
    UK_TRADE_EMBROIDERY_EXTRA_1000_STITCHES_KEY,
    quantityTier,
  )

  return {
    quantityTier,
    pricingStitchCount,
    extraStitchBlocks,
    unitPrice: baseUnitPrice + extraStitchBlocks * extraUnitPrice,
  }
}
