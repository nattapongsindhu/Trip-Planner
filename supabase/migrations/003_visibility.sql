-- Migration 003: Privacy Controls via is_public flag
-- Audit remediation: implements per-trip visibility control
-- Addresses: "Public Data Exposure" finding in Live Deployment Audit

-- Add is_public column to trips (default false for privacy-by-default)
alter table public.trips
  add column if not exists is_public boolean default false;

-- Mark the existing seed trip as public so the demo still works
update public.trips
  set is_public = true
  where title = 'Germany & Eastern Europe 2026';

-- Drop the old permissive public read policy
drop policy if exists "public read trips" on public.trips;

-- New public read policy: only trips where is_public = true
-- Authenticated users can still see all trips (admin model remains)
create policy "public read public trips"
  on public.trips for select
  using (
    is_public = true
    or auth.role() = 'authenticated'
  );

-- Days, hotels, and budget_items inherit visibility from their parent trip
-- Drop existing broad read policies
drop policy if exists "public read days" on public.days;
drop policy if exists "public read hotels" on public.hotels;
drop policy if exists "public read budget_items" on public.budget_items;

-- New policies: read only if the parent trip is public OR user is authenticated
create policy "public read days of public trips"
  on public.days for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = days.trip_id
      and (trips.is_public = true or auth.role() = 'authenticated')
    )
  );

create policy "public read hotels of public trips"
  on public.hotels for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = hotels.trip_id
      and (trips.is_public = true or auth.role() = 'authenticated')
    )
  );

create policy "public read budget of public trips"
  on public.budget_items for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = budget_items.trip_id
      and (trips.is_public = true or auth.role() = 'authenticated')
    )
  );

-- Index on is_public for faster filtering on the public list page
create index if not exists idx_trips_is_public on public.trips(is_public) where is_public = true;
