'use client'

// Component for toggling a trip between public and private visibility
// Added per audit recommendation: "Implement Visibility Toggles"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  tripId: string
  initialValue: boolean
}

export function VisibilityToggle({ tripId, initialValue }: Props) {
  const [isPublic, setIsPublic] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    const newValue = !isPublic
    setIsPublic(newValue) // optimistic update
    setSaving(true)

    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: newValue }),
    })

    // revert on failure
    if (!res.ok) {
      setIsPublic(!newValue)
    } else {
      // refresh server component data so the public/private badge updates everywhere
      router.refresh()
    }

    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {isPublic ? 'Public trip' : 'Private trip'}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isPublic
            ? 'Anyone with the link can view this trip'
            : 'Only signed-in users can view this trip'}
        </p>
      </div>

      <button
        onClick={handleToggle}
        disabled={saving}
        role="switch"
        aria-checked={isPublic}
        aria-label="Toggle trip visibility"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
          transition-colors disabled:opacity-50
          ${isPublic ? 'bg-primary' : 'bg-muted'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}
