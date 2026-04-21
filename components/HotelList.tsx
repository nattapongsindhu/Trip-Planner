'use client'

import { useReducer, useCallback, useState } from 'react'
import { HotelCard } from './HotelCard'
import type { Hotel } from '@/types'

type State = {
  hotels: Hotel[]
  saving: string | null
}

type Action =
  | { type: 'UPDATE_HOTEL'; payload: Hotel }
  | { type: 'ADD_HOTEL';    payload: Hotel }
  | { type: 'DELETE_HOTEL'; id: string }
  | { type: 'SET_SAVING';   id: string | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_HOTEL':
      return { ...state, hotels: state.hotels.map(h => h.id === action.payload.id ? action.payload : h) }
    case 'ADD_HOTEL':
      return { ...state, hotels: [...state.hotels, action.payload] }
    case 'DELETE_HOTEL':
      return { ...state, hotels: state.hotels.filter(h => h.id !== action.id) }
    case 'SET_SAVING':
      return { ...state, saving: action.id }
    default:
      return state
  }
}

type Props = {
  hotels: Hotel[]
  tripId: string
  isAdmin: boolean
}

export function HotelList({ hotels: initialHotels, tripId, isAdmin }: Props) {
  const [state, dispatch] = useReducer(reducer, { hotels: initialHotels, saving: null })

  const toggleSelected = useCallback(async (hotel: Hotel) => {
    const updated = { ...hotel, is_selected: !hotel.is_selected }
    dispatch({ type: 'UPDATE_HOTEL', payload: updated })
    dispatch({ type: 'SET_SAVING', id: hotel.id })
    const res = await fetch(`/api/trips/${tripId}/hotels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: hotel.id, is_selected: updated.is_selected }),
    })
    if (!res.ok) dispatch({ type: 'UPDATE_HOTEL', payload: hotel })
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  const updateHotel = useCallback(async (updated: Hotel) => {
    dispatch({ type: 'SET_SAVING', id: updated.id })
    const res = await fetch(`/api/trips/${tripId}/hotels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      const data: Hotel = await res.json()
      dispatch({ type: 'UPDATE_HOTEL', payload: data })
    }
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  const deleteHotel = useCallback(async (hotel: Hotel) => {
    dispatch({ type: 'DELETE_HOTEL', id: hotel.id })
    const res = await fetch(`/api/trips/${tripId}/hotels?hotelId=${hotel.id}`, { method: 'DELETE' })
    if (!res.ok) dispatch({ type: 'ADD_HOTEL', payload: hotel })
  }, [tripId])

  const grouped = state.hotels.reduce<Record<string, Hotel[]>>((acc, hotel) => {
    if (!acc[hotel.city]) acc[hotel.city] = []
    acc[hotel.city].push(hotel)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-5">
      {state.hotels.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">No hotels added yet.</p>
      )}
      {Object.entries(grouped).map(([city, cityHotels]) => (
        <div key={city}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {city}
          </h3>
          <div className="flex flex-col gap-2">
            {cityHotels.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isAdmin={isAdmin}
                saving={state.saving === hotel.id}
                onToggleSelected={toggleSelected}
                onUpdate={updateHotel}
                onDelete={deleteHotel}
              />
            ))}
          </div>
        </div>
      ))}
      {isAdmin && <AddHotelForm tripId={tripId} onAdd={hotel => dispatch({ type: 'ADD_HOTEL', payload: hotel })} />}
    </div>
  )
}

function AddHotelForm({ tripId, onAdd }: { tripId: string; onAdd: (hotel: Hotel) => void }) {
  const [open, setOpen]               = useState(false)
  const [name, setName]               = useState('')
  const [city, setCity]               = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !city.trim() || !countryCode.trim()) {
      setError('Name, city, and country code are required'); return
    }
    setSaving(true); setError(null)
    const res = await fetch(`/api/trips/${tripId}/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(), city: city.trim(),
        country_code: countryCode.trim().toUpperCase(),
        is_selected: false,
      }),
    })
    setSaving(false)
    if (!res.ok) { setError('Failed to add hotel'); return }
    const hotel: Hotel = await res.json()
    onAdd(hotel)
    setName(''); setCity(''); setCountryCode(''); setOpen(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
      + Add hotel
    </button>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border bg-card p-3 mt-1">
      <div className="flex gap-2">
        <input type="text" placeholder="Hotel name" value={name} onChange={e => setName(e.target.value)}
          className="flex-1 text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)}
          className="w-28 text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        <input type="text" placeholder="CC" value={countryCode} onChange={e => setCountryCode(e.target.value)}
          maxLength={2}
          className="w-14 text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? 'Adding…' : 'Add hotel'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
