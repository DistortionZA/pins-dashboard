import { connection } from "next/server"

import BackLink from "@/components/BackLink"
import type { CalculatorProfileCode } from "@/lib/calculator-profiles"

import CalculatorClient from "./CalculatorClient"
import { getCalculatorReferenceData } from "./data"

type CalculatorPageContentProps = {
  calculatorCode: CalculatorProfileCode
  title: string
  backHref: string
}

export default async function CalculatorPageContent({
  calculatorCode,
  title,
  backHref,
}: CalculatorPageContentProps) {
  await connection()

  const { garments, printPrices, garmentMarkups } =
    await getCalculatorReferenceData(calculatorCode)

  return (
    <div className="hub-page-stack">
      <section className="hub-panel hub-page-header flex items-center justify-between gap-4">
        <h1 className="hub-page-header-title mt-0">{title}</h1>

        <BackLink href={backHref}>Back to Calculators</BackLink>
      </section>

      <div className="min-w-0">
        <CalculatorClient
          garments={garments}
          printPrices={printPrices}
          garmentMarkups={garmentMarkups}
          calculatorTitle={title}
        />
      </div>
    </div>
  )
}