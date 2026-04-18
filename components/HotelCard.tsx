'use client'

import { countryFlag } from '@/lib/formatters'
import InlineEdit from './InlineEdit'
import type { Hotel } from '@/types'

type Props = {
  hotel: Hotel
  isAdmin: boolean
  saving: boolean
  onToggleSelected: (hotel: Hotel) => void
}

export function HotelCard({ hotel, isAdmin, saving, onToggleSelected }: Props) {
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
            <button
              onClick={() => onToggleSelected(hotel)}
              disabled={saving}
              className="text-xs text-muted-foreground hover:text-foreground
                         transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : hotel.is_selected ? 'Deselect' : 'Select'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}