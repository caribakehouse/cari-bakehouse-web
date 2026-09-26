-- ============================================================
--  Tùy chọn thêm cho sản phẩm (sốt đi kèm, loại sữa, % đường, % đá, lượng matcha...)
--  products.options: [{ "name": "Sốt đi kèm", "choices": [{ "label": "Sữa đặc", "price": 0 }, ...] }, ...]
--  Khách chọn đúng 1 lựa chọn mỗi nhóm; lựa chọn đầu tiên là mặc định.
--  place_order() tính lại phụ thu từ bảng products — khách không sửa được giá.
-- ============================================================

alter table public.products add column if not exists options jsonb;

-- p_items: [{ "slug": "...", "size": "Full size" | null, "quantity": 2, "options": { "Sốt đi kèm": "Caramel muối" } }, ...]
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
  v_group     jsonb;
  v_wanted    text;
  v_choice    jsonb;
  v_chosen    jsonb;
  v_extra     int;
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

    -- Giá theo cỡ
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

    -- Tùy chọn thêm: mỗi nhóm lấy lựa chọn khách gửi lên (không gửi → lựa chọn đầu tiên), cộng phụ thu
    v_chosen := '[]'::jsonb;
    if v_product.options is not null and jsonb_typeof(v_product.options) = 'array' then
      for v_group in select * from jsonb_array_elements(v_product.options) loop
        continue when jsonb_array_length(coalesce(v_group -> 'choices', '[]'::jsonb)) = 0;
        v_wanted := coalesce(v_item -> 'options' ->> (v_group ->> 'name'), v_group -> 'choices' -> 0 ->> 'label');
        select c into v_choice
        from jsonb_array_elements(v_group -> 'choices') c
        where c ->> 'label' = v_wanted
        limit 1;
        if v_choice is null then
          raise exception 'Lựa chọn "%" (%) của "%" không còn — vui lòng chọn lại', v_wanted, v_group ->> 'name', v_product.name;
        end if;
        v_extra := coalesce((v_choice ->> 'price')::int, 0);
        v_price := v_price + v_extra;
        v_chosen := v_chosen || jsonb_build_object('group', v_group ->> 'name', 'choice', v_wanted, 'price', v_extra);
      end loop;
    end if;

    v_subtotal := v_subtotal + v_price * v_qty;
    v_items := v_items || jsonb_strip_nulls(jsonb_build_object(
      'name', v_product.name, 'size', v_size, 'quantity', v_qty, 'price', v_price,
      'options', case when jsonb_array_length(v_chosen) > 0 then v_chosen end
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
