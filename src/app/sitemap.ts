import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

// /sitemap.xml — danh sách trang công khai + từng sản phẩm đang bán, để Google biết web có những trang nào.
// Đọc dữ liệu mới mỗi lần Google mở sitemap (dùng cookies → không bị lưu tạm), nên thêm sản phẩm là có ngay.
// lastModified chỉ ghi khi biết CHÍNH XÁC ngày sửa (Google bỏ qua cả sitemap nếu ngày sửa hay sai):
//   - trang nội dung: ngày admin lưu nội dung đó (site_content.updated_at)
//   - trang sản phẩm: ngày sửa sản phẩm (products.updated_at, migration 0012)
//   - trang chủ, /san-pham: thêm lần sửa sản phẩm mới nhất (cả 2 trang đều hiện danh sách sản phẩm)

/** Trang → các mục nội dung (site_content.key) hiển thị trên trang đó */
const PAGES: { path: string; keys: string[] }[] = [
  { path: "", keys: ["home", "settings"] },
  { path: "/san-pham", keys: ["products_page"] },
  { path: "/dat-theo-yeu-cau", keys: ["custom_order"] },
  { path: "/gioi-thieu", keys: ["about"] },
  { path: "/tich-diem", keys: ["loyalty"] },
  { path: "/lien-he", keys: ["settings"] },
];

const latest = (dates: (string | null | undefined)[]): Date | undefined => {
  const times = dates.filter((d): d is string => !!d).map((d) => new Date(d).getTime()).filter(Number.isFinite);
  return times.length > 0 ? new Date(Math.max(...times)) : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let contentDates = new Map<string, string>();
  let products: { slug: string; updated_at?: string | null }[] = [];

  try {
    const supabase = await createClient();
    const [content, items] = await Promise.all([
      supabase.from("site_content").select("key, updated_at"),
      // select("*") để vẫn chạy khi database chưa có cột updated_at
      supabase.from("products").select("*").neq("status", "hidden").order("id"),
    ]);
    contentDates = new Map(((content.data ?? []) as { key: string; updated_at: string }[]).map((r) => [r.key, r.updated_at]));
    products = (items.data ?? []) as typeof products;
  } catch (error) {
    // Tín hiệu nội bộ của Next ("trang phải chạy động vì đọc cookies") phải ném tiếp, không phải lỗi thật
    unstable_rethrow(error);
    console.error("sitemap: không tải được dữ liệu", error);
  }

  const productsChanged = latest(products.map((p) => p.updated_at));

  const entries: MetadataRoute.Sitemap = PAGES.map(({ path, keys }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: latest([
      ...keys.map((k) => contentDates.get(k)),
      // Trang chủ và /san-pham đều hiện danh sách sản phẩm
      ...((path === "/san-pham" || path === "") && productsChanged ? [productsChanged.toISOString()] : []),
    ]),
  }));

  for (const p of products) {
    entries.push({
      url: `${SITE_URL}/san-pham/${encodeURIComponent(p.slug)}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    });
  }

  return entries;
}
