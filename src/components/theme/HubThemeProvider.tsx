"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export const HUB_THEME_STORAGE_KEY = "pins-hub-theme"

export type HubTheme = "brand" | "classic"

const DEFAULT_THEME: HubTheme = "brand"

type HubThemeContextValue = {
  theme: HubTheme
  setTheme: (theme: HubTheme) => void
  toggleTheme: () => void
}

const HubThemeContext = createContext<HubThemeContextValue | null>(null)

function isHubTheme(value: string | null | undefined): value is HubTheme {
  return value === "brand" || value === "classic"
}

function applyTheme(theme: HubTheme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.remove("theme-brand", "theme-classic")
  root.classList.add(theme === "classic" ? "theme-classic" : "theme-brand")
}

function getInitialTheme(): HubTheme {
  if (typeof document === "undefined") {
    return DEFAULT_THEME
  }

  const documentTheme = document.documentElement.dataset.theme
  return isHubTheme(documentTheme) ? documentTheme : DEFAULT_THEME
}

// Brand Theme is the official Pins & Knuckles brand-guidelines theme.
// Classic Theme preserves the previous dashboard look for users who prefer it.
export const hubThemeBootstrapScript = `
(() => {
  const storageKey = "${HUB_THEME_STORAGE_KEY}";
  const defaultTheme = "${DEFAULT_THEME}";

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme = storedTheme === "classic" || storedTheme === "brand" ? storedTheme : defaultTheme;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.remove("theme-brand", "theme-classic");
    root.classList.add(theme === "classic" ? "theme-classic" : "theme-brand");
  } catch {
    const root = document.documentElement;
    root.dataset.theme = defaultTheme;
    root.classList.remove("theme-brand", "theme-classic");
    root.classList.add("theme-brand");
  }
})();
`

export function HubThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<HubTheme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)

    try {
      window.localStorage.setItem(HUB_THEME_STORAGE_KEY, theme)
    } catch {
      // Ignore storage write failures and keep the in-memory theme active.
    }
  }, [theme])

  const value = useMemo<HubThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => {
        setTheme((currentTheme) => (currentTheme === "brand" ? "classic" : "brand"))
      },
    }),
    [theme],
  )

  return <HubThemeContext.Provider value={value}>{children}</HubThemeContext.Provider>
}

export function useHubTheme() {
  const context = useContext(HubThemeContext)

  if (!context) {
    throw new Error("useHubTheme must be used within a HubThemeProvider.")
  }

  return context
}
