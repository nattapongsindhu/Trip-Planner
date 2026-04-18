'use client'

import { useReducer, useCallback } from 'react'
import { DayCard } from './DayCard'
import type { Day } from '@/types'

type State = {
  days: Day[]
  saving: string | null // id of the day currently being saved
}

type Action =
  | { type: 'UPDATE_DAY';  payload: Day }
  | { type: 'SET_SAVING';  id: string | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_DAY':
      return {
        ...state,
        days: state.days.map(d =>
          d.id === action.payload.id ? action.payload : d
        ),
      }
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
  const [state, dispatch] = useReducer(reducer, {
    days: initialDays,
    saving: null,
  })

  // optimistic toggle — updates UI immediately, reverts on server failure
  const toggleDone = useCallback(async (day: Day) => {
    const updated = { ...day, is_done: !day.is_done }
    dispatch({ type: 'UPDATE_DAY', payload: updated })
    dispatch({ type: 'SET_SAVING', id: day.id })

    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: day.id, is_done: updated.is_done }),
    })

    if (!res.ok) {
      console.error('Failed to toggle day done:', res.status, res.statusText)
      dispatch({ type: 'UPDATE_DAY', payload: day })
    }

    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  // saves the note text for a specific day
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
    } else {
      console.error('Failed to save note:', res.status, res.statusText)
    }

    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  if (state.days.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No days added yet.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {state.days.map(day => (
        <DayCard
          key={day.id}
          day={day}
          isAdmin={isAdmin}
          saving={state.saving === day.id}
          onToggleDone={toggleDone}
          onSaveNote={saveNote}
        />
      ))}
    </div>
  )
}
