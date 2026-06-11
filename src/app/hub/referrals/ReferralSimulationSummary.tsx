import AccordionSection from "./AccordionSection"
import ReferralScenarioComparison from "./ReferralScenarioComparison"
import {
  formatSimulatorMoney,
  getRewardTypeLabel,
  getRuleTypeLabel,
  type ReferralRuleCardData,
  type ReferralScenarioData,
  type ReferralTestCaseData,
  type SimulatorAggregate,
} from "./simulator"

type ReferralSimulationSummaryProps = {
  rules: ReferralRuleCardData[]
  testCases: ReferralTestCaseData[]
  aggregate: SimulatorAggregate
  savedScenarios: ReferralScenarioData[]
  onCopyPlanningSummary: () => void
  onExportJson: () => void
  onCopyScenarioComparison: (summary: string) => void
}

export default function ReferralSimulationSummary({
  rules,
  testCases,
  aggregate,
  savedScenarios,
  onCopyPlanningSummary,
  onExportJson,
  onCopyScenarioComparison,
}: ReferralSimulationSummaryProps) {
  const activeRules = rules.filter((rule) => rule.enabled)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-4 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400/80">
              Comparison Summary
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Planning comparison output</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              This view compares active rule cards against your test cases. Export from here when
              the team wants a portable planning snapshot.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopyPlanningSummary}
              className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
            >
              Copy Planning Summary
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-[#111219] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-[#171922]"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-[#111219] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Points</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {aggregate.totalPoints.toLocaleString("en-US")}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#111219] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cash Value</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatSimulatorMoney(aggregate.totalCashValue, "$")}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#111219] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Credit Value</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatSimulatorMoney(aggregate.totalCreditValue, "$")}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#111219] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Discount Rules</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {aggregate.totalDiscountPercent.toLocaleString("en-US")}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <AccordionSection
            title="Active Rules"
            badge={`${activeRules.length} Active Rules`}
            summary="Current live comparison set."
            // defaultOpen
          >
            <div className="space-y-3">
              {activeRules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-[#111219] p-4 text-sm text-zinc-500">
                  No active rules to compare yet.
                </div>
              ) : (
                activeRules.map((rule) => {
                  const summary = aggregate.ruleSummaries.find((item) => item.ruleId === rule.id)

                  return (
                    <div key={rule.id} className="rounded-xl border border-zinc-800 bg-[#111219] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-white">{rule.name}</p>
                        <span className="rounded-full border border-red-500/20 bg-red-600/10 px-2.5 py-1 text-xs font-semibold text-red-300">
                          {summary?.qualifyingCases ?? 0} qualifying
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">
                        {getRuleTypeLabel(rule.ruleType)} · {getRewardTypeLabel(rule.rewardType)} ·{" "}
                        {rule.timeWindowMonths} month{rule.timeWindowMonths === 1 ? "" : "s"}
                      </p>
                      {rule.notes ? <p className="mt-2 text-sm text-zinc-500">{rule.notes}</p> : null}
                    </div>
                  )
                })
              )}
            </div>
          </AccordionSection>

          <AccordionSection
            title="Tier Qualification Counts"
            badge={`${aggregate.qualifiedTierCounts.length} Tiers`}
            summary="How many test cases qualify for each active spend tier."
          >
            <div className="space-y-3">
              {aggregate.qualifiedTierCounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-[#111219] p-4 text-sm text-zinc-500">
                  No active spend tiers are enabled yet.
                </div>
              ) : (
                aggregate.qualifiedTierCounts.map((tier) => (
                  <div
                    key={tier.ruleId}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#111219] px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-zinc-300">{tier.ruleName}</span>
                    <span className="font-semibold text-white">{tier.count}</span>
                  </div>
                ))
              )}
            </div>
          </AccordionSection>
        </div>

        <AccordionSection
          title="Test Case Outcomes"
          badge={`${testCases.length} Cases`}
          summary="Projected outcomes from the current rule set."
          // defaultOpen
        >
          <div className="space-y-3">
            {testCases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-[#111219] p-4 text-sm text-zinc-500">
                Add test cases to compare how different planning rules behave.
              </div>
            ) : (
              testCases.map((testCase) => {
                const result = aggregate.results[testCase.id]

                return (
                  <div key={testCase.id} className="rounded-xl border border-zinc-800 bg-[#111219] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{testCase.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          Spend {formatSimulatorMoney(testCase.spendAmount, "$")} ·{" "}
                          {testCase.orderCount} order{testCase.orderCount === 1 ? "" : "s"} ·{" "}
                          {testCase.referred ? "Referred" : "Direct"}
                        </p>
                      </div>
                      <span className="rounded-full border border-zinc-700 bg-[#0b0c10] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                        {result?.appliedRules.length ?? 0} rule
                        {(result?.appliedRules.length ?? 0) === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Points</p>
                        <p className="mt-2 font-semibold text-white">
                          {result?.pointsTotal.toLocaleString("en-US") ?? "0"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Cash / Credit
                        </p>
                        <p className="mt-2 font-semibold text-white">
                          {formatSimulatorMoney(
                            (result?.cashValueTotal ?? 0) + (result?.creditTotal ?? 0),
                            "$",
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Tier</p>
                        <p className="mt-2 font-semibold text-white">{result?.tierName ?? "No tier"}</p>
                      </div>
                    </div>

                    {result?.appliedRules.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.appliedRules.map((rule) => (
                          <span
                            key={`${testCase.id}-${rule.ruleId}`}
                            className="rounded-full border border-red-500/20 bg-red-600/10 px-2.5 py-1 text-xs font-semibold text-red-300"
                          >
                            {rule.ruleName}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </AccordionSection>
      </div>

      <AccordionSection
        title="Saved Scenario Comparison"
        badge={`${savedScenarios.length} Saved Scenarios`}
        summary="Side-by-side saved planning models."
      >
        <ReferralScenarioComparison scenarios={savedScenarios} onCopy={onCopyScenarioComparison} />
      </AccordionSection>
    </div>
  )
}
