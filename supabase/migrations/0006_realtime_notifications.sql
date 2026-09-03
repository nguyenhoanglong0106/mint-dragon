-- Let the app receive realtime events for clearer local/system notifications.

do $$
begin
  alter publication supabase_realtime add table public.diaries;
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.wish_items;
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.love_coupons;
exception
  when duplicate_object then null;
end
$$;
