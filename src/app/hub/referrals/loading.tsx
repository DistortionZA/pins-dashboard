import Link from "next/link"

export default function Loading() {
  return (
    <div className="space-y-6">
      <Link href="/" className="hub-back-link">
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Hub
      </Link>

      <section className="hub-panel rounded-[2rem] p-6 md:p-8">
        <div className="h-9 w-72 animate-pulse rounded bg-brand-panel-alt" />
        <div className="mt-3 h-4 w-full max-w-3xl animate-pulse rounded bg-brand-panel-alt" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="hub-panel-subtle rounded-[1.7rem] p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="mb-4 h-24 animate-pulse rounded-2xl bg-brand-panel-alt" />
          ))}
        </div>
        <div className="hub-panel-subtle rounded-[1.7rem] p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mb-4 h-20 animate-pulse rounded-2xl bg-brand-panel-alt" />
          ))}
        </div>
      </div>
    </div>
  )
}
