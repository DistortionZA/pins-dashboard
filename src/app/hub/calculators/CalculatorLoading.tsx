export default function Loading() {
  return (
    <div
      className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-screen"
      aria-label="Loading calculator"
    >
      <span className="sr-only">Loading calculator...</span>
      <div className="h-5 w-32 rounded bg-brand-panel-alt mb-6" />
      <div className="h-9 w-64 rounded bg-brand-panel-alt mb-8" />

      <div className="max-w-4xl space-y-6">
        <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-11 rounded-lg bg-brand-panel-alt" />
            <div className="h-11 rounded-lg bg-brand-panel-alt" />
            <div className="h-11 rounded-lg bg-brand-panel-alt" />
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="h-10 rounded-lg bg-brand-panel-alt" />
            <div className="h-10 rounded-lg bg-brand-panel-alt" />
            <div className="h-10 rounded-lg bg-brand-panel-alt" />
            <div className="h-10 rounded-lg bg-brand-panel-alt" />
            <div className="h-10 rounded-lg bg-brand-panel-alt" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 rounded-2xl border border-blue-500/20 bg-brand-panel" />
          <div className="h-40 rounded-2xl border border-brand-border bg-brand-panel" />
        </div>
      </div>
    </div>
  )
}
