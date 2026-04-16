import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BudgetTracker } from '@/components/BudgetTracker'
import { DayList } from '@/components/DayList'
import { HotelList } from '@/components/HotelList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { formatDate, formatEur, tripDuration, calcProgress } from '@/lib/formatters'
import { getOptionalUserFromClientFactory } from '@/lib/supabaseAuth'
import { createClient } from '@/lib/supabaseServer'
import type { BudgetItem, Day, Hotel, Trip } from '@/types'

type Props = { params: { id: string } }

export const revalidate = 0

export default async function TripPage({ params }: Props) {
  const supabase = createClient()

  const [
    { data: trip, error: tripError },
    { data: days },
    { data: hotels },
    { data: budgetItems },
    user,
  ] = await Promise.all([
    supabase.from('trips').select('*').eq('id', params.id).single(),
    supabase.from('days').select('*').eq('trip_id', params.id).order('day_number'),
    supabase.from('hotels').select('*').eq('trip_id', params.id).order('city'),
    supabase.from('budget_items').select('*').eq('trip_id', params.id),
    getOptionalUserFromClientFactory(createClient),
  ])

  if (tripError || !trip) notFound()

  const isAdmin = !!user
  const typedTrip = trip as Trip
  const typedDays = (days ?? []) as Day[]
  const typedHotels = (hotels ?? []) as Hotel[]
  const typedBudget = (budgetItems ?? []) as BudgetItem[]
  const progress = calcProgress(typedDays)
  const duration = tripDuration(typedTrip.start_date, typedTrip.end_date)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          All trips
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
            <p className="text-sm font-medium">{formatEur(typedTrip.budget_eur)}</p>
          </div>
        </div>

        {typedDays.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Trip progress</span>
              <span>
                {typedDays.filter(day => day.is_done).length} / {typedDays.length} days done
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

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">
          Itinerary
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {typedDays.length} days
          </span>
        </h2>
        <DayList days={typedDays} tripId={params.id} isAdmin={isAdmin} />
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">
          Accommodation
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {typedHotels.filter(hotel => hotel.is_selected).length} selected
          </span>
        </h2>
        <HotelList hotels={typedHotels} tripId={params.id} isAdmin={isAdmin} />
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Budget</h2>
        <BudgetTracker items={typedBudget} tripId={params.id} isAdmin={isAdmin} />
      </section>
    </main>
  )
}
