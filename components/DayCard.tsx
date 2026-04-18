'use client'

import { useState } from 'react'
import { countryFlag, formatCostRange } from '@/lib/formatters'
import { DayNoteEditor } from './DayNoteEditor'
import InlineEdit from './InlineEdit'
import { createClient } from '@/lib/supabaseClient'
import type { Day } from '@/types'

type Props = {
  day: Day
  isAdmin: boolean
  saving: boolean
  onToggleDone: (day: Day) => void
  onSaveNote: (day: Day, note: string) => void
}

export function DayCard({ day, isAdmin, saving, onToggleDone, onSaveNote }: Props) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()

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
                  const { error } = await supabase.from('days').update({ city: val }).eq('id', day.id)
                  if (error) console.error('Failed to update city:', error.message)
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
                  const { error } = await supabase.from('days').update({ stay: val }).eq('id', day.id)
                  if (error) console.error('Failed to update stay:', error.message)
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
            <button
              onClick={() => onToggleDone(day)}
              disabled={saving}
              className={`self-start text-xs px-3 py-1.5 rounded-lg border
                transition-colors disabled:opacity-50
                ${day.is_done
                  ? 'border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10'
                  : 'hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400'
                }`}
            >
              {saving ? 'Saving…' : day.is_done ? '✓ Done' : 'Mark as done'}
            </button>
          )}

        </div>
      )}
    </div>
  )
}
