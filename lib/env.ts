import { z } from 'zod'

type EnvInput = Record<string, string | undefined>

function normalizeKey(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function isLegacyJwtKey(value: string) {
  return value.startsWith('eyJ')
}

function isPublishableKey(value: string) {
  return value.startsWith('sb_publishable_')
}

function isSecretKey(value: string) {
  return value.startsWith('sb_secret_')
}

function isValidPublicApiKey(value: string) {
  return value.length >= 20 && (isPublishableKey(value) || isLegacyJwtKey(value))
}

function isValidAdminApiKey(value: string) {
  return value.length >= 20 && (isSecretKey(value) || isLegacyJwtKey(value))
}

function resolvePublicApiKey(input: EnvInput) {
  const preferred = normalizeKey(input.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  const fallback = normalizeKey(input.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (preferred && isValidPublicApiKey(preferred)) {
    return preferred
  }

  return fallback ?? preferred
}

function resolveAdminApiKey(input: EnvInput) {
  const preferred = normalizeKey(input.SUPABASE_SECRET_KEY)
  const fallback = normalizeKey(input.SUPABASE_SERVICE_ROLE_KEY)

  if (preferred && isValidAdminApiKey(preferred)) {
    return preferred
  }

  return fallback ?? preferred
}

const publicApiKeySchema = z
  .string({
    required_error:
      'Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy fallback).',
  })
  .min(20, {
    message:
      'Supabase public API key is too short. Use a publishable key (sb_publishable_...) or legacy anon JWT.',
  })
  .refine(value => isPublishableKey(value) || isLegacyJwtKey(value), {
    message:
      'Supabase public API key must be a publishable key (sb_publishable_...) or legacy anon JWT.',
  })

const adminApiKeySchema = z
  .string({
    required_error:
      'Set SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY (legacy fallback).',
  })
  .min(20, {
    message:
      'Supabase admin API key is too short. Use a secret key (sb_secret_...) or legacy service_role JWT.',
  })
  .refine(value => isSecretKey(value) || isLegacyJwtKey(value), {
    message:
      'Supabase admin API key must be a secret key (sb_secret_...) or legacy service_role JWT.',
  })

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' })
    .startsWith('https://', { message: 'NEXT_PUBLIC_SUPABASE_URL must use HTTPS' }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicApiKeySchema,
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SITE_URL must be a valid URL' }),
})

const serverOnlyEnvSchema = z.object({
  SUPABASE_SECRET_KEY: adminApiKeySchema.optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

const serverEnvSchema = publicEnvSchema.merge(serverOnlyEnvSchema)

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
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: resolvePublicApiKey(input),
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
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: resolvePublicApiKey(input),
    NEXT_PUBLIC_SITE_URL: input.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SECRET_KEY: resolveAdminApiKey(input),
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

export function hasAdminApiKey(env = getServerEnv()): boolean {
  return typeof env.SUPABASE_SECRET_KEY === 'string' && env.SUPABASE_SECRET_KEY.length > 0
}
