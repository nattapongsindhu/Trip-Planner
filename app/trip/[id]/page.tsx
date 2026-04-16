// Server Component — fetches trip, days, hotels, and budget in parallel
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import {
  calcBudgetSummary,
  calcProgress,
  countryFlag,
  formatCostRange,
  formatDate,
  formatEur,
  tripDuration,
} from '@/lib/formatters'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DayList } from '@/components/DayList'
import { HotelList } from '@/components/HotelList'
import { BudgetTracker } from '@/components/BudgetTracker'
import { getOptionalUserFromClientFactory } from '@/lib/supabaseAuth'
import { createPublicServerClient } from '@/lib/supabasePublicServer'
import type { Trip, Day, Hotel, BudgetItem } from '@/types'

type Props = { params: { id: string } }

export const revalidate = 0

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function toText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

function toBoolean(value: unknown): boolean {
  return value === true
}

function renderReadonlyDays(days: Day[]) {
  if (days.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No days added yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {days.map(day => (
        <article key={day.id} className="rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                Day {day.day_number}: {countryFlag(day.country_code)} {day.city}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {day.stay ?? 'Stay not set'}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatCostRange(day.cost_eur_min, day.cost_eur_max)}
            </span>
          </div>

          {day.highlights && (
            <p className="text-sm mt-3 leading-relaxed">{day.highlights}</p>
          )}

          {day.transport && (
            <p className="text-xs text-muted-foreground mt-2">
              Transport: {day.transport}
            </p>
          )}

          {day.note && (
            <p className="text-xs text-muted-foreground mt-2">Note: {day.note}</p>
          )}
        </article>
      ))}
    </div>
  )
}

function renderReadonlyHotels(hotels: Hotel[]) {
  if (hotels.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No hotels added yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {hotels.map(hotel => (
        <article key={hotel.id} className="rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {countryFlag(hotel.country_code)} {hotel.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{hotel.city}</p>
            </div>
            {hotel.is_selected && (
              <span className="text-xs rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary">
                selected
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {(hotel.price_min != null || hotel.price_max != null) && (
              <span>{formatCostRange(hotel.price_min, hotel.price_max)} / night</span>
            )}
            {hotel.rating != null && <span>Rating: {hotel.rating}</span>}
          </div>

          {hotel.notes && (
            <p className="text-sm mt-3 leading-relaxed">{hotel.notes}</p>
          )}

          {hotel.book_url && (
            <a
              href={hotel.book_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-xs text-primary hover:underline"
            >
              Book
            </a>
          )}
        </article>
      ))}
    </div>
  )
}

function renderReadonlyBudget(items: BudgetItem[]) {
  const summary = calcBudgetSummary(items)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total estimated</p>
          <p className="text-xl font-semibold">{formatEur(summary.total_estimated)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total actual</p>
          <p className="text-xl font-semibold">{formatEur(summary.total_actual)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Items</p>
          <p className="text-xl font-semibold">{items.length}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No budget items yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium">{formatEur(item.amount_eur)}</p>
                <p className="text-xs text-muted-foreground">
                  {item.is_actual ? 'actual' : 'estimate'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function TripPage({ params }: Props) {
  const supabase = createPublicServerClient()

  // fetch all related data in parallel to minimise load time
  const [
    { data: trip, error: tripError },
    { data: days, error: daysError },
    { data: hotels, error: hotelsError },
    { data: budgetItems, error: budgetError },
    user,
  ] = await Promise.all([
    supabase.from('trips').select('*').eq('id', params.id).single(),
    supabase.from('days').select('*').eq('trip_id', params.id).order('day_number'),
    supabase.from('hotels').select('*').eq('trip_id', params.id).order('city'),
    supabase.from('budget_items').select('*').eq('trip_id', params.id),
    getOptionalUserFromClientFactory(createClient),
  ])

  if (tripError?.code === 'PGRST116' || !trip) notFound()

  if (tripError || daysError || hotelsError || budgetError) {
    console.error('Trip page resource load failed.', {
      tripId: params.id,
      tripError,
      daysError,
      hotelsError,
      budgetError,
    })
    throw new Error('Failed to load one or more trip resources.')
  }

  const isAdmin = !!user
  const tripRecord = trip as Trip
  const typedTrip: Trip = {
    id: toText(tripRecord.id, params.id),
    title: toText(tripRecord.title, 'Untitled trip'),
    destination: toText(tripRecord.destination, 'Destination unavailable'),
    start_date: toNullableString(tripRecord.start_date),
    end_date: toNullableString(tripRecord.end_date),
    budget_eur: toNumber(tripRecord.budget_eur),
    is_template: toBoolean(tripRecord.is_template),
    is_public: toBoolean(tripRecord.is_public),
    created_at: toText(tripRecord.created_at, ''),
  }
  const typedDays: Day[] = ((days ?? []) as Day[]).map((day, index) => ({
    id: toText(day.id, `day-${index}`),
    trip_id: toText(day.trip_id, params.id),
    day_number: toNumber(day.day_number, index + 1),
    city: toText(day.city, 'Unknown stop'),
    country_code: typeof day.country_code === 'string' ? day.country_code : '',
    highlights: toNullableString(day.highlights),
    transport: toNullableString(day.transport),
    stay: toNullableString(day.stay),
    cost_eur_min: toNumber(day.cost_eur_min),
    cost_eur_max: toNumber(day.cost_eur_max),
    note: toNullableString(day.note),
    is_done: toBoolean(day.is_done),
    book_by: toNullableString(day.book_by),
    is_transfer: toBoolean(day.is_transfer),
  }))
  const typedHotels: Hotel[] = ((hotels ?? []) as Hotel[]).map((hotel, index) => ({
    id: toText(hotel.id, `hotel-${index}`),
    trip_id: toText(hotel.trip_id, params.id),
    city: toText(hotel.city, 'Unknown city'),
    country_code: typeof hotel.country_code === 'string' ? hotel.country_code : '',
    name: toText(hotel.name, 'Unnamed hotel'),
    price_min: hotel.price_min == null ? null : toNumber(hotel.price_min),
    price_max: hotel.price_max == null ? null : toNumber(hotel.price_max),
    rating: hotel.rating == null ? null : toNumber(hotel.rating),
    notes: toNullableString(hotel.notes),
    book_url: toNullableString(hotel.book_url),
    is_selected: toBoolean(hotel.is_selected),
  }))
  const typedBudget: BudgetItem[] = ((budgetItems ?? []) as BudgetItem[]).map((item, index) => ({
    id: toText(item.id, `budget-${index}`),
    trip_id: toText(item.trip_id, params.id),
    category: item.category,
    label: toText(item.label, 'Untitled item'),
    amount_eur: toNumber(item.amount_eur),
    is_actual: toBoolean(item.is_actual),
  }))
  const progress = calcProgress(typedDays)
  const duration = tripDuration(typedTrip.start_date, typedTrip.end_date)

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
            <p className="text-sm font-medium">{formatEur(typedTrip.budget_eur)}</p>
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
        {isAdmin
          ? <DayList days={typedDays} tripId={params.id} isAdmin={isAdmin} />
          : renderReadonlyDays(typedDays)}
      </section>

      {/* accommodation section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">
          Accommodation
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {typedHotels.filter(h => h.is_selected).length} selected
          </span>
        </h2>
        {isAdmin
          ? <HotelList hotels={typedHotels} tripId={params.id} isAdmin={isAdmin} />
          : renderReadonlyHotels(typedHotels)}
      </section>

      {/* budget section */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Budget</h2>
        {isAdmin
          ? <BudgetTracker items={typedBudget} tripId={params.id} isAdmin={isAdmin} />
          : renderReadonlyBudget(typedBudget)}
      </section>

    </main>
  )
}
