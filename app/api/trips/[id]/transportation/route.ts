import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import type { TransportationInsert, TransportationUpdate } from '@/types'

type Params = { params: { id: string } }

// GET /api/trips/[id]/transportation — public, ordered by date then created_at
export async function GET(_req: Request, { params }: Params) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trip_transportation')
    .select('*')
    .eq('trip_id', params.id)
    .order('date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/trips/[id]/transportation — authenticated only
export async function POST(request: Request, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Omit<TransportationInsert, 'trip_id'>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.from?.trim() || !body.to?.trim() || !body.type) {
    return NextResponse.json({ error: 'type, from, and to are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('trip_transportation')
    .insert({ ...body, trip_id: params.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/trips/[id]/transportation — authenticated only
export async function PUT(request: Request, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: TransportationUpdate
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { id, ...updates } = body
  const { data, error } = await supabase
    .from('trip_transportation')
    .update(updates)
    .eq('id', id)
    .eq('trip_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/trips/[id]/transportation?itemId=xxx — authenticated only
export async function DELETE(request: Request, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const itemId = new URL(request.url).searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId query param is required' }, { status: 400 })

  const { error } = await supabase
    .from('trip_transportation')
    .delete()
    .eq('id', itemId)
    .eq('trip_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
