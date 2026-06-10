import Link from "next/link"
import type { ReactNode } from "react"

type NavigationCardTone = "interactive" | "disabled"

function StatusBadge({
  label,
  tone,
  showArrow = false,
}: {
  label: string
  tone: NavigationCardTone
  showArrow?: boolean
}) {
  return (
    <div
      className={`mt-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
        tone === "interactive"
          ? "border border-red-500/20 bg-red-600/10 text-red-300"
          : "bg-zinc-800/80 text-zinc-400"
      }`}
    >
      {label}
      {showArrow ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      ) : null}
    </div>
  )
}

export default function NavigationCard({
  title,
  description,
  icon,
  badge,
  href,
  disabled = false,
}: {
  title: string
  description: string
  icon: ReactNode
  badge: string
  href?: string
  disabled?: boolean
}) {
  const isInteractive = Boolean(href) && !disabled
  const tone: NavigationCardTone = isInteractive ? "interactive" : "disabled"

  const content = (
    <div
      className={`relative flex h-full min-h-[18rem] flex-col items-start rounded-2xl border p-8 transition-all duration-300 ${
        isInteractive
          ? "bg-zinc-950/80 border-zinc-800 hover:border-red-500/40 hover:bg-zinc-950 hover:shadow-[0_0_25px_rgba(239,68,68,0.12)]"
          : "bg-zinc-950/50 border-zinc-800/50 opacity-70"
      }`}
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50 text-zinc-500">
        {icon}
      </div>
      <h2
        className={`mb-2 text-xl font-bold tracking-tight ${
          isInteractive
            ? "text-zinc-300 transition-colors group-hover:text-white"
            : "text-zinc-300"
        }`}
      >
        {title}
      </h2>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
      <StatusBadge label={badge} tone={tone} showArrow={isInteractive} />
    </div>
  )

  if (!isInteractive) {
    return content
  }

  return (
    <Link href={href!} className="group relative">
      {content}
    </Link>
  )
}
