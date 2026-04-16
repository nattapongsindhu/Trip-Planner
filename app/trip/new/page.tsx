// Server Component — protected new trip page, redirects unauthenticated users
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { NewTripForm } from '@/components/NewTripForm'

export default async function NewTripPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All trips
        </Link>
      </div>

      <h1 className="text-xl font-semibold mb-6">New trip</h1>

      <NewTripForm />
    </main>
  )
}
