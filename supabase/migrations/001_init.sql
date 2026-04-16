-- trips table
create table public.trips (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  destination  text not null,
  start_date   date,
  end_date     date,
  budget_eur   numeric(10,2) default 0,
  is_template  boolean default false,
  created_at   timestamptz default now()
);

-- days table
create table public.days (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references public.trips(id) on delete cascade,
  day_number     int not null,
  city           text not null,
  country_code   char(2) not null,
  highlights     text,
  transport      text,
  stay           text,
  cost_eur_min   int default 0,
  cost_eur_max   int default 0,
  note           text,
  is_done        boolean default false,
  book_by        text,
  is_transfer    boolean default false
);

-- hotels table
create table public.hotels (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips(id) on delete cascade,
  city         text not null,
  country_code char(2) not null,
  name         text not null,
  price_min    numeric(8,2),
  price_max    numeric(8,2),
  rating       numeric(3,1),
  notes        text,
  book_url     text,
  is_selected  boolean default false
);

-- budget items table
create table public.budget_items (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  category    text not null,
  label       text not null,
  amount_eur  numeric(10,2) not null default 0,
  is_actual   boolean default false
);

-- indexes for faster lookups
create index idx_days_trip_id     on public.days(trip_id);
create index idx_hotels_trip_id   on public.hotels(trip_id);
create index idx_budget_trip_id   on public.budget_items(trip_id);
create index idx_days_number      on public.days(trip_id, day_number);
