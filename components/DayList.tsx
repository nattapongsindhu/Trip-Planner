'use client'

import { useReducer, useCallback, useState } from 'react'
import { DayCard } from './DayCard'
import type { Day } from '@/types'

type State = {
  days: Day[]
  saving: string | null
}

type Action =
  | { type: 'UPDATE_DAY';  payload: Day }
  | { type: 'ADD_DAY';     payload: Day }
  | { type: 'DELETE_DAY';  id: string }
  | { type: 'SET_SAVING';  id: string | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_DAY':
      return { ...state, days: state.days.map(d => d.id === action.payload.id ? action.payload : d) }
    case 'ADD_DAY':
      return { ...state, days: [...state.days, action.payload] }
    case 'DELETE_DAY':
      return { ...state, days: state.days.filter(d => d.id !== action.id) }
    case 'SET_SAVING':
      return { ...state, saving: action.id }
    default:
      return state
  }
}

type Props = {
  days: Day[]
  tripId: string
  isAdmin: boolean
}

export function DayList({ days: initialDays, tripId, isAdmin }: Props) {
  const [state, dispatch] = useReducer(reducer, { days: initialDays, saving: null })

  const toggleDone = useCallback(async (day: Day) => {
    const updated = { ...day, is_done: !day.is_done }
    dispatch({ type: 'UPDATE_DAY', payload: updated })
    dispatch({ type: 'SET_SAVING', id: day.id })
    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: day.id, is_done: updated.is_done }),
    })
    if (!res.ok) dispatch({ type: 'UPDATE_DAY', payload: day })
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  const saveNote = useCallback(async (day: Day, note: string) => {
    dispatch({ type: 'SET_SAVING', id: day.id })
    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: day.id, note }),
    })
    if (res.ok) {
      const data: Day = await res.json()
      dispatch({ type: 'UPDATE_DAY', payload: data })
    }
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  const updateDay = useCallback(async (updated: Day) => {
    dispatch({ type: 'SET_SAVING', id: updated.id })
    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      const data: Day = await res.json()
      dispatch({ type: 'UPDATE_DAY', payload: data })
    }
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  const deleteDay = useCallback(async (day: Day) => {
    dispatch({ type: 'DELETE_DAY', id: day.id })
    const res = await fetch(`/api/trips/${tripId}/days?dayId=${day.id}`, { method: 'DELETE' })
    if (!res.ok) dispatch({ type: 'ADD_DAY', payload: day })
  }, [tripId])

  return (
    <div className="flex flex-col gap-2">
      {state.days.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">No days added yet.</p>
      )}
      {state.days.map(day => (
        <DayCard
          key={day.id}
          day={day}
          isAdmin={isAdmin}
          saving={state.saving === day.id}
          onToggleDone={toggleDone}
          onSaveNote={saveNote}
          onUpdate={updateDay}
          onDelete={deleteDay}
        />
      ))}
      {isAdmin && <AddDayForm tripId={tripId} onAdd={day => dispatch({ type: 'ADD_DAY', payload: day })} />}
    </div>
  )
}

function AddDayForm({ tripId, onAdd }: { tripId: string; onAdd: (day: Day) => void }) {
  const [open, setOpen]               = useState(false)
  const [city, setCity]               = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!city.trim() || !countryCode.trim()) { setError('City and country code are required'); return }
    setSaving(true); setError(null)
    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: city.trim(), country_code: countryCode.trim().toUpperCase() }),
    })
    setSaving(false)
    if (!res.ok) { setError('Failed to add day'); return }
    const day: Day = await res.json()
    onAdd(day)
    setCity(''); setCountryCode(''); setOpen(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
      + Add day
    </button>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border bg-card p-3 mt-1">
      <div className="flex gap-2">
        <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)}
          className="flex-1 text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        <input type="text" placeholder="CC (e.g. DE)" value={countryCode} onChange={e => setCountryCode(e.target.value.toUpperCase())}
          maxLength={2}
          style={{ textTransform: 'uppercase' }}
          className="w-20 text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? 'Adding…' : 'Add day'}
        </button>
        <button type="button" onClick={() => { setCity(''); setCountryCode(''); setError(null) }}
          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
          Clear
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
