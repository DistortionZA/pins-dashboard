"use client"

import { toast } from "sonner"
import { useMemo, useState } from "react"

import {
  CUSTOMER_QUOTE_COPY_LABEL,
  formatBreakdownAmount,
  formatPrintBreakdownLabel,
  formatBreakdownUnitAmount,
  formatSubtotalBreakdownLabel,
  getBreakdownItemLabel,
} from "../../displayStandards"
import { formatUkTradeQuoteCopy } from "../../copyFormatters"
import {
  getUkTradeScreenPrintPrice,
  UK_TRADE_SCREEN_SETUP_PER_COLOUR,
} from "../tradeScreenPrintData"
import UkTradeDesignCard, { type UkTradeDesign } from "./UkTradeDesignCard"
import type { UkTradeGarment } from "./types"

type UkTradeItemBreakdown = {
  garmentCost: number
  printCost: number
  setupCost: number
  totalCost: number
  costPerUnit: number
  quantity: number
  garmentName?: string
  hasValidPrice: boolean
  missingReasons: string[]
}

const CURRENCY = "£"

function createDefaultDesign(): UkTradeDesign {
  return {
    quantity: 50,
    positions: { FRONT: 1 },
  }
}

function getSelectedPositionEntries(positions: Record<string, number>) {
  return Object.entries(positions).filter(([, colorCount]) => colorCount > 0)
}

function getGarmentDisplayName(garment?: UkTradeGarment) {
  if (!garment) return "No garment"

  return [garment.brandName, garment.name, garment.color].filter(Boolean).join(" - ")
}

function calculateUkTradeItemBreakdown(
  design: UkTradeDesign,
  garments: UkTradeGarment[],
): UkTradeItemBreakdown {
  const garment = garments.find((item) => item.id === design.garmentId)
  const selectedPositions = getSelectedPositionEntries(design.positions)
  const missingReasons: string[] = []

  if (!garment) {
    missingReasons.push("Select garment.")
  } else if (typeof garment.gbpPrice !== "number") {
    missingReasons.push("Selected garment missing GBP price.")
  }

  if (design.quantity < 50) {
    missingReasons.push("Minimum quantity 50.")
  }

  if (selectedPositions.length === 0) {
    missingReasons.push("Select at least one print position.")
  }

  let printCost = 0
  let setupCost = 0

  for (const [, colorCount] of selectedPositions) {
    const price = getUkTradeScreenPrintPrice(design.quantity, colorCount)
    printCost += (price.unitPrice ?? 0) * design.quantity
    setupCost += colorCount * UK_TRADE_SCREEN_SETUP_PER_COLOUR
  }

  const garmentCost =
    garment && typeof garment.gbpPrice === "number" ? garment.gbpPrice * design.quantity : 0
  const totalCost = garmentCost + printCost + setupCost
  const hasValidPrice = missingReasons.length === 0

  return {
    garmentCost,
    printCost,
    setupCost,
    totalCost,
    costPerUnit: hasValidPrice && design.quantity > 0 ? totalCost / design.quantity : 0,
    quantity: design.quantity,
    garmentName: getGarmentDisplayName(garment),
    hasValidPrice,
    missingReasons,
  }
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.left = "-9999px"
  textArea.style.top = "-9999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  document.execCommand("copy")
  document.body.removeChild(textArea)
}

export default function UkTradeCalculatorClient({
  garments,
}: {
  garments: UkTradeGarment[]
}) {
  const [designs, setDesigns] = useState<UkTradeDesign[]>([createDefaultDesign()])

  function addDesign() {
    setDesigns((current) => [...current, createDefaultDesign()])
  }

  function updateDesign(index: number, updated: UkTradeDesign) {
    setDesigns((current) => {
      const next = [...current]
      next[index] = updated
      return next
    })
  }

  function removeDesign(index: number) {
    setDesigns((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  const breakdowns = useMemo(
    () => designs.map((design) => calculateUkTradeItemBreakdown(design, garments)),
    [designs, garments],
  )

  const hasAnyGarmentSelected = designs.some((design) => Boolean(design.garmentId))

  const totals = useMemo(() => {
    let garmentCost = 0
    let printCost = 0
    let setupCost = 0
    let totalCost = 0
    let totalQuantity = 0
    let validItemCount = 0

    for (const breakdown of breakdowns) {
      garmentCost += breakdown.garmentCost
      printCost += breakdown.printCost
      setupCost += breakdown.setupCost
      totalCost += breakdown.totalCost

      if (breakdown.hasValidPrice) {
        totalQuantity += breakdown.quantity
        validItemCount += 1
      }
    }

    return {
      garmentCost,
      printCost,
      setupCost,
      totalCost,
      totalQuantity,
      validItemCount,
      costPerUnit: totalQuantity > 0 ? totalCost / totalQuantity : 0,
    }
  }, [breakdowns])

  async function handleCopyClick() {
    if (!hasAnyGarmentSelected) return

    const body = formatUkTradeQuoteCopy({
      designs,
      breakdowns,
      garments,
      currency: CURRENCY,
    })

    if (!body.trim()) return

    await copyToClipboard(body)
    toast.success("Quote copied to clipboard")
  }

  return (
    <div className="grid w-full min-w-0 gap-5 overflow-x-hidden xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
      <div className="max-w-[900px] space-y-4">
        {designs.map((design, index) => (
          <UkTradeDesignCard
            key={index}
            design={design}
            garments={garments}
            itemNumber={index + 1}
            onChange={(updated) => updateDesign(index, updated)}
            onRemove={designs.length > 1 ? () => removeDesign(index) : undefined}
          />
        ))}

        <div className="mt-2">
          <button
            onClick={addDesign}
            className="hub-accent-button flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
        <div
          className={`rounded-2xl border border-brand-border/80 bg-brand-panel-alt/30 p-4 transition-opacity ${
            hasAnyGarmentSelected ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-border bg-brand-panel p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted/80">
                Garment Cost
              </p>
              <p className="mt-3 text-4xl font-black tabular-nums text-brand-cream/90">
                {formatBreakdownAmount(CURRENCY, totals.garmentCost)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyClick}
              className="hub-info-card bg-brand-panel rounded-2xl flex flex-col overflow-hidden text-left transition-all duration-300 cursor-pointer"
              aria-label="Copy UK trade quote"
            >
              <div className="p-6 flex-grow">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-brand-muted/80 text-xs font-bold uppercase tracking-widest">
                    Total Cost
                  </p>
                  <span className="hub-info-pill text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    {CUSTOMER_QUOTE_COPY_LABEL}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="hub-info-text text-4xl md:text-5xl font-black tabular-nums">
                    {formatBreakdownAmount(CURRENCY, totals.totalCost)}
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-border bg-brand-panel shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-brand-border bg-brand-panel-alt px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                Breakdown
              </h2>
              <span className="text-brand-muted">⌄</span>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="space-y-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Print Cost</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatBreakdownAmount(CURRENCY, totals.printCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Setup Cost</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatBreakdownAmount(CURRENCY, totals.setupCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Total Unit Cost (excl VAT)</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatBreakdownUnitAmount(CURRENCY, totals.costPerUnit)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-cream/90">
                  <span className="font-semibold">
                    {formatSubtotalBreakdownLabel(totals.totalQuantity)}
                  </span>
                  <span className="font-mono font-semibold text-sky-300">
                    {formatBreakdownAmount(CURRENCY, totals.totalCost)}
                  </span>
                </div>

                <p className="text-xs text-brand-muted">
                  Based on {totals.totalQuantity} valid unit
                  {totals.totalQuantity === 1 ? "" : "s"} across {totals.validItemCount} valid
                  {" "}item
                  {totals.validItemCount === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="border-t border-brand-border pt-5">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-muted">
                  Item Breakdown
                </h3>

                <div className="space-y-4">
                  {breakdowns.map((breakdown, index) => {
                    const design = designs[index]
                    const garment = garments.find((item) => item.id === design?.garmentId)

                    if (!design) return null

                    return (
                      <div
                        key={index}
                        className="space-y-3 border-b border-brand-border/80 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-brand-muted/80">
                          <span>
                            {getBreakdownItemLabel(design.itemLabel, index)} -{" "}
                            {breakdown.garmentName}
                          </span>
                          <span className="shrink-0 whitespace-nowrap font-mono text-brand-muted">
                            {breakdown.quantity} units
                          </span>
                        </div>

                        {garment && typeof garment.gbpPrice === "number" ? (
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                            <span>Garment Base Price</span>
                            <span className="font-mono text-brand-cream/90">
                              {formatBreakdownUnitAmount(CURRENCY, garment.gbpPrice)}
                            </span>
                          </div>
                        ) : null}

                        {getSelectedPositionEntries(design.positions).map(([position, colorCount]) => {
                          const unitPrice = getUkTradeScreenPrintPrice(design.quantity, colorCount)

                          return (
                            <div
                              key={position}
                              className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted"
                            >
                              <span>{formatPrintBreakdownLabel(position, colorCount)}</span>
                              <span className="font-mono text-brand-cream/90">
                                {formatBreakdownUnitAmount(CURRENCY, unitPrice.unitPrice ?? 0)}
                              </span>
                            </div>
                          )
                        })}

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                          <span>Setup Cost</span>
                          <span className="font-mono text-brand-cream/90">
                            {formatBreakdownAmount(CURRENCY, breakdown.setupCost)}
                          </span>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                          <span>Total Unit Cost (excl VAT)</span>
                          <span className="font-mono text-brand-cream/90">
                            {formatBreakdownUnitAmount(CURRENCY, breakdown.costPerUnit)}
                          </span>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-cream/90">
                          <span className="font-semibold">
                            {formatSubtotalBreakdownLabel(breakdown.quantity)}
                          </span>
                          <span className="font-mono font-semibold text-sky-300">
                            {formatBreakdownAmount(CURRENCY, breakdown.totalCost)}
                          </span>
                        </div>

                        {!breakdown.hasValidPrice ? (
                          <div className="rounded-xl border border-brand-red/35 bg-brand-red/10 p-3">
                            <ul className="space-y-1 text-sm text-brand-cream/90">
                              {breakdown.missingReasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
