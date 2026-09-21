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
| `/admin/cai-dat` | Hotline, email, Zalo, mạng xã hội + khôi phục dữ liệu mẫu |

## Dữ liệu (Giai đoạn 2 — mock)
- Dữ liệu gốc DUY NHẤT: `src/lib/mock-data.ts`. Cửa hàng và admin cùng đọc/ghi qua `src/lib/db.ts`;
  chỉnh sửa được lưu chồng lên bằng localStorage (`cari-db:*`). "Khôi phục dữ liệu mẫu" ở `/admin/cai-dat`.
- Đăng nhập admin (mock): email `admin@cari.bakehouse`, mật khẩu bất kỳ — xem `src/lib/auth.ts`.
  TODO: thay bằng kiểm tra vai trò thật qua Supabase Auth ở Giai đoạn 4.
