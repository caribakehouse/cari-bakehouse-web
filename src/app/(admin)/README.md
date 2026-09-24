# (admin) — Khu quản trị (`/admin`)

Khung: sidebar tối 220px + topbar + vùng nội dung (theo wireframe 07-khung-admin) — xem `src/components/admin/AdminShell.tsx`.

| Route | Màn hình |
|-------|----------|
| `/admin` | Dashboard: số liệu tổng quan + 5 đơn gần nhất |
| `/admin/san-pham` | Sản phẩm: bảng, lọc, phân trang, thêm/sửa/xóa (cỡ bánh + giá từng cỡ) |
| `/admin/don-hang` | Đơn hàng: Chờ xử lý → Đã giao (cộng điểm) / Đã hủy |
| `/admin/khach-hang` | Khách hàng: lịch sử đơn, lịch sử điểm, cộng/trừ điểm thủ công |
| `/admin/dat-theo-yeu-cau` | Bánh đặt theo yêu cầu: Mới → Đang tư vấn → Đã báo giá → Đã cọc → Hoàn tất / Hủy |
| `/admin/tich-diem` | Tổng quan tích điểm + nhật ký điểm |
| `/admin/noi-dung-trang-chu` | Nội dung các khối trang chủ |
| `/admin/gioi-thieu-chinh-sach` | Câu chuyện thương hiệu, giá trị cốt lõi, FAQ chính sách |
| `/admin/cai-dat` | Hotline, email, Zalo, mạng xã hội |

## Dữ liệu (Supabase)
- Mọi dữ liệu nằm trên Supabase; cửa hàng và admin cùng đọc/ghi qua `src/lib/db.ts`.
  Cấu trúc bảng + quyền (RLS): `supabase/migrations/` (chạy lần lượt trong Supabase SQL Editor).
- Đặt hàng đi qua hàm `place_order()` trong database — giá lấy từ bảng products, khách không sửa được.
  Voucher: bảng `vouchers` (thêm/tắt mã trong Supabase Table Editor).
- Ảnh admin tải lên: Supabase Storage, bucket `images`.
- Đăng nhập: Supabase Auth. Quyền admin = `profiles.role = 'admin'` (cấp trong SQL Editor) — xem `src/lib/auth.ts`.
- `src/lib/mock-data.ts` chỉ còn là dữ liệu mẫu ban đầu (sinh `supabase/seed.sql` bằng `npm run db:seed-sql`).
