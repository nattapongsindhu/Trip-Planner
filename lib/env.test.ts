import { describe, expect, it } from 'vitest'
import {
  getPublicEnv,
  getServerEnv,
  hasAdminApiKey,
  parsePublicEnv,
  parseServerEnv,
  resetEnvCache,
} from './env'

const validUrl = 'https://demo-project.supabase.co'
const validLegacyJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholderplaceholderplaceholderplaceholderplaceholderplaceholderplaceholder'
const validPublishableKey = 'sb_publishable_1234567890abcdefghijklmnopqrstuvwxyz'
const validSecretKey = 'sb_secret_1234567890abcdefghijklmnopqrstuvwxyz'
const validSiteUrl = 'https://trip-planner.example.com'

function withValidProcessEnv() {
  Object.assign(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: validUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
    NEXT_PUBLIC_SITE_URL: validSiteUrl,
    SUPABASE_SECRET_KEY: validSecretKey,
    NODE_ENV: 'test',
  })
}

describe('parsePublicEnv', () => {
  it('parses the preferred publishable key variables', () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
      })
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: validUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
      NEXT_PUBLIC_SITE_URL: validSiteUrl,
    })
  })

  it('accepts the legacy anon key as a temporary fallback', () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validLegacyJwt,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
      }).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ).toBe(validLegacyJwt)
  })

  it('prefers the publishable key when both names are present', () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validLegacyJwt,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
      }).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ).toBe(validPublishableKey)
  })

  it('falls back to the legacy anon key when the new public key is malformed', () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_...',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validLegacyJwt,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
      }).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ).toBe(validLegacyJwt)
  })

  it('throws a readable error when a public variable is missing', () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
      })
    ).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/)
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
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
        SUPABASE_SECRET_KEY: validSecretKey,
      }).NODE_ENV
    ).toBe('development')
  })

  it('accepts an omitted admin key for app runtime', () => {
    const env = parseServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: validUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
      NEXT_PUBLIC_SITE_URL: validSiteUrl,
      NODE_ENV: 'production',
    })

    expect(hasAdminApiKey(env)).toBe(false)
  })

  it('accepts the legacy service role key as a temporary fallback', () => {
    expect(
      parseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
        SUPABASE_SERVICE_ROLE_KEY: validLegacyJwt,
        NODE_ENV: 'production',
      }).SUPABASE_SECRET_KEY
    ).toBe(validLegacyJwt)
  })

  it('falls back to the legacy service role key when the new admin key is malformed', () => {
    expect(
      parseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
        SUPABASE_SECRET_KEY: 'sb_secret_...',
        SUPABASE_SERVICE_ROLE_KEY: validLegacyJwt,
        NODE_ENV: 'production',
      }).SUPABASE_SECRET_KEY
    ).toBe(validLegacyJwt)
  })

  it('rejects malformed server-only secrets', () => {
    expect(() =>
      parseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: validUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validPublishableKey,
        NEXT_PUBLIC_SITE_URL: validSiteUrl,
        SUPABASE_SECRET_KEY: 'not-a-key',
        NODE_ENV: 'production',
      })
    ).toThrow(/SUPABASE_SECRET_KEY/)
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
