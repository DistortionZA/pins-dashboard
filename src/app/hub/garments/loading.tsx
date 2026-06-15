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
      </section>

      <div className="hub-panel-subtle rounded-[1.7rem] p-6">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-brand-panel-alt" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-brand-panel-alt" />
          ))}
        </div>
      </div>
    </div>
  )
}
