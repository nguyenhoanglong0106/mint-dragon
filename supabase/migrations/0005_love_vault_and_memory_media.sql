-- More couple keepsakes: memory media notes, wishlist, and love coupons.

alter table public.memories
  add column if not exists audio_note_url text,
  add column if not exists video_note_url text;

create table if not exists public.wish_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) default auth.uid(),
  title text not null,
  category text not null default 'other' check (category in ('food', 'place', 'movie', 'activity', 'gift', 'other')),
  note text,
  status text not null default 'open' check (status in ('open', 'done')),
  picked_count integer not null default 0,
  last_picked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.love_coupons (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) default auth.uid(),
  title text not null,
  description text,
  coupon_type text not null default 'custom' check (coupon_type in ('choice', 'hug', 'date', 'pause', 'custom')),
  status text not null default 'available' check (status in ('available', 'redeemed', 'archived')),
  redeemed_by uuid references auth.users (id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wish_items_couple_id on public.wish_items (couple_id);
create index if not exists idx_wish_items_status on public.wish_items (status);
create index if not exists idx_wish_items_updated_at on public.wish_items (updated_at desc);
create index if not exists idx_love_coupons_couple_id on public.love_coupons (couple_id);
create index if not exists idx_love_coupons_status on public.love_coupons (status);
create index if not exists idx_love_coupons_updated_at on public.love_coupons (updated_at desc);

drop trigger if exists trg_wish_items_updated_at on public.wish_items;
create trigger trg_wish_items_updated_at before update on public.wish_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_love_coupons_updated_at on public.love_coupons;
create trigger trg_love_coupons_updated_at before update on public.love_coupons
  for each row execute function public.set_updated_at();

alter table public.wish_items enable row level security;
alter table public.love_coupons enable row level security;

drop policy if exists "wish_items_select_couple" on public.wish_items;
create policy "wish_items_select_couple" on public.wish_items
  for select using (couple_id = public.current_couple_id());

drop policy if exists "wish_items_insert_couple" on public.wish_items;
create policy "wish_items_insert_couple" on public.wish_items
  for insert with check (couple_id = public.current_couple_id() and created_by = auth.uid());

drop policy if exists "wish_items_update_couple" on public.wish_items;
create policy "wish_items_update_couple" on public.wish_items
  for update using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

drop policy if exists "wish_items_delete_couple" on public.wish_items;
create policy "wish_items_delete_couple" on public.wish_items
  for delete using (couple_id = public.current_couple_id());

drop policy if exists "love_coupons_select_couple" on public.love_coupons;
create policy "love_coupons_select_couple" on public.love_coupons
  for select using (couple_id = public.current_couple_id());

drop policy if exists "love_coupons_insert_couple" on public.love_coupons;
create policy "love_coupons_insert_couple" on public.love_coupons
  for insert with check (couple_id = public.current_couple_id() and created_by = auth.uid());

drop policy if exists "love_coupons_update_couple" on public.love_coupons;
create policy "love_coupons_update_couple" on public.love_coupons
  for update using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

drop policy if exists "love_coupons_delete_couple" on public.love_coupons;
create policy "love_coupons_delete_couple" on public.love_coupons
  for delete using (couple_id = public.current_couple_id());
