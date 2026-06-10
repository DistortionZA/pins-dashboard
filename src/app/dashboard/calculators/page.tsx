import Link from "next/link"

function CalculatorChoiceCard({
  href,
  title,
  status,
  description,
  disabled = false,
}: {
  href?: string
  title: string
  status: string
  description: string
  disabled?: boolean
}) {
  const content = (
    <div
      className={`h-full rounded-2xl border p-6 transition-all ${
        disabled
          ? "border-zinc-800 bg-[#0b0c10]/70 text-zinc-500"
          : "border-zinc-800 bg-[#0b0c10] text-zinc-200 hover:border-red-500/40 hover:shadow-[0_0_25px_rgba(239,68,68,0.1)]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${
            disabled
              ? "border border-zinc-800 bg-zinc-900 text-zinc-500"
              : "border border-red-500/20 bg-red-600/10 text-red-300"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  )

  if (disabled || !href) {
    return content
  }

  return <Link href={href}>{content}</Link>
}

export default function CalculatorsPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-screen">
      <Link
        href="/"
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
        Back to Hub
      </Link>

      <div className="mb-8 space-y-3">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-400/80">
          Price Calculators
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Choose a calculator
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Open the calculator that matches the client profile. Trade Calculator
          remains reserved as a placeholder for a later release.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <CalculatorChoiceCard
          href="/dashboard/calculators/eu"
          title="Standard EU Calculator"
          status="Active"
          description="Current EU pricing calculator with the existing production, pins, PK markup, and VAT logic."
        />
        <CalculatorChoiceCard
          href="/dashboard/calculators/us-clients"
          title="US Clients Calculator"
          status="Active"
          description="Uses the same calculator flow and pricing logic, with calculator-specific garment markups for US client quotes."
        />
        <CalculatorChoiceCard
          title="Trade Calculator"
          status="Coming Soon"
          description="Placeholder for a future trade-specific calculator profile."
          disabled
        />
      </div>
    </div>
  )
}
