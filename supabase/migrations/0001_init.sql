-- Nhật ký kỷ niệm của hai người - initial schema
-- Chạy toàn bộ file này trong Supabase SQL Editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Chúng mình',
  started_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  couple_id uuid references public.couples (id) on delete set null,
  display_name text not null default '',
  nickname text,
  avatar_url text,
  birthday date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) default auth.uid(),
  title text not null,
  content text not null default '',
  memory_date date not null,
  cover_image_url text,
  google_photos_url text,
  location_name text,
  latitude double precision,
  longitude double precision,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diaries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) default auth.uid(),
  diary_date date not null,
  title text not null,
  content text not null default '',
  mood text check (mood in ('happy', 'love', 'normal', 'sad', 'excited')),
  weather text,
  google_photos_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.special_dates (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null,
  event_date date not null,
  repeat_yearly boolean not null default true,
  note text,
  created_by uuid not null references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.live_locations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  altitude double precision,
  heading double precision,
  speed double precision,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_profiles_couple_id on public.profiles (couple_id);
create index if not exists idx_memories_couple_id on public.memories (couple_id);
create index if not exists idx_memories_memory_date on public.memories (memory_date desc);
create index if not exists idx_memories_updated_at on public.memories (updated_at desc);
create index if not exists idx_diaries_couple_id on public.diaries (couple_id);
create index if not exists idx_diaries_diary_date on public.diaries (diary_date desc);
create index if not exists idx_diaries_updated_at on public.diaries (updated_at desc);
create index if not exists idx_special_dates_couple_id on public.special_dates (couple_id);
create index if not exists idx_special_dates_event_date on public.special_dates (event_date);
create index if not exists idx_live_locations_couple_id on public.live_locations (couple_id);
create index if not exists idx_live_locations_updated_at on public.live_locations (updated_at desc);

-- ============================================================
-- updated_at triggers
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_memories_updated_at on public.memories;
create trigger trg_memories_updated_at before update on public.memories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_diaries_updated_at on public.diaries;
create trigger trg_diaries_updated_at before update on public.diaries
  for each row execute function public.set_updated_at();

drop trigger if exists trg_live_locations_updated_at on public.live_locations;
create trigger trg_live_locations_updated_at before update on public.live_locations
  for each row execute function public.set_updated_at();

-- ============================================================
-- Helper: couple_id of the currently authenticated user.
-- SECURITY DEFINER so it can read public.profiles without
-- re-triggering profiles' own RLS policy (avoids recursion).
-- ============================================================

create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

grant execute on function public.current_couple_id() to authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.memories enable row level security;
alter table public.diaries enable row level security;
alter table public.special_dates enable row level security;
alter table public.live_locations enable row level security;

-- couples: only the two members of the couple can read/update it.
-- There is no INSERT policy on purpose: a couple row is provisioned
-- once by an admin through the Supabase SQL editor (see README), not
-- through the app, since this product only ever serves two people.
drop policy if exists "couples_select_own" on public.couples;
create policy "couples_select_own" on public.couples
  for select using (id = public.current_couple_id());

drop policy if exists "couples_update_own" on public.couples;
create policy "couples_update_own" on public.couples
  for update using (id = public.current_couple_id())
  with check (id = public.current_couple_id());

-- profiles: a user can always see/edit their own row, and can see
-- (but not edit) their partner's row once linked to the same couple.
drop policy if exists "profiles_select_own_or_partner" on public.profiles;
create policy "profiles_select_own_or_partner" on public.profiles
  for select using (
    id = auth.uid()
    or (couple_id is not null and couple_id = public.current_couple_id())
  );

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- memories / diaries / special_dates: fully scoped to the couple.
drop policy if exists "memories_select_couple" on public.memories;
create policy "memories_select_couple" on public.memories
  for select using (couple_id = public.current_couple_id());

drop policy if exists "memories_insert_couple" on public.memories;
create policy "memories_insert_couple" on public.memories
  for insert with check (couple_id = public.current_couple_id() and created_by = auth.uid());

drop policy if exists "memories_update_couple" on public.memories;
create policy "memories_update_couple" on public.memories
  for update using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

drop policy if exists "memories_delete_couple" on public.memories;
create policy "memories_delete_couple" on public.memories
  for delete using (couple_id = public.current_couple_id());

drop policy if exists "diaries_select_couple" on public.diaries;
create policy "diaries_select_couple" on public.diaries
  for select using (couple_id = public.current_couple_id());

drop policy if exists "diaries_insert_couple" on public.diaries;
create policy "diaries_insert_couple" on public.diaries
  for insert with check (couple_id = public.current_couple_id() and created_by = auth.uid());

drop policy if exists "diaries_update_couple" on public.diaries;
create policy "diaries_update_couple" on public.diaries
  for update using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

drop policy if exists "diaries_delete_couple" on public.diaries;
create policy "diaries_delete_couple" on public.diaries
  for delete using (couple_id = public.current_couple_id());

drop policy if exists "special_dates_select_couple" on public.special_dates;
create policy "special_dates_select_couple" on public.special_dates
  for select using (couple_id = public.current_couple_id());

drop policy if exists "special_dates_insert_couple" on public.special_dates;
create policy "special_dates_insert_couple" on public.special_dates
  for insert with check (couple_id = public.current_couple_id() and created_by = auth.uid());

drop policy if exists "special_dates_update_couple" on public.special_dates;
create policy "special_dates_update_couple" on public.special_dates
  for update using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

drop policy if exists "special_dates_delete_couple" on public.special_dates;
create policy "special_dates_delete_couple" on public.special_dates
  for delete using (couple_id = public.current_couple_id());

-- live_locations: couple members can read both rows, but each user
-- may only write (insert/update/delete) their own row. Never "using (true)".
drop policy if exists "live_locations_select_couple" on public.live_locations;
create policy "live_locations_select_couple" on public.live_locations
  for select using (couple_id = public.current_couple_id());

drop policy if exists "live_locations_insert_self" on public.live_locations;
create policy "live_locations_insert_self" on public.live_locations
  for insert with check (user_id = auth.uid() and couple_id = public.current_couple_id());

drop policy if exists "live_locations_update_self" on public.live_locations;
create policy "live_locations_update_self" on public.live_locations
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and couple_id = public.current_couple_id());

drop policy if exists "live_locations_delete_self" on public.live_locations;
create policy "live_locations_delete_self" on public.live_locations
  for delete using (user_id = auth.uid());

-- ============================================================
-- Realtime: allow subscribing to live_locations changes.
-- ============================================================

do $$
begin
  alter publication supabase_realtime add table public.live_locations;
exception
  when duplicate_object then null;
end
$$;
