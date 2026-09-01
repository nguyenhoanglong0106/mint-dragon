-- Dữ liệu mẫu (tùy chọn) cho "Nhật ký kỷ niệm của hai người".
-- Chạy SAU khi đã chạy 0001_init.sql và sau khi đã tạo 2 tài khoản
-- trong Supabase Auth (Authentication > Users > Add user).
--
-- Thay YOUR_USER_A_UUID và YOUR_USER_B_UUID bằng id thật lấy từ
-- Authentication > Users trong Supabase Dashboard trước khi chạy.

do $$
declare
  v_couple_id uuid;
  v_user_a uuid := 'YOUR_USER_A_UUID'; -- TODO: thay bằng uuid của người thứ nhất
  v_user_b uuid := 'YOUR_USER_B_UUID'; -- TODO: thay bằng uuid của người thứ hai
begin
  insert into public.couples (name, started_date)
  values ('Chúng mình', '2023-06-01')
  returning id into v_couple_id;

  insert into public.profiles (id, couple_id, display_name, nickname)
  values (v_user_a, v_couple_id, 'Người thứ nhất', 'Anh')
  on conflict (id) do update set couple_id = excluded.couple_id;

  insert into public.profiles (id, couple_id, display_name, nickname)
  values (v_user_b, v_couple_id, 'Người thứ hai', 'Em')
  on conflict (id) do update set couple_id = excluded.couple_id;

  insert into public.memories (couple_id, created_by, title, content, memory_date, location_name, is_favorite)
  values
    (v_couple_id, v_user_a, 'Lần đầu gặp nhau', 'Ngày hôm đó trời rất đẹp, và chúng mình đã nói chuyện suốt mấy tiếng đồng hồ.', '2023-06-01', 'Hà Nội', true),
    (v_couple_id, v_user_b, 'Chuyến đi Vũng Tàu', 'Kỷ niệm đáng nhớ với biển và hoàng hôn.', '2024-03-15', 'Vũng Tàu', false);

  insert into public.diaries (couple_id, created_by, diary_date, title, content, mood)
  values
    (v_couple_id, v_user_a, current_date, 'Hôm nay thật vui', 'Chỉ là một ngày bình thường nhưng bên nhau là đủ.', 'love');

  insert into public.special_dates (couple_id, created_by, title, event_date, repeat_yearly, note)
  values
    (v_couple_id, v_user_a, 'Ngày quen nhau', '2023-06-01', true, 'Kỷ niệm ngày đầu tiên'),
    (v_couple_id, v_user_b, 'Valentine', '2026-02-14', true, null);
end
$$;
