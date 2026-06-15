import { TAB_OPTIONS, type SimulatorTab } from "./simulator"

type ReferralTabsProps = {
  activeTab: SimulatorTab
  onChange: (tab: SimulatorTab) => void
}

export default function ReferralTabs({ activeTab, onChange }: ReferralTabsProps) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-2 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap gap-2">
        {TAB_OPTIONS.map((tab) => {
          const isActive = tab.value === activeTab

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border border-brand-red/40 bg-brand-red/18 text-brand-cream"
                  : "border border-transparent bg-brand-panel-alt text-brand-cream/90 hover:border-brand-border/80 hover:text-brand-cream"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
