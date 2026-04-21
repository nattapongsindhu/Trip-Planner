'use client'

import { useReducer, useCallback, useState } from 'react'
import { formatUsd, calcBudgetSummary } from '@/lib/formatters'
import InlineEdit from './InlineEdit'
import type { BudgetItem, BudgetCategory } from '@/types'

type State = {
  items: BudgetItem[]
  saving: string | null
}

type Action =
  | { type: 'UPDATE_ITEM'; payload: BudgetItem }
  | { type: 'ADD_ITEM';    payload: BudgetItem }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'SET_SAVING';  id: string | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_ITEM':
      return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] }
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) }
    case 'SET_SAVING':
      return { ...state, saving: action.id }
    default:
      return state
  }
}

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  accommodation: 'Hotel',
  transport:     'Transport',
  food:          'Food & drinks',
  activities:    'Activities',
  misc:          'Miscellaneous',
}

type Props = {
  items: BudgetItem[]
  tripId: string
  isAdmin: boolean
}

export function BudgetTracker({ items: initialItems, tripId, isAdmin }: Props) {
  const [state, dispatch] = useReducer(reducer, { items: initialItems, saving: null })
  const summary = calcBudgetSummary(state.items)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftItem, setDraftItem] = useState<BudgetItem | null>(null)

  const saveEdit = useCallback(async () => {
    if (!draftItem) return
    const res = await fetch(`/api/trips/${tripId}/budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftItem),
    })
    if (!res.ok) { console.error('Failed to update budget item:', res.status, res.statusText); return }
    const updated: BudgetItem = await res.json()
    dispatch({ type: 'UPDATE_ITEM', payload: updated })
    setEditingId(null); setDraftItem(null)
  }, [draftItem, tripId])

  const toggleActual = useCallback(async (item: BudgetItem) => {
    const updated = { ...item, is_actual: !item.is_actual }
    dispatch({ type: 'UPDATE_ITEM', payload: updated })
    dispatch({ type: 'SET_SAVING', id: item.id })
    const res = await fetch(`/api/trips/${tripId}/budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_actual: updated.is_actual }),
    })
    if (!res.ok) {
      console.error('Failed to toggle actual status:', res.status, res.statusText)
      dispatch({ type: 'UPDATE_ITEM', payload: item })
    }
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  const deleteItem = useCallback(async (item: BudgetItem) => {
    dispatch({ type: 'DELETE_ITEM', id: item.id })
    const res = await fetch(`/api/trips/${tripId}/budget?itemId=${item.id}`, { method: 'DELETE' })
    if (!res.ok) {
      console.error('Failed to delete budget item:', res.status, res.statusText)
      dispatch({ type: 'ADD_ITEM', payload: item })
    }
  }, [tripId])

  return (
    <div className="flex flex-col gap-4">

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total estimated</p>
          <p className="text-xl font-semibold">{formatUsd(summary.total_estimated)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total actual</p>
          <p className="text-xl font-semibold">{formatUsd(summary.total_actual)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Items</p>
          <p className="text-xl font-semibold">{state.items.length}</p>
        </div>
      </div>

      {(Object.entries(CATEGORY_LABELS) as [BudgetCategory, string][]).map(([cat, label]) => {
        const catItems = state.items.filter(i => i.category === cat)
        if (catItems.length === 0) return null

        return (
          <div key={cat}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </h3>
              <span className="text-xs text-muted-foreground">
                {formatUsd(summary.by_category[cat] ?? 0)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {catItems.map(item => {
                if (editingId === item.id && draftItem) {
                  return (
                    <div key={item.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 flex-wrap">
                      <select value={draftItem.category}
                        onChange={e => setDraftItem(d => d && ({ ...d, category: e.target.value as BudgetCategory }))}
                        className="text-xs rounded-lg border bg-background px-2 py-1 focus:outline-none">
                        {(Object.keys(CATEGORY_LABELS) as BudgetCategory[]).map(c => (
                          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                        ))}
                      </select>
                      <input type="text" value={draftItem.label}
                        onChange={e => setDraftItem(d => d && ({ ...d, label: e.target.value }))}
                        className="flex-1 text-xs rounded-lg border bg-background px-2 py-1 focus:outline-none min-w-0" />
                      <input type="number" min={0} value={draftItem.amount_eur}
                        onChange={e => setDraftItem(d => d && ({ ...d, amount_eur: parseFloat(e.target.value) || 0 }))}
                        className="w-20 text-xs rounded-lg border bg-background px-2 py-1 focus:outline-none" />
                      <button onClick={saveEdit}
                        className="text-xs px-2 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
                        Save
                      </button>
                      <button onClick={() => { setEditingId(null); setDraftItem(null) }}
                        className="text-xs px-2 py-1 rounded-lg border hover:bg-accent transition-colors shrink-0">
                        Cancel
                      </button>
                    </div>
                  )
                }
                return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    {isAdmin ? (
                      <InlineEdit
                        value={item.label}
                        className={`text-sm ${item.is_actual ? 'text-muted-foreground line-through' : ''}`}
                        onSave={async (val) => {
                          const res = await fetch(`/api/trips/${tripId}/budget`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: item.id, label: val }),
                          })
                          if (!res.ok) { console.error('Failed to update label:', res.status, res.statusText); return }
                          dispatch({ type: 'UPDATE_ITEM', payload: { ...item, label: val } })
                        }}
                      />
                    ) : (
                      <p className={`text-sm truncate ${item.is_actual ? 'text-muted-foreground line-through' : ''}`}>
                        {item.label}
                      </p>
                    )}
                  </div>

                  <span className="text-sm font-medium shrink-0">
                    {isAdmin ? (
                      <InlineEdit
                        value={String(item.amount_eur)}
                        inputClassName="w-20 text-right"
                        onSave={async (val) => {
                          const num = parseFloat(val)
                          if (isNaN(num) || !isFinite(num) || num < 0) return
                          const res = await fetch(`/api/trips/${tripId}/budget`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: item.id, amount_eur: num }),
                          })
                          if (!res.ok) { console.error('Failed to update amount:', res.status, res.statusText); return }
                          dispatch({ type: 'UPDATE_ITEM', payload: { ...item, amount_eur: num } })
                        }}
                      />
                    ) : (
                      formatUsd(item.amount_eur)
                    )}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleActual(item)}
                        disabled={state.saving === item.id}
                        className={`text-xs px-2 py-1 rounded-lg border transition-colors
                          disabled:opacity-50
                          ${item.is_actual
                            ? 'border-green-500/40 text-green-600 dark:text-green-400'
                            : 'text-muted-foreground hover:border-border'
                          }`}
                      >
                        {item.is_actual ? '✓ actual' : 'estimate'}
                      </button>
                      <button
                        onClick={() => { setDraftItem({ ...item }); setEditingId(item.id) }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {state.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No budget items yet.</p>
      )}

      {isAdmin && <AddItemForm tripId={tripId} onAdd={item => dispatch({ type: 'ADD_ITEM', payload: item })} />}
    </div>
  )
}

function AddItemForm({ tripId, onAdd }: { tripId: string; onAdd: (item: BudgetItem) => void }) {
  const [open, setOpen]         = useState(false)
  const [category, setCategory] = useState<BudgetCategory>('misc')
  const [label, setLabel]       = useState('')
  const [amount, setAmount]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) { setError('Label is required'); return }
    setSaving(true); setError(null)
    const res = await fetch(`/api/trips/${tripId}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, label: label.trim(), amount_eur: parseFloat(amount) || 0, is_actual: false }),
    })
    setSaving(false)
    if (!res.ok) { setError('Failed to add item'); return }
    const item: BudgetItem = await res.json()
    onAdd(item)
    setLabel(''); setAmount(''); setOpen(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors">
      + Add item
    </button>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border bg-card p-3">
      <div className="flex gap-2">
        <select value={category} onChange={e => setCategory(e.target.value as BudgetCategory)}
          className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none">
          <option value="accommodation">Hotel</option>
          <option value="transport">Transport</option>
          <option value="food">Food & drinks</option>
          <option value="activities">Activities</option>
          <option value="misc">Miscellaneous</option>
        </select>
        <input type="text" placeholder="Label" value={label} onChange={e => setLabel(e.target.value)}
          className="flex-1 text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)}
          min={0} step={1}
          className="w-20 text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
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
