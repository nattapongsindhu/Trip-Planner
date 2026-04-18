import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import type { HotelInsert, HotelUpdate } from '@/types'

type Params = { params: { id: string } }

// GET /api/trips/[id]/hotels — public, selected hotels listed first
export async function GET(_req: Request, { params }: Params) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('trip_id', params.id)
    .order('is_selected', { ascending: false })
    .order('city', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/trips/[id]/hotels — authenticated only, adds a new hotel option
export async function POST(request: Request, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Omit<HotelInsert, 'trip_id'>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name?.trim() || !body.city?.trim()) {
    return NextResponse.json(
      { error: 'name and city are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('hotels')
    .insert({ ...body, trip_id: params.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PUT /api/trips/[id]/hotels — authenticated only
// commonly used to toggle is_selected on a hotel
export async function PUT(request: Request, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: HotelUpdate
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'hotel id is required' }, { status: 400 })
  }

  // verify the hotel belongs to this trip before updating
  const { data: existing } = await supabase
    .from('hotels')
    .select('trip_id')
    .eq('id', body.id)
    .single()

  if (existing?.trip_id !== params.id) {
    return NextResponse.json({ error: 'Hotel not found in this trip' }, { status: 404 })
  }

  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('hotels')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
