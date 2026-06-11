import type { ReferralScenarioData } from "./simulator"

type ReferralScenarioManagerProps = {
  activeScenarioId: string | null
  scenarioName: string
  scenarioNotes: string
  savedScenarios: ReferralScenarioData[]
  onScenarioNameChange: (value: string) => void
  onScenarioNotesChange: (value: string) => void
  onSave: () => void
  onLoad: (scenarioId: string) => void
  onDuplicate: (scenarioId: string) => void
  onDelete: (scenarioId: string) => void
}

export default function ReferralScenarioManager({
  activeScenarioId,
  scenarioName,
  scenarioNotes,
  savedScenarios,
  onScenarioNameChange,
  onScenarioNotesChange,
  onSave,
  onLoad,
  onDuplicate,
  onDelete,
}: ReferralScenarioManagerProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-[#111219] p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_auto]">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Scenario Name
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(event) => onScenarioNameChange(event.target.value)}
              placeholder="Tier A v1"
              className="w-full rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2 text-sm text-white focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Notes
            </label>
            <input
              type="text"
              value={scenarioNotes}
              onChange={(event) => onScenarioNotesChange(event.target.value)}
              placeholder="What business rule is this scenario testing?"
              className="w-full rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2 text-sm text-white focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg border border-red-500/20 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
            >
              {activeScenarioId ? "Update Scenario" : "Save New Scenario"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Planning tool only — this does not update real customers, referrals, or loyalty points.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-[980px] w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-[#111219]">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Scenario Name
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Notes
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Rules
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Test Cases
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Last Updated
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-[#0b0c10]">
            {savedScenarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-zinc-500">
                  No shared team scenarios saved yet.
                </td>
              </tr>
            ) : (
              savedScenarios.map((scenario) => (
                <tr key={scenario.id} className={activeScenarioId === scenario.id ? "bg-red-600/5" : ""}>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-white">{scenario.name}</p>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-400">{scenario.notes || "No notes"}</td>
                  <td className="px-3 py-2.5 text-zinc-300">{scenario.rules.length}</td>
                  <td className="px-3 py-2.5 text-zinc-300">{scenario.testCases.length}</td>
                  <td className="px-3 py-2.5 text-zinc-400">
                    {new Date(scenario.updatedAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onLoad(scenario.id)}
                        className="rounded-md border border-red-500/20 bg-red-600/10 px-2.5 py-1 text-xs font-semibold text-red-300 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(scenario.id)}
                        className="rounded-md border border-zinc-700 bg-[#111219] px-2.5 py-1 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-[#171922]"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(scenario.id)}
                        className="rounded-md border border-red-500/20 bg-red-600/10 px-2.5 py-1 text-xs font-semibold text-red-300 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
