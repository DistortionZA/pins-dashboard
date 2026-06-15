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
      className="group rounded-2xl border border-brand-border bg-brand-panel shadow-[0_0_15px_rgba(0,0,0,0.18)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-brand-cream">{title}</p>
            {badge ? (
              <span className="rounded-full border border-brand-red/35 bg-brand-red/16 px-2 py-0.5 text-[11px] font-semibold text-brand-cream">
                {badge}
              </span>
            ) : null}
          </div>
          {summary ? <p className="mt-1 text-xs text-brand-muted/80">{summary}</p> : null}
        </div>

        <svg
          className="h-4 w-4 shrink-0 text-brand-muted/80 transition-transform group-open:rotate-180"
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

      <div className="border-t border-brand-border px-4 py-4">{children}</div>
    </details>
  )
}
