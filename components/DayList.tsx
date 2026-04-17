'use client'

// DayList — manages array of day cards for one trip
// Uses useReducer for explicit state transitions
// All mutations go optimistic-first: UI updates immediately, reverts on failure
import { useReducer } from 'react'
import { DayCard } from './DayCard'
import type { Day, DayUpdate } from '@/types'

type Action =
  | { type: 'UPDATE'; id: string; patch: DayUpdate }
  | { type: 'DELETE'; id: string }
  | { type: 'ADD'; day: Day }
  | { type: 'REVERT'; days: Day[] }

function reducer(state: Day[], action: Action): Day[] {
  switch (action.type) {
    case 'UPDATE': return state.map(d => d.id === action.id ? { ...d, ...action.patch } : d)
    case 'DELETE': return state.filter(d => d.id !== action.id)
    case 'ADD':    return [...state, action.day].sort((a, b) => a.day_number - b.day_number)
    case 'REVERT': return action.days
  }
}

type Props = {
  tripId:      string
  initialDays: Day[]
  isAdmin:     boolean
}

export function DayList({ tripId, initialDays, isAdmin }: Props) {
  const [days, dispatch] = useReducer(reducer, initialDays)

  async function updateDay(id: string, patch: DayUpdate) {
    const prev = days
    dispatch({ type: 'UPDATE', id, patch })
    const res = await fetch(`/api/trips/${tripId}/days/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) dispatch({ type: 'REVERT', days: prev })
  }

  async function deleteDay(id: string) {
    const prev = days
    dispatch({ type: 'DELETE', id })
    const res = await fetch(`/api/trips/${tripId}/days/${id}`, { method: 'DELETE' })
    if (!res.ok) dispatch({ type: 'REVERT', days: prev })
  }

  async function addDay() {
    const nextNum = Math.max(0, ...days.map(d => d.day_number)) + 1
    const draft: Omit<Day, 'id' | 'created_at'> = {
      trip_id: tripId,
      day_number: nextNum,
      country_code: '??',
      city: 'New city',
      stay: null,
      transport: null,
      highlights: null,
      cost_range: null,
      notes: null,
      done: false,
    }
    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      const newDay: Day = await res.json()
      dispatch({ type: 'ADD', day: newDay })
    }
  }

  const doneCount = days.filter(d => d.done).length

  return (
    <section className="space-y-4">

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold">Itinerary</h2>
          <span className="text-sm text-muted-foreground">{days.length} days</span>
        </div>
        {isAdmin && (
          <button
            onClick={addDay}
            className="text-sm rounded-md border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            + Add day
          </button>
        )}
      </div>

      {days.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{doneCount} / {days.length} days done</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: days.length ? `${(doneCount / days.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {days.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-xl text-sm text-muted-foreground">
          No days yet.
          {isAdmin && <> Click <button onClick={addDay} className="underline hover:text-foreground">Add day</button> to start.</>}
        </div>
      ) : (
        <div className="space-y-2">
          {days.map(day => (
            <DayCard
              key={day.id}
              day={day}
              dayNum={day.day_number}
              onUpdate={patch => updateDay(day.id, patch)}
              onDelete={() => deleteDay(day.id)}
              onToggleDone={() => updateDay(day.id, { done: !day.done })}
            />
          ))}
        </div>
      )}

    </section>
  )
}
