-- ============================================================
--  Cấp quyền truy cập bảng cho website (Data API).
--  Project Supabase mới không tự cấp quyền cho bảng tạo bằng SQL → website báo "permission denied".
--  Quyền ở đây chỉ là "cửa ngoài"; RLS trong 0001_init.sql vẫn quyết định được xem/sửa dòng nào.
--    anon          = khách chưa đăng nhập
--    authenticated = người đã đăng nhập (khách hoặc admin)
-- ============================================================

grant usage on schema public to anon, authenticated;

-- Dữ liệu công khai: ai cũng đọc được
grant select on public.product_groups, public.products, public.reviews, public.site_content to anon, authenticated;

-- Khách vãng lai được đặt đơn và gửi yêu cầu đặt bánh
grant insert on public.orders, public.custom_requests to anon;

-- Người đã đăng nhập: RLS giới hạn khách chỉ thấy dữ liệu của mình, admin được sửa tất cả
grant select on public.profiles, public.customers, public.orders, public.point_logs, public.custom_requests to authenticated;
grant insert, update, delete on
  public.customers, public.product_groups, public.products, public.reviews, public.site_content,
  public.orders, public.point_logs, public.custom_requests
  to authenticated;
-- profiles: chỉ sửa được tên + sđt (đã cấp trong 0001_init.sql), không tự đổi role

-- Mã tự tăng (KH001, P001, YC0001, id sản phẩm...)
grant usage, select on all sequences in schema public to anon, authenticated;
