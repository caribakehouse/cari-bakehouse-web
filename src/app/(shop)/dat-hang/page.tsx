"use client";

import { useState } from "react";
import Image from "@/components/ui/SafeImage";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  Landmark,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  X,
} from "lucide-react";
import {
  INPUT_CLASS,
  INPUT_ERROR_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from "@/components/ui/form-styles";
import { PageSpinner, SignedOutNotice } from "@/components/account/PageSpinner";
import { useRequireAuth } from "@/lib/auth";
import { cartLineKey, clearCart, useCart } from "@/lib/cart";
import PackingAnimation, { type PackingItemKind } from "@/components/order/PackingAnimation";
import { checkVoucher, placeOrder, priceForSize, useMembership, useProducts, useSiteSettings } from "@/lib/db";
import { openZaloChat } from "@/lib/zalo";
import {
  FULFILLMENT_LABELS,
  PAYMENT_LABELS,
  buildOrderMessage,
  cartOptionsText,
  copyToClipboard,
  orderDiscountLines,
  orderOptionsText,
  useMyOrders,
} from "@/lib/orders";
import { formatDateVN, formatVND, todayISO } from "@/lib/utils";
import type { FulfillmentMethod, Order, PaymentMethod, Voucher } from "@/types/order";

type CopyStatus = "idle" | "copied" | "failed";
type FormErrors = { address?: string; receiveDate?: string; receiveTime?: string };

// ─── Ô chọn dạng thẻ (radio) ─────────────────────────────────
function OptionCard({
  name,
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <label className="relative block cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <div className="flex h-full items-start gap-3 rounded-xl border border-border/80 bg-white p-4 transition-all hover:border-[#1B4B5A]/40 peer-checked:border-[#1B4B5A] peer-checked:bg-[#FCE9C6]/40 peer-checked:ring-2 peer-checked:ring-[#1B4B5A]/15 peer-focus-visible:ring-2 peer-focus-visible:ring-[#1B4B5A]/40">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FCE9C6] text-[#1B4B5A]">
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-[#1B4B5A]">{title}</div>
          {description && <div className="mt-0.5 text-xs leading-relaxed text-text-muted">{description}</div>}
        </div>
      </div>
    </label>
  );
}

function SectionCard({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/80 bg-white p-5 shadow-xs sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 font-heading text-base font-bold text-[#1B4B5A] sm:text-lg">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4B5A] text-xs font-black text-[#F6CE8B]">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function CheckoutPage() {
  // Chưa đăng nhập → sang /dang-nhap, đăng nhập xong quay lại đây
  const { status, user } = useRequireAuth("/dat-hang");
  const { items, subtotal } = useCart();
  const settings = useSiteSettings();

  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("delivery");
  const [address, setAddress] = useState("");
  const [receiveDate, setReceiveDate] = useState("");
  const [receiveTime, setReceiveTime] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<FormErrors>({});

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState(false);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  // Đơn vừa đặt xong, đang chạy animation đóng gói (xong mới hiện màn hình "Đặt hàng thành công")
  const [packing, setPacking] = useState<{ order: Order; kinds: PackingItemKind[] } | null>(null);
  const products = useProducts();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  // ─── Ưu đãi thành viên (số ở đây chỉ để khách xem trước — database tính lại chính xác khi đặt hàng) ───
  const membership = useMembership(user?.email);
  const loyalty = membership.config;
  const myOrders = useMyOrders(user?.email);
  const [redeemIndex, setRedeemIndex] = useState<number | null>(null);
  const [useBirthday, setUseBirthday] = useState(true);

  const lines = items.map((item, index) => {
    const product = products.find((p) => p.slug === item.slug);
    return {
      item,
      index,
      isCake: product?.category !== "Đồ uống",
      redeemable: !!product && !!loyalty.redeemGroupId && product.subcategory === loyalty.redeemGroupId,
      sizePrice: product ? priceForSize(product, item.size) : item.price,
    };
  });
  const redeemableLines = lines.filter((l) => l.redeemable);
  const canRedeem = membership.balance >= loyalty.redeemPoints && redeemableLines.length > 0;
  const redeemLine = canRedeem ? redeemableLines.find((l) => l.index === redeemIndex) : undefined;
  const redeemAmount = redeemLine?.sizePrice ?? 0;

  const isVip = membership.tier.key === "vip";
  const thisMonth = todayISO().slice(0, 7);
  const birthdayUsed = myOrders.some(
    (o) =>
      o.status !== "Đã hủy" &&
      o.createdAt.startsWith(thisMonth) &&
      (o.discountDetails ?? []).some((d) => d.label.toLowerCase().includes("sinh nhật")),
  );
  const birthdayAvailable = isVip && !!user?.birthday && user.birthday.slice(5, 7) === thisMonth.slice(5, 7) && !birthdayUsed;
  const applyBirthday = birthdayAvailable && useBirthday;

  const cakeTotal = lines.filter((l) => l.isCake).reduce((sum, l) => sum + l.item.price * l.item.quantity, 0);
  const cakeAfterRedeem = Math.max(0, cakeTotal - (redeemLine?.isCake ? redeemAmount : 0));
  const memberPercent = applyBirthday ? loyalty.birthdayCakeDiscountPercent : isVip ? loyalty.vipCakeDiscountPercent : 0;
  const memberAmount = Math.floor((cakeAfterRedeem * memberPercent) / 100);
  const memberLabel = applyBirthday
    ? `Ưu đãi sinh nhật VIP -${loyalty.birthdayCakeDiscountPercent}% tiền bánh`
    : `Ưu đãi VIP -${loyalty.vipCakeDiscountPercent}% tiền bánh`;

  // Voucher không bao giờ làm tổng tiền âm
  const discount = appliedVoucher ? Math.min(appliedVoucher.discount, Math.max(0, subtotal - redeemAmount - memberAmount)) : 0;
  const total = Math.max(0, subtotal - redeemAmount - memberAmount - discount);

  // ─── Voucher ───────────────────────────────────────────────
  const handleApplyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code || checkingVoucher) return;
    setCheckingVoucher(true);
    const voucherDiscount = await checkVoucher(code);
    setCheckingVoucher(false);
    if (voucherDiscount === null) {
      setVoucherError(true);
      return;
    }
    setAppliedVoucher({ code, discount: voucherDiscount });
    setVoucherError(false);
    setVoucherInput("");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(false);
  };

  // ─── Xác nhận đặt hàng ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0 || submitting) return;

    const nextErrors: FormErrors = {};
    if (fulfillment === "delivery" && !address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    }
    if (!receiveDate) {
      nextErrors.receiveDate = "Vui lòng chọn ngày nhận";
    } else if (receiveDate < todayISO()) {
      nextErrors.receiveDate = "Ngày nhận không được ở quá khứ";
    }
    if (!receiveTime) {
      nextErrors.receiveTime = "Vui lòng chọn giờ nhận";
    } else if (receiveDate === todayISO()) {
      const now = new Date();
      const nowHHmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (receiveTime <= nowHHmm) nextErrors.receiveTime = "Giờ nhận phải sau thời điểm hiện tại";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Đưa con trỏ tới ô lỗi đầu tiên sau khi React vẽ lại
      setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return;
    }

    // Gửi đơn lên database: chỉ gửi sản phẩm + cỡ + số lượng; giá, giảm giá và tổng tiền do database tự tính
    // từ bảng sản phẩm (khách không sửa được). Đơn tạo ra ở trạng thái "Chờ xử lý".
    setSubmitting(true);
    setSubmitError("");
    const result = await placeOrder({
      items: items.map(({ slug, size, quantity, options }) => ({ slug, size, quantity, options })),
      voucherCode: appliedVoucher?.code,
      fulfillment,
      address: fulfillment === "delivery" ? address.trim() : undefined,
      receiveDate,
      receiveTime,
      note: note.trim() || undefined,
      paymentMethod: payment,
      redeemIndex: redeemLine?.index,
      useBirthday: applyBirthday,
    });
    setSubmitting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    // Hộp đóng gói bỏ vào bánh và/hoặc ly đồ uống theo đúng loại món trong giỏ
    const categories = items.map((i) => products.find((p) => p.slug === i.slug)?.category);
    const kinds: PackingItemKind[] = [];
    if (categories.some((c) => c !== "Đồ uống")) kinds.push("cake");
    if (categories.some((c) => c === "Đồ uống")) kinds.push("drink");

    clearCart();
    setPacking({ order: result.order, kinds });
  };

  const finishPacking = () => {
    if (!packing) return;
    setPlacedOrder(packing.order);
    setPacking(null);
    window.scrollTo({ top: 0 });
  };

  // ─── Sao chép nội dung đơn & mở Zalo ───────────────────────
  const handleCopyAndOpenZalo = () => {
    if (!placedOrder) return;
    // Cả hai lệnh phải chạy đồng bộ trong sự kiện click: sao chép trước (khi trang còn focus),
    // rồi mở Zalo (máy tính: app Zalo PC, không có thì Zalo Web; điện thoại: app Zalo).
    const copying = copyToClipboard(buildOrderMessage(placedOrder));
    openZaloChat(settings.hotline, settings.zalo);
    copying.then((ok) => setCopyStatus(ok ? "copied" : "failed"));
  };

  // ─── Trạng thái tải / chuyển hướng ─────────────────────────
  if (status === "signed-out") return <SignedOutNotice />;
  if (!user) return <PageSpinner />;

  // ─── Animation đóng gói (giỏ hàng đã được xóa, nên phải hiện trước màn hình "giỏ trống") ───
  if (packing) return <PackingAnimation kinds={packing.kinds} onDone={finishPacking} />;

  // ─── Màn hình Xác nhận đơn hàng ────────────────────────────
  if (placedOrder) {
    const o = placedOrder;
    return (
      <div className="min-h-screen w-full bg-[#FFF8EF]">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
              Đặt hàng thành công!
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Cảm ơn bạn đã đặt bánh tại Cari Bakehouse. Đơn của bạn đang ở trạng thái{" "}
              <strong className="text-amber-700">{o.status}</strong>.
            </p>
          </div>

          <div className="space-y-5 rounded-2xl border border-border/80 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Mã đơn</div>
                <div className="text-2xl font-black text-[#1B4B5A]">{o.id}</div>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                {o.status}
              </span>
            </div>

            {/* Tóm tắt sản phẩm */}
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Sản phẩm</div>
              <ul className="divide-y divide-border/50 text-sm">
                {o.items.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3 py-2">
                    <span className="text-[#2b2b2b]">
                      {item.name}
                      {item.size ? <span className="text-text-muted"> ({item.size})</span> : null}
                      {item.options && item.options.length > 0 && (
                        <span className="block text-xs text-text-muted">{orderOptionsText(item.options)}</span>
                      )}
                      <span className="text-text-muted"> × {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-semibold">{formatVND(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Tạm tính</span>
                <span className="font-semibold">{formatVND(o.subtotal)}</span>
              </div>
              {orderDiscountLines(o).map((d) => (
                <div key={d.label} className="flex justify-between gap-3 text-emerald-700">
                  <span>{d.label}</span>
                  <span className="shrink-0 font-semibold">-{formatVND(d.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-base font-bold text-[#1B4B5A]">Tổng tiền</span>
                <span className="text-xl font-black text-[#1B4B5A]">{formatVND(o.total)}</span>
              </div>
            </div>

            <dl className="space-y-3 border-t border-border/60 pt-4 text-sm">
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-text-muted">Hình thức nhận</dt>
                <dd className="font-semibold text-[#2b2b2b]">{FULFILLMENT_LABELS[o.fulfillment]}</dd>
              </div>
              {o.address && (
                <div className="flex gap-3">
                  <dt className="w-32 shrink-0 text-text-muted">Địa chỉ</dt>
                  <dd className="font-semibold text-[#2b2b2b]">{o.address}</dd>
                </div>
              )}
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-text-muted">Ngày giờ nhận</dt>
                <dd className="font-semibold text-[#2b2b2b]">
                  {o.receiveTime} - {formatDateVN(o.receiveDate)}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-text-muted">Thanh toán</dt>
                <dd className="font-semibold text-[#2b2b2b]">{PAYMENT_LABELS[o.paymentMethod]}</dd>
              </div>
              {o.note && (
                <div className="flex gap-3">
                  <dt className="w-32 shrink-0 text-text-muted">Ghi chú</dt>
                  <dd className="text-[#2b2b2b]">{o.note}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Gửi đơn qua Zalo */}
          <div className="space-y-4 rounded-2xl border-2 border-[#1B4B5A]/15 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="font-heading text-lg font-bold text-[#1B4B5A]">Gửi đơn cho Cari Bakehouse qua Zalo</h2>

            <button type="button" onClick={handleCopyAndOpenZalo} className={`${PRIMARY_BUTTON_CLASS} w-full`}>
              <Copy className="h-4 w-4 text-[#F6CE8B]" />
              Sao chép nội dung đơn &amp; Mở Zalo
            </button>

            <div aria-live="polite">
              {copyStatus === "copied" && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
                  Nội dung đơn đã được sao chép. Vui lòng dán và tự gửi tin nhắn này cho Cari Bakehouse qua Zalo
                  để tiệm xác nhận đơn của bạn.
                </p>
              )}
              {copyStatus === "failed" && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
                  Trình duyệt không cho phép tự động sao chép. Vui lòng chọn và sao chép nội dung đơn bên dưới,
                  rồi tự gửi cho Cari Bakehouse qua Zalo để tiệm xác nhận đơn của bạn.
                </p>
              )}
              {copyStatus === "idle" && (
                <p className="text-xs leading-relaxed text-text-muted">
                  Bấm nút trên để sao chép nội dung đơn và mở Zalo của tiệm ở tab mới.
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-[#1B4B5A]">Nội dung đơn hàng sẽ được sao chép</div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border/80 bg-[#FFF8EF]/60 p-3.5 font-sans text-xs leading-relaxed text-[#2b2b2b] select-all">
                {buildOrderMessage(o)}
              </pre>
            </div>

            <ol className="space-y-1.5 border-t border-border/60 pt-4 text-xs leading-relaxed text-text-muted">
              <li>1. Bạn tự gửi nội dung đơn cho Cari Bakehouse qua Zalo.</li>
              <li>2. Tiệm xác nhận đơn với bạn qua Zalo.</li>
              <li>
                3. Nếu chọn chuyển khoản, bạn chuyển khoản trực tiếp sau khi tiệm xác nhận (không thanh toán trên
                website).
              </li>
            </ol>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/tai-khoan" className={SECONDARY_BUTTON_CLASS}>
              Xem lịch sử đơn hàng
            </Link>
            <Link href="/san-pham" className={SECONDARY_BUTTON_CLASS}>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Giỏ hàng trống ────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FCE9C6] text-[#1B4B5A]">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-black text-[#1B4B5A]">Chưa có sản phẩm để đặt hàng</h1>
        <p className="mt-2 text-sm text-text-muted">Hãy thêm vài chiếc bánh vào giỏ hàng trước nhé.</p>
        <Link href="/san-pham" className={`${PRIMARY_BUTTON_CLASS} mt-6`}>
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  // ─── Form đặt hàng ─────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#FFF8EF]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          href="/gio-hang"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4B5A] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại giỏ hàng
        </Link>
        <h1 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">Đặt hàng</h1>
        {user && (
          <p className="mt-1 text-sm text-text-muted">
            Người đặt: <strong className="text-[#2b2b2b]">{user.fullName}</strong>
            {user.phone ? ` • ${user.phone}` : ""}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]"
        >
          {/* Cột trái: thông tin nhận hàng */}
          <div className="space-y-5">
            <SectionCard step={1} title="Hình thức nhận">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <OptionCard
                  name="fulfillment"
                  checked={fulfillment === "delivery"}
                  onChange={() => setFulfillment("delivery")}
                  icon={<Truck className="h-5 w-5" />}
                  title={FULFILLMENT_LABELS.delivery}
                  description="Tiệm giao bánh đến địa chỉ của bạn"
                />
                <OptionCard
                  name="fulfillment"
                  checked={fulfillment === "pickup"}
                  onChange={() => setFulfillment("pickup")}
                  icon={<Store className="h-5 w-5" />}
                  title={FULFILLMENT_LABELS.pickup}
                  description="Bạn đến tiệm nhận bánh"
                />
              </div>

              {fulfillment === "delivery" && (
                <div className="mt-4 space-y-1.5">
                  <label htmlFor="checkout-address" className={LABEL_CLASS}>
                    Địa chỉ giao hàng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-text-muted" />
                    <textarea
                      id="checkout-address"
                      rows={2}
                      autoComplete="street-address"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      aria-invalid={!!errors.address}
                      className={`${INPUT_CLASS} resize-none pl-10 ${errors.address ? INPUT_ERROR_CLASS : ""}`}
                    />
                  </div>
                  {errors.address && <p className="text-xs text-rose-600">{errors.address}</p>}
                </div>
              )}
            </SectionCard>

            <SectionCard step={2} title="Ngày giờ nhận mong muốn">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="checkout-date" className={LABEL_CLASS}>
                    Ngày nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-date"
                    type="date"
                    min={todayISO()}
                    value={receiveDate}
                    onChange={(e) => {
                      setReceiveDate(e.target.value);
                      setErrors((prev) => ({ ...prev, receiveDate: undefined, receiveTime: undefined }));
                    }}
                    aria-invalid={!!errors.receiveDate}
                    className={`${INPUT_CLASS} ${errors.receiveDate ? INPUT_ERROR_CLASS : ""}`}
                  />
                  {errors.receiveDate && <p className="text-xs text-rose-600">{errors.receiveDate}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="checkout-time" className={LABEL_CLASS}>
                    Giờ nhận <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="checkout-time"
                      type="time"
                      value={receiveTime}
                      onChange={(e) => {
                        setReceiveTime(e.target.value);
                        setErrors((prev) => ({ ...prev, receiveTime: undefined }));
                      }}
                      aria-invalid={!!errors.receiveTime}
                      className={`${INPUT_CLASS} ${errors.receiveTime ? INPUT_ERROR_CLASS : ""}`}
                    />
                  </div>
                  {errors.receiveTime && <p className="text-xs text-rose-600">{errors.receiveTime}</p>}
                </div>
              </div>
            </SectionCard>

            <SectionCard step={3} title="Ghi chú thêm">
              <label htmlFor="checkout-note" className="sr-only">
                Ghi chú thêm
              </label>
              <textarea
                id="checkout-note"
                rows={3}
                placeholder="Ví dụ: Viết chữ lên bánh, gọi trước khi giao, không dùng hạnh nhân... (không bắt buộc)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`${INPUT_CLASS} resize-none`}
              />
            </SectionCard>

            <SectionCard step={4} title="Phương thức thanh toán">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <OptionCard
                  name="payment"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  icon={<Banknote className="h-5 w-5" />}
                  title={PAYMENT_LABELS.cod}
                  description="Thanh toán trực tiếp khi nhận bánh"
                />
                <OptionCard
                  name="payment"
                  checked={payment === "bank"}
                  onChange={() => setPayment("bank")}
                  icon={<Landmark className="h-5 w-5" />}
                  title={PAYMENT_LABELS.bank}
                  description="Chuyển khoản sau khi tiệm xác nhận đơn"
                />
              </div>
            </SectionCard>
          </div>

          {/* Cột phải: tóm tắt đơn */}
          <aside className="rounded-2xl border border-border/80 bg-white p-5 shadow-xs sm:p-6 lg:sticky lg:top-28">
            <h2 className="font-heading text-lg font-bold text-[#1B4B5A]">Đơn hàng của bạn</h2>

            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={cartLineKey(item)} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FCE9C6]">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-semibold leading-snug text-[#2b2b2b]">{item.name}</div>
                    <div className="text-xs text-text-muted">
                      Cỡ: {item.size ?? "Tiêu chuẩn"} • SL: {item.quantity}
                    </div>
                    {item.options && <div className="text-xs text-text-muted">{cartOptionsText(item.options)}</div>}
                  </div>
                  <div className="shrink-0 text-sm font-bold text-[#1B4B5A]">
                    {formatVND(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-4 text-sm">
              <span className="text-text-muted">Tạm tính</span>
              <span className="font-semibold text-[#2b2b2b]">{formatVND(subtotal)}</span>
            </div>

            {/* Ưu đãi thành viên: đổi điểm, VIP, sinh nhật */}
            <div className="mt-4 space-y-2.5 rounded-xl border border-[#F6CE8B] bg-[#FCE9C6]/40 p-3.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#1B4B5A]">Ưu đãi thành viên</span>
                <span className="rounded-full bg-[#1B4B5A] px-2.5 py-0.5 text-[11px] font-bold text-[#F6CE8B]">
                  {membership.tier.name} · {membership.balance.toLocaleString("vi-VN")} điểm
                </span>
              </div>

              {canRedeem ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-[#2b2b2b]/80">
                    Đổi <strong>{loyalty.redeemPoints} điểm</strong> lấy 1 cái miễn phí:
                  </p>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="redeem"
                      checked={redeemLine === undefined}
                      onChange={() => setRedeemIndex(null)}
                      className="accent-[#1B4B5A]"
                    />
                    Không đổi điểm lần này
                  </label>
                  {redeemableLines.map((l) => (
                    <label key={l.index} className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="redeem"
                        checked={redeemLine?.index === l.index}
                        onChange={() => setRedeemIndex(l.index)}
                        className="accent-[#1B4B5A]"
                      />
                      <span>
                        1 {l.item.name}
                        {l.item.size ? ` (${l.item.size})` : ""} —{" "}
                        <strong className="text-emerald-700">-{formatVND(l.sizePrice)}</strong>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">
                  {membership.balance >= loyalty.redeemPoints
                    ? "Thêm bánh thuộc nhóm được đổi điểm vào giỏ để dùng điểm đổi 1 cái miễn phí."
                    : `Đủ ${loyalty.redeemPoints} điểm là đổi được 1 bánh miễn phí (bạn đang có ${membership.balance} điểm).`}
                </p>
              )}

              {birthdayAvailable && (
                <label className="flex cursor-pointer items-start gap-2 border-t border-[#F6CE8B]/60 pt-2 text-xs">
                  <input
                    type="checkbox"
                    checked={useBirthday}
                    onChange={(e) => setUseBirthday(e.target.checked)}
                    className="mt-0.5 accent-[#1B4B5A]"
                  />
                  <span>
                    🎂 Dùng <strong>ưu đãi sinh nhật VIP</strong> cho đơn này: giảm {loyalty.birthdayCakeDiscountPercent}% tiền bánh
                    (mỗi tháng sinh nhật 1 đơn, thay cho mức VIP {loyalty.vipCakeDiscountPercent}%)
                  </span>
                </label>
              )}
              {isVip && !applyBirthday && (
                <p className="border-t border-[#F6CE8B]/60 pt-2 text-xs text-[#2b2b2b]/80">
                  Thành viên VIP được tự động giảm {loyalty.vipCakeDiscountPercent}% tiền bánh.
                </p>
              )}
            </div>

            {/* Các khoản giảm */}
            {(redeemAmount > 0 || memberAmount > 0) && (
              <div className="mt-3 space-y-1.5 text-sm">
                {redeemLine && (
                  <div className="flex justify-between gap-3 text-emerald-700">
                    <span>
                      Đổi {loyalty.redeemPoints} điểm: 1 {redeemLine.item.name} miễn phí
                    </span>
                    <span className="shrink-0 font-semibold">-{formatVND(redeemAmount)}</span>
                  </div>
                )}
                {memberAmount > 0 && (
                  <div className="flex justify-between gap-3 text-emerald-700">
                    <span>{memberLabel}</span>
                    <span className="shrink-0 font-semibold">-{formatVND(memberAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Ô nhập mã voucher — ngay phía trên dòng tổng tiền */}
            <div className="mt-4">
              {appliedVoucher ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      Đã áp dụng voucher: giảm {formatVND(discount)}
                      <span className="ml-1.5 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-800">
                        {appliedVoucher.code}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    aria-label="Hủy áp dụng voucher"
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <label htmlFor="checkout-voucher" className={LABEL_CLASS}>
                    Mã voucher
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Tag className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        id="checkout-voucher"
                        type="text"
                        autoComplete="off"
                        placeholder="Nhập mã voucher"
                        value={voucherInput}
                        onChange={(e) => {
                          setVoucherInput(e.target.value);
                          setVoucherError(false);
                        }}
                        onKeyDown={(e) => {
                          // Enter trong ô voucher chỉ áp dụng mã, không gửi cả form đặt hàng
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyVoucher();
                          }
                        }}
                        aria-invalid={voucherError}
                        className={`${INPUT_CLASS} pl-9 uppercase placeholder:normal-case ${
                          voucherError ? INPUT_ERROR_CLASS : ""
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={!voucherInput.trim() || checkingVoucher}
                      className="shrink-0 cursor-pointer rounded-xl bg-[#1B4B5A] px-4 text-sm font-bold text-white transition-all hover:bg-[#123640] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {voucherError && (
                    <p role="alert" className="mt-1.5 text-xs text-rose-600">
                      Mã voucher không hợp lệ hoặc đã hết hạn
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Tổng tiền cuối cùng */}
            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-4">
              <span className="text-base font-bold text-[#1B4B5A]">Tổng tiền</span>
              <span className="text-2xl font-black text-[#1B4B5A]">{formatVND(total)}</span>
            </div>

            {submitError && (
              <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`${PRIMARY_BUTTON_CLASS} mt-5 w-full disabled:cursor-wait disabled:opacity-70`}
            >
              <MessageCircle className="h-4 w-4 text-[#F6CE8B]" />
              {submitting ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-text-muted">
              Sau khi đặt, bạn sẽ gửi nội dung đơn cho tiệm qua Zalo để được xác nhận.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
