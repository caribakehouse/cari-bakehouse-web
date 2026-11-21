-- ============================================================
--  Ngày sửa sản phẩm gần nhất (products.updated_at) — dùng cho sitemap.xml (lastmod)
--  để Google biết trang sản phẩm nào vừa đổi giá / ảnh / mô tả.
--  Database tự ghi mỗi khi sản phẩm được sửa; sản phẩm cũ lấy ngày tạo.
-- ============================================================

alter table public.products add column if not exists updated_at timestamptz;
update public.products set updated_at = created_at where updated_at is null;
alter table public.products alter column updated_at set default now();
alter table public.products alter column updated_at set not null;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();
