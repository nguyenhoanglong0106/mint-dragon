-- Đăng nhập bằng username ngắn (dragon / mint) thay vì email dài.
-- Chạy sau khi đã chạy 0001_init.sql.
--
-- Cách hoạt động: app không có màn hình đăng ký công khai, chỉ 2 tài
-- khoản Supabase Auth (auth.users) cố định, được đặt email dạng
-- "<username>@mint-dragon.local". App tự suy ra email đó từ username
-- người dùng gõ, rồi đăng nhập bằng supabase.auth.signInWithPassword -
-- vẫn là Supabase Auth thật (mật khẩu được Supabase hash, lưu trong
-- auth.users), chỉ có điều người dùng không phải gõ email/mật khẩu dài.

alter table public.profiles add column if not exists username text;

create unique index if not exists idx_profiles_username on public.profiles (username);

-- ============================================================
-- Tạo couple + gán username cho 2 tài khoản cố định.
--
-- ĐIỀU KIỆN BẮT BUỘC trước khi chạy khối bên dưới: đã tạo 2 user
-- trong Authentication > Users (Supabase Dashboard) với đúng email:
--   dragon@mint-dragon.local
--   mint@mint-dragon.local
-- (mật khẩu xem README mục 7 - không lặp lại ở đây để tránh lưu mật khẩu
-- thật trong file commit vào git). Khối này tự tìm id của 2 user đó theo email
-- và gán vào profiles - không cần copy UUID thủ công.
--
-- Sửa started_date bên dưới thành ngày bắt đầu yêu thật của hai bạn.
-- Có thể chạy lại toàn bộ file này an toàn (idempotent).
-- ============================================================

insert into public.couples (id, name, started_date)
values ('11111111-1111-1111-1111-111111111111', 'Dragon & Mint', '2024-01-01')
on conflict (id) do nothing;

insert into public.profiles (id, couple_id, username, display_name, nickname)
select u.id, '11111111-1111-1111-1111-111111111111', 'dragon', 'Dragon', 'Rồng'
from auth.users u
where u.email = 'dragon@mint-dragon.local'
on conflict (id) do update set
  username = excluded.username,
  couple_id = excluded.couple_id;

insert into public.profiles (id, couple_id, username, display_name, nickname)
select u.id, '11111111-1111-1111-1111-111111111111', 'mint', 'Mint', 'Bạc Hà'
from auth.users u
where u.email = 'mint@mint-dragon.local'
on conflict (id) do update set
  username = excluded.username,
  couple_id = excluded.couple_id;
