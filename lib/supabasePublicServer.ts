import { createClient } from '@supabase/supabase-js'
import { getServerEnv } from '@/lib/env'

export function createPublicServerClient() {
  const env = getServerEnv()

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
