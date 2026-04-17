'use client'

// HotelList — groups hotels by city, allows add/edit/delete
import { useReducer } from 'react'
import { HotelCard } from './HotelCard'
import type { Hotel } from '@/types'

type Action =
  | { type: 'UPDATE'; id: string; patch: Partial<Hotel> }
  | { type: 'DELETE'; id: string }
  | { type: 'ADD'; hotel: Hotel }
  | { type: 'TOGGLE_SELECT'; id: string; city: string }
  | { type: 'REVERT'; hotels: Hotel[] }

function reducer(state: Hotel[], action: Action): Hotel[] {
  switch (action.type) {
    case 'UPDATE': return state.map(h => h.id === action.id ? { ...h, ...action.patch } : h)
    case 'DELETE': return state.filter(h => h.id !== action.id)
    case 'ADD':    return [...state, action.hotel]
    case 'TOGGLE_SELECT':
      // only one hotel per city can be selected
      return state.map(h => h.city === action.city
        ? { ...h, selected: h.id === action.id ? !h.selected : false }
        : h)
    case 'REVERT': return action.hotels
  }
}

type Props = {
  tripId:         string
  initialHotels:  Hotel[]
  isAdmin:        boolean
}

export function HotelList({ tripId, initialHotels, isAdmin }: Props) {
  const [hotels, dispatch] = useReducer(reducer, initialHotels)

  async function updateHotel(id: string, patch: Partial<Hotel>) {
    const prev = hotels
    dispatch({ type: 'UPDATE', id, patch })
    const res = await fetch(`/api/trips/${tripId}/hotels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) dispatch({ type: 'REVERT', hotels: prev })
  }

  async function deleteHotel(id: string) {
    const prev = hotels
    dispatch({ type: 'DELETE', id })
    const res = await fetch(`/api/trips/${tripId}/hotels/${id}`, { method: 'DELETE' })
    if (!res.ok) dispatch({ type: 'REVERT', hotels: prev })
  }

  async function toggleSelected(id: string, city: string) {
    const prev = hotels
    dispatch({ type: 'TOGGLE_SELECT', id, city })
    const hotel = hotels.find(h => h.id === id)
    if (!hotel) return
    const res = await fetch(`/api/trips/${tripId}/hotels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected: !hotel.selected }),
    })
    if (!res.ok) dispatch({ type: 'REVERT', hotels: prev })
  }

  async function addHotel(city: string, countryCode: string) {
    const draft = {
      trip_id:      tripId,
      country_code: countryCode,
      city,
      name:         'New hotel',
      price_range:  null,
      rating:       null,
      notes:        null,
      booking_url:  null,
      selected:     false,
    }
    const res = await fetch(`/api/trips/${tripId}/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      const newHotel: Hotel = await res.json()
      dispatch({ type: 'ADD', hotel: newHotel })
    }
  }

  // group by city, preserve first occurrence order
  const groups = hotels.reduce<Record<string, { countryCode: string; hotels: Hotel[] }>>((acc, h) => {
    if (!acc[h.city]) acc[h.city] = { countryCode: h.country_code, hotels: [] }
    acc[h.city].hotels.push(h)
    return acc
  }, {})

  const selectedCount = hotels.filter(h => h.selected).length

  return (
    <section className="space-y-4">

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold">Accommodation</h2>
          <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => addHotel('New city', '??')}
            className="text-sm rounded-md border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            + Add hotel
          </button>
        )}
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-xl text-sm text-muted-foreground">
          No hotels yet.
          {isAdmin && <> Click <button
            onClick={() => addHotel('New city', '??')}
            className="underline hover:text-foreground"
          >Add hotel</button> to start.</>}
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([city, { countryCode, hotels: cityHotels }]) => (
            <div key={city} className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {city}
              </h3>
              {cityHotels.map(h => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  onUpdate={patch => updateHotel(h.id, patch)}
                  onDelete={() => deleteHotel(h.id)}
                  onToggleSelected={() => toggleSelected(h.id, h.city)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

    </section>
  )
}
