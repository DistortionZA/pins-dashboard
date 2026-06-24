import BackLink from "@/components/BackLink"
import NavigationCard from "@/components/NavigationCard"

export default function UkCalculatorsPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/calculators">Back to Regions</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">UK Trade</p>
        <h1 className="hub-page-header-title">UK Trade Calculator</h1>
        <p className="hub-page-header-copy max-w-2xl">
          Open the UK trade screen-print calculator below. Standard UK
          calculator flows stay reserved until they are implemented.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <NavigationCard
          href="/hub/calculators/uk/trade"
          title="UK Trade Calculator"
          description="UK trade screen-print calculator using UK quantity tiers, setup charges, and garment GBP costs."
          badge="Active"
          icon={
            <>
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </>
          }
        />
      </div>
    </div>
  )
}
