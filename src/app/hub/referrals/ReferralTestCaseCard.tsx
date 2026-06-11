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
    <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-zinc-700 bg-[#111219] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {testCase.referred ? "Referred" : "Direct"}
              </span>
              {testCase.manualBonusEligible ? (
                <span className="rounded-full border border-red-500/20 bg-red-600/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-red-300">
                  Manual Bonus Candidate
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              This scenario is simulated only. No live loyalty balance is changed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(testCase.id)}
            className="rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
          >
            Delete
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Brand / Customer Name
            </label>
            <input
              type="text"
              value={testCase.name}
              onChange={(event) => update({ name: event.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Spend Amount</label>
            <input
              min={0}
              type="number"
              value={testCase.spendAmount}
              onChange={(event) =>
                update({ spendAmount: parseNonNegativeNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Orders</label>
            <input
              min={0}
              type="number"
              value={testCase.orderCount}
              onChange={(event) =>
                update({ orderCount: parseNonNegativeNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
          <div className="rounded-xl border border-zinc-800 bg-[#111219] p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-zinc-300">
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
                className="h-4 w-4 rounded border-zinc-700 bg-[#0b0c10] text-red-500 focus:ring-red-500/40"
              />
            </label>
            <p className="mt-2 text-xs text-zinc-500">
              Turn this on when the scenario comes from a referral relationship.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Referring Customer</label>
            <select
              value={testCase.referrerKey}
              disabled={!testCase.referred}
              onChange={(event) => update({ referrerKey: event.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow disabled:cursor-not-allowed disabled:opacity-50 focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            >
              <option value="">No referrer selected</option>
              {referrerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#111219] p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-zinc-300">
              <span>Manual bonus candidate</span>
              <input
                type="checkbox"
                checked={testCase.manualBonusEligible}
                onChange={(event) => update({ manualBonusEligible: event.target.checked })}
                className="h-4 w-4 rounded border-zinc-700 bg-[#0b0c10] text-red-500 focus:ring-red-500/40"
              />
            </label>
            <p className="mt-2 text-xs text-zinc-500">
              Use this for ad hoc reward scenarios without changing live loyalty rules.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Notes</label>
            <textarea
              rows={3}
              value={testCase.notes}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder="Why is this scenario useful for the planning discussion?"
              className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#111219] p-4">
            <p className="text-sm font-semibold text-white">Projected Result</p>
            <p className="mt-1 text-xs text-zinc-500">Transparent preview from active rule cards.</p>

            {result ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Tier</p>
                    <p className="mt-2 font-semibold text-white">{result.tierName ?? "No tier"}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-[#0b0c10] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Rules Hit</p>
                    <p className="mt-2 font-semibold text-white">{result.appliedRules.length}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2">
                    <span className="text-zinc-400">Points</span>
                    <span className="font-semibold text-white">
                      {result.pointsTotal.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2">
                    <span className="text-zinc-400">Cash Value</span>
                    <span className="font-semibold text-white">
                      {formatSimulatorMoney(result.cashValueTotal, "$")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2">
                    <span className="text-zinc-400">Credit</span>
                    <span className="font-semibold text-white">
                      {formatSimulatorMoney(result.creditTotal, "$")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">No projected result yet.</p>
            )}
          </div>
        </div>

        {result?.appliedRules.length ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Applied Rules</p>
            <div className="space-y-2">
              {result.appliedRules.map((rule) => (
                <div
                  key={`${testCase.id}-${rule.ruleId}`}
                  className="rounded-xl border border-zinc-800 bg-[#111219] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-white">{rule.ruleName}</p>
                    <span className="rounded-full border border-red-500/20 bg-red-600/10 px-2.5 py-1 text-xs font-semibold text-red-300">
                      {rule.rewardDisplay}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{rule.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-[#111219] p-4 text-sm text-zinc-500">
            No active rules qualify for this scenario yet.
          </div>
        )}
      </div>
    </div>
  )
}
