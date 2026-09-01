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

## 7. Tạo 2 tài khoản (account)

1. Vào **Authentication > Users > Add user** trong Supabase Dashboard.
2. Tạo tài khoản thứ nhất (ví dụ: `you@example.com`) và đặt mật khẩu.
3. Tạo tài khoản thứ hai (ví dụ: `partner@example.com`) và đặt mật khẩu.
4. Bấm vào từng user để copy **User UID** (dạng uuid) - sẽ dùng ở bước tiếp theo.

Không cần trang đăng ký công khai - chỉ admin (bạn) tạo 2 tài khoản này một lần duy nhất qua Dashboard.

## 8. Tạo couple và ghép 2 user vào cùng couple

Mở **SQL Editor**, chạy đoạn sau (thay 2 UUID lấy ở bước 7 và ngày bắt đầu yêu):

```sql
insert into public.couples (name, started_date)
values ('Chúng mình', '2023-06-01')
returning id;
-- Nhớ lại id vừa trả về (ví dụ 11111111-1111-1111-1111-111111111111)

update public.profiles set couple_id = '<id-cua-couple-vua-tao>'
where id = '<uuid-user-thu-nhat>';

update public.profiles set couple_id = '<id-cua-couple-vua-tao>'
where id = '<uuid-user-thu-hai>';
```

> Lưu ý: hàng `profiles` cho mỗi user sẽ **tự động không tồn tại** cho tới khi họ đăng nhập lần đầu (do RLS cho phép user tự insert profile của chính mình). Nếu muốn tạo sẵn profile trước, chạy thêm:
>
> ```sql
> insert into public.profiles (id, couple_id, display_name)
> values ('<uuid-user-thu-nhat>', '<id-couple>', 'Tên hiển thị 1')
> on conflict (id) do update set couple_id = excluded.couple_id;
> ```

Bạn cũng có thể tham khảo file [`supabase/seed.sql`](supabase/seed.sql) để tạo couple + profile + vài kỷ niệm mẫu trong một lần chạy (nhớ sửa 2 UUID trong file trước).

## 9. Cấu hình file `.env`

Sao chép file mẫu và điền giá trị thật:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GOOGLE_PHOTOS_ALBUM_URL=https://photos.app.goo.gl/K7bKtMDdSgHypoCk8
```

File `.env` đã được đưa vào `.gitignore` - **không bao giờ commit** file này.

## 10. Chạy dev

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173` (hoặc port Vite in ra). Đăng nhập bằng 1 trong 2 tài khoản đã tạo ở bước 7.

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
| Đăng nhập báo "Email hoặc mật khẩu chưa đúng" | Kiểm tra lại email/mật khẩu đã tạo trong Authentication > Users. |
| Trang trắng, không có dữ liệu | Kiểm tra đã chạy migration (bước 6) và đã gán `couple_id` cho cả 2 profile (bước 8) chưa. |
| Vào app thấy cảnh báo "Hãy điền Supabase URL..." | Chưa cấu hình đúng `.env`, kiểm tra lại bước 9 và restart `npm run dev`. |
| Không thấy vị trí người còn lại | Kiểm tra cả 2 tài khoản đã bật "Chia sẻ vị trí", kiểm tra Realtime đã bật (bước 13), kiểm tra cả 2 profile cùng `couple_id`. |
| Trình duyệt từ chối GPS | Vào cài đặt trình duyệt/site, cấp lại quyền Location cho domain, tải lại trang. |
| Build lỗi type | Chạy `npm run build` để xem lỗi TypeScript cụ thể và sửa trực tiếp trong `src/`. |
| Deploy Cloudflare bị 404 khi vào thẳng `/memories`, `/map`,... | Kiểm tra file `public/_redirects` có được build ra `dist/_redirects` không (Vite tự động copy mọi thứ trong `public/`). |

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
  pages/         LoginPage, HomePage, MemoriesPage, MemoryDetailPage, DiaryPage, MapPage, SpecialDatesPage, ProfilePage, SettingsPage
  router/        route guard (redirect /login nếu chưa đăng nhập)
  services/      supabase.ts + *.service.ts (gọi Supabase trực tiếp, không qua backend riêng)
  stores/        Pinia store cho auth, couple, memories, diaries, specialDates, location
  types/         kiểu dữ liệu dùng chung, khớp với schema Postgres
  utils/         distance.ts (Haversine), date.ts (dayjs helpers)
supabase/
  migrations/0001_init.sql   schema + RLS + trigger + realtime
  seed.sql                   dữ liệu mẫu (tùy chọn)
tests/           unit test cho utils (Vitest)
```

## Giới hạn / phần còn lại bạn cần tự làm

- Tạo Supabase project thật và điền `.env` (bước 5, 9).
- Tạo 2 tài khoản và ghép couple bằng SQL (bước 7, 8) - đây là bước thủ công bắt buộc vì app không có đăng ký công khai.
- Tạo/thay avatar thật (nhập URL ảnh trong trang Hồ sơ) và cập nhật album Google Photos thật.
- Deploy lên Cloudflare Pages và gán biến môi trường (bước 12).
- (Tùy chọn, không thuộc scope v1) Nếu muốn vị trí chạy cả khi tắt màn hình/đóng app, cần đóng gói bằng Capacitor + plugin Background Geolocation native - kiến trúc hiện tại đã sẵn sàng để mở rộng nhưng chưa triển khai trong bản này.
