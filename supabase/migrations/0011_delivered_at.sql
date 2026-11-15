-- ============================================================
--  Ghi ngày hoàn tất đơn để trang Doanh thu tính theo NGÀY GIAO (ngày admin bấm "Đã giao"),
--  không theo ngày khách hẹn nhận bánh.
--    - orders.delivered_at        : ngày đơn chuyển sang "Đã giao"
--    - custom_requests.done_at    : ngày yêu cầu đặt bánh chuyển sang "Hoàn tất"
--  Database tự ghi (trigger), admin không phải nhập.
-- ============================================================

alter table public.orders add column if not exists delivered_at date;
alter table public.custom_requests add column if not exists done_at date;

-- Đơn online: ghi ngày khi chuyển sang "Đã giao"
create or replace function public.set_order_delivered_at()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status is distinct from old.status and new.status = 'Đã giao' then
    new.delivered_at := public.today_vn();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_delivered_at on public.orders;
create trigger orders_set_delivered_at
  before update of status on public.orders
  for each row execute function public.set_order_delivered_at();

-- Bánh theo yêu cầu: ghi ngày khi chuyển sang "Hoàn tất", bỏ ngày nếu chuyển sang trạng thái khác
create or replace function public.set_request_done_at()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.done_at := case when new.status = 'Hoàn tất' then public.today_vn() end;
  end if;
  return new;
end;
$$;

drop trigger if exists custom_requests_set_done_at on public.custom_requests;
create trigger custom_requests_set_done_at
  before update of status on public.custom_requests
  for each row execute function public.set_request_done_at();

-- ─── Điền ngày cho dữ liệu cũ ────────────────────────────────
-- Đơn đã giao trước đây: lấy ngày cộng điểm (điểm được cộng đúng lúc bấm "Đã giao");
-- đơn không có điểm (không có email khách) thì lấy ngày nhận bánh (không quá hôm nay).
update public.orders o
set delivered_at = coalesce(
  (select min(l.date) from public.point_logs l where l.order_id = o.id and l.kind = 'order'),
  least(o.receive_date, public.today_vn())
)
where o.status = 'Đã giao' and o.delivered_at is null;

-- Yêu cầu đã hoàn tất trước đây: lấy ngày cần bánh (không quá hôm nay)
update public.custom_requests
set done_at = least(delivery_date, public.today_vn())
where status = 'Hoàn tất' and done_at is null;

-- Xem kết quả: các đơn đã giao và ngày giao được điền
select id, receive_date as ngay_nhan, delivered_at as ngay_giao, total
from public.orders where status = 'Đã giao' order by delivered_at desc;
