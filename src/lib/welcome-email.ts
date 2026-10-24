// Email chào mừng khi khách tạo tài khoản mới (đăng ký bằng email hoặc lần đầu đăng nhập Google).
// Chỉ chạy trên server: gửi qua Resend bằng RESEND_API_KEY (biến môi trường trên Vercel, không lộ ra trình duyệt).
// Chống lạm dụng: chỉ gửi cho chính tài khoản đang đăng nhập, tài khoản tạo trong 15 phút gần nhất,
// và chỉ 1 lần (đánh dấu welcome_sent trong user_metadata).
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";

const NEW_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function welcomeHtml(name: string): string {
  return `<div style="margin:0;padding:24px;background:#FFF8EF;font-family:Arial,Helvetica,sans-serif;color:#2B2B2B">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #E5D9C3;border-radius:16px;padding:28px">
    <h1 style="margin:0 0 4px;font-size:22px;color:#1B4B5A">${SITE_NAME}</h1>
    <p style="margin:0 0 20px;font-size:12px;color:#7A7A7A;letter-spacing:1px">INDULGENCE IN EVERY BITE</p>
    <p style="font-size:15px;line-height:1.6">Chào ${escapeHtml(name)},</p>
    <p style="font-size:15px;line-height:1.6">
      Cảm ơn bạn đã tạo tài khoản tại ${SITE_NAME}! Từ giờ mỗi đơn bánh đều được tích điểm để đổi bánh miễn phí,
      lên hạng Thân thiết, VIP và nhận ưu đãi riêng trong tháng sinh nhật.
    </p>
    <p style="text-align:center;margin:28px 0">
      <a href="${SITE_URL}/san-pham"
         style="display:inline-block;background:#1B4B5A;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">
        Xem thực đơn
      </a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#7A7A7A">
      Nếu bạn không tạo tài khoản này, vui lòng trả lời email hoặc nhắn tiệm để được hỗ trợ.
    </p>
    <p style="font-size:13px;color:#7A7A7A;margin-top:20px">
      ${SITE_NAME} · ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality} · www.caribakehouse.vn
    </p>
  </div>
</div>`;
}

/** Gửi email chào mừng cho tài khoản đang đăng nhập (nếu là tài khoản mới và chưa gửi). Không bao giờ ném lỗi. */
export async function sendWelcomeEmailIfNew(supabase: SupabaseClient): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.email || user.user_metadata?.welcome_sent) return;
    if (Date.now() - new Date(user.created_at).getTime() > NEW_ACCOUNT_WINDOW_MS) return;

    // Đánh dấu trước khi gửi để 2 lần gọi gần nhau không gửi trùng
    const { error: markError } = await supabase.auth.updateUser({ data: { welcome_sent: true } });
    if (markError) return;

    const name = (user.user_metadata?.full_name as string | undefined)?.trim() || "bạn";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${SITE_NAME} <noreply@caribakehouse.vn>`,
        to: [user.email],
        subject: `Chào mừng bạn đến với ${SITE_NAME}`,
        html: welcomeHtml(name),
      }),
    });
    if (!res.ok) console.error("Gửi email chào mừng thất bại", res.status, await res.text());
  } catch (error) {
    console.error("Gửi email chào mừng thất bại", error);
  }
}
