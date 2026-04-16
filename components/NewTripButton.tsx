'use client'

import { useRouter } from 'next/navigation'

export function NewTripButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push('/trip/new')}
      className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground
                 font-medium hover:opacity-90 transition-opacity"
    >
      + New trip
    </button>
  )
}
