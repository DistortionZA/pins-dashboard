import Link from "next/link"
import { connection } from "next/server"

import CalculatorClient from "../calculator/CalculatorClient"
import { getCalculatorReferenceData } from "./data"
import type { CalculatorProfileCode } from "@/lib/calculator-profiles"

type CalculatorPageContentProps = {
  calculatorCode: CalculatorProfileCode
  title: string
}

export default async function CalculatorPageContent({
  calculatorCode,
  title,
}: CalculatorPageContentProps) {
  await connection()

  const { garments, printPrices, garmentMarkups } =
    await getCalculatorReferenceData(calculatorCode)

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-screen">
      <Link
        href="/dashboard/calculators"
        className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-100 mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Calculators
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">
        {title}
      </h1>

      <CalculatorClient
        garments={garments}
        printPrices={printPrices}
        garmentMarkups={garmentMarkups}
        calculatorTitle={title}
      />
    </div>
  )
}
