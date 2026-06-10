import NavigationCard from "@/components/NavigationCard"
import Link from "next/link"

export default function EuCalculatorsPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-screen">
      <Link
        href="/hub/calculators"
        className="mb-6 inline-flex items-center text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <svg
          className="mr-2 h-4 w-4"
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
        Back to Regions
      </Link>

      <div className="mb-10 space-y-3">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-400/80">
          EU Calculators
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Choose a calculator
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Open the EU calculator that matches the client type. Trade Calculator
          remains a placeholder for a later release.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <NavigationCard
          href="/hub/calculators/eu/standard"
          title="Standard EU Calculator"
          description="Current EU pricing calculator with the existing production, pins, PK markup, and VAT logic."
          badge="Active"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="16" height="20" x="4" y="2" rx="2" />
              <line x1="8" x2="16" y1="6" y2="6" />
              <path d="M8 11h.01" />
              <path d="M12 11h.01" />
              <path d="M16 11h.01" />
              <path d="M8 16h.01" />
              <path d="M12 16h.01" />
              <path d="M16 16h.01" />
            </svg>
          }
        />
        <NavigationCard
          href="/hub/calculators/eu/us-clients"
          title="US Clients Calculator"
          description="Uses the same calculator flow and pricing logic, with calculator-specific garment markups for US client quotes."
          badge="Active"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="16" height="20" x="4" y="2" rx="2" />
              <line x1="8" x2="16" y1="6" y2="6" />
              <path d="M8 11h.01" />
              <path d="M12 11h.01" />
              <path d="M16 11h.01" />
              <path d="M8 16h.01" />
              <path d="M12 16h.01" />
              <path d="M16 16h.01" />
            </svg>
          }
        />
        <NavigationCard
          title="Trade Calculator"
          description="Placeholder for a future trade-specific calculator profile."
          badge="Coming Soon"
          disabled
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h18" />
              <path d="M6 3h12v18H6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
