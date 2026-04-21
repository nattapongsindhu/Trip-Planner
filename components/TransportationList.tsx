'use client'

import { useReducer, useCallback, useState } from 'react'
import { formatUsd } from '@/lib/formatters'
import type { Transportation, TransportType } from '@/types'

const TYPE_LABELS: Record<TransportType, string> = {
  flight: '✈ Flight',
  train:  '🚆 Train',
  bus:    '🚌 Bus',
  car:    '🚗 Car',
  other:  '🚀 Other',
}

type State = { items: Transportation[]; saving: string | null }

type Action =
  | { type: 'UPDATE'; payload: Transportation }
  | { type: 'ADD';    payload: Transportation }
  | { type: 'DELETE'; id: string }
  | { type: 'SET_SAVING'; id: string | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE':  return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'ADD':     return { ...state, items: [...state.items, action.payload] }
    case 'DELETE':  return { ...state, items: state.items.filter(i => i.id !== action.id) }
    case 'SET_SAVING': return { ...state, saving: action.id }
    default: return state
  }
}

type Props = { items: Transportation[]; tripId: string; isAdmin: boolean; startDate?: string | null; endDate?: string | null }

function clampDate(date: string, min?: string | null, max?: string | null): string {
  if (!date) return date
  if (min && date < min) return min
  if (max && date > max) return max
  return date
}

export function TransportationList({ items: initialItems, tripId, isAdmin, startDate, endDate }: Props) {
  const [state, dispatch] = useReducer(reducer, { items: initialItems, saving: null })

  const deleteItem = useCallback(async (item: Transportation) => {
    dispatch({ type: 'DELETE', id: item.id })
    const res = await fetch(`/api/trips/${tripId}/transportation?itemId=${item.id}`, { method: 'DELETE' })
    if (!res.ok) dispatch({ type: 'ADD', payload: item })
  }, [tripId])

  const updateItem = useCallback(async (updated: Transportation) => {
    dispatch({ type: 'SET_SAVING', id: updated.id })
    const res = await fetch(`/api/trips/${tripId}/transportation`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      const data: Transportation = await res.json()
      dispatch({ type: 'UPDATE', payload: data })
    }
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  return (
    <div className="flex flex-col gap-2">
      {state.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">No transportation added yet.</p>
      )}
      {state.items.map(item => (
        <TransportationCard
          key={item.id}
          item={item}
          isAdmin={isAdmin}
          saving={state.saving === item.id}
          onUpdate={updateItem}
          onDelete={deleteItem}
          startDate={startDate}
          endDate={endDate}
        />
      ))}
      {isAdmin && (
        <AddTransportationForm
          tripId={tripId}
          onAdd={item => dispatch({ type: 'ADD', payload: item })}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  )
}

function TransportationCard({
  item, isAdmin, saving, onUpdate, onDelete, startDate, endDate,
}: {
  item: Transportation
  isAdmin: boolean
  saving: boolean
  onUpdate: (item: Transportation) => void
  onDelete: (item: Transportation) => void
  startDate?: string | null
  endDate?: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(item)

  if (editing) {
    return (
      <div className="rounded-xl border bg-card px-4 py-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Type</label>
            <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value as TransportType }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none">
              {(Object.keys(TYPE_LABELS) as TransportType[]).map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Date</label>
            <input type="date" value={draft.date ?? ''}
              min={startDate ?? undefined} max={endDate ?? undefined}
              onChange={e => {
                const clamped = e.target.value ? clampDate(e.target.value, startDate, endDate) : null
                setDraft(d => ({ ...d, date: clamped }))
              }}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">From</label>
            <input type="text" value={draft.from_location}
              onChange={e => setDraft(d => ({ ...d, from_location: e.target.value }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">To</label>
            <input type="text" value={draft.to_location}
              onChange={e => setDraft(d => ({ ...d, to_location: e.target.value }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Cost (USD)</label>
            <input type="number" min={0} step={1} value={draft.cost_usd ?? ''}
              onChange={e => setDraft(d => ({ ...d, cost_usd: e.target.value ? parseFloat(e.target.value) : null }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Notes</label>
            <input type="text" value={draft.notes ?? ''}
              onChange={e => setDraft(d => ({ ...d, notes: e.target.value || null }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onUpdate(draft); setEditing(false) }} disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => { setDraft(item); setEditing(false) }}
            className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card px-4 py-3 flex items-start gap-3">
      <span className="text-xs font-medium px-2 py-1 rounded-lg bg-muted shrink-0 mt-0.5">
        {TYPE_LABELS[item.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {item.from_location} → {item.to_location}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          {item.date && <span>{item.date}</span>}
          {item.cost_usd != null && <span>{formatUsd(item.cost_usd)}</span>}
          {item.notes && <span className="truncate">{item.notes}</span>}
        </div>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Edit
          </button>
          <button onClick={() => onDelete(item)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function AddTransportationForm({ tripId, onAdd, startDate, endDate }: { tripId: string; onAdd: (item: Transportation) => void; startDate?: string | null; endDate?: string | null }) {
  const [open, setOpen]     = useState(false)
  const [type, setType]     = useState<TransportType>('flight')
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [date, setDate]     = useState('')
  const [cost, setCost]     = useState('')
  const [notes, setNotes]   = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!from.trim() || !to.trim()) { setError('From and To are required'); return }
    setSaving(true); setError(null)
    const res = await fetch(`/api/trips/${tripId}/transportation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        from_location: from.trim(),
        to_location: to.trim(),
        date: date || null,
        cost_usd: cost ? parseFloat(cost) : null,
        notes: notes.trim() || null,
      }),
    })
    setSaving(false)
    if (!res.ok) { setError('Failed to add item'); return }
    const item: Transportation = await res.json()
    onAdd(item)
    setFrom(''); setTo(''); setDate(''); setCost(''); setNotes(''); setOpen(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
      + Add transportation
    </button>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border bg-card p-3 mt-1">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <select value={type} onChange={e => setType(e.target.value as TransportType)}
            className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none">
            {(Object.keys(TYPE_LABELS) as TransportType[]).map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Date</label>
          <input type="date" value={date}
            min={startDate ?? undefined} max={endDate ?? undefined}
            onChange={e => setDate(e.target.value ? clampDate(e.target.value, startDate, endDate) : '')}
            className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">From</label>
          <input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="Origin"
            className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">To</label>
          <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="Destination"
            className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Cost (USD)</label>
          <input type="number" min={0} step={1} value={cost} onChange={e => setCost(e.target.value)}
            className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Notes</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? 'Adding…' : 'Add'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
