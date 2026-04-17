// Server Component — protected edit page, redirects unauthenticated users to home
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { TripEditForm } from '@/components/TripEditForm'
import type { Trip } from '@/types'

type Props = { params: { id: string } }

export default async function EditTripPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: { user } }, { data: trip, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('trips').select('*').eq('id', params.id).single(),
  ])

  // server-side auth guard — unauthenticated users are redirected immediately
  if (!user) redirect('/')

  if (error || !trip) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/trip/${params.id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to trip
        </Link>
      </div>

      <h1 className="text-xl font-semibold mb-6">Edit trip</h1>

      <TripEditForm trip={trip as Trip} />
    </main>
  )
}
