function SkeletonSection() {
  return (
    <section className="mb-8">
      <div className="h-5 w-36 rounded bg-muted mb-3" />
      <div className="space-y-3">
        <div className="h-24 rounded-xl border bg-card" />
        <div className="h-24 rounded-xl border bg-card" />
      </div>
    </section>
  )
}

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-9 w-24 rounded-lg bg-muted" />
      </div>

      <div className="rounded-xl border bg-card p-6 mb-6">
        <div className="h-7 w-56 rounded bg-muted mb-3" />
        <div className="h-4 w-40 rounded bg-muted mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-14 rounded bg-muted" />
          <div className="h-14 rounded bg-muted" />
          <div className="h-14 rounded bg-muted" />
          <div className="h-14 rounded bg-muted" />
        </div>
      </div>

      <SkeletonSection />
      <SkeletonSection />
      <SkeletonSection />
    </main>
  )
}
