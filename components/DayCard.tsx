'use client'

// Editable day card — header fields (city, country, cost) use inline edit
// Long fields (transport, stay, highlights, notes) open in a modal
import { useState } from 'react'
import { InlineEdit } from './InlineEdit'
import type { Day } from '@/types'

type Props = {
  day: Day
  dayNum: number
  onUpdate: (patch: Partial<Day>) => Promise<void>
  onDelete: () => Promise<void>
  onToggleDone: () => Promise<void>
}

export function DayCard({ day, dayNum, onUpdate, onDelete, onToggleDone }: Props) {
  const [expanded, setExpanded]  = useState(false)
  const [editingLong, setEditingLong] = useState(false)
  const hasTransit = day.transport && day.city.includes('→')

  return (
    <div className="rounded-xl border bg-card transition-colors">

      {/* ─── Collapsed header row ─── */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggleDone}
          aria-label={day.done ? 'Mark undone' : 'Mark done'}
          className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium transition-colors
            ${day.done
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
        >
          {day.done ? '✓' : dayNum}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            {/* country code — inline editable */}
            <InlineEdit
              value={day.country_code}
              onSave={v => onUpdate({ country_code: v.toUpperCase().slice(0, 2) })}
              placeholder="??"
              className="text-xs uppercase text-muted-foreground font-medium tracking-wide"
              inputClassName="w-12 text-xs uppercase"
            />
            {/* city — inline editable */}
            <InlineEdit
              value={day.city}
              onSave={v => onUpdate({ city: v })}
              placeholder="City name"
              className="font-medium"
            />
            {hasTransit && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                transit
              </span>
            )}
          </div>

          {/* stay — short inline text under header */}
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            <InlineEdit
              value={day.stay}
              onSave={v => onUpdate({ stay: v })}
              placeholder="Add accommodation"
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <InlineEdit
            value={day.cost_range}
            onSave={v => onUpdate({ cost_range: v })}
            placeholder="Cost"
            className="text-sm text-muted-foreground"
            inputClassName="w-24 text-sm"
          />
          <button
            onClick={() => setExpanded(x => !x)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                 fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 8l4 4 4-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Expanded body ─── */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t text-sm space-y-3">

          <div className="flex items-start gap-2 pt-3">
            <span className="text-xs uppercase text-muted-foreground tracking-wide shrink-0 w-20 pt-0.5">Transport</span>
            <span className="flex-1 text-muted-foreground">
              {day.transport || <span className="italic opacity-60">Not set</span>}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-xs uppercase text-muted-foreground tracking-wide shrink-0 w-20 pt-0.5">Highlights</span>
            <span className="flex-1 text-muted-foreground">
              {day.highlights || <span className="italic opacity-60">Not set</span>}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-xs uppercase text-muted-foreground tracking-wide shrink-0 w-20 pt-0.5">Notes</span>
            <span className="flex-1 text-muted-foreground">
              {day.notes || <span className="italic opacity-60">None</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setEditingLong(true)}
              className="text-xs rounded-md border px-3 py-1.5 hover:bg-muted transition-colors"
            >
              Edit details
            </button>
            <button
              onClick={() => { if (confirm('Delete this day?')) onDelete() }}
              className="text-xs text-destructive hover:underline ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ─── Modal for long fields ─── */}
      {editingLong && (
        <DayDetailsModal
          day={day}
          onSave={async patch => { await onUpdate(patch); setEditingLong(false) }}
          onClose={() => setEditingLong(false)}
        />
      )}
    </div>
  )
}

// Modal for editing longer fields (transport, highlights, notes)
function DayDetailsModal({
  day,
  onSave,
  onClose,
}: {
  day: Day
  onSave: (patch: Partial<Day>) => Promise<void>
  onClose: () => void
}) {
  const [transport, setTransport]   = useState(day.transport ?? '')
  const [highlights, setHighlights] = useState(day.highlights ?? '')
  const [notes, setNotes]           = useState(day.notes ?? '')
  const [saving, setSaving]         = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ transport, highlights, notes })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b">
          <h3 className="font-semibold">Edit day details</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{day.city}</p>
        </div>
        <div className="p-5 space-y-4">

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Transport
            </label>
            <input
              type="text"
              value={transport}
              onChange={e => setTransport(e.target.value)}
              placeholder="How you'll get here"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Highlights
            </label>
            <textarea
              value={highlights}
              onChange={e => setHighlights(e.target.value)}
              placeholder="Things to see, do, or eat"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Private notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Reminders, addresses, tips"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>

        </div>
        <div className="p-5 border-t flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm rounded-md px-4 py-2 hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm rounded-md bg-primary text-primary-foreground px-4 py-2
                       font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
