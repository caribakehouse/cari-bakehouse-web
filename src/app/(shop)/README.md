# (shop) — Nhóm route mua sắm

Các trang công khai của Cari Bakehouse:
- `/` — Trang chủ
- `/danh-muc` — Danh mục sản phẩm
- `/san-pham/[slug]` — Chi tiết sản phẩm
- `/gio-hang` — Giỏ hàng (danh sách, tăng/giảm/xóa, tạm tính)
- `/dat-hang` — Đặt hàng: hình thức nhận, ngày giờ, ghi chú, thanh toán, voucher, xác nhận đơn + gửi Zalo
- `/dang-nhap`, `/dang-ky` — Đăng nhập / đăng ký (mock, lưu tạm localStorage)
- `/tai-khoan` — Tài khoản: thông tin cá nhân, thẻ điểm, lịch sử đơn hàng (chỉ vào được khi đã đăng nhập mock)
- `/dat-theo-yeu-cau` — Đặt bánh theo yêu cầu
- `/gioi-thieu` — Giới thiệu về Cari Bakehouse
- `/tich-diem` — Chương trình tích điểm khách hàng
- `/lien-he` — Liên hệ & địa chỉ cửa hàng

Giai đoạn 2: giỏ hàng, đăng nhập, đơn hàng đều là MOCK (localStorage) — xem `src/lib/{auth,cart,orders}.ts`
và dữ liệu mẫu trong `src/lib/mock-data.ts`.
