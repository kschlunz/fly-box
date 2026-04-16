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

-- Tackle Box: personal fly collection with photos
create table if not exists public.tackle_box (
  id uuid primary key default gen_random_uuid(),
  fly_name text not null,
  normalized_name text not null,
  size text,
  role text not null check (role in ('dry', 'dropper', 'anchor', 'point', 'soft', 'streamer')),
  category text not null,
  colors text,
  description text,
  photo_url text not null,
  photo_quality_score integer default 50,
  count integer default 1,
  notes text,
  first_identified_at timestamptz default now(),
  last_identified_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tackle_box_normalized_name on tackle_box(normalized_name);
create index if not exists idx_tackle_box_role on tackle_box(role);
create index if not exists idx_tackle_box_category on tackle_box(category);

create table if not exists public.tackle_box_photos (
  id uuid primary key default gen_random_uuid(),
  tackle_box_id uuid not null references tackle_box(id) on delete cascade,
  photo_url text not null,
  quality_score integer default 50,
  identification_result jsonb,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_tackle_box_photos_tackle_box_id on tackle_box_photos(tackle_box_id);

-- Supabase Storage bucket for fly photos
insert into storage.buckets (id, name, public)
values ('fly-photos', 'fly-photos', true)
on conflict (id) do nothing;

create policy "Public read fly photos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'fly-photos');

create policy "Service role can upload fly photos" on storage.objects
  for insert to service_role
  with check (bucket_id = 'fly-photos');

create policy "Service role can delete fly photos" on storage.objects
  for delete to service_role
  using (bucket_id = 'fly-photos');

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

alter table public.tackle_box enable row level security;
alter table public.tackle_box_photos enable row level security;

drop policy if exists "read tackle_box" on public.tackle_box;
create policy "read tackle_box" on public.tackle_box
  for select to anon, authenticated using (true);

drop policy if exists "read tackle_box_photos" on public.tackle_box_photos;
create policy "read tackle_box_photos" on public.tackle_box_photos
  for select to anon, authenticated using (true);
