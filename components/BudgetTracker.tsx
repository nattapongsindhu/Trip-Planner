'use client'

// BudgetTracker — grouped by category, inline edit for label + amount
// Actual column shown only when any item has actual set
import { useReducer, useState } from 'react'
import { InlineEdit } from './InlineEdit'
import type { BudgetItem } from '@/types'

type Action =
  | { type: 'UPDATE'; id: string; patch: Partial<BudgetItem> }
  | { type: 'DELETE'; id: string }
  | { type: 'ADD'; item: BudgetItem }
  | { type: 'REVERT'; items: BudgetItem[] }

function reducer(state: BudgetItem[], action: Action): BudgetItem[] {
  switch (action.type) {
    case 'UPDATE': return state.map(i => i.id === action.id ? { ...i, ...action.patch } : i)
    case 'DELETE': return state.filter(i => i.id !== action.id)
    case 'ADD':    return [...state, action.item]
    case 'REVERT': return action.items
  }
}

const DEFAULT_CATEGORIES = ['Transport', 'Food & drinks', 'Activities', 'Miscellaneous']

type Props = {
  tripId:        string
  initialItems:  BudgetItem[]
  isAdmin:       boolean
}

export function BudgetTracker({ tripId, initialItems, isAdmin }: Props) {
  const [items, dispatch] = useReducer(reducer, initialItems)
  const [showActual, setShowActual] = useState(false)

  async function updateItem(id: string, patch: Partial<BudgetItem>) {
    const prev = items
    dispatch({ type: 'UPDATE', id, patch })
    const res = await fetch(`/api/trips/${tripId}/budget/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) dispatch({ type: 'REVERT', items: prev })
  }

  async function deleteItem(id: string) {
    const prev = items
    dispatch({ type: 'DELETE', id })
    const res = await fetch(`/api/trips/${tripId}/budget/${id}`, { method: 'DELETE' })
    if (!res.ok) dispatch({ type: 'REVERT', items: prev })
  }

  async function addItem(category: string) {
    const draft = {
      trip_id:          tripId,
      category,
      label:            'New item',
      estimate_eur:     0,
      actual_eur:       null,
    }
    const res = await fetch(`/api/trips/${tripId}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      const newItem: BudgetItem = await res.json()
      dispatch({ type: 'ADD', item: newItem })
    }
  }

  // group by category preserving insertion order
  const grouped = items.reduce<Record<string, BudgetItem[]>>((acc, i) => {
    if (!acc[i.category]) acc[i.category] = []
    acc[i.category].push(i)
    return acc
  }, {})

  const categories = [
    ...DEFAULT_CATEGORIES.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !DEFAULT_CATEGORIES.includes(c)),
  ]

  const totalEstimate = items.reduce((sum, i) => sum + (i.estimate_eur ?? 0), 0)
  const totalActual   = items.reduce((sum, i) => sum + (i.actual_eur ?? 0), 0)
  const hasActuals    = items.some(i => i.actual_eur !== null && i.actual_eur > 0)

  return (
    <section className="space-y-4">

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Budget</h2>
        {isAdmin && (
          <div className="flex items-center gap-2">
            {hasActuals && (
              <button
                onClick={() => setShowActual(x => !x)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showActual ? 'Show estimates' : 'Show actuals'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Total estimated</p>
          <p className="text-xl font-semibold mt-1">€{totalEstimate.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Total actual</p>
          <p className="text-xl font-semibold mt-1">€{totalActual.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="text-xl font-semibold mt-1">{items.length}</p>
        </div>
      </div>

      {/* line items grouped by category */}
      {items.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-xl text-sm text-muted-foreground">
          No budget items yet.
          {isAdmin && (
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              {DEFAULT_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => addItem(c)}
                  className="text-xs rounded-md border px-3 py-1.5 hover:bg-muted transition-colors"
                >
                  + {c}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map(category => {
            const catItems = grouped[category]
            const catTotal = catItems.reduce(
              (s, i) => s + ((showActual ? i.actual_eur : i.estimate_eur) ?? 0), 0
            )
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    {category}
                  </h3>
                  <span className="text-xs text-muted-foreground">€{catTotal.toLocaleString()}</span>
                </div>

                {catItems.map(item => (
                  <BudgetRow
                    key={item.id}
                    item={item}
                    showActual={showActual}
                    onUpdate={patch => updateItem(item.id, patch)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}

                {isAdmin && (
                  <button
                    onClick={() => addItem(category)}
                    className="text-xs text-muted-foreground hover:text-foreground -mt-1 ml-1"
                  >
                    + Add item
                  </button>
                )}
              </div>
            )
          })}

          {isAdmin && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Add category:</p>
              <div className="flex items-center gap-2 flex-wrap">
                {DEFAULT_CATEGORIES.filter(c => !grouped[c]).map(c => (
                  <button
                    key={c}
                    onClick={() => addItem(c)}
                    className="text-xs rounded-md border px-3 py-1.5 hover:bg-muted transition-colors"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </section>
  )
}

// Single budget row — label + amount both editable inline
function BudgetRow({
  item,
  showActual,
  onUpdate,
  onDelete,
}: {
  item: BudgetItem
  showActual: boolean
  onUpdate: (patch: Partial<BudgetItem>) => Promise<void>
  onDelete: () => Promise<void>
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <div className="flex-1 min-w-0">
        <InlineEdit
          value={item.label}
          onSave={v => onUpdate({ label: v })}
          placeholder="Item name"
          className="text-sm"
        />
      </div>
      <div className="shrink-0 text-sm tabular-nums">
        <InlineEdit
          value={showActual ? (item.actual_eur ?? 0) : (item.estimate_eur ?? 0)}
          onSave={v => onUpdate(
            showActual
              ? { actual_eur: Number(v) || 0 }
              : { estimate_eur: Number(v) || 0 }
          )}
          type="number"
          placeholder="0"
          prefix="€"
          inputClassName="w-24 text-right"
        />
      </div>
      <button
        onClick={() => { if (confirm('Delete this item?')) onDelete() }}
        className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete item"
      >
        ×
      </button>
    </div>
  )
}
