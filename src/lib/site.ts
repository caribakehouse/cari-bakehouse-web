import type { Metadata } from "next";

// Thông tin chung của tiệm dùng cho SEO (tiêu đề trang, sitemap, dữ liệu có cấu trúc cho Google).
// Tên / địa chỉ / giờ mở cửa phải khớp đúng với chữ hiển thị trên web (footer, trang Liên hệ)
// và với hồ sơ Google Maps (Google Business Profile) — Google so khớp các nguồn này với nhau.

/** Địa chỉ chính của web (bản có www — bản không www tự chuyển hướng về đây) */
export const SITE_URL = "https://www.caribakehouse.vn";

export const SITE_NAME = "Cari Bakehouse";

export const BUSINESS = {
  name: SITE_NAME,
  description:
    "Tiệm bánh thủ công tại Hà Nội: cheesecake, brownies, bánh theo yêu cầu và đồ uống, làm mới mỗi ngày từ nguyên liệu nhập khẩu, không chất bảo quản.",
  streetAddress: "Số 34, ngõ 40, Tô Vĩnh Diện",
  addressLocality: "Hà Nội",
  addressCountry: "VN",
  /** Giờ mở cửa hằng ngày — khớp footer và trang Liên hệ (10:00 – 24:00) */
  opens: "10:00",
  closes: "23:59",
  logo: "/images/logo.jpg",
} as const;

/**
 * Metadata cho 1 trang: tiêu đề (tự thêm " · Cari Bakehouse"), mô tả, đường dẫn chuẩn (canonical),
 * ảnh xem trước khi chia sẻ link. noindex = không cho hiện trên Google (giỏ hàng, tài khoản...).
 * Next.js thay nguyên khối openGraph của layout cha nên phải ghi lại siteName / ảnh ở đây.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  /** Tiêu đề đầy đủ, không thêm đuôi tên tiệm (dùng cho trang chủ) */
  absoluteTitle?: boolean;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const ogTitle = opts.absoluteTitle ? opts.title : `${opts.title} · ${SITE_NAME}`;
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: SITE_NAME,
      url: opts.path,
      title: ogTitle,
      description: opts.description,
      images: [{ url: opts.image ?? BUSINESS.logo, alt: ogTitle }],
    },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}
