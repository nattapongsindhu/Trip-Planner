// Server Component — fetches all trips server-side, no client loading state needed
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { formatDate, formatEur, tripDuration } from '@/lib/formatters'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthButton } from '@/components/AuthButton'
import { NewTripButton } from '@/components/NewTripButton'
import { getOptionalUserFromClientFactory } from '@/lib/supabaseAuth'
import { createPublicServerClient } from '@/lib/supabasePublicServer'
import type { Trip } from '@/types'

// always fetch fresh data — no ISR caching on the trips list
export const revalidate = 0

export default async function HomePage() {
  const supabase = createPublicServerClient()

  const [{ data: trips, error: tripsError }, user] = await Promise.all([
    supabase.from('trips').select('*').order('created_at', { ascending: false }),
    getOptionalUserFromClientFactory(createClient),
  ])

  if (tripsError) {
    throw new Error(`Failed to load trips: ${tripsError.message}`)
  }

  const isAdmin = !!user

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">

      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trip Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {trips?.length ?? 0} trip{trips?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButton isAdmin={isAdmin} />
          {isAdmin && <NewTripButton />}
        </div>
      </div>

      {/* trip grid */}
      {!trips || trips.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No trips yet</p>
          <p className="text-sm mt-1">Sign in to create your first trip</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(trips as Trip[]).map(trip => (
            <Link
              key={trip.id}
              href={`/trip/${trip.id}`}
              className="block rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="font-semibold text-base leading-snug line-clamp-2">
                  {trip.title}
                </h2>
                <div className="flex items-center gap-1.5 shrink-0">
                  {trip.is_template && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent
                                     text-muted-foreground border">
                      template
                    </span>
                  )}
                  {/* Public/Private badge — visible to everyone for transparency */}
                  {trip.is_public ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10
                                     text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      public
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted
                                     text-muted-foreground border">
                      private
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
                {trip.destination}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {trip.start_date
                    ? `${formatDate(trip.start_date)} — ${formatDate(trip.end_date)}`
                    : 'Dates not set'}
                </span>
                <div className="flex items-center gap-3">
                  <span>{tripDuration(trip.start_date, trip.end_date)} days</span>
                  <span className="font-medium text-foreground">
                    {formatEur(trip.budget_eur)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
