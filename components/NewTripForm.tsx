'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TripInsert } from '@/types'

const EMPTY: TripInsert = {
  title: '',
  destination: '',
  start_date: null,
  end_date: null,
  budget_usd: 0,
  is_template: false,
  is_public: false,
  note: null,
}

export function NewTripForm() {
  const [form, setForm]     = useState<TripInsert>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const router = useRouter()

  function set<K extends keyof TripInsert>(key: K, value: TripInsert[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.destination.trim()) {
      setError('Title and destination are required')
      return
    }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    router.push(`/trip/${data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          placeholder="Trip title"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Destination</label>
        <input
          type="text"
          placeholder="Where are you going?"
          value={form.destination}
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
          value={form.budget_usd}
          onChange={e => set('budget_usd', Number(e.target.value))}
          className="rounded-lg border bg-background px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_template"
            checked={form.is_template}
            onChange={e => set('is_template', e.target.checked)}
            className="accent-primary"
          />
          <label htmlFor="is_template" className="text-sm text-muted-foreground">
            Save as template for future trips
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_public"
            checked={form.is_public}
            onChange={e => set('is_public', e.target.checked)}
            className="accent-primary"
          />
          <label htmlFor="is_public" className="text-sm text-muted-foreground">
            Make this trip public (visible to everyone)
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setForm(EMPTY); setError(null) }}
          className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm
                     font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create trip'}
        </button>
      </div>

    </form>
  )
}
