'use client'

import { useState } from 'react'
import { countryFlag } from '@/lib/formatters'
import InlineEdit from './InlineEdit'
import type { Hotel } from '@/types'

type Props = {
  hotel: Hotel
  isAdmin: boolean
  saving: boolean
  onToggleSelected: (hotel: Hotel) => void
  onUpdate: (hotel: Hotel) => void
  onDelete: (hotel: Hotel) => void
}

export function HotelCard({ hotel, isAdmin, saving, onToggleSelected, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(hotel)

  if (editing) {
    return (
      <div className="rounded-xl border bg-card px-4 py-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Name</label>
            <input type="text" value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">City</label>
            <input type="text" value={draft.city}
              onChange={e => setDraft(d => ({ ...d, city: e.target.value }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Country code</label>
            <input type="text" value={draft.country_code}
              onChange={e => setDraft(d => ({ ...d, country_code: e.target.value.toUpperCase() }))}
              maxLength={2} style={{ textTransform: 'uppercase' }}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Rating</label>
            <input type="number" min={0} max={5} step={0.1} value={draft.rating ?? ''}
              onChange={e => setDraft(d => ({ ...d, rating: e.target.value ? parseFloat(e.target.value) : null }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Price min</label>
            <input type="number" min={0} value={draft.price_min ?? ''}
              onChange={e => setDraft(d => ({ ...d, price_min: e.target.value ? parseFloat(e.target.value) : null }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Price max</label>
            <input type="number" min={0} value={draft.price_max ?? ''}
              onChange={e => setDraft(d => ({ ...d, price_max: e.target.value ? parseFloat(e.target.value) : null }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs text-muted-foreground">Book URL</label>
            <input type="url" value={draft.book_url ?? ''}
              onChange={e => setDraft(d => ({ ...d, book_url: e.target.value || null }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
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
          <button onClick={() => { setDraft(hotel); setEditing(false) }}
            className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border bg-card px-4 py-3 flex items-start gap-3
        transition-colors
        ${hotel.is_selected
          ? 'border-primary/40 bg-primary/5'
          : 'hover:border-border/80'
        }`}
    >
      <span className="text-lg shrink-0 mt-0.5">
        {countryFlag(hotel.country_code)}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">
            {isAdmin ? (
              <InlineEdit
                value={hotel.name}
                onSave={async (val) => {
                  const res = await fetch(`/api/trips/${hotel.trip_id}/hotels`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: hotel.id, name: val }),
                  })
                  if (!res.ok) console.error('Failed to update hotel name:', res.status, res.statusText)
                }}
              />
            ) : (
              hotel.name
            )}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {hotel.rating && (
              <span className="text-xs text-amber-500 font-medium">
                {hotel.rating}★
              </span>
            )}
            {hotel.is_selected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10
                               text-primary border border-primary/20">
                selected
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1">
          {hotel.price_min != null && hotel.price_max != null && (
            <span className="text-xs text-muted-foreground">
              ${hotel.price_min}–{hotel.price_max}/night
            </span>
          )}
          {isAdmin ? (
            <InlineEdit
              value={hotel.notes ?? ''}
              inputClassName="w-48"
              onSave={async (val) => {
                const res = await fetch(`/api/trips/${hotel.trip_id}/hotels`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: hotel.id, notes: val }),
                })
                if (!res.ok) console.error('Failed to update hotel notes:', res.status, res.statusText)
              }}
            />
          ) : (
            hotel.notes && (
              <span className="text-xs text-muted-foreground truncate">
                {hotel.notes}
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          {hotel.book_url && (
            <a
              href={hotel.book_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Book ↗
            </a>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => onToggleSelected(hotel)}
                disabled={saving}
                className="text-xs text-muted-foreground hover:text-foreground
                           transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : hotel.is_selected ? 'Deselect' : 'Select'}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(hotel)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
