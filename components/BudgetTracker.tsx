'use client'

import { useReducer, useCallback } from 'react'
import { formatEur, calcBudgetSummary } from '@/lib/formatters'
import InlineEdit from './InlineEdit'
import { createClient } from '@/lib/supabaseClient'
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
  accommodation: 'Accommodation',
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
  const supabase = createClient()
  const summary = calcBudgetSummary(state.items)

  const toggleActual = useCallback(async (item: BudgetItem) => {
    const updated = { ...item, is_actual: !item.is_actual }
    dispatch({ type: 'UPDATE_ITEM', payload: updated })
    dispatch({ type: 'SET_SAVING', id: item.id })
    const res = await fetch(`/api/trips/${tripId}/budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_actual: updated.is_actual }),
    })
    if (!res.ok) dispatch({ type: 'UPDATE_ITEM', payload: item })
    dispatch({ type: 'SET_SAVING', id: null })
  }, [tripId])

  const deleteItem = useCallback(async (item: BudgetItem) => {
    dispatch({ type: 'DELETE_ITEM', id: item.id })
    const res = await fetch(`/api/trips/${tripId}/budget?itemId=${item.id}`, { method: 'DELETE' })
    if (!res.ok) dispatch({ type: 'ADD_ITEM', payload: item })
  }, [tripId])

  return (
    <div className="flex flex-col gap-4">

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                {formatEur(summary.by_category[cat] ?? 0)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {catItems.map(item => (
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
                          await supabase.from('budget_items').update({ label: val }).eq('id', item.id)
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
                          if (isNaN(num)) return
                          await supabase.from('budget_items').update({ amount_eur: num }).eq('id', item.id)
                          dispatch({ type: 'UPDATE_ITEM', payload: { ...item, amount_eur: num } })
                        }}
                      />
                    ) : (
                      formatEur(item.amount_eur)
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
                        onClick={() => deleteItem(item)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {state.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No budget items yet.</p>
      )}
    </div>
  )
}
