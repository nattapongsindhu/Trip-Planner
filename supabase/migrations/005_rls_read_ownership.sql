-- Migration 005: Restrict authenticated read access to admin only
-- Migration 003 allowed any authenticated user to read all private trips.
-- This replaces those policies so only the admin email can read non-public data.

-- trips: replace permissive authenticated read
drop policy if exists "public read public trips" on public.trips;

create policy "public read public trips"
  on public.trips for select
  using (
    is_public = true
    or auth.email() = 'rogers.rockmore@gmail.com'
  );

-- days
drop policy if exists "public read days of public trips" on public.days;

create policy "public read days of public trips"
  on public.days for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = days.trip_id
      and (trips.is_public = true or auth.email() = 'rogers.rockmore@gmail.com')
    )
  );

-- hotels
drop policy if exists "public read hotels of public trips" on public.hotels;

create policy "public read hotels of public trips"
  on public.hotels for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = hotels.trip_id
      and (trips.is_public = true or auth.email() = 'rogers.rockmore@gmail.com')
    )
  );

-- budget items
drop policy if exists "public read budget of public trips" on public.budget_items;

create policy "public read budget of public trips"
  on public.budget_items for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = budget_items.trip_id
      and (trips.is_public = true or auth.email() = 'rogers.rockmore@gmail.com')
    )
  );
