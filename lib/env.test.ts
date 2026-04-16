import { describe, expect, it } from 'vitest'
import {
  getPublicEnv,
  getServerEnv,
  hasServiceRoleKey,
  parsePublicEnv,
  parseServerEnv,
  resetEnvCache,
} from './env'

const validUrl = 'https://demo-project.supabase.co'
const validKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholderplaceholderplaceholderplaceholderplaceholderplaceholderplaceholder'
const validSiteUrl = 'https://trip-planner.example.com'

function withValidProcessEnv() {
  Object.assign(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: validUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
    NEXT_PUBLIC_SITE_URL: validSiteUrl,
    SUPABASE_SERVICE_ROLE_KEY: validKey,
    NODE_ENV: 'test',
  })
}

describe('parsePublicEnv', () => {
  it('parses the required public variables', () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
      })
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: validUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
      NEXT_PUBLIC_SITE_URL: validSiteUrl,
    })
  })

  it('throws a readable error when a public variable is missing', () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
      })
    ).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/)
  })

  it('reads and caches public env from process.env', () => {
    resetEnvCache()
    withValidProcessEnv()

    const first = getPublicEnv()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://changed.example.com'
    const second = getPublicEnv()

    expect(first.NEXT_PUBLIC_SUPABASE_URL).toBe(validUrl)
    expect(second.NEXT_PUBLIC_SUPABASE_URL).toBe(validUrl)
  })
})

describe('parseServerEnv', () => {
  it('defaults NODE_ENV to development', () => {
    expect(
      parseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
        SUPABASE_SERVICE_ROLE_KEY: validKey,
      }).NODE_ENV
    ).toBe('development')
  })

  it('accepts an omitted service role key for app runtime', () => {
    const env = parseServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: validUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
      NEXT_PUBLIC_SITE_URL: validSiteUrl,
      NODE_ENV: 'production',
    })

    expect(hasServiceRoleKey(env)).toBe(false)
  })

  it('rejects malformed server-only secrets', () => {
    expect(() =>
      parseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
        SUPABASE_SERVICE_ROLE_KEY: 'not-a-jwt',
        NODE_ENV: 'production',
      })
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY/)
  })

  it('reads and caches server env from process.env', () => {
    resetEnvCache()
    withValidProcessEnv()

    const first = getServerEnv()
    Object.assign(process.env, { NODE_ENV: 'production' })
    const second = getServerEnv()

    expect(first.NODE_ENV).toBe('test')
    expect(second.NODE_ENV).toBe('test')
  })

  it('rejects getServerEnv usage in a browser-like context', () => {
    resetEnvCache()
    withValidProcessEnv()
    ;(globalThis as { window?: object }).window = {}

    expect(() => getServerEnv()).toThrow(/server/)

    delete (globalThis as { window?: object }).window
  })
})
