-- Cho phép gắn 1 bài hát YouTube vào mỗi lời nhắn (diaries).
--
-- Chỉ lưu video_id (dùng để nhúng iframe phát) và title (hiển thị tên bài
-- hát mà không cần gọi lại API) - không lưu link đầy đủ vì video_id là đủ
-- để dựng lại URL nhúng (https://www.youtube.com/embed/<video_id>).

alter table public.diaries
  add column if not exists music_video_id text,
  add column if not exists music_title text;
