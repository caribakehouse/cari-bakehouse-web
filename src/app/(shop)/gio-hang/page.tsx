"use client";

import Image from "@/components/ui/SafeImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useAuth, useHydrated } from "@/lib/auth";
import {
  MAX_ITEM_QUANTITY,
  cartLineKey,
  clearCart,
  removeFromCart,
  updateCartQuantity,
  useCart,
} from "@/lib/cart";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/ui/form-styles";
import { cartOptionsText } from "@/lib/orders";
import { formatVND } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user } = useAuth();
  const { items, count, subtotal } = useCart();

  const handleCheckout = () => {
    // Chưa đăng nhập → sang /dang-nhap trước, đăng nhập xong quay lại /dat-hang
    router.push(user ? "/dat-hang" : "/dang-nhap?next=/dat-hang");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B4B5A] border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FCE9C6] text-[#1B4B5A]">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-black text-[#1B4B5A]">Giỏ hàng đang trống</h1>
        <p className="mt-2 text-sm text-text-muted">
          Hãy chọn vài chiếc bánh thơm nướng tươi mỗi ngày của Cari nhé!
        </p>
        <Link href="/san-pham" className={`${PRIMARY_BUTTON_CLASS} mt-6`}>
          Khám phá sản phẩm
          <ArrowRight className="h-4 w-4 text-[#F6CE8B]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFF8EF]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">Giỏ hàng của bạn</h1>
            <p className="mt-1 text-sm text-text-muted">{count} sản phẩm</p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="cursor-pointer text-xs font-semibold text-text-muted underline-offset-4 hover:text-rose-600 hover:underline"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
          {/* Danh sách sản phẩm */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs">
            {/* Tiêu đề cột (desktop) */}
            <div className="hidden grid-cols-[1fr_100px_120px_110px_36px] gap-4 border-b border-border/80 bg-[#FCE9C6]/50 px-5 py-3 text-xs font-bold text-[#1B4B5A] md:grid">
              <span>Sản phẩm</span>
              <span className="text-right">Đơn giá</span>
              <span className="text-center">Số lượng</span>
              <span className="text-right">Thành tiền</span>
              <span />
            </div>

            <ul className="divide-y divide-border/60">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <li
                    key={cartLineKey(item)}
                    className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-3 px-4 py-4 sm:px-5 md:grid-cols-[1fr_100px_120px_110px_36px] md:items-center"
                  >
                    {/* Ảnh + tên + cỡ */}
                    <div className="contents md:flex md:items-center md:gap-4">
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-[#FCE9C6] sm:h-20 sm:w-20">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 self-center">
                        <h3 className="font-heading text-sm font-bold leading-snug text-[#2B2B2B] sm:text-base">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-text-muted">Cỡ: {item.size ?? "Tiêu chuẩn"}</p>
                        {item.options && (
                          <p className="mt-0.5 text-xs text-text-muted">{cartOptionsText(item.options)}</p>
                        )}
                        <p className="mt-1 text-xs font-semibold text-[#1B4B5A] md:hidden">
                          {formatVND(item.price)}
                        </p>
                      </div>
                    </div>

                    {/* Đơn giá (desktop) */}
                    <div className="hidden text-right text-sm text-[#2b2b2b] md:block">
                      {formatVND(item.price)}
                    </div>

                    {/* Số lượng */}
                    <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:justify-center">
                      <div className="inline-flex items-center rounded-full border border-border bg-[#FFF8EF]/60">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Giảm số lượng ${item.name}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#1B4B5A] transition-colors hover:bg-[#1B4B5A]/10 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span
                          className="w-8 text-center text-sm font-bold text-[#2b2b2b]"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item, item.quantity + 1)}
                          disabled={item.quantity >= MAX_ITEM_QUANTITY}
                          aria-label={`Tăng số lượng ${item.name}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#1B4B5A] transition-colors hover:bg-[#1B4B5A]/10 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Thành tiền + xóa (mobile) */}
                      <div className="flex items-center gap-2 md:hidden">
                        <span className="text-sm font-black text-[#1B4B5A]">{formatVND(lineTotal)}</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item)}
                          aria-label={`Xóa ${item.name} khỏi giỏ`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Thành tiền + xóa (desktop) */}
                    <div className="hidden text-right text-sm font-black text-[#1B4B5A] md:block">
                      {formatVND(lineTotal)}
                    </div>
                    <div className="hidden md:block">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item)}
                        aria-label={`Xóa ${item.name} khỏi giỏ`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tóm tắt đơn */}
          <aside className="rounded-2xl border border-border/80 bg-white p-5 shadow-xs sm:p-6 lg:sticky lg:top-28">
            <h2 className="font-heading text-lg font-bold text-[#1B4B5A]">Tóm tắt giỏ hàng</h2>
            <div className="mt-4 flex items-center justify-between text-sm text-[#2b2b2b]">
              <span>Tạm tính ({count} sản phẩm)</span>
              <span className="font-semibold">{formatVND(subtotal)}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              Bạn có thể nhập mã voucher và chọn hình thức nhận hàng ở bước đặt hàng.
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-4">
              <span className="font-heading text-base font-bold text-[#1B4B5A]">Tổng tiền</span>
              <span className="font-heading text-xl font-black text-[#1B4B5A]">{formatVND(subtotal)}</span>
            </div>

            <button type="button" onClick={handleCheckout} className={`${PRIMARY_BUTTON_CLASS} mt-5 w-full`}>
              Tiến hành đặt hàng
              <ArrowRight className="h-4 w-4 text-[#F6CE8B]" />
            </button>
            <Link href="/san-pham" className={`${SECONDARY_BUTTON_CLASS} mt-3 w-full`}>
              Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
