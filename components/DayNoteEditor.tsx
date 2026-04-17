'use client'

import { useState, useEffect } from 'react'
import type { Day } from '@/types'

type Props = {
  day: Day
  isAdmin: boolean
  saving: boolean
  onSave: (note: string) => void
}

export function DayNoteEditor({ day, isAdmin, saving, onSave }: Props) {
  const [note, setNote]   = useState(day.note ?? '')
  const [dirty, setDirty] = useState(false)

  // sync local state when the parent updates the day (e.g. after an optimistic revert)
  useEffect(() => {
    setNote(day.note ?? '')
    setDirty(false)
  }, [day.note])

  function handleChange(value: string) {
    setNote(value)
    setDirty(value !== (day.note ?? ''))
  }

  function handleSave() {
    onSave(note)
    setDirty(false)
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">Notes</p>

      {isAdmin ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={note}
            onChange={e => handleChange(e.target.value)}
            placeholder="Add a note for this day…"
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm
                       resize-none focus:outline-none focus:ring-2 focus:ring-primary/30
                       placeholder:text-muted-foreground"
          />
          {/* save button only appears when the content has changed */}
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="self-end text-xs px-3 py-1.5 rounded-lg bg-primary
                         text-primary-foreground hover:opacity-90 transition-opacity
                         disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save note'}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          {day.note ?? 'No notes yet.'}
        </p>
      )}
    </div>
  )
}
