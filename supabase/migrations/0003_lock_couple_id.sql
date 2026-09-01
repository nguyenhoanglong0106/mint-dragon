-- Chặn user tự đổi couple_id của chính mình qua client.
--
-- Lỗ hổng: policy "profiles_update_self" (0001_init.sql) chỉ kiểm tra
-- id = auth.uid(), không ràng buộc couple_id. Vì mọi policy couple-scoped
-- khác (memories/diaries/special_dates/live_locations) đều tin tưởng
-- current_couple_id() - đọc thẳng từ couple_id trong hàng profiles của
-- chính người gọi - nên 1 user đã đăng nhập có thể tự gọi
-- supabase.from('profiles').update({ couple_id: '<uuid-bat-ky>' })
-- để "nhảy" sang xem/ghi dữ liệu của 1 couple khác (nếu project có nhiều
-- hơn 1 couple), hoặc tự tách khỏi couple hiện tại.
--
-- Cách chặn: trigger BEFORE UPDATE ép couple_id giữ nguyên giá trị cũ khi
-- request có auth.uid() (tức là chạy qua PostgREST/app với JWT của user
-- thường). Khi chạy trong SQL Editor / bằng service_role (không có JWT),
-- auth.uid() trả về null nên trigger không can thiệp - migration 0002 và
-- các thao tác gán couple thủ công của admin vẫn hoạt động bình thường.

create or replace function public.lock_profile_couple_id()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and new.couple_id is distinct from old.couple_id then
    new.couple_id := old.couple_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_lock_couple_id on public.profiles;
create trigger trg_profiles_lock_couple_id before update on public.profiles
  for each row execute function public.lock_profile_couple_id();
