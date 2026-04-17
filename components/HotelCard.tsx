'use client'

import { useState } from 'react'
import { InlineEdit } from './InlineEdit'
import type { Hotel } from '@/types'

type Props = {
  hotel: Hotel
  onUpdate: (patch: Partial<Hotel>) => Promise<void>
  onDelete: () => Promise<void>
  onToggleSelected: () => Promise<void>
}

export function HotelCard({ hotel, onUpdate, onDelete, onToggleSelected }: Props) {
  const [editingNotes, setEditingNotes] = useState(false)

  return (
    <div className={`rounded-xl border bg-card p-4 transition-colors
      ${hotel.selected ? 'border-primary/50 bg-primary/[0.02]' : ''}`}>

      <div className="flex items-start gap-3">
        <span className="text-xs uppercase text-muted-foreground font-medium tracking-wide mt-1 shrink-0 w-8">
          {hotel.country_code}
        </span>

        <div className="flex-1 min-w-0">

          <div className="flex items-baseline gap-2 flex-wrap">
            <InlineEdit
              value={hotel.name}
              onSave={v => onUpdate({ name: v })}
              placeholder="Hotel name"
              className="font-medium"
            />
            {hotel.selected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-0.5 flex-wrap">
            <span>
              <InlineEdit
                value={hotel.price_range}
                onSave={v => onUpdate({ price_range: v })}
                placeholder="€xx–xx/night"
                inputClassName="w-28"
              />
            </span>

            <span className="text-muted-foreground/50">·</span>

            <span
              className="cursor-pointer hover:bg-muted/40 -mx-1 px-1 rounded"
              onClick={() => setEditingNotes(true)}
              title="Edit notes"
            >
              {hotel.notes ? (
                <span className="truncate max-w-md inline-block align-bottom">{hotel.notes}</span>
              ) : (
                <span className="italic text-muted-foreground/60">Add notes</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-x-3 gap-y-1 text-xs mt-2 flex-wrap">
            <span className="text-amber-600 dark:text-amber-400">
              <InlineEdit
                value={hotel.rating}
                onSave={v => onUpdate({ rating: v })}
                placeholder="0.0★"
                inputClassName="w-16"
              />
            </span>

            <span className="text-muted-foreground/50">·</span>

            {hotel.booking_url ? (
              <a
                href={hotel.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Book ↗
              </a>
            ) : (
              <InlineEdit
                value={hotel.booking_url}
                onSave={v => onUpdate({ booking_url: v })}
                placeholder="Add booking URL"
                className="text-xs text-muted-foreground"
                inputClassName="text-xs"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onToggleSelected}
            className={`text-xs rounded-md border px-2.5 py-1 transition-colors
              ${hotel.selected ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
          >
            {hotel.selected ? '✓' : 'Pick'}
          </button>
          <button
            onClick={() => { if (confirm('Delete this hotel?')) onDelete() }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* notes + booking URL modal */}
      {editingNotes && (
        <NotesModal
          hotel={hotel}
          onSave={async patch => { await onUpdate(patch); setEditingNotes(false) }}
          onClose={() => setEditingNotes(false)}
        />
      )}
    </div>
  )
}

function NotesModal({
  hotel,
  onSave,
  onClose,
}: {
  hotel: Hotel
  onSave: (patch: Partial<Hotel>) => Promise<void>
  onClose: () => void
}) {
  const [notes, setNotes]             = useState(hotel.notes ?? '')
  const [bookingUrl, setBookingUrl]   = useState(hotel.booking_url ?? '')
  const [saving, setSaving]           = useState(false)

  async function save() {
    setSaving(true)
    try { await onSave({ notes, booking_url: bookingUrl || null }) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b">
          <h3 className="font-semibold">Edit hotel details</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{hotel.name}</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Location, amenities, impressions"
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Booking URL
            </label>
            <input
              type="url"
              value={bookingUrl}
              onChange={e => setBookingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            onClick={save}
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
