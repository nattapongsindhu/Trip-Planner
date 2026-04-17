-- enable Row Level Security on all tables
alter table public.trips        enable row level security;
alter table public.days         enable row level security;
alter table public.hotels       enable row level security;
alter table public.budget_items enable row level security;

-- public read: anyone can view all tables
create policy "public read trips"
  on public.trips for select using (true);

create policy "public read days"
  on public.days for select using (true);

create policy "public read hotels"
  on public.hotels for select using (true);

create policy "public read budget_items"
  on public.budget_items for select using (true);

-- authenticated write: only signed-in users can modify trips
create policy "auth insert trips"
  on public.trips for insert
  with check (auth.role() = 'authenticated');

create policy "auth update trips"
  on public.trips for update
  using (auth.role() = 'authenticated');

create policy "auth delete trips"
  on public.trips for delete
  using (auth.role() = 'authenticated');

-- authenticated write: days
create policy "auth write days"
  on public.days for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- authenticated write: hotels
create policy "auth write hotels"
  on public.hotels for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- authenticated write: budget items
create policy "auth write budget"
  on public.budget_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
