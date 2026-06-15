import Link from "next/link"
import type { ReactNode } from "react"

type NavigationCardProps = {
  title: string
  description: string
  icon: ReactNode
  href?: string
  badge?: string
  disabled?: boolean
}

function CardInner({
  title,
  description,
  icon,
  badge,
  disabled,
}: NavigationCardProps) {
  return (
    <div
      className={[
        "group relative flex min-h-[210px] overflow-hidden rounded-[1.65rem] border p-6 shadow-[var(--shadow-card)] transition",
        disabled
          ? "border-brand-border bg-brand-panel/70 opacity-70"
          : "border-brand-border bg-brand-panel hover:-translate-y-1 hover:border-brand-red/70",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(222,59,67,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />

      <div className="relative flex h-full w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div
            className={[
              "flex h-12 w-12 items-center justify-center rounded-2xl border",
              disabled
                ? "border-brand-border bg-brand-panel-alt text-brand-muted"
                : "border-brand-red/45 bg-brand-red/10 text-brand-red",
            ].join(" ")}
          >
            <svg
              className="h-6 w-6"
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
                "rounded-full border px-4 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.18em]",
                disabled
                  ? "border-brand-border bg-brand-panel-alt text-brand-muted"
                  : "border-brand-red/45 bg-brand-red/15 text-brand-cream",
              ].join(" ")}
            >
              {badge}
            </span>
          ) : null}
        </div>

        <div className="mt-7 pr-12">
          <h2 className="text-xl font-black tracking-[-0.035em] text-brand-cream">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-6 text-brand-muted">
            {description}
          </p>
        </div>

        {/* <div
          className={[
            "absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border text-lg transition",
            disabled
              ? "border-brand-border text-brand-muted"
              : "border-brand-red/55 text-brand-red group-hover:bg-brand-red group-hover:text-brand-cream",
          ].join(" ")}
          aria-hidden="true"
        >
          →
        </div> */}
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