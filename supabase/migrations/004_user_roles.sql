-- user_roles: maps auth.users to admin/staff roles
-- RLS: only service_role can read or write (no direct client access)

create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create index user_roles_user_id_idx on public.user_roles (user_id);

alter table public.user_roles enable row level security;

-- deny all access to authenticated/anon roles; service_role bypasses RLS by default
create policy "no direct client access" on public.user_roles
  as restrictive
  for all
  to authenticated, anon
  using (false);
