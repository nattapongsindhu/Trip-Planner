import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getOptionalUser } from '@/lib/supabaseAuth'
import { createPublicServerClient } from '@/lib/supabasePublicServer'
import type { TripInsert } from '@/types'

// GET /api/trips — public, returns all trips ordered by newest first
export async function GET() {
  const supabase = createPublicServerClient()

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/trips — authenticated only, creates a new trip
export async function POST(request: Request) {
  const supabase = createClient()

  const user = await getOptionalUser(supabase)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: TripInsert = await request.json()

  // basic validation — no Zod, plain TypeScript guard
  if (!body.title?.trim() || !body.destination?.trim()) {
    return NextResponse.json(
      { error: 'title and destination are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('trips')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
