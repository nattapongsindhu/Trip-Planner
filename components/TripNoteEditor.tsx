'use client'

import { useState } from 'react'

type Props = {
  tripId: string
  initialNote: string | null
  isAdmin: boolean
}

export function TripNoteEditor({ tripId, initialNote, isAdmin }: Props) {
  const [note, setNote]     = useState(initialNote ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]   = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: draft || null }),
    })
    setSaving(false)
    if (res.ok) { setNote(draft); setEditing(false) }
  }

  async function deleteNote() {
    setSaving(true)
    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: null }),
    })
    setSaving(false)
    if (res.ok) { setNote(''); setEditing(false) }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={4}
          autoFocus
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          placeholder="Add a note…"
        />
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground
                       hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => setEditing(false)}
            className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors">
            Cancel
          </button>
          {note && (
            <button onClick={deleteNote} disabled={saving}
              className="text-xs text-destructive hover:underline disabled:opacity-50 ml-auto">
              Delete note
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!note) {
    return isAdmin ? (
      <button onClick={() => { setDraft(''); setEditing(true) }}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        + Add note
      </button>
    ) : (
      <p className="text-sm text-muted-foreground py-4">No notes yet.</p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{note}</p>
      {isAdmin && (
        <button onClick={() => { setDraft(note); setEditing(true) }}
          className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors">
          Edit
        </button>
      )}
    </div>
  )
}
