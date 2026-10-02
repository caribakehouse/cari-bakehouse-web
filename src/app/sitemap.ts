import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

// /sitemap.xml — danh sách trang công khai + từng sản phẩm đang bán, để Google biết web có những trang nào.
// Đọc sản phẩm mới mỗi lần Google mở sitemap (dùng cookies → không bị lưu tạm), nên thêm sản phẩm là có ngay.
// Không ghi lastModified: Google chỉ tin ngày sửa khi chính xác, ghi sai còn tệ hơn để trống.

const PAGES = ["", "/san-pham", "/dat-theo-yeu-cau", "/gioi-thieu", "/tich-diem", "/lien-he"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = PAGES.map((path) => ({ url: `${SITE_URL}${path}` }));

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("slug").neq("status", "hidden").order("id");
    for (const p of data ?? []) entries.push({ url: `${SITE_URL}/san-pham/${encodeURIComponent(p.slug)}` });
  } catch (error) {
    console.error("sitemap: không tải được sản phẩm", error);
  }

  return entries;
}
