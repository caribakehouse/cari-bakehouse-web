// Email thông báo đơn hàng — chỉ chạy trên server, gửi qua Resend (RESEND_API_KEY).
//   - Khách đặt đơn       → email "Đơn mới" cho admin
//   - Admin bấm "Đã giao" → email xác nhận + số điểm được cộng cho khách, bản sao cho admin
//   - Admin hủy đơn       → email báo hủy cho khách, bản sao cho admin
// Địa chỉ admin: biến môi trường ADMIN_NOTIFY_EMAIL (nhiều địa chỉ cách nhau dấu phẩy);
// nếu không đặt thì dùng email tiệm trong Admin → Cài đặt.
// Quyền + chống gửi trùng do hàm claim_order_email() trong database kiểm tra (migration 0010).
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";
import { formatDateVN, formatVND } from "@/lib/utils";
import type { OrderDiscount, OrderItem } from "@/types/order";

export type OrderEmailKind = "placed" | "Đã giao" | "Đã hủy";

interface ClaimedOrder {
  id: string;
  created_at: string;
  items: OrderItem[];
  subtotal: number;
  voucher_code: string | null;
  discount: number;
  total: number;
  status: string;
  fulfillment: "delivery" | "pickup";
  address: string | null;
  receive_date: string;
  receive_time: string;
  note: string | null;
  payment_method: "cod" | "bank";
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  discount_details: OrderDiscount[] | null;
  points_redeemed: number | null;
  points_awarded: number | string;
  point_balance: number | string;
  shop_email: string | null;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fmtPoints = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });

const FULFILLMENT: Record<ClaimedOrder["fulfillment"], string> = { delivery: "Giao tận nơi", pickup: "Lấy tại tiệm" };
const PAYMENT: Record<ClaimedOrder["payment_method"], string> = { cod: "Tiền mặt khi nhận hàng", bank: "Chuyển khoản" };

function layout(inner: string): string {
  return `<div style="margin:0;padding:24px;background:#FFF8EF;font-family:Arial,Helvetica,sans-serif;color:#2B2B2B">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E5D9C3;border-radius:16px;padding:28px">
    <h1 style="margin:0 0 4px;font-size:22px;color:#1B4B5A">${SITE_NAME}</h1>
    <p style="margin:0 0 20px;font-size:12px;color:#7A7A7A;letter-spacing:1px">INDULGENCE IN EVERY BITE</p>
    ${inner}
    <p style="font-size:13px;color:#7A7A7A;margin-top:24px">
      ${SITE_NAME} · ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality} · www.caribakehouse.vn
    </p>
  </div>
</div>`;
}

function statusBadge(status: string): string {
  const color = status === "Đã giao" ? "#15803D" : status === "Đã hủy" ? "#B91C1C" : "#B45309";
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${color};color:#fff;font-size:12px;font-weight:bold">${escapeHtml(status)}</span>`;
}

function orderDetails(o: ClaimedOrder): string {
  const rows = (o.items ?? [])
    .map((item) => {
      const opts = (item.options ?? [])
        .map((op) => `${op.group}: ${op.choice}`)
        .join(" · ");
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0E8DA;font-size:14px">
          ${escapeHtml(item.name)}${item.size ? ` (${escapeHtml(item.size)})` : ""}
          ${opts ? `<div style="font-size:12px;color:#7A7A7A">${escapeHtml(opts)}</div>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #F0E8DA;font-size:14px;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #F0E8DA;font-size:14px;text-align:right">${formatVND(item.price * item.quantity)}</td>
      </tr>`;
    })
    .join("");

  const discounts =
    o.discount_details && o.discount_details.length > 0
      ? o.discount_details
      : o.voucher_code && o.discount > 0
        ? [{ label: `Voucher ${o.voucher_code}`, amount: o.discount }]
        : [];

  const line = (label: string, value: string, style = "") =>
    `<tr><td style="padding:3px 0;font-size:14px;${style}">${label}</td><td style="padding:3px 0;font-size:14px;text-align:right;${style}">${value}</td></tr>`;

  const info = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:3px 12px 3px 0;font-size:13px;color:#7A7A7A;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:3px 0;font-size:13px">${escapeHtml(value)}</td></tr>`
      : "";

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:8px">
      <tr>
        <th style="text-align:left;font-size:12px;color:#7A7A7A;padding-bottom:6px">Sản phẩm</th>
        <th style="text-align:center;font-size:12px;color:#7A7A7A;padding-bottom:6px">SL</th>
        <th style="text-align:right;font-size:12px;color:#7A7A7A;padding-bottom:6px">Thành tiền</th>
      </tr>
      ${rows}
    </table>
    <table style="width:100%;border-collapse:collapse;margin-top:10px">
      ${line("Tạm tính", formatVND(o.subtotal))}
      ${discounts.map((d) => line(escapeHtml(d.label), `-${formatVND(d.amount)}`, "color:#15803D")).join("")}
      ${line("Tổng tiền", formatVND(o.total), "font-weight:bold;font-size:16px;color:#1B4B5A")}
    </table>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid #F0E8DA;padding-top:8px">
      ${info("Khách hàng", o.customer_name)}
      ${info("Điện thoại", o.customer_phone)}
      ${info("Email", o.customer_email)}
      ${info("Ngày đặt", formatDateVN(o.created_at))}
      ${info("Hình thức", FULFILLMENT[o.fulfillment])}
      ${info("Địa chỉ", o.address)}
      ${info("Ngày giờ nhận", `${o.receive_time} - ${formatDateVN(o.receive_date)}`)}
      ${info("Thanh toán", PAYMENT[o.payment_method])}
      ${info("Ghi chú", o.note)}
    </table>`;
}

function button(href: string, label: string): string {
  return `<p style="text-align:center;margin:24px 0 8px">
    <a href="${href}" style="display:inline-block;background:#1B4B5A;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:999px">${label}</a>
  </p>`;
}

interface Mail {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

function buildMails(kind: OrderEmailKind, o: ClaimedOrder, adminTo: string[]): Mail[] {
  const name = o.customer_name?.trim() || "bạn";
  const customer = o.customer_email?.trim();
  const mails: Mail[] = [];

  if (kind === "placed") {
    if (adminTo.length)
      mails.push({
        to: adminTo,
        subject: `🛎️ Đơn mới ${o.id} — ${o.customer_name ?? "Khách"} — ${formatVND(o.total)}`,
        html: layout(`
          <p style="font-size:15px;line-height:1.6">Có đơn hàng mới cần xử lý: <strong>${o.id}</strong> ${statusBadge(o.status)}</p>
          ${orderDetails(o)}
          ${button(`${SITE_URL}/admin/don-hang`, "Mở trang quản lý đơn")}`),
      });
    return mails;
  }

  const points = Number(o.points_awarded) || 0;
  const balance = Number(o.point_balance) || 0;
  const refunded = o.points_redeemed ?? 0;

  if (kind === "Đã giao") {
    const pointsText =
      points > 0
        ? `<div style="margin:16px 0;padding:14px 16px;background:#FFF8EF;border:1px dashed #D9B98C;border-radius:12px;font-size:14px;line-height:1.6">
             🎉 Bạn được cộng <strong style="color:#1B4B5A">${fmtPoints(points)} điểm</strong> từ đơn này.<br/>
             Tổng điểm hiện có: <strong>${fmtPoints(balance)} điểm</strong>
           </div>`
        : "";
    // ── MẪU EMAIL GỬI KHÁCH KHI ADMIN DUYỆT ĐƠN (sửa lời văn ở đây) ──
    if (customer)
      mails.push({
        to: [customer],
        replyTo: adminTo[0],
        subject: `Cảm ơn bạn đã đặt bánh tại ${SITE_NAME} — Đơn ${o.id} đã được xác nhận`,
        html: layout(`
          <p style="font-size:15px;line-height:1.6">Chào ${escapeHtml(name)},</p>
          <p style="font-size:15px;line-height:1.6">
            ${SITE_NAME} xin chân thành <strong>cảm ơn bạn</strong> đã tin tưởng và đặt bánh tại tiệm! 💛
          </p>
          <p style="font-size:15px;line-height:1.6">Đơn hàng <strong>${o.id}</strong> của bạn đã được tiệm xác nhận.</p>
          <p>Tình trạng đơn: ${statusBadge(o.status)}</p>
          ${pointsText}
          ${orderDetails(o)}
          <p style="font-size:15px;line-height:1.6;margin-top:20px">
            Mỗi chiếc bánh đều được tiệm làm thủ công với tất cả sự tận tâm — mong bánh mang lại cho bạn và người thân
            những khoảnh khắc thật ngọt ngào. Nếu có góp ý gì, bạn chỉ cần trả lời email này, tiệm luôn lắng nghe.
          </p>
          <p style="font-size:15px;line-height:1.6">Hẹn gặp lại bạn ở những chiếc bánh tiếp theo!</p>
          <p style="font-size:15px;line-height:1.6;margin-bottom:0">Thân mến,<br/><strong>${SITE_NAME}</strong></p>
          ${button(`${SITE_URL}/tich-diem`, "Xem điểm tích lũy")}`),
      });
    if (adminTo.length)
      mails.push({
        to: adminTo,
        subject: `✅ Đơn ${o.id} đã giao — khách +${fmtPoints(points)} điểm`,
        html: layout(`
          <p style="font-size:15px;line-height:1.6">Đơn <strong>${o.id}</strong> đã chuyển sang ${statusBadge(o.status)}.</p>
          <p style="font-size:14px;line-height:1.6">Khách ${escapeHtml(o.customer_name ?? "—")} được cộng <strong>${fmtPoints(points)} điểm</strong> (tổng hiện có: ${fmtPoints(balance)} điểm).
          ${customer ? "Email xác nhận đã gửi cho khách." : "Đơn không có email khách nên không gửi email cho khách."}</p>
          ${orderDetails(o)}`),
      });
    return mails;
  }

  // Đã hủy
  if (customer)
    mails.push({
      to: [customer],
      subject: `Đơn hàng ${o.id} đã bị hủy`,
      html: layout(`
        <p style="font-size:15px;line-height:1.6">Chào ${escapeHtml(name)},</p>
        <p style="font-size:15px;line-height:1.6">Đơn hàng <strong>${o.id}</strong> của bạn đã được hủy.
        ${refunded > 0 ? `Tiệm đã hoàn lại <strong>${fmtPoints(refunded)} điểm</strong> bạn đã đổi trong đơn này.` : ""}
        Nếu cần hỗ trợ, bạn chỉ cần trả lời email này hoặc nhắn tiệm nhé.</p>
        <p>Tình trạng đơn: ${statusBadge(o.status)}</p>
        ${orderDetails(o)}
        <p style="font-size:15px;line-height:1.6;margin-top:20px">
          Cảm ơn bạn đã quan tâm đến ${SITE_NAME}. Rất mong được phục vụ bạn trong những lần tới!
        </p>
        <p style="font-size:15px;line-height:1.6;margin-bottom:0">Thân mến,<br/><strong>${SITE_NAME}</strong></p>`),
      replyTo: adminTo[0],
    });
  if (adminTo.length)
    mails.push({
      to: adminTo,
      subject: `❌ Đơn ${o.id} đã hủy`,
      html: layout(`
        <p style="font-size:15px;line-height:1.6">Đơn <strong>${o.id}</strong> đã chuyển sang ${statusBadge(o.status)}.
        ${refunded > 0 ? `Đã hoàn ${fmtPoints(refunded)} điểm cho khách.` : ""}</p>
        ${orderDetails(o)}`),
    });
  return mails;
}

function adminRecipients(shopEmail: string | null): string[] {
  const fromEnv = (process.env.ADMIN_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  return shopEmail?.trim() ? [shopEmail.trim()] : [];
}

/** Gửi email thông báo cho đơn hàng (nếu người gọi có quyền và chưa gửi). Không bao giờ ném lỗi. */
export async function sendOrderEmails(supabase: SupabaseClient, orderId: string, kind: OrderEmailKind): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    const { data, error } = await supabase.rpc("claim_order_email", { p_order_id: orderId, p_kind: kind });
    if (error) {
      console.error("claim_order_email lỗi", error);
      return;
    }
    if (!data) return;

    const order = data as ClaimedOrder;
    const mails = buildMails(kind, order, adminRecipients(order.shop_email));
    await Promise.all(
      mails.map(async (m) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `${SITE_NAME} <noreply@caribakehouse.vn>`,
            to: m.to,
            subject: m.subject,
            html: m.html,
            ...(m.replyTo ? { reply_to: m.replyTo } : {}),
          }),
        });
        if (!res.ok) console.error("Gửi email đơn hàng thất bại", res.status, await res.text());
      }),
    );
  } catch (error) {
    console.error("Gửi email đơn hàng thất bại", error);
  }
}
