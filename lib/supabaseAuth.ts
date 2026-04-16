import type { User } from '@supabase/supabase-js'

type AuthCapableClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: User | null }
      error: { message: string } | null
    }>
  }
}

export async function getOptionalUser(client: AuthCapableClient): Promise<User | null> {
  try {
    const { data, error } = await client.auth.getUser()

    if (error) {
      console.warn('Supabase auth.getUser() failed; continuing as signed out.', error.message)
      return null
    }

    return data.user ?? null
  } catch (error) {
    console.warn('Supabase auth.getUser() threw; continuing as signed out.', error)
    return null
  }
}

export async function getOptionalUserFromClientFactory(
  createClient: () => AuthCapableClient
): Promise<User | null> {
  try {
    return await getOptionalUser(createClient())
  } catch (error) {
    console.warn('Supabase server client creation failed; continuing as signed out.', error)
    return null
  }
}
