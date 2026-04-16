import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

// POST /api/auth — sends a magic link to the given email address
// body: { email: string }
export async function POST(request: Request) {
  const supabase = createClient()
  const { email }: { email: string } = await request.json()

  if (!email?.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Magic link sent — check your email' })
}

// DELETE /api/auth — signs out the current user
export async function DELETE() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return new NextResponse(null, { status: 204 })
}
