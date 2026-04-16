import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getOptionalUser } from '@/lib/supabaseAuth'
import type { DayUpdate } from '@/types'

type Params = { params: { id: string } }

// GET /api/trips/[id]/days — public, returns all days sorted by day_number
export async function GET(_req: Request, { params }: Params) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('days')
    .select('*')
    .eq('trip_id', params.id)
    .order('day_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT /api/trips/[id]/days — authenticated only
// updates a single day; the day id must be included in the request body
export async function PUT(request: Request, { params }: Params) {
  const supabase = createClient()

  const user = await getOptionalUser(supabase)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: DayUpdate = await request.json()

  if (!body.id) {
    return NextResponse.json({ error: 'day id is required' }, { status: 400 })
  }

  // verify the day belongs to this trip before applying updates
  const { data: existing } = await supabase
    .from('days')
    .select('trip_id')
    .eq('id', body.id)
    .single()

  if (existing?.trip_id !== params.id) {
    return NextResponse.json({ error: 'Day not found in this trip' }, { status: 404 })
  }

  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('days')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
