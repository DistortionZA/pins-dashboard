import Link from "next/link"
import type { ReactNode } from "react"

type NavigationCardProps = {
  title: string
  description: string
  icon: ReactNode
  href?: string
  badge?: string
  disabled?: boolean
  compact?: boolean
}

function CardInner({
  title,
  description,
  icon,
  badge,
  disabled,
  compact = false,
}: NavigationCardProps) {
  return (
    <div
      className={[
        "group relative flex overflow-hidden border transition",
        compact
          ? "min-h-[152px] rounded-[1.1rem] p-4 shadow-[var(--shadow-soft)]"
          : "min-h-[210px] rounded-[1.65rem] p-6 shadow-[var(--shadow-card)]",
        disabled
          ? "border-brand-border bg-brand-panel/70 opacity-70"
          : "border-brand-border bg-brand-panel hover:-translate-y-1 hover:border-brand-red/70",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(222,59,67,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]",
          compact ? "opacity-70" : "",
        ].join(" ")}
      />

      <div className="relative flex h-full w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div
            className={[
              "flex items-center justify-center border",
              compact ? "h-10 w-10 rounded-xl" : "h-12 w-12 rounded-2xl",
              disabled
                ? "border-brand-border bg-brand-panel-alt text-brand-muted"
                : "border-brand-red/45 bg-brand-red/10 text-brand-red",
            ].join(" ")}
          >
            <svg
              className={compact ? "h-5 w-5" : "h-6 w-6"}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {icon}
            </svg>
          </div>

          {badge ? (
            <span
              className={[
                "rounded-full border font-black uppercase",
                compact
                  ? "px-2.5 py-1 text-[0.6rem] tracking-[0.14em]"
                  : "px-4 py-1.5 text-[0.68rem] tracking-[0.18em]",
                disabled
                  ? "border-brand-border bg-brand-panel-alt text-brand-muted"
                  : "border-brand-red/45 bg-brand-red/15 text-brand-cream",
              ].join(" ")}
            >
              {badge}
            </span>
          ) : null}
        </div>

        <div className={compact ? "mt-4 pr-4" : "mt-7 pr-12"}>
          <h2
            className={[
              "font-black tracking-[-0.035em] text-brand-cream",
              compact ? "text-lg" : "text-xl",
            ].join(" ")}
          >
            {title}
          </h2>
          <p
            className={[
              "text-sm text-brand-muted",
              compact ? "mt-2 leading-5" : "mt-4 leading-6",
            ].join(" ")}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function NavigationCard(props: NavigationCardProps) {
  if (props.disabled || !props.href) {
    return <CardInner {...props} />
  }

  return (
    <Link href={props.href} className="block h-full">
      <CardInner {...props} />
    </Link>
  )
}
