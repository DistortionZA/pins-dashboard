"use client"

import { useHubTheme } from "@/components/theme/HubThemeProvider"

type ThemeToggleProps = {
  compact?: boolean
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useHubTheme()

  return (
    <div className={`flex items-center ${compact ? "" : "gap-4"}`}>
      {!compact && (
        <p className="text-sm font-semibold text-brand-cream">
          Theme
        </p>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={theme === "brand"}
        aria-label="Toggle theme"
        onClick={toggleTheme}
        className={`hub-theme-switch ${theme === "brand" ? "hub-theme-switch-active" : ""}`}
      >
        <span className="hub-theme-switch-thumb" />
      </button>
    </div>
  )
}