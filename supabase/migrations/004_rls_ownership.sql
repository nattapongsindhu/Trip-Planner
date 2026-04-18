-- Migration 004: Restrict write access to a single admin user
-- Replaces role-based write policies (any authenticated user) with an
-- email-allowlist policy. Only the admin email below can mutate data.
-- WARNING: Update this email if the admin account changes.

-- trips: remove permissive write policies
drop policy if exists "auth insert trips" on public.trips;
drop policy if exists "auth update trips" on public.trips;
drop policy if exists "auth delete trips" on public.trips;

-- trips: admin-only write
create policy "admin insert trips"
  on public.trips for insert
  with check (auth.email() = 'rogers.rockmore@gmail.com');

create policy "admin update trips"
  on public.trips for update
  using (auth.email() = 'rogers.rockmore@gmail.com');

create policy "admin delete trips"
  on public.trips for delete
  using (auth.email() = 'rogers.rockmore@gmail.com');

-- child tables: remove permissive write policies
drop policy if exists "auth write days" on public.days;
drop policy if exists "auth write hotels" on public.hotels;
drop policy if exists "auth write budget" on public.budget_items;

-- days: admin-only write
create policy "admin write days"
  on public.days for all
  using (auth.email() = 'rogers.rockmore@gmail.com')
  with check (auth.email() = 'rogers.rockmore@gmail.com');

-- hotels: admin-only write
create policy "admin write hotels"
  on public.hotels for all
  using (auth.email() = 'rogers.rockmore@gmail.com')
  with check (auth.email() = 'rogers.rockmore@gmail.com');

-- budget items: admin-only write
create policy "admin write budget"
  on public.budget_items for all
  using (auth.email() = 'rogers.rockmore@gmail.com')
  with check (auth.email() = 'rogers.rockmore@gmail.com');
