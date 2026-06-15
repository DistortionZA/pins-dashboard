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
      <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_auto]">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-brand-muted/80">
              Scenario Name
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(event) => onScenarioNameChange(event.target.value)}
              placeholder="Tier A v1"
              className="w-full rounded-lg border border-brand-border bg-brand-panel px-3 py-2 text-sm text-brand-cream focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-brand-muted/80">
              Notes
            </label>
            <input
              type="text"
              value={scenarioNotes}
              onChange={(event) => onScenarioNotesChange(event.target.value)}
              placeholder="What business rule is this scenario testing?"
              className="w-full rounded-lg border border-brand-border bg-brand-panel px-3 py-2 text-sm text-brand-cream focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg border border-brand-red/35 bg-brand-red/16 px-4 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
            >
              {activeScenarioId ? "Update Scenario" : "Save New Scenario"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-brand-muted/80">
          Planning tool only — this does not update real customers, referrals, or loyalty points.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="min-w-[980px] w-full divide-y divide-brand-border text-sm">
          <thead className="bg-brand-panel-alt">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted/80">
                Scenario Name
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted/80">
                Notes
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted/80">
                Rules
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted/80">
                Test Cases
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted/80">
                Last Updated
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted/80">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border bg-brand-panel">
            {savedScenarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-brand-muted/80">
                  No shared team scenarios saved yet.
                </td>
              </tr>
            ) : (
              savedScenarios.map((scenario) => (
                <tr key={scenario.id} className={activeScenarioId === scenario.id ? "bg-brand-red/10" : ""}>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-brand-cream">{scenario.name}</p>
                  </td>
                  <td className="px-3 py-2.5 text-brand-muted">{scenario.notes || "No notes"}</td>
                  <td className="px-3 py-2.5 text-brand-cream/90">{scenario.rules.length}</td>
                  <td className="px-3 py-2.5 text-brand-cream/90">{scenario.testCases.length}</td>
                  <td className="px-3 py-2.5 text-brand-muted">
                    {new Date(scenario.updatedAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onLoad(scenario.id)}
                        className="rounded-md border border-brand-red/35 bg-brand-red/16 px-2.5 py-1 text-xs font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(scenario.id)}
                        className="rounded-md border border-brand-border/80 bg-brand-panel-alt px-2.5 py-1 text-xs font-semibold text-brand-cream transition-colors hover:border-brand-red/40 hover:bg-brand-surface"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(scenario.id)}
                        className="rounded-md border border-brand-red/35 bg-brand-red/16 px-2.5 py-1 text-xs font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
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
