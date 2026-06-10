import type { Metadata } from "next"

import CalculatorPageContent from "../CalculatorPageContent"
import { CALCULATOR_PROFILE_CODES } from "@/lib/calculator-profiles"

export const metadata: Metadata = {
  title: "Standard EU Calculator | Pins Dashboard",
  description:
    "Run the Standard EU Calculator to compare production cost, pins pricing, and customer quotes.",
}

export default function StandardEuCalculatorPage() {
  return (
    <CalculatorPageContent
      calculatorCode={CALCULATOR_PROFILE_CODES.STANDARD_EU}
      title="Standard EU Calculator"
    />
  )
}
