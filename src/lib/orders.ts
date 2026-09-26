// Helper cho đơn hàng phía cửa hàng: nhãn, voucher, nội dung gửi Zalo, sao chép clipboard.
// Dữ liệu đơn hàng nằm trong src/lib/db.ts (dùng chung với khu admin); voucher kiểm tra qua checkVoucher() ở db.ts.

import { useMemo } from "react";
import { useOrders } from "@/lib/db";
import { formatDateVN, formatVND } from "@/lib/utils";
import type { FulfillmentMethod, Order, OrderItemOption, PaymentMethod } from "@/types/order";

/** Tùy chọn trong giỏ hàng → "Sốt đi kèm: Caramel muối · Lượng đường: 50%" */
export function cartOptionsText(options: Record<string, string> | undefined): string {
  return options ? Object.entries(options).map(([group, choice]) => `${group}: ${choice}`).join(" · ") : "";
}

/** Tùy chọn trong đơn hàng → "Sốt đi kèm: Caramel muối (+6.000đ) · Lượng đường: 50%" */
export function orderOptionsText(options: OrderItemOption[] | undefined): string {
  return (options ?? [])
    .map((o) => `${o.group}: ${o.choice}${o.price > 0 ? ` (+${formatVND(o.price)})` : ""}`)
    .join(" · ");
}

export const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  delivery: "Giao tận nơi",
  pickup: "Lấy tại tiệm",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Tiền mặt khi nhận hàng",
  bank: "Chuyển khoản",
};

/** Đơn hàng của một khách (theo email), mới nhất trước. */
export function useMyOrders(email: string | undefined): Order[] {
  const orders = useOrders();
  return useMemo(() => {
    const key = (email ?? "").trim().toLowerCase();
    if (!key) return [];
    return orders
      .filter((o) => (o.customerEmail ?? "").trim().toLowerCase() === key)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, email]);
}

// ─── Nội dung gửi Zalo ───────────────────────────────────────
export function buildOrderMessage(order: Order): string {
  const lines: string[] = [];
  lines.push("ĐƠN HÀNG CARI BAKEHOUSE");
  lines.push(`Mã đơn: ${order.id}`);
  if (order.customerName) {
    const phone = order.customerPhone ? ` - ${order.customerPhone}` : "";
    lines.push(`Khách hàng: ${order.customerName}${phone}`);
  }
  lines.push("");
  lines.push("Sản phẩm:");
  order.items.forEach((item, idx) => {
    const size = item.size ? ` (${item.size})` : "";
    lines.push(
      `${idx + 1}. ${item.name}${size} x${item.quantity} - ${formatVND(item.price * item.quantity)}`,
    );
    const options = orderOptionsText(item.options);
    if (options) lines.push(`   + ${options}`);
  });
  lines.push("");
  lines.push(`Tạm tính: ${formatVND(order.subtotal)}`);
  if (order.voucherCode && order.discount > 0) {
    lines.push(`Voucher ${order.voucherCode}: -${formatVND(order.discount)}`);
  }
  lines.push(`Tổng tiền: ${formatVND(order.total)}`);
  lines.push("");
  lines.push(`Hình thức nhận: ${FULFILLMENT_LABELS[order.fulfillment]}`);
  if (order.fulfillment === "delivery" && order.address) {
    lines.push(`Địa chỉ giao hàng: ${order.address}`);
  }
  lines.push(`Thời gian nhận: ${order.receiveTime} ngày ${formatDateVN(order.receiveDate)}`);
  lines.push(`Thanh toán: ${PAYMENT_LABELS[order.paymentMethod]}`);
  if (order.note) lines.push(`Ghi chú: ${order.note}`);
  return lines.join("\n");
}

/**
 * Sao chép văn bản vào clipboard bằng navigator.clipboard.writeText.
 * Nếu trình duyệt không cấp API này (trang chạy http không bảo mật, ví dụ mở bằng IP mạng LAN
 * trên điện thoại) thì dùng execCommand làm phương án dự phòng.
 * Phải được gọi đồng bộ trong sự kiện click.
 */
export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => legacyCopy(text),
    );
  }
  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
