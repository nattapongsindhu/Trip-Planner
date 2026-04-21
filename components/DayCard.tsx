'use client'

import { useState } from 'react'
import { countryFlag, formatCostRange } from '@/lib/formatters'
import { DayNoteEditor } from './DayNoteEditor'
import InlineEdit from './InlineEdit'
import type { Day } from '@/types'

type Props = {
  day: Day
  isAdmin: boolean
  saving: boolean
  onToggleDone: (day: Day) => void
  onSaveNote: (day: Day, note: string) => void
  onUpdate: (day: Day) => void
  onDelete: (day: Day) => void
}

export function DayCard({ day, isAdmin, saving, onToggleDone, onSaveNote, onUpdate, onDelete }: Props) {
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(day)

  if (editing) {
    return (
      <div className="rounded-xl border bg-card px-4 py-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
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
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs text-muted-foreground">Stay</label>
            <input type="text" value={draft.stay ?? ''}
              onChange={e => setDraft(d => ({ ...d, stay: e.target.value || null }))}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs text-muted-foreground">Note</label>
            <textarea value={draft.note ?? ''}
              onChange={e => setDraft(d => ({ ...d, note: e.target.value || null }))}
              rows={3}
              className="text-xs rounded-lg border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onUpdate(draft); setEditing(false) }} disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => { setDraft(day); setEditing(false) }}
            className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border bg-card transition-colors
        ${day.is_done
          ? 'border-green-500/30 opacity-75'
          : 'hover:border-primary/30'
        }`}
    >
      {/* header row — always visible, click to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* day number badge */}
        <span className="shrink-0 w-9 h-9 rounded-full bg-muted flex items-center
                         justify-center text-xs font-semibold">
          {day.day_number}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <span>{countryFlag(day.country_code)}</span>
            {isAdmin ? (
              <InlineEdit
                value={day.city}
                className="truncate"
                onSave={async (val) => {
                  const res = await fetch(`/api/trips/${day.trip_id}/days`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: day.id, city: val }),
                  })
                  if (!res.ok) console.error('Failed to update city:', res.status, res.statusText)
                }}
              />
            ) : (
              <span className="truncate">{day.city}</span>
            )}
            {day.is_transfer && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10
                               text-amber-600 dark:text-amber-400 border
                               border-amber-500/20 shrink-0">
                transit
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {isAdmin ? (
              <InlineEdit
                value={day.stay ?? '—'}
                onSave={async (val) => {
                  const res = await fetch(`/api/trips/${day.trip_id}/days`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: day.id, stay: val }),
                  })
                  if (!res.ok) console.error('Failed to update stay:', res.status, res.statusText)
                }}
              />
            ) : (
              day.stay ?? '—'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {formatCostRange(day.cost_eur_min, day.cost_eur_max)}
          </span>
          <span className="text-muted-foreground text-xs">
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* expanded body */}
      {open && (
        <div className="border-t px-4 py-4 flex flex-col gap-4">

          {day.highlights && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Highlights</p>
              <p className="text-sm leading-relaxed">{day.highlights}</p>
            </div>
          )}

          {day.transport && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Transport</p>
              <p className="text-sm leading-relaxed">{day.transport}</p>
            </div>
          )}

          {day.book_by && (
            <p className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10
                          text-amber-600 dark:text-amber-400 border border-amber-500/20">
              ⚠ {day.book_by}
            </p>
          )}

          <DayNoteEditor
            day={day}
            isAdmin={isAdmin}
            saving={saving}
            onSave={note => onSaveNote(day, note)}
          />

          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleDone(day)}
                disabled={saving}
                className={`text-xs px-3 py-1.5 rounded-lg border
                  transition-colors disabled:opacity-50
                  ${day.is_done
                    ? 'border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10'
                    : 'hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400'
                  }`}
              >
                {saving ? 'Saving…' : day.is_done ? '✓ Done' : 'Mark as done'}
              </button>
              <button
                onClick={() => { setDraft(day); setEditing(true) }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(day)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Delete day
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
