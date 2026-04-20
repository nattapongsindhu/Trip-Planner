import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_USERS = [
  { email: 'admin@demo.com', password: 'Admin1234!', role: 'admin' },
  { email: 'staff@demo.com', password: 'Staff1234!', role: 'staff' },
]

async function seedUser(email: string, password: string, role: string) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email === email)

  let userId: string

  if (found) {
    console.log(`skip: ${email} already exists`)
    userId = found.id
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw new Error(`createUser ${email}: ${error.message}`)
    userId = data.user.id
    console.log(`created: ${email} (${userId})`)
  }

  // Upsert role (idempotent via delete+insert on conflict)
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

  if (roleError) throw new Error(`upsert role ${email}: ${roleError.message}`)
  console.log(`role set: ${email} → ${role}`)
}

async function main() {
  for (const u of DEMO_USERS) {
    await seedUser(u.email, u.password, u.role)
  }
  console.log('seed complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
