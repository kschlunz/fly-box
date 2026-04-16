-- Davidson Fly Box · Supabase schema (Field Journal edition)
-- Run this in the Supabase SQL editor once, then seed from the admin intake flow.

create table if not exists public.rigs (
  id text primary key,
  section text not null check (section in ('dry-dropper', 'euro', 'soft-hackle', 'streamer')),
  label text not null,
  title text not null,
  "when" text not null,
  flies jsonb not null,
  tip text not null,
  description text,
  hot boolean default false,
  photo_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.conditions (
  id integer primary key default 1 check (id = 1),
  water text not null,
  temp text not null,
  flow text,
  clarity text,
  trend text,
  approach text not null,
  hatches jsonb not null,
  tippet text not null,
  updated text not null,
  source text not null,
  created_at timestamptz default now()
);

create table if not exists public.shopping (
  id serial primary key,
  name text not null,
  sizes text not null,
  category text not null check (category in ('dry', 'nymph', 'streamer', 'soft-hackle', 'other')),
  descriptor text,
  quantity integer default 3,
  sort_order integer default 0
);

create table if not exists public.fly_ids (
  id uuid primary key default gen_random_uuid(),
  result jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.gear_defaults (
  id serial primary key,
  name text not null,
  sort_order integer default 0
);

-- Row level security: public reads, writes only from the service role key
-- (used by the Vercel serverless functions).
alter table public.rigs enable row level security;
alter table public.conditions enable row level security;
alter table public.shopping enable row level security;
alter table public.fly_ids enable row level security;
alter table public.gear_defaults enable row level security;

drop policy if exists "read rigs" on public.rigs;
create policy "read rigs" on public.rigs
  for select to anon, authenticated using (true);

drop policy if exists "read conditions" on public.conditions;
create policy "read conditions" on public.conditions
  for select to anon, authenticated using (true);

drop policy if exists "read shopping" on public.shopping;
create policy "read shopping" on public.shopping
  for select to anon, authenticated using (true);

drop policy if exists "read gear" on public.gear_defaults;
create policy "read gear" on public.gear_defaults
  for select to anon, authenticated using (true);
