import { TAB_OPTIONS, type SimulatorTab } from "./simulator"

type ReferralTabsProps = {
  activeTab: SimulatorTab
  onChange: (tab: SimulatorTab) => void
}

export default function ReferralTabs({ activeTab, onChange }: ReferralTabsProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-2 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
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
                  ? "border border-red-500/30 bg-red-600/15 text-red-300"
                  : "border border-transparent bg-[#111219] text-zinc-300 hover:border-zinc-700 hover:text-white"
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
