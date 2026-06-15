import {
  buildScenarioComparisonSummary,
  formatSimulatorMoney,
  type ReferralScenarioData,
} from "./simulator"

type ReferralScenarioComparisonProps = {
  scenarios: ReferralScenarioData[]
  onCopy: (summary: string) => void
}

export default function ReferralScenarioComparison({
  scenarios,
  onCopy,
}: ReferralScenarioComparisonProps) {
  const summary = buildScenarioComparisonSummary(scenarios)

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red/80">
            Scenario Comparison
          </p>
          <h3 className="mt-2 text-xl font-bold text-brand-cream">Saved scenarios side by side</h3>
          <p className="mt-2 max-w-3xl text-sm text-brand-muted">
            Compare named planning models without touching live referral or loyalty data.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCopy(summary)}
          className="inline-flex items-center justify-center rounded-xl border border-brand-red/35 bg-brand-red/16 px-4 py-2.5 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
        >
          Copy Comparison Summary
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {scenarios.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-border bg-brand-panel-alt p-4 text-sm text-brand-muted/80">
            Save a scenario to unlock side-by-side planning comparison.
          </div>
        ) : (
          scenarios.map((scenario) => {
            const activeRules = scenario.rules.filter((rule) => rule.enabled).length

            return (
              <div key={scenario.id} className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-brand-cream">{scenario.name}</p>
                    <p className="mt-1 text-xs text-brand-muted/80">
                      Updated {new Date(scenario.updatedAt).toLocaleString("en-GB")}
                    </p>
                    {scenario.notes.trim() ? (
                      <p className="mt-2 text-sm text-brand-muted">{scenario.notes}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-brand-border bg-brand-panel px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted/80">
                        Active Rules
                      </p>
                      <p className="mt-1 font-semibold text-brand-cream">{activeRules}</p>
                    </div>
                    <div className="rounded-lg border border-brand-border bg-brand-panel px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted/80">Points</p>
                      <p className="mt-1 font-semibold text-brand-cream">
                        {scenario.aggregate.totalPoints.toLocaleString("en-US")}
                      </p>
                    </div>
                    <div className="rounded-lg border border-brand-border bg-brand-panel px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted/80">
                        Cash / Credit
                      </p>
                      <p className="mt-1 font-semibold text-brand-cream">
                        {formatSimulatorMoney(
                          scenario.aggregate.totalCashValue + scenario.aggregate.totalCreditValue,
                          "$",
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-brand-border bg-brand-panel px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted/80">
                        Test Cases
                      </p>
                      <p className="mt-1 font-semibold text-brand-cream">{scenario.testCases.length}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted/80">
                    Customers Qualifying Per Tier
                  </p>
                  {scenario.aggregate.qualifiedTierCounts.length === 0 ? (
                    <p className="text-sm text-brand-muted/80">No spend tiers enabled in this scenario.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {scenario.aggregate.qualifiedTierCounts.map((tier) => (
                        <span
                          key={`${scenario.id}-${tier.ruleId}`}
                          className="rounded-full border border-brand-border/80 bg-brand-panel px-2.5 py-1 text-xs font-semibold text-brand-cream/90"
                        >
                          {tier.ruleName}: {tier.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
