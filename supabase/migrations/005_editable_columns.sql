-- Migration 005: Add missing columns for full editability
-- The old schema had some fields fixed or missing — this fills the gaps
-- so every visible piece of text in the UI corresponds to a real editable column

-- DAYS table: add country_code, stay, transport, highlights, cost_range, notes
-- if they don't already exist
alter table public.days
  add column if not exists country_code text default '??',
  add column if not exists stay          text,
  add column if not exists transport     text,
  add column if not exists highlights    text,
  add column if not exists cost_range    text,
  add column if not exists notes         text,
  add column if not exists done          boolean default false;

-- day_number renamed/enforced (was sometimes missing)
-- if column exists as 'day_num' or similar, manual migration needed — skip here

-- HOTELS table: add country_code, price_range, rating, booking_url, selected
alter table public.hotels
  add column if not exists country_code text default '??',
  add column if not exists price_range  text,
  add column if not exists rating       text,
  add column if not exists notes        text,
  add column if not exists booking_url  text,
  add column if not exists selected     boolean default false;

-- BUDGET_ITEMS: ensure estimate + actual are nullable numerics
alter table public.budget_items
  add column if not exists estimate_eur numeric(10,2),
  add column if not exists actual_eur   numeric(10,2);
