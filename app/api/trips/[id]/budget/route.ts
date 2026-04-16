import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getOptionalUser } from '@/lib/supabaseAuth'
import type { BudgetInsert } from '@/types'

type Params = { params: { id: string } }

// GET /api/trips/[id]/budget — public, returns all budget items grouped by category
export async function GET(_req: Request, { params }: Params) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('trip_id', params.id)
    .order('category', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/trips/[id]/budget — authenticated only, adds a new budget line item
export async function POST(request: Request, { params }: Params) {
  const supabase = createClient()

  const user = await getOptionalUser(supabase)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: Omit<BudgetInsert, 'trip_id'> = await request.json()

  if (!body.label?.trim() || !body.category) {
    return NextResponse.json(
      { error: 'label and category are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('budget_items')
    .insert({ ...body, trip_id: params.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PUT /api/trips/[id]/budget — authenticated only
// updates amount, label, or toggles the is_actual flag on a line item
export async function PUT(request: Request, { params }: Params) {
  const supabase = createClient()

  const user = await getOptionalUser(supabase)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: { id: string; amount_eur?: number; is_actual?: boolean; label?: string } =
    await request.json()

  if (!body.id) {
    return NextResponse.json({ error: 'budget item id is required' }, { status: 400 })
  }

  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', id)
    .eq('trip_id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/trips/[id]/budget?itemId=xxx — authenticated only
// removes a single budget line item by query param
export async function DELETE(request: Request, { params }: Params) {
  const supabase = createClient()

  const user = await getOptionalUser(supabase)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('itemId')

  if (!itemId) {
    return NextResponse.json({ error: 'itemId query param is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId)
    .eq('trip_id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
