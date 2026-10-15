-- ============================================================
--  Điểm tích lẻ: tính theo đúng số tiền, không làm tròn xuống.
--  Ví dụ 10.000đ = 1 điểm → đơn 72.500đ được 7,25 điểm (trước đây chỉ được 7).
--  - point_logs.points đổi sang số thập phân (2 chữ số sau dấu phẩy)
--  - Hạng thành viên và điều kiện đổi quà vẫn so với mốc số nguyên (30,5 điểm chưa đủ 31)
--  - Tính lại điểm cho các đơn đã giao trước đó
-- ============================================================

alter table public.point_logs alter column points type numeric(12, 2);

-- Điểm của 1 đơn: làm tròn 2 chữ số thập phân (trước đây làm tròn xuống số nguyên)
drop function if exists public.points_for_order(int);
create function public.points_for_order(p_total int)
returns numeric
language sql stable security definer set search_path = ''
as $$
  select round(p_total / greatest(coalesce((public.loyalty_config() ->> 'pointRateVnd')::numeric, 10000), 1), 2);
$$;

-- Điểm hiện có (dùng khi đổi quà): trả số lẻ để báo đúng "hiện có 67,5 điểm"
drop function if exists public.point_balance(text);
create function public.point_balance(p_email text)
returns numeric
language sql stable security definer set search_path = ''
as $$
  select coalesce(sum(points), 0) from public.point_logs where lower(email) = lower(p_email);
$$;

-- Tổng điểm đã tích (xét hạng): làm tròn xuống để 30,5 điểm vẫn chưa lên hạng 31
create or replace function public.lifetime_points(p_email text)
returns int
language sql stable security definer set search_path = ''
as $$
  select floor(coalesce(sum(points), 0))::int from public.point_logs
  where lower(email) = lower(p_email) and points > 0 and kind in ('order', 'manual', 'initial');
$$;

-- Admin cộng/trừ điểm thủ công: không cho số dư âm (so bằng số lẻ, không làm tròn)
create or replace function public.check_point_balance()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  balance numeric;
begin
  select coalesce(sum(points), 0) into balance
  from public.point_logs where lower(email) = lower(new.email);
  if balance + new.points < 0 then
    raise exception 'Không thể trừ quá số điểm hiện có (% điểm)', balance;
  end if;
  return new;
end;
$$;

-- Đổi trạng thái đơn: Đã giao → cộng điểm (số lẻ); Đã hủy → hoàn điểm đã đổi
create or replace function public.before_order_status_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  pts numeric;
begin
  if new.status is distinct from old.status then
    if old.status <> 'Chờ xử lý' then
      raise exception 'Đơn đã kết thúc, không thể đổi trạng thái';
    end if;

    if new.status = 'Đã giao' and coalesce(new.customer_email, '') <> '' then
      pts := public.points_for_order(new.total);
      if pts > 0 then
        insert into public.point_logs (email, points, kind, order_id, title)
        values (new.customer_email, pts, 'order', new.id, 'Đơn hàng ' || new.id || ' hoàn tất')
        on conflict do nothing;
      end if;
    end if;

    if new.status = 'Đã hủy' and coalesce(old.points_redeemed, 0) > 0 and coalesce(new.customer_email, '') <> '' then
      insert into public.point_logs (email, points, kind, order_id, title)
      values (new.customer_email, old.points_redeemed, 'redeem', new.id, 'Hoàn điểm đổi quà (đơn ' || new.id || ' đã hủy)');
    end if;
  end if;
  return new;
end;
$$;

-- Tính lại điểm cho các đơn đã giao trước đây (trước bị làm tròn xuống)
update public.point_logs l
set points = public.points_for_order(o.total)
from public.orders o
where l.order_id = o.id and l.kind = 'order' and o.status = 'Đã giao';

-- Xem kết quả: điểm từng đơn đã giao sau khi tính lại
select o.id as ma_don, o.customer_email as email, o.total as tong_tien, l.points as diem
from public.point_logs l join public.orders o on o.id = l.order_id
where l.kind = 'order'
order by o.id;
