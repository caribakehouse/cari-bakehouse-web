-- ============================================================
--  Quyền quản trị chỉ có hiệu lực khi đăng nhập bằng email + mật khẩu.
--  Đăng nhập Google (hoặc cách khác) vào tài khoản admin → chỉ được quyền như khách thường.
--  Supabase ghi cách đăng nhập của phiên hiện tại trong JWT, mục "amr": [{"method": "password", ...}].
--  Mọi chính sách RLS / hàm kiểm tra quyền đều gọi is_admin() nên chỉ cần sửa ở đây.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
     and coalesce(auth.jwt() -> 'amr', '[]'::jsonb) @> '[{"method": "password"}]'::jsonb;
$$;
