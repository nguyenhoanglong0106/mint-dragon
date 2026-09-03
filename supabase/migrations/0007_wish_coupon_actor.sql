-- Track who last acted on a wish/coupon so partner notifications name the right person
-- (picking a wish or redeeming a coupon isn't always done by whoever created it).

alter table public.wish_items
  add column if not exists updated_by uuid references auth.users (id);

alter table public.love_coupons
  add column if not exists updated_by uuid references auth.users (id);

-- Without full replica identity, Postgres only ships the primary key in the "old" row
-- of an UPDATE change, so the app can't tell what status/count actually changed and
-- silently drops notifications for picking a wish / redeeming a coupon / etc.
alter table public.wish_items replica identity full;
alter table public.love_coupons replica identity full;
