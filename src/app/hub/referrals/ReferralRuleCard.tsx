import {
  CURRENCY_OPTIONS,
  REWARD_TYPE_OPTIONS,
  RULE_TYPE_OPTIONS,
  getRuleTypeDescription,
  type ReferralRuleCardData,
} from "./simulator"

type ReferralRuleCardProps = {
  rule: ReferralRuleCardData
  onChange: (rule: ReferralRuleCardData) => void
  onDuplicate: (ruleId: string) => void
  onDelete: (ruleId: string) => void
}

function parseNonNegativeNumber(value: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

export default function ReferralRuleCard({
  rule,
  onChange,
  onDuplicate,
  onDelete,
}: ReferralRuleCardProps) {
  const update = (patch: Partial<ReferralRuleCardData>) => onChange({ ...rule, ...patch })

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-brand-border/80 bg-brand-panel-alt px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">
                {rule.enabled ? "Enabled" : "Disabled"}
              </span>
              <span className="rounded-full border border-brand-red/35 bg-brand-red/16 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-cream">
                {RULE_TYPE_OPTIONS.find((option) => option.value === rule.ruleType)?.label}
              </span>
            </div>
            <p className="mt-3 text-xs text-brand-muted/80">{getRuleTypeDescription(rule.ruleType)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(rule.id)}
              className="rounded-lg border border-brand-border/80 bg-brand-panel-alt px-3 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/40 hover:bg-brand-surface"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={() => onDelete(rule.id)}
              className="rounded-lg border border-brand-red/35 bg-brand-red/16 px-3 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-muted">Rule Name</label>
            <input
              type="text"
              value={rule.name}
              onChange={(event) => update({ name: event.target.value })}
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Rule Type</label>
            <select
              value={rule.ruleType}
              onChange={(event) =>
                update({ ruleType: event.target.value as ReferralRuleCardData["ruleType"] })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            >
              {RULE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">
              Time Window (months)
            </label>
            <input
              min={0}
              type="number"
              value={rule.timeWindowMonths}
              onChange={(event) =>
                update({ timeWindowMonths: parseNonNegativeNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Spend Threshold</label>
            <input
              min={0}
              type="number"
              value={rule.spendThreshold}
              onChange={(event) =>
                update({ spendThreshold: parseNonNegativeNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Currency</label>
            <select
              value={rule.currency}
              onChange={(event) =>
                update({ currency: event.target.value as ReferralRuleCardData["currency"] })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Reward Type</label>
            <select
              value={rule.rewardType}
              onChange={(event) =>
                update({ rewardType: event.target.value as ReferralRuleCardData["rewardType"] })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            >
              {REWARD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Reward Value</label>
            <input
              min={0}
              type="number"
              value={rule.rewardValue}
              onChange={(event) =>
                update({ rewardValue: parseNonNegativeNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-muted">Notes</label>
            <textarea
              rows={3}
              value={rule.notes}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder="How should the team interpret this planning rule?"
              className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-4">
            <p className="text-sm font-semibold text-brand-cream">Rule Status</p>
            <p className="mt-1 text-xs text-brand-muted/80">
              Disable a card to leave it in the planning deck without affecting results.
            </p>
            <label className="mt-4 flex items-center justify-between gap-3 text-sm text-brand-cream/90">
              <span>Enabled in simulator</span>
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(event) => update({ enabled: event.target.checked })}
                className="h-4 w-4 rounded border-brand-border/80 bg-brand-panel text-brand-red focus:ring-brand-red/40"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
