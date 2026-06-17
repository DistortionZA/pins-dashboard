import { PRINT_POSITIONS } from "@/components/DesignCard"

// Shared calculator display helpers keep breakdown rows and copy affordances
// aligned across current calculators and future variants.
export const CUSTOMER_QUOTE_COPY_LABEL = "Click to Copy"

export function formatBreakdownAmount(currency: string, value: number) {
  return `${currency}${value.toFixed(2)}`
}

export function formatBreakdownUnitAmount(currency: string, value: number) {
  return `${formatBreakdownAmount(currency, value)}/unit`
}

export function getBreakdownItemLabel(itemLabel: string | undefined, index: number) {
  return itemLabel?.trim() || `Item #${index + 1}`
}

export function getPrintPositionLabel(position: string) {
  return PRINT_POSITIONS.find((item) => item.value === position)?.label || position
}

export function formatPrintBreakdownLabel(position: string, colorCount: number) {
  return `${getPrintPositionLabel(position)} Print (${colorCount} col)`
}

export function formatSubtotalBreakdownLabel(quantity: number) {
  return `Subtotal (${quantity} units, excl VAT)`
}
