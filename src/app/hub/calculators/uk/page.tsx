import NavigationCard from "@/components/NavigationCard"
import Link from "next/link"

export default function UkCalculatorsPage() {
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
          UK Calculators
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Coming Soon
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          No UK calculators are available yet.
        </p>
      </div>

      <div className="max-w-sm">
        <NavigationCard
          title="UK Calculator Suite"
          description="This region is visible in the Hub now, but no UK calculators are available yet."
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
