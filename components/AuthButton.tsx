'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type Props = { isAdmin: boolean }

export function AuthButton({ isAdmin }: Props) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router  = useRouter()
  const supabase = createClient()

  async function handlePasswordSignIn() {
    if (!email.includes('@')) { setError('Enter a valid email address'); return }
    if (!password) { setError('Enter your password'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else { setOpen(false); router.refresh() }
  }

  async function handleMagicLink() {
    if (!email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (isAdmin) {
    return (
      <button
        onClick={handleSignOut}
        className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent
                   transition-colors text-muted-foreground"
      >
        Sign out
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent
                   transition-colors text-muted-foreground"
      >
        Sign in
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border
                        bg-card shadow-sm p-4">
          {sent ? (
            <p className="text-sm text-center text-muted-foreground py-2">
              Check your email for a magic link.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSignIn()}
                className="w-full text-sm rounded-lg border bg-background px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSignIn()}
                className="w-full text-sm rounded-lg border bg-background px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
              <button
                onClick={handlePasswordSignIn}
                disabled={loading}
                className="w-full text-sm rounded-lg bg-primary text-primary-foreground
                           py-2 font-medium hover:opacity-90 transition-opacity
                           disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={handleMagicLink}
                disabled={loading}
                className="w-full text-sm rounded-lg border py-2 font-medium
                           hover:bg-accent transition-colors disabled:opacity-50"
              >
                Send magic link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
