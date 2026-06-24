import type { Metadata } from "next"
import { connection } from "next/server"

import BackLink from "@/components/BackLink"

import UkTradeCalculatorClient from "./UkTradeCalculatorClient"
import { getUkTradeCalculatorGarments } from "./data"

export const metadata: Metadata = {
  title: "UK Trade Calculator | Pins Hub",
  description:
    "Run the UK trade screen-print calculator for garment, print, and setup costs.",
}

export default async function UkTradeCalculatorPage() {
  await connection()
  const garments = await getUkTradeCalculatorGarments()

  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/calculators/uk">Back to UK Trade Calculator</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">UK Trade</p>
        <h1 className="hub-page-header-title">UK Trade Calculator</h1>
        <p className="hub-page-header-copy max-w-2xl">
          UK trade screen-print pricing using UK quantity tiers, per-colour
          setup charges, and garment GBP costs.
        </p>
      </section>

      <div className="min-w-0">
        <UkTradeCalculatorClient garments={garments} />
      </div>
    </div>
  )
}
