// Gửi email thông báo đơn hàng. Trình duyệt gọi route này sau khi:
//   - khách đặt đơn thành công      → { orderId, kind: "placed" }
//   - admin đổi trạng thái đơn       → { orderId, kind: "Đã giao" | "Đã hủy" }
// Quyền và chống gửi trùng do database kiểm tra (claim_order_email), dựa trên phiên đăng nhập trong cookie.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderEmails, type OrderEmailKind } from "@/lib/order-email";

const KINDS: OrderEmailKind[] = ["placed", "Đã giao", "Đã hủy"];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { orderId?: unknown; kind?: unknown } | null;
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const kind = KINDS.find((k) => k === body?.kind);
  if (!orderId || !kind) return NextResponse.json({ ok: false }, { status: 400 });

  await sendOrderEmails(await createClient(), orderId, kind);
  return NextResponse.json({ ok: true });
}
