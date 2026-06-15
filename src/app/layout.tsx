import type { Metadata } from "next"
import Script from "next/script"
import { Toaster } from "sonner"

import { HubThemeProvider, hubThemeBootstrapScript } from "@/components/theme/HubThemeProvider"

import "./globals.css"

export const metadata: Metadata = {
  title: "Pins Hub",
  description: "Internal Pins Hub for calculators, directories, and team tools.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased dark theme-brand" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-brand-black text-brand-cream selection:bg-brand-red selection:text-brand-cream"
        suppressHydrationWarning
      >
        <Script id="hub-theme-bootstrap" strategy="beforeInteractive">
          {hubThemeBootstrapScript}
        </Script>
        <HubThemeProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </HubThemeProvider>
      </body>
    </html>
  )
}
