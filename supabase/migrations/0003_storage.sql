-- ============================================================
--  Kho ảnh "images" trên Supabase Storage (ảnh sản phẩm, banner, gallery... admin tải lên).
--  Ai cũng xem được ảnh (bucket public); chỉ admin được tải lên / thay / xóa.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "images: admin tải lên" on storage.objects
  for insert to authenticated with check (bucket_id = 'images' and public.is_admin());
create policy "images: admin sửa" on storage.objects
  for update to authenticated using (bucket_id = 'images' and public.is_admin());
create policy "images: admin xóa" on storage.objects
  for delete to authenticated using (bucket_id = 'images' and public.is_admin());
