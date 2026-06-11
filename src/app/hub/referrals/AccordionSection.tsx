import type { ReactNode } from "react"

type AccordionSectionProps = {
  title: string
  summary?: string
  badge?: string
  defaultOpen?: boolean
  children: ReactNode
}

export default function AccordionSection({
  title,
  summary,
  badge,
  defaultOpen = false,
  children,
}: AccordionSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-zinc-800 bg-[#0b0c10] shadow-[0_0_15px_rgba(0,0,0,0.18)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">{title}</p>
            {badge ? (
              <span className="rounded-full border border-red-500/20 bg-red-600/10 px-2 py-0.5 text-[11px] font-semibold text-red-300">
                {badge}
              </span>
            ) : null}
          </div>
          {summary ? <p className="mt-1 text-xs text-zinc-500">{summary}</p> : null}
        </div>

        <svg
          className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="border-t border-zinc-800 px-4 py-4">{children}</div>
    </details>
  )
}
