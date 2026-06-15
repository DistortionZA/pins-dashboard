import type { ReactNode } from "react"

import HubSidebar from "@/components/HubSidebar"

export default function HubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-black text-brand-cream">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:gap-4 lg:px-5 lg:py-4">
        <HubSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
