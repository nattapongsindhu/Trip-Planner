-- Migration 004: Clear seed data, keep one empty template trip
-- Removes the Germany & Eastern Europe sample data so users start with a blank slate
-- Keeps a single empty trip so the app demonstrates the UI shell on first load

-- Delete all existing data in dependency order (children first, parents last)
delete from public.budget_items;
delete from public.hotels;
delete from public.days;
delete from public.trips;

-- Insert one empty template trip that the user can immediately start editing
-- All fields use reasonable defaults so the UI renders without null errors
insert into public.trips (title, destination, start_date, end_date, budget_eur, is_template, is_public)
values (
  'Untitled trip',
  'Add your destination',
  null,
  null,
  0,
  false,
  false
);
