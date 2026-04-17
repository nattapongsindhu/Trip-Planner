// Environment variable validation using Zod
// Runs at application startup — fails fast if any required variable is missing or malformed
// This prevents the app from starting in an insecure or broken state
import { z } from 'zod'

// Schema for all required environment variables
// NEXT_PUBLIC_* variables are exposed to the browser — never put secrets here
// Variables without NEXT_PUBLIC_ prefix are server-only and never reach the client
const envSchema = z.object({
  // Supabase project URL — must be a valid HTTPS URL
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' })
    .startsWith('https://', { message: 'NEXT_PUBLIC_SUPABASE_URL must use HTTPS' }),

  // Supabase anon key — always starts with "eyJ" (base64-encoded JWT header)
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(100, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is too short to be a valid JWT' })
    .startsWith('eyJ', { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be a JWT token' }),

  // Service role key — server-only, bypasses RLS
  // Optional because it is only needed by the seed script, not the running app
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(100, { message: 'SUPABASE_SERVICE_ROLE_KEY is too short to be a valid JWT' })
    .startsWith('eyJ', { message: 'SUPABASE_SERVICE_ROLE_KEY must be a JWT token' })
    .optional(),

  // Site URL for magic link redirects
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SITE_URL must be a valid URL' }),

  // Node environment — standard values only
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parse and validate at import time
// If validation fails, the process exits immediately with a clear error message
function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('Environment variable validation failed:')
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    }
    console.error('\nCheck your .env.local file and ensure all required variables are set.')
    console.error('See .env.example for the expected format.\n')

    // In production, fail hard — do not let the app start with bad config
    // In test environment, throw instead so Vitest can catch it
    if (process.env.NODE_ENV === 'test') {
      throw new Error('Environment validation failed')
    }
    process.exit(1)
  }

  return parsed.data
}

// Exported validated env object — use this instead of process.env elsewhere
// TypeScript will provide full autocomplete and type safety
export const env = validateEnv()

// Helper to check if we have permission to run admin-only scripts (e.g. seed)
export function hasServiceRoleKey(): boolean {
  return typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' && env.SUPABASE_SERVICE_ROLE_KEY.length > 0
}
