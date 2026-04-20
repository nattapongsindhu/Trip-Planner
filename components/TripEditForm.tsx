'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VisibilityToggle } from './VisibilityToggle'
import type { Trip, TripUpdate } from '@/types'

type Props = { trip: Trip }

export function TripEditForm({ trip }: Props) {
  const [form, setForm] = useState<TripUpdate>({
    title:       trip.title,
    destination: trip.destination,
    start_date:  trip.start_date,
    end_date:    trip.end_date,
    budget_usd:  trip.budget_usd,
    is_template: trip.is_template,
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  function set<K extends keyof TripUpdate>(key: K, value: TripUpdate[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/trips/${trip.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Save failed')
      return
    }

    router.push(`/trip/${trip.id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this trip? This cannot be undone.')) return
    setDeleting(true)

    const res = await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })

    if (!res.ok) {
      setDeleting(false)
      setError('Delete failed')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Visibility toggle — separate from the form because it saves on click, not submit */}
      <VisibilityToggle tripId={trip.id} initialValue={trip.is_public} />

      <form onSubmit={handleSave} className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            value={form.title ?? ''}
            onChange={e => set('title', e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Destination</label>
          <input
            type="text"
            value={form.destination ?? ''}
            onChange={e => set('destination', e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Start date</label>
            <input
              type="date"
              value={form.start_date ?? ''}
              onChange={e => {
                const newStart = e.target.value || null
                setForm(prev => {
                  const endInvalid = newStart && prev.end_date && prev.end_date <= newStart
                  return { ...prev, start_date: newStart, end_date: endInvalid ? null : prev.end_date }
                })
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">End date</label>
            <input
              type="date"
              value={form.end_date ?? ''}
              min={form.start_date
                ? new Date(new Date(form.start_date).getTime() + 86400000).toISOString().slice(0, 10)
                : undefined}
              onChange={e => set('end_date', e.target.value || null)}
              className="rounded-lg border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Budget (USD)</label>
          <input
            type="number"
            min={0}
            step={10}
            value={form.budget_usd ?? 0}
            onChange={e => set('budget_usd', Number(e.target.value))}
            className="rounded-lg border bg-background px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_template"
            checked={form.is_template ?? false}
            onChange={e => set('is_template', e.target.checked)}
            className="accent-primary"
          />
          <label htmlFor="is_template" className="text-sm text-muted-foreground">
            Save as template
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-destructive hover:underline disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete trip'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm
                       font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>

      </form>
    </div>
  )
}
