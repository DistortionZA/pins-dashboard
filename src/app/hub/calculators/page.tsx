import BackLink from "@/components/BackLink"
import NavigationCard from "@/components/NavigationCard"

export default function CalculatorsPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Calculators</p>
        <h1 className="hub-page-header-title">Price Calculators</h1>
        <p className="hub-page-header-copy">Open the live calculator routes below.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <NavigationCard
          href="/hub/calculators/eu"
          title="EU"
          description="Existing EU pricing tools, including the standard calculator and the US clients quote flow."
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
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>
          }
        />

        <NavigationCard
          href="/hub/calculators/uk"
          title="UK"
          description="UK Trade Calculator plus reserved space for the future Standard UK Calculator."
          badge="Reserved"
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
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
              <path d="M8 3v18" />
              <path d="M16 3v18" />
            </svg>
          }
        />
      </section>
    </div>
  )
}
