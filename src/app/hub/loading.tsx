import BackLink from "@/components/BackLink"

export default function Loading() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <div className="h-9 w-72 max-w-full animate-pulse rounded bg-brand-panel-alt" />
      </section>

      <div className="hub-panel-subtle rounded-[1.5rem] p-5">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
          <div className="h-4 w-40 animate-pulse rounded bg-brand-panel-alt" />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-brand-panel-alt" />
          ))}
        </div>
      </div>
    </div>
  )
}
