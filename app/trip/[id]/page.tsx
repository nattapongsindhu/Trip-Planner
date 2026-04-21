// Server Component — fetches trip, days, hotels, and budget in parallel
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { formatDate, formatUsd, tripDuration, calcProgress } from '@/lib/formatters'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DayList } from '@/components/DayList'
import { HotelList } from '@/components/HotelList'
import { BudgetTracker } from '@/components/BudgetTracker'
import { TripNoteEditor } from '@/components/TripNoteEditor'
import { TransportationList } from '@/components/TransportationList'
import type { Trip, Day, Hotel, BudgetItem, Transportation } from '@/types'

type Props = { params: { id: string } }

export const revalidate = 0

export default async function TripPage({ params }: Props) {
  const supabase = createClient()

  // fetch all related data in parallel to minimise load time
  const [
    { data: trip, error: tripError },
    { data: days, error: daysError },
    { data: hotels, error: hotelsError },
    { data: budgetItems, error: budgetError },
    { data: transportation, error: transportError },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('trips').select('*').eq('id', params.id).single(),
    supabase.from('days').select('*').eq('trip_id', params.id).order('day_number'),
    supabase.from('hotels').select('*').eq('trip_id', params.id).order('city'),
    supabase.from('budget_items').select('*').eq('trip_id', params.id),
    supabase.from('trip_transportation').select('*').eq('trip_id', params.id).order('date', { ascending: true, nullsFirst: false }),
    supabase.auth.getUser(),
  ])

  if (tripError || !trip) notFound()
  if (daysError || hotelsError || budgetError || transportError) {
    throw new Error(
      daysError?.message ?? hotelsError?.message ?? budgetError?.message ?? transportError?.message ?? 'Failed to load trip data'
    )
  }

  const isAdmin             = !!user
  const typedTrip           = trip as Trip
  const typedDays           = (days ?? []) as Day[]
  const typedHotels         = (hotels ?? []) as Hotel[]
  const typedBudget         = (budgetItems ?? []) as BudgetItem[]
  const typedTransportation = (transportation ?? []) as Transportation[]
  const progress     = calcProgress(typedDays)
  const duration     = tripDuration(typedTrip.start_date, typedTrip.end_date)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">

      {/* top navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All trips
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdmin && (
            <Link
              href={`/trip/${params.id}/edit`}
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors"
            >
              Edit trip
            </Link>
          )}
        </div>
      </div>

      {/* trip header card */}
      <div className="rounded-xl border bg-card p-6 mb-6">
        <h1 className="text-xl font-semibold mb-1">{typedTrip.title}</h1>
        <p className="text-sm text-muted-foreground mb-4">{typedTrip.destination}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Start</p>
            <p className="text-sm font-medium">{formatDate(typedTrip.start_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">End</p>
            <p className="text-sm font-medium">{formatDate(typedTrip.end_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Duration</p>
            <p className="text-sm font-medium">{duration} days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Budget</p>
            <p className="text-sm font-medium">{formatUsd(typedTrip.budget_usd)}</p>
          </div>
        </div>

        {/* progress bar — only shown when there are days */}
        {typedDays.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Trip progress</span>
              <span>
                {typedDays.filter(d => d.is_done).length} / {typedDays.length} days done
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* itinerary section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">
          Itinerary
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {typedDays.length} days
          </span>
        </h2>
        <DayList days={typedDays} tripId={params.id} isAdmin={isAdmin} />
      </section>

      {/* transportation section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Transportation</h2>
        <TransportationList items={typedTransportation} tripId={params.id} isAdmin={isAdmin} startDate={typedTrip.start_date} endDate={typedTrip.end_date} />
      </section>

      {/* hotel section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">
          Hotel
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {typedHotels.filter(h => h.is_selected).length} selected
          </span>
        </h2>
        <HotelList hotels={typedHotels} tripId={params.id} isAdmin={isAdmin} />
      </section>

      {/* budget section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Budget</h2>
        <BudgetTracker items={typedBudget} tripId={params.id} isAdmin={isAdmin} />
      </section>

      {/* notes section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Notes</h2>
        <TripNoteEditor tripId={params.id} initialNote={typedTrip.note} isAdmin={isAdmin} />
      </section>

    </main>
  )
}
