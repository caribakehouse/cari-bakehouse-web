-- ============================================================
--  Email thông báo đơn hàng (gửi qua Resend từ route /api/don-hang/thong-bao)
--    - 'placed'  : khách vừa đặt đơn → báo cho admin
--    - 'Đã giao' : admin xác nhận đơn (cộng điểm) → báo cho khách + admin
--    - 'Đã hủy'  : admin hủy đơn → báo cho khách + admin
--  Mỗi loại email chỉ gửi 1 lần cho mỗi đơn (ghi vào cột emails_sent),
--  nên gọi route nhiều lần cũng không gửi trùng / không dùng để spam được.
-- ============================================================

alter table public.orders add column if not exists emails_sent text[] not null default '{}';

-- Đánh dấu "đã gửi" loại email p_kind cho đơn p_order_id.
-- Trả về dữ liệu đơn (kèm điểm) nếu người gọi được phép và email này chưa gửi; ngược lại trả về null.
create or replace function public.claim_order_email(p_order_id text, p_kind text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_order  public.orders;
  v_points numeric := 0;
  v_balance numeric := 0;
begin
  if p_kind not in ('placed', 'Đã giao', 'Đã hủy') then
    return null;
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return null;
  end if;

  if p_kind = 'placed' then
    -- Chỉ chủ đơn (hoặc admin) báo được đơn mới
    if not (public.is_admin()
            or v_order.user_id = auth.uid()
            or lower(coalesce(v_order.customer_email, '')) = public.current_email()) then
      return null;
    end if;
  else
    -- Chỉ admin, và đơn phải đúng trạng thái tương ứng
    if not public.is_admin() or v_order.status <> p_kind then
      return null;
    end if;
  end if;

  if p_kind = any (v_order.emails_sent) then
    return null;
  end if;

  update public.orders set emails_sent = array_append(emails_sent, p_kind) where id = p_order_id;

  if coalesce(v_order.customer_email, '') <> '' then
    select coalesce(sum(points), 0) into v_points
    from public.point_logs where order_id = v_order.id and kind = 'order';
    v_balance := public.point_balance(v_order.customer_email);
  end if;

  return to_jsonb(v_order) || jsonb_build_object(
    'points_awarded', v_points,
    'point_balance', v_balance,
    'shop_email', (select value ->> 'email' from public.site_content where key = 'settings')
  );
end;
$$;

revoke execute on function public.claim_order_email(text, text) from public, anon;
grant execute on function public.claim_order_email(text, text) to authenticated;
