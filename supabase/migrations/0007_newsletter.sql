-- ============================================================
--  Ô "Nhận ưu đãi ngọt ngào" ở footer: lưu email khách để tiệm gửi ưu đãi.
--  - Khách (kể cả chưa đăng nhập) chỉ gửi email qua hàm subscribe_newsletter(), không đọc được danh sách.
--  - Admin xem / xóa ở /admin/email-uu-dai.
-- ============================================================

create table public.newsletter_subscribers (
  email       text primary key,
  created_at  timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "newsletter: admin xem" on public.newsletter_subscribers for select using (public.is_admin());
create policy "newsletter: admin xóa" on public.newsletter_subscribers for delete using (public.is_admin());

grant select, delete on public.newsletter_subscribers to authenticated;

-- Đăng ký nhận ưu đãi: email đã có thì bỏ qua (không báo lỗi, không lộ email nào đã đăng ký)
create or replace function public.subscribe_newsletter(p_email text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Email không hợp lệ';
  end if;
  insert into public.newsletter_subscribers (email) values (v_email)
  on conflict (email) do nothing;
end;
$$;

grant execute on function public.subscribe_newsletter(text) to anon, authenticated;
