-- Travel & Expense Tracker — Supabase schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists "uuid-ossp";

-- ============ TRIPS ============
create table if not exists trips (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  purpose text,
  from_date date not null,
  to_date date not null,
  from_city text,
  to_city text,
  status text not null default 'planned', -- planned | ongoing | completed
  created_at timestamptz not null default now()
);

-- ============ FLIGHTS (a trip can have multiple legs) ============
create table if not exists flights (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  airline text,
  flight_number text,
  pnr text,
  from_city text,
  to_city text,
  departure_at timestamptz,
  arrival_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ HOTELS ============
create table if not exists hotels (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text,
  address text,
  booking_ref text,
  checkin date,
  checkout date,
  created_at timestamptz not null default now()
);

-- ============ EXPENSES ============
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  category text not null, -- food | conveyance | hotel | other
  subtype text,           -- cab | rapido | train | auto | breakfast | lunch | dinner | misc
  amount numeric(10,2) not null,
  expense_date date not null,
  note text,
  receipt_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_trip on expenses(trip_id);
create index if not exists idx_expenses_date on expenses(expense_date);
create index if not exists idx_flights_trip on flights(trip_id);
create index if not exists idx_hotels_trip on hotels(trip_id);

-- ============ STORAGE (receipts) ============
-- Run once: create a public bucket called "receipts" via Supabase Dashboard > Storage
-- or via SQL:
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- ============ ROW LEVEL SECURITY ============
-- Single-user personal tool: RLS enabled, open policies scoped to authenticated user.
-- Tighten these if you ever add more than one user.
alter table trips enable row level security;
alter table flights enable row level security;
alter table hotels enable row level security;
alter table expenses enable row level security;

create policy "allow all to authenticated" on trips
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "allow all to authenticated" on flights
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "allow all to authenticated" on hotels
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "allow all to authenticated" on expenses
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage policy: authenticated users can upload/read receipts
create policy "authenticated receipt access"
  on storage.objects for all
  using (bucket_id = 'receipts' and auth.role() = 'authenticated')
  with check (bucket_id = 'receipts' and auth.role() = 'authenticated');
