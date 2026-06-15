import BackLink from "@/components/BackLink"
import NavigationCard from "@/components/NavigationCard"

export default function UkCalculatorsPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/calculators">Back to Regions</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">UK Calculators</p>
        <h1 className="hub-page-header-title">UK Calculator Menu</h1>
        <p className="hub-page-header-copy max-w-2xl">
          No UK calculators are available yet. This area stays reserved for the future UK pricing
          suite.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <NavigationCard
          title="UK Calculator Suite"
          description="This slot remains disabled until UK calculator flows are implemented."
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
