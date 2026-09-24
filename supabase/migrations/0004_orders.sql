-- ============================================================
--  Phần 3: đặt hàng an toàn, voucher, thứ tự thời gian.
--  - Khách KHÔNG được ghi thẳng vào bảng orders nữa: chỉ đặt qua hàm place_order(), hàm tự lấy giá
--    từ bảng products + voucher nên khách không sửa được giá / tổng tiền.
--  - Voucher nằm trong bảng vouchers (admin tự thêm/tắt trong Table Editor).
-- ============================================================

-- Thời điểm chính xác (để sắp xếp đơn / yêu cầu trong cùng một ngày)
alter table public.orders add column if not exists placed_at timestamptz not null default now();
alter table public.custom_requests add column if not exists placed_at timestamptz not null default now();

-- ─── Voucher ─────────────────────────────────────────────────
create table if not exists public.vouchers (
  code        text primary key check (code = upper(code)),
  -- Số tiền giảm (đồng)
  discount    int  not null check (discount > 0),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.vouchers enable row level security;
-- Không mở quyền đọc danh sách voucher cho khách (tránh dò mã); khách kiểm tra 1 mã qua check_voucher()
create policy "vouchers: admin toàn quyền" on public.vouchers
  for all using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.vouchers to authenticated;

create or replace function public.check_voucher(p_code text)
returns int
language sql stable security definer set search_path = ''
as $$
  select discount from public.vouchers where code = upper(trim(p_code)) and active;
$$;
grant execute on function public.check_voucher(text) to anon, authenticated;

-- ─── Đặt hàng ────────────────────────────────────────────────
revoke insert on public.orders from anon, authenticated;

-- p_items: [{ "slug": "...", "size": "16cm" | null, "quantity": 2 }, ...]
create or replace function public.place_order(
  p_items         jsonb,
  p_voucher       text,
  p_fulfillment   text,
  p_address       text,
  p_receive_date  date,
  p_receive_time  text,
  p_note          text,
  p_payment       text
)
returns public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_email     text;
  v_name      text;
  v_phone     text;
  v_item      jsonb;
  v_product   public.products;
  v_qty       int;
  v_size      text;
  v_price     int;
  v_items     jsonb := '[]'::jsonb;
  v_subtotal  int := 0;
  v_discount  int := 0;
  v_code      text := nullif(upper(trim(coalesce(p_voucher, ''))), '');
  v_order     public.orders;
begin
  if v_uid is null then
    raise exception 'Vui lòng đăng nhập để đặt hàng';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Giỏ hàng đang trống';
  end if;
  if p_receive_date < public.today_vn() then
    raise exception 'Ngày nhận không được ở quá khứ';
  end if;
  if p_fulfillment = 'delivery' and coalesce(trim(p_address), '') = '' then
    raise exception 'Vui lòng nhập địa chỉ giao hàng';
  end if;

  select u.email, coalesce(nullif(p.full_name, ''), split_part(u.email, '@', 1)), nullif(p.phone, '')
    into v_email, v_name, v_phone
  from auth.users u left join public.profiles p on p.id = u.id
  where u.id = v_uid;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'Số lượng không hợp lệ';
    end if;

    select * into v_product from public.products where slug = v_item ->> 'slug';
    if not found or v_product.status = 'hidden' then
      raise exception 'Sản phẩm không còn bán: %', coalesce(v_item ->> 'slug', '?');
    end if;
    if v_product.status = 'soldout' or (v_product.stock is not null and v_product.stock <= 0) then
      raise exception 'Sản phẩm "%" đã hết hàng', v_product.name;
    end if;

    v_size := nullif(v_item ->> 'size', '');
    if v_product.sizes is not null and jsonb_array_length(v_product.sizes) > 0 then
      select (s ->> 'price')::int into v_price
      from jsonb_array_elements(v_product.sizes) s
      where s ->> 'label' = coalesce(v_size, v_product.sizes -> 0 ->> 'label');
      if v_price is null then
        raise exception 'Cỡ "%" của "%" không còn bán', v_size, v_product.name;
      end if;
      v_size := coalesce(v_size, v_product.sizes -> 0 ->> 'label');
    else
      v_price := v_product.price;
      v_size := null;
    end if;

    v_subtotal := v_subtotal + v_price * v_qty;
    v_items := v_items || jsonb_strip_nulls(jsonb_build_object(
      'name', v_product.name, 'size', v_size, 'quantity', v_qty, 'price', v_price
    ));
  end loop;

  if v_code is not null then
    v_discount := public.check_voucher(v_code);
    if v_discount is null then
      raise exception 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
    end if;
    v_discount := least(v_discount, v_subtotal);
  end if;

  insert into public.orders (
    id, items, subtotal, voucher_code, discount, total, fulfillment, address,
    receive_date, receive_time, note, payment_method, customer_name, customer_phone, customer_email
  ) values (
    public.generate_order_id(), v_items, v_subtotal, v_code, v_discount, v_subtotal - v_discount, p_fulfillment,
    case when p_fulfillment = 'delivery' then trim(p_address) end,
    p_receive_date, p_receive_time, nullif(trim(coalesce(p_note, '')), ''), p_payment, v_name, v_phone, v_email
  )
  returning * into v_order;

  return v_order;
end;
$$;
revoke execute on function public.place_order(jsonb, text, text, text, date, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, date, text, text, text) to authenticated;

-- ─── Yêu cầu đặt bánh: email luôn lấy từ tài khoản đang đăng nhập (không cho điền email người khác) ───
create or replace function public.before_custom_request_insert()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if public.from_website() and not public.is_admin() then
    new.status := 'Mới';
    new.quoted_price := null;
    new.created_at := public.today_vn();
    new.placed_at := now();
    new.user_id := auth.uid();
    new.customer_email := nullif(public.current_email(), '');
  end if;
  return new;
end;
$$;
