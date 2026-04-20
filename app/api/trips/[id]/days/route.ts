import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import type { DayUpdate } from '@/types'

type Params = { params: { id: string } }

// POST /api/trips/[id]/days — authenticated only, adds a new day
export async function POST(request: Request, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { city: string; country_code: string; day_number?: number }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.city?.trim() || !body.country_code?.trim()) {
    return NextResponse.json({ error: 'city and country_code are required' }, { status: 400 })
  }

  let dayNumber = body.day_number
  if (!dayNumber) {
    const { data: last } = await supabase
      .from('days').select('day_number').eq('trip_id', params.id)
      .order('day_number', { ascending: false }).limit(1).maybeSingle()
    dayNumber = (last?.day_number ?? 0) + 1
  }

  const { data, error } = await supabase
    .from('days')
    .insert({ city: body.city, country_code: body.country_code, trip_id: params.id, day_number: dayNumber, cost_eur_min: 0, cost_eur_max: 0 })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/trips/[id]/days?dayId=xxx — authenticated only
export async function DELETE(request: Request, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dayId = new URL(request.url).searchParams.get('dayId')
  if (!dayId) return NextResponse.json({ error: 'dayId query param is required' }, { status: 400 })

  const { error } = await supabase.from('days').delete().eq('id', dayId).eq('trip_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: DayUpdate
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

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
