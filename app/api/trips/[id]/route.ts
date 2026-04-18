import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import type { TripUpdate } from '@/types'

type Params = { params: { id: string } }

// GET /api/trips/[id] — public, returns a single trip
export async function GET(_req: Request, { params }: Params) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    // PGRST116 is Supabase's "row not found" error code
    const status = error.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data)
}

// PUT /api/trips/[id] — authenticated only, updates trip fields
export async function PUT(request: Request, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: TripUpdate
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('trips')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/trips/[id] — authenticated only
// cascade in the schema deletes days, hotels, and budget_items automatically
export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
