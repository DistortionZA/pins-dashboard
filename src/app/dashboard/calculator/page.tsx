import type { Metadata } from "next"
import CalculatorClient from "./CalculatorClient"
import Link from "next/link"
import { connection } from "next/server"
import { getCalculatorReferenceData } from "./data"

export const metadata: Metadata = {
  title: "EU Price Calculator | Pins Dashboard",
  description:
    "Run the EU Price Calculator to compare production cost, pins pricing, and customer quotes.",
}

export default async function CalculatorPage() {
  await connection()

  const { garments, printPrices, garmentMarkups } =
    await getCalculatorReferenceData()

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-screen">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-100 mb-6 transition-colors">
        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Hub
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">
        EU Price Calculator
      </h1>

      {/* Keep the current live calculator mounted on /dashboard/calculator until regional routes are introduced. */}
      <CalculatorClient garments={garments} printPrices={printPrices} garmentMarkups={garmentMarkups} />
    </div>
  )
}
