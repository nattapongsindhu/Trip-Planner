'use client'

import { useReducer, useCallback } from 'react'
import { HotelCard } from './HotelCard'
import type { Hotel } from '@/types'

type State = {
  hotels: Hotel[]
  saving: string | null
}

type Action =
  | { type: 'UPDATE_HOTEL'; payload: Hotel }
  | { type: 'SET_SAVING';   id: string | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_HOTEL':
      return {
        ...state,
        hotels: state.hotels.map(h =>
          h.id === action.payload.id ? action.payload : h
        ),
      }
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
  const [state, dispatch] = useReducer(reducer, {
    hotels: initialHotels,
    saving: null,
  })

  // optimistic toggle — updates selection immediately, reverts on failure
  const toggleSelected = useCallback(async (hotel: Hotel) => {
    const updated = { ...hotel, is_selected: !hotel.is_selected }
    dispatch({ type: 'UPDATE_HOTEL', payload: updated })
    dispatch({ type: 'SET_SAVING', id: hotel.id })

    const res = await fetch(`/api/trips/${tripId}/hotels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: hotel.id, is_selected: updated.is_selected }),
    })

    if (!res.ok) {
      console.error('Failed to toggle hotel selection:', res.status, res.statusText)
      dispatch({ type: 'UPDATE_HOTEL', payload: hotel })
    }

    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  // group hotels by city for display
  const grouped = state.hotels.reduce<Record<string, Hotel[]>>((acc, hotel) => {
    if (!acc[hotel.city]) acc[hotel.city] = []
    acc[hotel.city].push(hotel)
    return acc
  }, {})

  if (state.hotels.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No hotels added yet.</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(grouped).map(([city, cityHotels]) => (
        <div key={city}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase
                         tracking-wider mb-2">
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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
