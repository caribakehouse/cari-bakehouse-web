// /llms.txt — "bản giới thiệu" tiệm dành cho các trợ lý AI (ChatGPT, Claude, Gemini, Perplexity...),
// theo định dạng llmstxt.org: tên tiệm, tóm tắt, thông tin liên hệ, các trang chính và thực đơn kèm giá.
// Tạo mới mỗi lần mở từ dữ liệu trên Supabase → admin sửa sản phẩm / liên hệ là file tự cập nhật.
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { fetchProducts, fetchSiteContent } from "@/lib/supabase/public-data";
import { formatHotline, formatVND } from "@/lib/utils";
import type { Product } from "@/lib/mock-data";

function priceText(p: Product): string {
  const prices = p.sizes && p.sizes.length > 0 ? p.sizes.map((s) => s.price) : [p.price];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
}

const oneLine = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

export async function GET() {
  const supabase = await createClient();
  const [products, content] = await Promise.all([
    fetchProducts(supabase).catch(() => [] as Product[]),
    fetchSiteContent(supabase).catch(() => null),
  ]);
  const settings = content?.settings;

  const visible = products.filter((p) => (p.status ?? "active") !== "hidden");
  const byCategory = new Map<string, Product[]>();
  for (const p of visible) byCategory.set(p.category, [...(byCategory.get(p.category) ?? []), p]);

  const contact = [
    `- Địa chỉ: ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, Việt Nam`,
    `- Giờ mở cửa: ${BUSINESS.opens} – 24:00, tất cả các ngày trong tuần`,
    settings?.hotline && `- Hotline / Zalo: ${formatHotline(settings.hotline)}`,
    settings?.email && `- Email: ${settings.email}`,
    settings?.zalo?.startsWith("http") && `- Zalo: ${settings.zalo}`,
    settings?.facebook?.startsWith("http") && `- Facebook: ${settings.facebook}`,
    settings?.instagram?.startsWith("http") && `- Instagram: ${settings.instagram}`,
    settings?.tiktok?.startsWith("http") && `- TikTok: ${settings.tiktok}`,
  ].filter(Boolean);

  const menu = [...byCategory.entries()].flatMap(([category, items]) => [
    "",
    `### ${category}`,
    "",
    ...items.map((p) => {
      const desc = oneLine(p.description);
      const soldOut = p.status === "soldout" ? " (tạm hết hàng)" : "";
      return `- [${p.name}](${SITE_URL}/san-pham/${encodeURIComponent(p.slug)}): ${priceText(p)}${soldOut}${desc ? `. ${desc}` : ""}`;
    }),
  ]);

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${BUSINESS.description}`,
    "",
    "Khách đặt bánh online trên website (giao tận nơi hoặc lấy tại tiệm, thanh toán tiền mặt hoặc chuyển khoản), " +
      "đặt bánh sinh nhật / sự kiện theo yêu cầu, và tích điểm thành viên để đổi bánh miễn phí.",
    "",
    "## Thông tin liên hệ",
    "",
    ...contact,
    "",
    "## Các trang chính",
    "",
    `- [Thực đơn](${SITE_URL}/san-pham): toàn bộ bánh và đồ uống, giá, đặt hàng online`,
    `- [Đặt bánh theo yêu cầu](${SITE_URL}/dat-theo-yeu-cau): bánh sinh nhật, sự kiện, thiết kế riêng`,
    `- [Tích điểm thành viên](${SITE_URL}/tich-diem): cách tích điểm, hạng thành viên, đổi quà`,
    `- [Giới thiệu & chính sách](${SITE_URL}/gioi-thieu): câu chuyện của tiệm, chính sách giao hàng, đổi trả`,
    `- [Liên hệ](${SITE_URL}/lien-he): địa chỉ, hotline, mạng xã hội`,
    ...(menu.length > 0 ? ["", "## Thực đơn", ...menu] : []),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Lưu tạm 1 giờ ở CDN để không hỏi database mỗi lần bot ghé
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
