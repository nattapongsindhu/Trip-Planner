'use client'

import Link from 'next/link'
import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TripError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm font-medium text-destructive mb-3">Trip unavailable</p>
        <h1 className="text-2xl font-semibold tracking-tight mb-3">
          We could not load this itinerary right now.
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          One of the trip resources failed to load. Retry first, then confirm that the
          trip exists and the database is reachable.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Back to trips
          </Link>
        </div>
      </div>
    </main>
  )
}
