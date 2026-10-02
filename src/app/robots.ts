import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /robots.txt — cho phép mọi máy tìm kiếm (kể cả công cụ tìm kiếm AI) đọc trang công khai,
// chặn khu quản trị và các đường dẫn kỹ thuật. Các trang tài khoản / giỏ hàng vẫn đọc được
// nhưng tự gắn "noindex" (xem layout từng trang) để không hiện trên Google.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/auth/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
