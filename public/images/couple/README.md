# Ảnh chibi cho card "Khoảng cách giữa chúng mình"

`be_mint_chibi_running.jpg` (Bé Mint) và `rong_chibi_running.jpg` (Rồng)
trong thư mục này là ảnh chibi thật đang dùng làm mặc định cho
`DistanceLoveCard.vue`.

Muốn đổi ảnh khác, chọn 1 trong 2 cách:

1. **Đơn giản nhất**: đè file mới lên đúng 2 tên ở trên (giữ nguyên tên,
   đổi đuôi thì sửa 2 đường dẫn mặc định trong
   `src/components/home/DistanceLoveCard.vue`).
2. **Không đụng file mặc định**: thả ảnh mới vào thư mục này với tên
   khác, rồi truyền props `girl-image` / `boy-image` trỏ tới ảnh đó từ
   nơi gọi `<DistanceLoveCard>` (hiện đang gọi ở `src/pages/HomePage.vue`).

Lưu ý khi thay ảnh:

- Cả 2 ảnh hiện tại đều quay mặt/chạy về **cùng một hướng** (sang phải).
  Component tự lật ảnh của "boy" bằng CSS (`transform: scaleX(-1)`) để 2
  nhân vật quay mặt vào nhau khi chạy tới giữa - nếu ảnh mới đã tự nhìn
  đúng chiều (2 người quay mặt vào nhau sẵn) thì bỏ dòng `scaleX(-1)` đó
  trong `src/style.css` (tìm class `.chibi-boy`).
- Nền ảnh trong suốt (PNG/WEBP có alpha) sẽ đẹp hơn nền trắng của JPG,
  nhưng không bắt buộc - nền trắng vẫn hiển thị được, chỉ hơi lộ viền
  vuông nhẹ trên nền thẻ.
- Nếu ảnh lỗi hoặc đường dẫn sai, component tự hiện emoji 👧 / 👦 thay
  thế - không vỡ layout, không cần làm gì thêm.
