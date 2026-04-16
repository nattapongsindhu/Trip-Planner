function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="h-5 w-2/3 rounded bg-muted mb-3" />
      <div className="h-4 w-1/2 rounded bg-muted mb-6" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-40 rounded bg-muted mb-2" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div className="h-9 w-24 rounded-lg bg-muted" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  )
}
