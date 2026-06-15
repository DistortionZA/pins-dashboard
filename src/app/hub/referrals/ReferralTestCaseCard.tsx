import {
  formatSimulatorMoney,
  type ReferralTestCaseData,
  type TestCaseSimulationResult,
} from "./simulator"

type ReferrerOption = {
  value: string
  label: string
}

type ReferralTestCaseCardProps = {
  testCase: ReferralTestCaseData
  result: TestCaseSimulationResult | undefined
  referrerOptions: ReferrerOption[]
  onChange: (testCase: ReferralTestCaseData) => void
  onDelete: (testCaseId: string) => void
}

function parseNonNegativeNumber(value: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

export default function ReferralTestCaseCard({
  testCase,
  result,
  referrerOptions,
  onChange,
  onDelete,
}: ReferralTestCaseCardProps) {
  const update = (patch: Partial<ReferralTestCaseData>) => onChange({ ...testCase, ...patch })

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-brand-border/80 bg-brand-panel-alt px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">
                {testCase.referred ? "Referred" : "Direct"}
              </span>
              {testCase.manualBonusEligible ? (
                <span className="rounded-full border border-brand-red/35 bg-brand-red/16 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-cream">
                  Manual Bonus Candidate
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-brand-muted/80">
              This scenario is simulated only. No live loyalty balance is changed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(testCase.id)}
            className="rounded-lg border border-brand-red/35 bg-brand-red/16 px-3 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
          >
            Delete
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-muted">
              Brand / Customer Name
            </label>
            <input
              type="text"
              value={testCase.name}
              onChange={(event) => update({ name: event.target.value })}
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Spend Amount</label>
            <input
              min={0}
              type="number"
              value={testCase.spendAmount}
              onChange={(event) =>
                update({ spendAmount: parseNonNegativeNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Orders</label>
            <input
              min={0}
              type="number"
              value={testCase.orderCount}
              onChange={(event) =>
                update({ orderCount: parseNonNegativeNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-brand-cream/90">
              <span>Referred customer</span>
              <input
                type="checkbox"
                checked={testCase.referred}
                onChange={(event) =>
                  update({
                    referred: event.target.checked,
                    referrerKey: event.target.checked ? testCase.referrerKey : "",
                  })
                }
                className="h-4 w-4 rounded border-brand-border/80 bg-brand-panel text-brand-red focus:ring-brand-red/40"
              />
            </label>
            <p className="mt-2 text-xs text-brand-muted/80">
              Turn this on when the scenario comes from a referral relationship.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Referring Customer</label>
            <select
              value={testCase.referrerKey}
              disabled={!testCase.referred}
              onChange={(event) => update({ referrerKey: event.target.value })}
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow disabled:cursor-not-allowed disabled:opacity-50 focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            >
              <option value="">No referrer selected</option>
              {referrerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-brand-cream/90">
              <span>Manual bonus candidate</span>
              <input
                type="checkbox"
                checked={testCase.manualBonusEligible}
                onChange={(event) => update({ manualBonusEligible: event.target.checked })}
                className="h-4 w-4 rounded border-brand-border/80 bg-brand-panel text-brand-red focus:ring-brand-red/40"
              />
            </label>
            <p className="mt-2 text-xs text-brand-muted/80">
              Use this for ad hoc reward scenarios without changing live loyalty rules.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Notes</label>
            <textarea
              rows={3}
              value={testCase.notes}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder="Why is this scenario useful for the planning discussion?"
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
            <p className="text-sm font-semibold text-brand-cream">Projected Result</p>
            <p className="mt-1 text-xs text-brand-muted/80">Transparent preview from active rule cards.</p>

            {result ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-brand-border bg-brand-panel p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Tier</p>
                    <p className="mt-2 font-semibold text-brand-cream">{result.tierName ?? "No tier"}</p>
                  </div>
                  <div className="rounded-lg border border-brand-border bg-brand-panel p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted/80">Rules Hit</p>
                    <p className="mt-2 font-semibold text-brand-cream">{result.appliedRules.length}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-panel px-3 py-2">
                    <span className="text-brand-muted">Points</span>
                    <span className="font-semibold text-brand-cream">
                      {result.pointsTotal.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-panel px-3 py-2">
                    <span className="text-brand-muted">Cash Value</span>
                    <span className="font-semibold text-brand-cream">
                      {formatSimulatorMoney(result.cashValueTotal, "$")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-panel px-3 py-2">
                    <span className="text-brand-muted">Credit</span>
                    <span className="font-semibold text-brand-cream">
                      {formatSimulatorMoney(result.creditTotal, "$")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-brand-muted/80">No projected result yet.</p>
            )}
          </div>
        </div>

        {result?.appliedRules.length ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-brand-cream">Applied Rules</p>
            <div className="space-y-2">
              {result.appliedRules.map((rule) => (
                <div
                  key={`${testCase.id}-${rule.ruleId}`}
                  className="rounded-xl border border-brand-border bg-brand-panel-alt p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-brand-cream">{rule.ruleName}</p>
                    <span className="rounded-full border border-brand-red/35 bg-brand-red/16 px-2.5 py-1 text-xs font-semibold text-brand-cream">
                      {rule.rewardDisplay}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brand-muted">{rule.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-brand-border bg-brand-panel-alt p-4 text-sm text-brand-muted/80">
            No active rules qualify for this scenario yet.
          </div>
        )}
      </div>
    </div>
  )
}
