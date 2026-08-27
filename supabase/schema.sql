-- ============================================================
--  تالار مرمر — Supabase schema
--
--  Paste this whole file into the Supabase SQL editor and run it
--  once. It is idempotent: running it twice is harmless.
--
--  THE SECURITY MODEL, IN ONE PARAGRAPH
--
--  The anon key that ships in the published JavaScript is PUBLIC by
--  design — it identifies the project, it does not grant access.
--  Every table below has Row Level Security enabled, so what the
--  anon key can actually do is exactly what the policies here allow
--  and nothing else. Get the policies right and publishing the key
--  is safe. Skip RLS and the key is a skeleton key. That is the
--  whole game.
-- ============================================================


-- ─────────────────────────────────────────────
--  LEADS — written by the public inquiry form
-- ─────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  -- Jalali, as text. NOT a postgres `date`: this app reasons entirely
  -- in the Persian calendar, and '1405-06-12' fed to a date column is
  -- read as the Gregorian year 1405. Text also sorts correctly here,
  -- because a zero-padded YYYY-MM-DD sorts lexicographically.
  event_date  text,
  message     text,
  status      text not null default 'new',

  -- Length caps are a security control, not tidiness: without them
  -- an anonymous caller can write megabytes into your table.
  constraint leads_name_len    check (char_length(name)    between 1 and 120),
  constraint leads_phone_len   check (char_length(phone)   between 1 and 40),
  constraint leads_message_len check (message is null or char_length(message) <= 2000),
  constraint leads_status_ok   check (status in ('new', 'contacted', 'converted', 'archived')),
  constraint leads_date_fmt    check (event_date is null or event_date ~ '^\d{4}-\d{2}-\d{2}$')
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);


-- ─────────────────────────────────────────────
--  BOOKINGS — the manager's own data. Never public.
-- ─────────────────────────────────────────────
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_date  text not null,   -- Jalali YYYY-MM-DD, see note on leads
  client      text not null,
  phone       text,
  status      text not null default 'tentative',
  guests      integer not null default 0,
  contract    bigint  not null default 0,
  deposit     bigint  not null default 0,
  hall        text,
  note        text,

  constraint bookings_status_ok check (status in ('tentative', 'booked', 'cancelled')),
  constraint bookings_guests_ok check (guests >= 0),
  constraint bookings_money_ok  check (contract >= 0 and deposit >= 0),
  constraint bookings_date_fmt  check (event_date ~ '^\d{4}-\d{2}-\d{2}$')
);

create index if not exists bookings_event_date_idx on public.bookings (event_date);


-- ─────────────────────────────────────────────
--  TABLE GRANTS
--
--  Postgres checks TWO separate things, and both must pass:
--
--    1. GRANT — does this role may touch the table at all?
--    2. RLS   — which rows, and under what conditions?
--
--  Policies alone are not enough. Without the grants below every
--  anonymous insert is refused with 42501 "permission denied for
--  table leads" before any policy is even consulted.
--
--  Granting narrowly is also a second layer of defence: even if an
--  RLS policy were mis-written later, anon still has no SELECT on
--  leads and no rights whatsoever on bookings.
-- ─────────────────────────────────────────────
grant usage on schema public to anon, authenticated;

-- Start from nothing, then open one door.
revoke all on public.leads    from anon;
revoke all on public.bookings from anon;

grant insert on public.leads to anon;   -- post the letter, cannot read the box

grant select, insert, update, delete on public.leads    to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;


-- ─────────────────────────────────────────────
--  ROW LEVEL SECURITY
--
--  Enabling RLS with no policy denies everything. Each policy below
--  then opens exactly one door.
-- ─────────────────────────────────────────────
alter table public.leads    enable row level security;
alter table public.bookings enable row level security;

-- Drop first so re-running this file does not error on duplicates.
drop policy if exists "anon may submit a lead"        on public.leads;
drop policy if exists "staff may read and edit leads" on public.leads;
drop policy if exists "staff may read and edit bookings" on public.bookings;


-- A visitor filling in the form can INSERT a lead — and nothing else.
-- No select, no update, no delete. They can drop a note through the
-- letterbox; they cannot open the box and read what is inside.
create policy "anon may submit a lead"
  on public.leads
  for insert
  to anon
  with check (
    -- Status is not the caller's to choose. Without this an anonymous
    -- insert could file itself as already 'archived' and never appear
    -- in the inbox.
    status = 'new'
  );

-- Signed-in staff get full access to both tables.
create policy "staff may read and edit leads"
  on public.leads
  for all
  to authenticated
  using (true)
  with check (true);

create policy "staff may read and edit bookings"
  on public.bookings
  for all
  to authenticated
  using (true)
  with check (true);


-- ─────────────────────────────────────────────
--  VERIFY
--
--  Run this after the above. Every row must say rowsecurity = true.
--  If either says false, stop and fix it before going live.
-- ─────────────────────────────────────────────
-- select tablename, rowsecurity
--   from pg_tables
--  where schemaname = 'public' and tablename in ('leads', 'bookings');
--
--  And that anon holds exactly one privilege — INSERT on leads:
--
-- select table_name, privilege_type
--   from information_schema.role_table_grants
--  where grantee = 'anon' and table_schema = 'public';
