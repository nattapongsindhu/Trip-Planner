import { z } from 'zod'

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' })
    .startsWith('https://', { message: 'NEXT_PUBLIC_SUPABASE_URL must use HTTPS' }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(100, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is too short to be a valid JWT' })
    .startsWith('eyJ', { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be a JWT token' }),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SITE_URL must be a valid URL' }),
})

const serverOnlyEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(100, { message: 'SUPABASE_SERVICE_ROLE_KEY is too short to be a valid JWT' })
    .startsWith('eyJ', { message: 'SUPABASE_SERVICE_ROLE_KEY must be a JWT token' })
    .optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

const serverEnvSchema = publicEnvSchema.merge(serverOnlyEnvSchema)

type EnvInput = Record<string, string | undefined>

function formatValidationError(
  prefix: string,
  issues: { path: (string | number)[]; message: string }[]
) {
  const details = issues
    .map(issue => `- ${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n')

  return `${prefix}\n${details}\nSee .env.example for the expected format.`
}

export function parsePublicEnv(input: EnvInput) {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: input.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: input.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: input.NEXT_PUBLIC_SITE_URL,
  })

  if (!parsed.success) {
    throw new Error(
      formatValidationError('Public environment validation failed.', parsed.error.issues)
    )
  }

  return parsed.data
}

export function parseServerEnv(input: EnvInput) {
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: input.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: input.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: input.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SERVICE_ROLE_KEY: input.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: input.NODE_ENV ?? 'development',
  })

  if (!parsed.success) {
    throw new Error(
      formatValidationError('Server environment validation failed.', parsed.error.issues)
    )
  }

  return parsed.data
}

let cachedPublicEnv: ReturnType<typeof parsePublicEnv> | undefined
let cachedServerEnv: ReturnType<typeof parseServerEnv> | undefined

export function resetEnvCache() {
  cachedPublicEnv = undefined
  cachedServerEnv = undefined
}

export function getPublicEnv() {
  if (!cachedPublicEnv) {
    cachedPublicEnv = parsePublicEnv(process.env)
  }

  return cachedPublicEnv
}

export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be used on the server.')
  }

  if (!cachedServerEnv) {
    cachedServerEnv = parseServerEnv(process.env)
  }

  return cachedServerEnv
}

export function hasServiceRoleKey(env = getServerEnv()): boolean {
  return typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' && env.SUPABASE_SERVICE_ROLE_KEY.length > 0
}
