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
    <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400/80">
            Scenario Comparison
          </p>
          <h3 className="mt-2 text-xl font-bold text-white">Saved scenarios side by side</h3>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Compare named planning models without touching live referral or loyalty data.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCopy(summary)}
          className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
        >
          Copy Comparison Summary
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {scenarios.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-[#111219] p-4 text-sm text-zinc-500">
            Save a scenario to unlock side-by-side planning comparison.
          </div>
        ) : (
          scenarios.map((scenario) => {
            const activeRules = scenario.rules.filter((rule) => rule.enabled).length

            return (
              <div key={scenario.id} className="rounded-xl border border-zinc-800 bg-[#111219] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-white">{scenario.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Updated {new Date(scenario.updatedAt).toLocaleString("en-GB")}
                    </p>
                    {scenario.notes.trim() ? (
                      <p className="mt-2 text-sm text-zinc-400">{scenario.notes}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                        Active Rules
                      </p>
                      <p className="mt-1 font-semibold text-white">{activeRules}</p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Points</p>
                      <p className="mt-1 font-semibold text-white">
                        {scenario.aggregate.totalPoints.toLocaleString("en-US")}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                        Cash / Credit
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {formatSimulatorMoney(
                          scenario.aggregate.totalCashValue + scenario.aggregate.totalCreditValue,
                          "$",
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                        Test Cases
                      </p>
                      <p className="mt-1 font-semibold text-white">{scenario.testCases.length}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Customers Qualifying Per Tier
                  </p>
                  {scenario.aggregate.qualifiedTierCounts.length === 0 ? (
                    <p className="text-sm text-zinc-500">No spend tiers enabled in this scenario.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {scenario.aggregate.qualifiedTierCounts.map((tier) => (
                        <span
                          key={`${scenario.id}-${tier.ruleId}`}
                          className="rounded-full border border-zinc-700 bg-[#0b0c10] px-2.5 py-1 text-xs font-semibold text-zinc-300"
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
