import type { Metadata } from "next"

import CalculatorPageContent from "../../CalculatorPageContent"
import { CALCULATOR_PROFILE_CODES } from "@/lib/calculator-profiles"

export const metadata: Metadata = {
  title: "US Clients Calculator | Pins Hub",
  description:
    "Run the US Clients Calculator to compare production cost, pins pricing, and customer quotes.",
}

export default function UsClientsCalculatorPage() {
  return (
    <CalculatorPageContent
      calculatorCode={CALCULATOR_PROFILE_CODES.US_CLIENTS}
      title="US Clients Calculator"
      backHref="/hub/calculators/eu"
    />
  )
}
