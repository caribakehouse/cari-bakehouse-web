-- ============================================================
--  Chương trình thành viên (quy tắc đối tác chốt 2026-09-26)
--  - Tích điểm: 10.000đ = 1 điểm (cộng khi đơn "Đã giao", tính trên tổng tiền sau giảm giá)
--  - Hạng theo TỔNG ĐIỂM ĐÃ TÍCH (đổi quà không tụt hạng): Mới 0–30 · Thân thiết 31–99 · VIP từ 100
--  - Đổi 68 điểm → 1 bánh thuộc nhóm "Cheesecake" miễn phí (cỡ nào cũng được, phụ thu tùy chọn vẫn tính)
--  - VIP: giảm 10% tiền bánh (không tính đồ uống)
--  - VIP tháng sinh nhật: 1 đơn giảm 50% tiền bánh (thay cho mức 10%)
--  Mọi con số nằm trong site_content key 'loyalty' — admin sửa ở /admin/tich-diem.
-- ============================================================

-- ─── Cấu hình ────────────────────────────────────────────────
insert into public.site_content (key, value) values ('loyalty', jsonb_build_object(
  'pointRateVnd', 10000,
  'redeemPoints', 68,
  'redeemGroupId', coalesce((select id from public.product_groups where title ilike '%cheesecake%' order by sort_order limit 1), ''),
  'loyalMinPoints', 31,
  'vipMinPoints', 100,
  'vipCakeDiscountPercent', 10,
  'birthdayCakeDiscountPercent', 50
)) on conflict (key) do nothing;

create or replace function public.loyalty_config()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce((select value from public.site_content where key = 'loyalty'), '{}'::jsonb);
$$;

-- Quy tắc tích điểm đọc từ cấu hình
create or replace function public.points_for_order(p_total int)
returns int
language sql stable security definer set search_path = ''
as $$
  select floor(p_total / greatest(coalesce((public.loyalty_config() ->> 'pointRateVnd')::numeric, 10000), 1))::int;
$$;

-- Tổng điểm đã tích (xét hạng): điểm cộng từ đơn hàng / admin cộng tay / điểm khởi tạo — không tính hoàn điểm đổi quà
create or replace function public.lifetime_points(p_email text)
returns int
language sql stable security definer set search_path = ''
as $$
  select coalesce(sum(points), 0)::int from public.point_logs
  where lower(email) = lower(p_email) and points > 0 and kind in ('order', 'manual', 'initial');
$$;

create or replace function public.point_balance(p_email text)
returns int
language sql stable security definer set search_path = ''
as $$
  select coalesce(sum(points), 0)::int from public.point_logs where lower(email) = lower(p_email);
$$;

-- ─── Ngày sinh (khách tự nhập 1 lần) ─────────────────────────
alter table public.profiles add column if not exists birthday date;
grant update (full_name, phone, birthday) on public.profiles to authenticated;

create or replace function public.lock_birthday()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if public.from_website() and not public.is_admin()
     and old.birthday is not null and new.birthday is distinct from old.birthday then
    raise exception 'Ngày sinh đã được lưu — vui lòng nhắn tiệm nếu cần sửa';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_birthday on public.profiles;
create trigger profiles_lock_birthday
  before update of birthday on public.profiles
  for each row execute function public.lock_birthday();

-- Đăng ký: lưu luôn ngày sinh nếu khách nhập
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_birthday date;
begin
  begin
    v_birthday := nullif(new.raw_user_meta_data ->> 'birthday', '')::date;
  exception when others then
    v_birthday := null;
  end;

  insert into public.profiles (id, full_name, phone, birthday)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    v_birthday
  );

  perform public.ensure_customer(
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.id
  );
  return new;
end;
$$;

-- ─── Đơn hàng: chi tiết giảm giá + điểm đã đổi ───────────────
alter table public.orders add column if not exists discount_details jsonb;
alter table public.orders add column if not exists points_redeemed int not null default 0;
-- Tháng đã dùng ưu đãi sinh nhật (vd '2026-09') — mỗi tháng sinh nhật chỉ 1 đơn
alter table public.orders add column if not exists birthday_month text;

-- ─── Đặt hàng (thay hàm cũ: thêm đổi điểm + ưu đãi thành viên) ───
drop function if exists public.place_order(jsonb, text, text, text, date, text, text, text);

-- p_items: [{ "slug", "size", "quantity", "options": { nhóm: lựa chọn } }, ...]
-- p_redeem_index: vị trí (0, 1, ...) của món trong p_items muốn đổi điểm lấy 1 cái miễn phí; null = không đổi
-- p_use_birthday: dùng ưu đãi sinh nhật VIP cho đơn này
create function public.place_order(
  p_items          jsonb,
  p_voucher        text,
  p_fulfillment    text,
  p_address        text,
  p_receive_date   date,
  p_receive_time   text,
  p_note           text,
  p_payment        text,
  p_redeem_index   int default null,
  p_use_birthday   boolean default false
)
returns public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_cfg        jsonb := public.loyalty_config();
  v_uid        uuid := auth.uid();
  v_email      text;
  v_name       text;
  v_phone      text;
  v_birthday   date;
  v_item       jsonb;
  v_idx        int := -1;
  v_product    public.products;
  v_qty        int;
  v_size       text;
  v_size_price int;
  v_price      int;
  v_group      jsonb;
  v_wanted     text;
  v_choice     jsonb;
  v_chosen     jsonb;
  v_extra      int;
  v_items      jsonb := '[]'::jsonb;
  v_subtotal   int := 0;
  v_cake_total int := 0;
  v_redeem_amt int := 0;
  v_redeem_name text;
  v_redeem_cake boolean := false;
  v_points_redeemed int := 0;
  v_lifetime   int;
  v_is_vip     boolean;
  v_month      text := to_char(public.today_vn(), 'YYYY-MM');
  v_birthday_month text;
  v_member_amt int := 0;
  v_member_label text;
  v_voucher_amt int := 0;
  v_details    jsonb := '[]'::jsonb;
  v_discount   int;
  v_code       text := nullif(upper(trim(coalesce(p_voucher, ''))), '');
  v_order      public.orders;
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

  select u.email, coalesce(nullif(p.full_name, ''), split_part(u.email, '@', 1)), nullif(p.phone, ''), p.birthday
    into v_email, v_name, v_phone, v_birthday
  from auth.users u left join public.profiles p on p.id = u.id
  where u.id = v_uid;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_idx := v_idx + 1;
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
      v_size_price := null;
      select (s ->> 'price')::int into v_size_price
      from jsonb_array_elements(v_product.sizes) s
      where s ->> 'label' = coalesce(v_size, v_product.sizes -> 0 ->> 'label');
      if v_size_price is null then
        raise exception 'Cỡ "%" của "%" không còn bán', v_size, v_product.name;
      end if;
      v_size := coalesce(v_size, v_product.sizes -> 0 ->> 'label');
    else
      v_size_price := v_product.price;
      v_size := null;
    end if;
    v_price := v_size_price;

    -- Tùy chọn thêm (phụ thu)
    v_chosen := '[]'::jsonb;
    if v_product.options is not null and jsonb_typeof(v_product.options) = 'array' then
      for v_group in select * from jsonb_array_elements(v_product.options) loop
        continue when jsonb_array_length(coalesce(v_group -> 'choices', '[]'::jsonb)) = 0;
        v_wanted := coalesce(v_item -> 'options' ->> (v_group ->> 'name'), v_group -> 'choices' -> 0 ->> 'label');
        v_choice := null;
        select c into v_choice from jsonb_array_elements(v_group -> 'choices') c where c ->> 'label' = v_wanted limit 1;
        if v_choice is null then
          raise exception 'Lựa chọn "%" (%) của "%" không còn — vui lòng chọn lại', v_wanted, v_group ->> 'name', v_product.name;
        end if;
        v_extra := coalesce((v_choice ->> 'price')::int, 0);
        v_price := v_price + v_extra;
        v_chosen := v_chosen || jsonb_build_object('group', v_group ->> 'name', 'choice', v_wanted, 'price', v_extra);
      end loop;
    end if;

    v_subtotal := v_subtotal + v_price * v_qty;
    if v_product.category <> 'Đồ uống' then
      v_cake_total := v_cake_total + v_price * v_qty;
    end if;

    -- Món khách chọn đổi điểm: miễn phí 1 cái theo giá cỡ (phụ thu tùy chọn vẫn tính)
    if p_redeem_index is not null and p_redeem_index = v_idx then
      if coalesce(v_cfg ->> 'redeemGroupId', '') = '' or v_product.subcategory is distinct from v_cfg ->> 'redeemGroupId' then
        raise exception '"%" không thuộc nhóm được đổi điểm', v_product.name;
      end if;
      v_redeem_amt := v_size_price;
      v_redeem_name := v_product.name || coalesce(' (' || v_size || ')', '');
      v_redeem_cake := v_product.category <> 'Đồ uống';
    end if;

    v_items := v_items || jsonb_strip_nulls(jsonb_build_object(
      'name', v_product.name, 'size', v_size, 'quantity', v_qty, 'price', v_price,
      'options', case when jsonb_array_length(v_chosen) > 0 then v_chosen end
    ));
  end loop;

  -- 1) Đổi điểm
  if p_redeem_index is not null then
    if v_redeem_name is null then
      raise exception 'Không tìm thấy món muốn đổi điểm trong giỏ hàng';
    end if;
    v_points_redeemed := coalesce((v_cfg ->> 'redeemPoints')::int, 68);
    if public.point_balance(v_email) < v_points_redeemed then
      raise exception 'Bạn cần % điểm để đổi quà (hiện có % điểm)', v_points_redeemed, public.point_balance(v_email);
    end if;
    v_details := v_details || jsonb_build_object(
      'label', 'Đổi ' || v_points_redeemed || ' điểm: 1 ' || v_redeem_name || ' miễn phí', 'amount', v_redeem_amt);
    if v_redeem_cake then
      v_cake_total := v_cake_total - v_redeem_amt;
    end if;
  end if;

  -- 2) Ưu đãi thành viên VIP (tính trên tiền bánh còn lại)
  v_lifetime := public.lifetime_points(v_email);
  v_is_vip := v_lifetime >= coalesce((v_cfg ->> 'vipMinPoints')::int, 100);
  if p_use_birthday then
    if not v_is_vip then
      raise exception 'Ưu đãi sinh nhật chỉ dành cho thành viên VIP';
    end if;
    if v_birthday is null or extract(month from v_birthday) <> extract(month from public.today_vn()) then
      raise exception 'Ưu đãi sinh nhật chỉ dùng được trong tháng sinh nhật của bạn';
    end if;
    if exists (
      select 1 from public.orders
      where lower(customer_email) = lower(v_email) and birthday_month = v_month and status <> 'Đã hủy'
    ) then
      raise exception 'Bạn đã dùng ưu đãi sinh nhật trong tháng này rồi';
    end if;
    v_birthday_month := v_month;
    v_member_amt := floor(greatest(v_cake_total, 0) * coalesce((v_cfg ->> 'birthdayCakeDiscountPercent')::numeric, 50) / 100)::int;
    v_member_label := 'Ưu đãi sinh nhật VIP -' || coalesce(v_cfg ->> 'birthdayCakeDiscountPercent', '50') || '% tiền bánh';
  elsif v_is_vip then
    v_member_amt := floor(greatest(v_cake_total, 0) * coalesce((v_cfg ->> 'vipCakeDiscountPercent')::numeric, 10) / 100)::int;
    v_member_label := 'Ưu đãi VIP -' || coalesce(v_cfg ->> 'vipCakeDiscountPercent', '10') || '% tiền bánh';
  end if;
  if v_member_amt > 0 then
    v_details := v_details || jsonb_build_object('label', v_member_label, 'amount', v_member_amt);
  end if;

  -- 3) Voucher (trên phần còn lại)
  if v_code is not null then
    v_voucher_amt := public.check_voucher(v_code);
    if v_voucher_amt is null then
      raise exception 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
    end if;
    v_voucher_amt := least(v_voucher_amt, greatest(v_subtotal - v_redeem_amt - v_member_amt, 0));
    if v_voucher_amt > 0 then
      v_details := v_details || jsonb_build_object('label', 'Voucher ' || v_code, 'amount', v_voucher_amt);
    end if;
  end if;

  v_discount := least(v_redeem_amt + v_member_amt + v_voucher_amt, v_subtotal);

  insert into public.orders (
    id, items, subtotal, voucher_code, discount, total, fulfillment, address,
    receive_date, receive_time, note, payment_method, customer_name, customer_phone, customer_email,
    discount_details, points_redeemed, birthday_month
  ) values (
    public.generate_order_id(), v_items, v_subtotal, v_code, v_discount, v_subtotal - v_discount, p_fulfillment,
    case when p_fulfillment = 'delivery' then trim(p_address) end,
    p_receive_date, p_receive_time, nullif(trim(coalesce(p_note, '')), ''), p_payment, v_name, v_phone, v_email,
    case when jsonb_array_length(v_details) > 0 then v_details end, v_points_redeemed, v_birthday_month
  )
  returning * into v_order;

  if v_points_redeemed > 0 then
    insert into public.point_logs (email, points, kind, order_id, title)
    values (v_email, -v_points_redeemed, 'redeem', v_order.id, 'Đổi điểm lấy ' || v_redeem_name || ' (đơn ' || v_order.id || ')');
  end if;

  return v_order;
end;
$$;
revoke execute on function public.place_order(jsonb, text, text, text, date, text, text, text, int, boolean) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, date, text, text, text, int, boolean) to authenticated;

-- ─── Đổi trạng thái đơn: Đã giao → cộng điểm (theo cấu hình); Đã hủy → hoàn điểm đã đổi ───
create or replace function public.before_order_status_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  pts int;
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
