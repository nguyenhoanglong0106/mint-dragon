# Nhật ký kỷ niệm của hai người

Ứng dụng web/PWA riêng tư dành cho hai người: lưu nhật ký, kỷ niệm, ngày đặc biệt và xem vị trí realtime của nhau trên bản đồ. Không cần VPS/server riêng - toàn bộ backend chạy trên Supabase, frontend deploy tĩnh (static) trên Cloudflare Pages.

## 1. Giới thiệu

- Ứng dụng chỉ phục vụ **đúng 2 tài khoản** (một cặp đôi).
- Dữ liệu được bảo vệ bằng Row Level Security (RLS) của Supabase: mỗi người chỉ thấy dữ liệu của couple mình.
- Ảnh/video kỷ niệm **không lưu trong Supabase Storage** mà quản lý qua một album Google Photos dùng chung; app chỉ lưu **link** tới album/ảnh đó.
- Vị trí realtime dùng Leaflet + OpenStreetMap (miễn phí), không dùng Google Maps API trả phí.

## 2. Công nghệ

| Nhóm | Công nghệ |
| --- | --- |
| Frontend | Vue 3 (Composition API) + Vite + TypeScript |
| State | Pinia |
| Router | Vue Router (có route guard) |
| UI | CSS tùy chỉnh theo phong cách "Romantic Minimal" + Tailwind CSS (reset) + Lucide Icons |
| PWA | vite-plugin-pwa |
| Backend | Supabase (Postgres + Auth + Realtime + RLS) |
| Bản đồ | Leaflet + OpenStreetMap |
| Ngày tháng | dayjs |
| Test | Vitest |

Không có Node.js server riêng, không Express/NestJS - mọi thao tác dữ liệu đi thẳng qua Supabase client (`@supabase/supabase-js`).

## 3. Cài Node.js

Cần Node.js **>= 20** (khuyến nghị 22 trở lên) và npm. Kiểm tra:

```bash
node -v
npm -v
```

## 4. Cài dependencies

```bash
npm install
```

## 5. Tạo Supabase project

1. Vào https://supabase.com/dashboard, tạo project mới (chọn region gần Việt Nam, ví dụ Singapore).
2. Vào **Project Settings > API**, lấy:
   - `Project URL` -> điền vào `VITE_SUPABASE_URL`
   - `anon public` key (hoặc `publishable` key theo hệ key mới) -> điền vào `VITE_SUPABASE_ANON_KEY`
   - **Tuyệt đối không** dùng `service_role` key trong frontend.

## 6. Chạy migration (tạo bảng + RLS)

1. Mở **SQL Editor** trong Supabase Dashboard.
2. Copy toàn bộ nội dung file [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) và chạy (Run).
3. File này sẽ tạo:
   - Bảng: `couples`, `profiles`, `memories`, `diaries`, `special_dates`, `live_locations`.
   - Index cho `couple_id`, `memory_date`, `diary_date`, `updated_at`.
   - Trigger tự động cập nhật `updated_at`.
   - Hàm `current_couple_id()` và đầy đủ RLS policy cho tất cả bảng (không có policy nào dùng `using (true)`).
   - Bật Realtime cho bảng `live_locations`.

Có thể chạy lại file này an toàn (idempotent) nếu cần - các lệnh đều dùng `if not exists` / `drop policy if exists`.

## 7. Tạo 2 tài khoản đăng nhập bằng username ngắn (dragon / mint)

App đăng nhập bằng **username ngắn + mật khẩu** (`dragon` / `hoanglong0106` và `mint` / `hongdiem1708`) thay vì email dài, nhưng bên dưới vẫn là Supabase Auth thật - mỗi username được ánh xạ tới 1 email cố định dạng `<username>@mint-dragon.local`, mật khẩu được Supabase hash và lưu trong `auth.users` như bình thường.

1. Vào **Authentication > Users > Add user** trong Supabase Dashboard.
2. Tạo tài khoản thứ nhất với email `dragon@mint-dragon.local`, mật khẩu `hoanglong0106`.
3. Tạo tài khoản thứ hai với email `mint@mint-dragon.local`, mật khẩu `hongdiem1708`.
4. Tick "Auto Confirm User" khi tạo (app dùng email giả nên không thể xác thực qua link email).

Không cần trang đăng ký công khai - chỉ admin (bạn) tạo 2 tài khoản này một lần duy nhất qua Dashboard.

## 8. Chạy migration gán username + tạo couple

1. Mở **SQL Editor**, copy toàn bộ nội dung file [`supabase/migrations/0002_username_login.sql`](supabase/migrations/0002_username_login.sql) và chạy.
2. File này tự động:
   - Thêm cột `username` (unique) vào bảng `profiles`.
   - Tạo 1 couple mặc định.
   - Tìm id của 2 user vừa tạo ở bước 7 theo email, gán `username` (`dragon` / `mint`) và `couple_id` cho profile của họ - không cần copy UUID thủ công.
3. Sửa `started_date` trong file thành ngày bắt đầu yêu thật của hai bạn trước khi chạy (mặc định `2024-01-01`).

Có thể chạy lại file này an toàn (idempotent). Sau bước này, đăng nhập ở bước 10 bằng `dragon`/`hoanglong0106` hoặc `mint`/`hongdiem1708` sẽ hoạt động, và toàn bộ dữ liệu (kỷ niệm, lời thương mỗi ngày...) được lưu thật trong Supabase, đồng bộ giữa 2 người thay vì chỉ lưu trên trình duyệt.

Bạn cũng có thể tham khảo file [`supabase/seed.sql`](supabase/seed.sql) để có thêm vài kỷ niệm mẫu (nhớ sửa 2 UUID trong file theo id thật của 2 user trước khi chạy).

Chạy thêm file [`supabase/migrations/0003_lock_couple_id.sql`](supabase/migrations/0003_lock_couple_id.sql) - vá một lỗ hổng RLS: nếu không có file này, 1 trong 2 tài khoản đã đăng nhập có thể tự đổi `couple_id` của chính mình (ví dụ qua console trình duyệt) để xem/ghi dữ liệu của couple khác nếu project Supabase từng chứa nhiều hơn 1 couple. File này thêm 1 trigger chặn việc đó từ phía client, không ảnh hưởng thao tác gán couple thủ công của admin qua SQL Editor.

Chạy thêm file [`supabase/migrations/0004_diary_music.sql`](supabase/migrations/0004_diary_music.sql) - thêm 2 cột `music_video_id`, `music_title` vào bảng `diaries` để mỗi lời nhắn có thể đính kèm 1 bài hát YouTube (xem mục "Lấy YouTube Data API key" ở bước 9).

Chạy thêm file [`supabase/migrations/0005_love_vault_and_memory_media.sql`](supabase/migrations/0005_love_vault_and_memory_media.sql) - thêm voice/video note cho kỷ niệm, hũ điều ước (`wish_items`) và coupon yêu thương (`love_coupons`).

## 9. Cấu hình file `.env`

Sao chép file mẫu và điền giá trị thật:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GOOGLE_PHOTOS_ALBUM_URL=https://photos.app.goo.gl/K7bKtMDdSgHypoCk8
VITE_YOUTUBE_API_KEY=
```

File `.env` đã được đưa vào `.gitignore` - **không bao giờ commit** file này.

### Lấy YouTube Data API key (tùy chọn - để tìm nhạc trong Lời nhắn)

Trang **Lời nhắn** cho phép tìm và đính kèm 1 bài hát YouTube vào status hàng ngày (phát bằng cách bấm vào icon sóng nhạc cạnh avatar ở Trang chủ). Tính năng tìm kiếm này gọi YouTube Data API v3 - **miễn phí** (quota mặc định 10.000 unit/ngày, mỗi lượt tìm tốn 100 unit, tức ~100 lượt tìm/ngày, dư sức cho 2 người dùng). Nếu không cấu hình key, phần tìm nhạc sẽ tự ẩn/báo chưa cấu hình, không ảnh hưởng các tính năng khác.

1. Vào https://console.cloud.google.com/, tạo project mới (hoặc dùng project có sẵn).
2. Vào **APIs & Services > Library**, tìm "YouTube Data API v3", bấm **Enable**.
3. Vào **APIs & Services > Credentials > Create Credentials > API key**.
4. (Khuyến nghị) Bấm vào key vừa tạo, ở **Application restrictions** chọn **Websites**, thêm domain thật của app (ví dụ `https://your-app.pages.dev/*`) để tránh key bị lộ trong bundle frontend rồi bị người khác dùng ké. Ở **API restrictions**, chọn **Restrict key**, chỉ tick "YouTube Data API v3".
5. Copy API key, điền vào `VITE_YOUTUBE_API_KEY` trong `.env` (và trong biến môi trường Cloudflare Pages nếu deploy - bước 12).

## 10. Chạy dev

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173` (hoặc port Vite in ra). Đăng nhập bằng `dragon`/`hoanglong0106` hoặc `mint`/`hongdiem1708` (đã tạo ở bước 7-8).

## 11. Build production

```bash
npm run build
```

Lệnh này chạy `vue-tsc -b` (kiểm tra type) rồi `vite build`, xuất ra thư mục `dist/`. Xem trước bản build:

```bash
npm run preview
```

## 12. Deploy Cloudflare Pages

1. Đẩy code lên GitHub/GitLab.
2. Vào Cloudflare Dashboard > **Workers & Pages > Create > Pages > Connect to Git**.
3. Chọn repo, cấu hình:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Vào **Settings > Environment variables**, thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_PHOTOS_ALBUM_URL`
   - `VITE_YOUTUBE_API_KEY` (tùy chọn - bỏ trống nếu không cần tìm nhạc trong Lời nhắn)
5. Deploy. File `public/_redirects` (chứa `/* /index.html 200`) đã có sẵn để SPA routing (Vue Router `createWebHistory`) hoạt động đúng khi truy cập trực tiếp vào các route con như `/memories`, `/map`, ...

## 13. Bật Supabase Realtime cho `live_locations`

Migration `0001_init.sql` đã tự động chạy:

```sql
alter publication supabase_realtime add table public.live_locations;
```

Kiểm tra lại (tùy chọn): vào **Database > Replication** trong Supabase Dashboard, đảm bảo bảng `live_locations` nằm trong publication `supabase_realtime` và đã bật.

## 14. Test GPS / vị trí realtime

- Vị trí realtime **cần HTTPS** (hoặc `localhost` khi dev) - trình duyệt sẽ từ chối `navigator.geolocation` trên HTTP thường.
- Mở app trên 2 thiết bị (hoặc 2 trình duyệt/2 tài khoản khác nhau), vào **Map**, bấm **Bật chia sẻ**.
- Cho phép quyền vị trí khi trình duyệt hỏi. Nếu từ chối, app sẽ hiện banner hướng dẫn bật lại quyền, không crash.
- Vị trí chỉ gửi lên server tối đa 1 lần / ~8 giây hoặc khi di chuyển > ~15m (throttle), để tiết kiệm quota Supabase.
- Marker của người còn lại sẽ tự cập nhật qua Supabase Realtime, không reload trang.

## 15. Troubleshooting

| Vấn đề | Cách xử lý |
| --- | --- |
| Đăng nhập báo "Sai username hoặc mật khẩu" | Kiểm tra đã tạo đúng email `dragon@mint-dragon.local` / `mint@mint-dragon.local` với đúng mật khẩu trong Authentication > Users (bước 7). |
| Trang trắng, không có dữ liệu | Kiểm tra đã chạy migration (bước 6, 8) và profile của cả 2 user đã có `couple_id` chưa (chạy lại `0002_username_login.sql`). |
| Vào app thấy cảnh báo "Hãy điền Supabase URL..." | Chưa cấu hình đúng `.env`, kiểm tra lại bước 9 và restart `npm run dev`. |
| Không thấy vị trí người còn lại | Kiểm tra cả 2 tài khoản đã bật "Chia sẻ vị trí", kiểm tra Realtime đã bật (bước 13), kiểm tra cả 2 profile cùng `couple_id`. |
| Trình duyệt từ chối GPS | Vào cài đặt trình duyệt/site, cấp lại quyền Location cho domain, tải lại trang. |
| Build lỗi type | Chạy `npm run build` để xem lỗi TypeScript cụ thể và sửa trực tiếp trong `src/`. |
| Deploy Cloudflare bị 404 khi vào thẳng `/memories`, `/map`,... | Kiểm tra file `public/_redirects` có được build ra `dist/_redirects` không (Vite tự động copy mọi thứ trong `public/`). |
| Trang Lời nhắn báo "Chưa cấu hình tìm nhạc" | Chưa điền `VITE_YOUTUBE_API_KEY` (bước 9) - tính năng đính nhạc là tùy chọn, các tính năng khác vẫn hoạt động bình thường. |

## 16. Giới hạn của vị trí realtime trên PWA

`navigator.geolocation.watchPosition` **không đảm bảo** hoạt động khi:

- Trình duyệt/app bị đóng hoặc bị hệ điều hành kill.
- iOS suspend PWA chạy nền (background).
- Android dừng tiến trình để tiết kiệm pin.

=> Vị trí realtime hoạt động tốt nhất **khi ứng dụng đang mở ở foreground**. Đây là giới hạn của nền tảng web/PWA, không phải lỗi của app. Kiến trúc code (composable `useGeolocation`, service `location.service.ts`) được tách riêng để sau này có thể nâng cấp lên Capacitor (Android/iOS native) + Background Geolocation plugin mà không cần viết lại logic nghiệp vụ.

## Cấu trúc thư mục

```
src/
  components/    common/ home/ memory/ diary/ map/
  composables/   useGeolocation, useRealtimeLocation, useDistance, useTheme, useOnlineStatus, useToast
  layouts/       AppLayout.vue (bottom nav mobile + sidebar desktop)
  pages/         LoginPage, HomePage, MemoriesPage, MemoryDetailPage, DiaryPage, MapPage, ProfilePage, SettingsPage
  router/        route guard (redirect /login nếu chưa đăng nhập)
  services/      supabase.ts + *.service.ts (gọi Supabase trực tiếp, không qua backend riêng)
  stores/        Pinia store cho auth, couple, memories, diaries, specialDates, location
  types/         kiểu dữ liệu dùng chung, khớp với schema Postgres
  utils/         distance.ts (Haversine), date.ts (dayjs helpers), mood.ts (mood options dùng chung cho diary + history)
supabase/
  migrations/0001_init.sql   schema + RLS + trigger + realtime
  migrations/0002_username_login.sql   username login (dragon/mint) + tạo couple
  migrations/0003_lock_couple_id.sql   vá RLS: chặn user tự đổi couple_id của mình
  migrations/0004_diary_music.sql   thêm music_video_id/music_title vào diaries (đính nhạc YouTube)
  seed.sql                   dữ liệu mẫu (tùy chọn)
tests/           unit test cho utils (Vitest)
```

## Giới hạn / phần còn lại bạn cần tự làm

- Tạo Supabase project thật và điền `.env` (bước 5, 9).
- Tạo 2 tài khoản (email giả `dragon@mint-dragon.local` / `mint@mint-dragon.local`) và chạy migration gán couple (bước 7, 8) - đây là bước thủ công bắt buộc vì app không có đăng ký công khai và Supabase Auth cần được tạo qua Dashboard (cần service role key, không dùng được từ frontend).
- Tạo/thay avatar thật (nhập URL ảnh trong trang Hồ sơ) và cập nhật album Google Photos thật.
- Deploy lên Cloudflare Pages và gán biến môi trường (bước 12).
- (Tùy chọn, không thuộc scope v1) Nếu muốn vị trí chạy cả khi tắt màn hình/đóng app, cần đóng gói bằng Capacitor + plugin Background Geolocation native - kiến trúc hiện tại đã sẵn sàng để mở rộng nhưng chưa triển khai trong bản này.
