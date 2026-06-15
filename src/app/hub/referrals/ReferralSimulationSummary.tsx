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
      <div className="rounded-2xl border border-brand-border bg-brand-panel p-4 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red/80">
              Comparison Summary
            </p>
            <h2 className="mt-2 text-2xl font-bold text-brand-cream">Planning comparison output</h2>
            <p className="mt-2 max-w-3xl text-sm text-brand-muted">
              This view compares active rule cards against your test cases. Export from here when
              the team wants a portable planning snapshot.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopyPlanningSummary}
              className="inline-flex items-center justify-center rounded-xl border border-brand-red/35 bg-brand-red/16 px-4 py-2.5 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
            >
              Copy Planning Summary
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex items-center justify-center rounded-xl border border-brand-border/80 bg-brand-panel-alt px-4 py-2.5 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/40 hover:bg-brand-surface"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Total Points</p>
            <p className="mt-2 text-2xl font-bold text-brand-cream">
              {aggregate.totalPoints.toLocaleString("en-US")}
            </p>
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Cash Value</p>
            <p className="mt-2 text-2xl font-bold text-brand-cream">
              {formatSimulatorMoney(aggregate.totalCashValue, "$")}
            </p>
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Credit Value</p>
            <p className="mt-2 text-2xl font-bold text-brand-cream">
              {formatSimulatorMoney(aggregate.totalCreditValue, "$")}
            </p>
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Discount Rules</p>
            <p className="mt-2 text-2xl font-bold text-brand-cream">
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
                <div className="rounded-xl border border-dashed border-brand-border bg-brand-panel-alt p-4 text-sm text-brand-muted/80">
                  No active rules to compare yet.
                </div>
              ) : (
                activeRules.map((rule) => {
                  const summary = aggregate.ruleSummaries.find((item) => item.ruleId === rule.id)

                  return (
                    <div key={rule.id} className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-brand-cream">{rule.name}</p>
                        <span className="rounded-full border border-brand-red/35 bg-brand-red/16 px-2.5 py-1 text-xs font-semibold text-brand-cream">
                          {summary?.qualifyingCases ?? 0} qualifying
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-brand-muted">
                        {getRuleTypeLabel(rule.ruleType)} · {getRewardTypeLabel(rule.rewardType)} ·{" "}
                        {rule.timeWindowMonths} month{rule.timeWindowMonths === 1 ? "" : "s"}
                      </p>
                      {rule.notes ? <p className="mt-2 text-sm text-brand-muted/80">{rule.notes}</p> : null}
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
                <div className="rounded-xl border border-dashed border-brand-border bg-brand-panel-alt p-4 text-sm text-brand-muted/80">
                  No active spend tiers are enabled yet.
                </div>
              ) : (
                aggregate.qualifiedTierCounts.map((tier) => (
                  <div
                    key={tier.ruleId}
                    className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-panel-alt px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-brand-cream/90">{tier.ruleName}</span>
                    <span className="font-semibold text-brand-cream">{tier.count}</span>
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
              <div className="rounded-xl border border-dashed border-brand-border bg-brand-panel-alt p-4 text-sm text-brand-muted/80">
                Add test cases to compare how different planning rules behave.
              </div>
            ) : (
              testCases.map((testCase) => {
                const result = aggregate.results[testCase.id]

                return (
                  <div key={testCase.id} className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-brand-cream">{testCase.name}</p>
                        <p className="mt-1 text-sm text-brand-muted/80">
                          Spend {formatSimulatorMoney(testCase.spendAmount, "$")} ·{" "}
                          {testCase.orderCount} order{testCase.orderCount === 1 ? "" : "s"} ·{" "}
                          {testCase.referred ? "Referred" : "Direct"}
                        </p>
                      </div>
                      <span className="rounded-full border border-brand-border/80 bg-brand-panel px-2.5 py-1 text-xs font-semibold text-brand-cream/90">
                        {result?.appliedRules.length ?? 0} rule
                        {(result?.appliedRules.length ?? 0) === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border border-brand-border bg-brand-panel p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Points</p>
                        <p className="mt-2 font-semibold text-brand-cream">
                          {result?.pointsTotal.toLocaleString("en-US") ?? "0"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-brand-border bg-brand-panel p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">
                          Cash / Credit
                        </p>
                        <p className="mt-2 font-semibold text-brand-cream">
                          {formatSimulatorMoney(
                            (result?.cashValueTotal ?? 0) + (result?.creditTotal ?? 0),
                            "$",
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border border-brand-border bg-brand-panel p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Tier</p>
                        <p className="mt-2 font-semibold text-brand-cream">{result?.tierName ?? "No tier"}</p>
                      </div>
                    </div>

                    {result?.appliedRules.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.appliedRules.map((rule) => (
                          <span
                            key={`${testCase.id}-${rule.ruleId}`}
                            className="rounded-full border border-brand-red/35 bg-brand-red/16 px-2.5 py-1 text-xs font-semibold text-brand-cream"
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
