import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import localFont from "next/font/local";
import { unstable_rethrow } from "next/navigation";
import "./globals.css";
import { PublicDataProvider } from "@/components/PublicDataProvider";
import {
  SEED_ABOUT_CONTENT,
  SEED_CUSTOM_ORDER_CONTENT,
  SEED_HOME_CONTENT,
  SEED_PRODUCTS,
  SEED_PRODUCTS_PAGE_CONTENT,
  SEED_SITE_SETTINGS,
  reviews as SEED_REVIEWS,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LOYALTY, fetchPublicData, type PublicData } from "@/lib/supabase/public-data";
import { BusinessJsonLd } from "@/components/seo/JsonLd";
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";

// Font tiêu đề: Magnolia Script (SIL OFL, xem src/app/fonts/OFL.txt). Bản gốc thiếu nhiều chữ có dấu tiếng Việt
// (ơ, ư, dấu hỏi, dấu nặng, dấu chồng như ấ/ầ...) nên các chữ đó lấy từ Cari Script VN — ghép từ chính nét/dấu của Magnolia.
// Không dùng font dự phòng tự động (Arial) để trình duyệt tìm chữ thiếu ở Cari Script VN trước.
// Font chỉ có 1 độ đậm → khai báo 400–900 để các tiêu đề font-bold/font-black không bị làm đậm giả.
const magnolia = localFont({
  src: [{ path: "./fonts/MagnoliaScript.otf", weight: "400 900", style: "normal" }],
  variable: "--font-heading-main",
  display: "swap",
  adjustFontFallback: false,
});

const cariScriptVN = localFont({
  src: [{ path: "./fonts/CariScriptVN.otf", weight: "400 900", style: "normal" }],
  variable: "--font-heading-vn",
  display: "swap",
  adjustFontFallback: false,
});

const nunitoSans = Nunito_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

// Tiêu đề trang con tự thêm đuôi " · Cari Bakehouse" (title.template). Link tương đối (canonical, ảnh) tính theo SITE_URL.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cari Bakehouse · Tiệm bánh thủ công tại Hà Nội",
    template: "%s · Cari Bakehouse",
  },
  description: BUSINESS.description,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    images: [{ url: BUSINESS.logo, alt: SITE_NAME }],
  },
};

/** Tải dữ liệu công khai từ Supabase mỗi lần mở trang; lỗi kết nối thì tạm dùng dữ liệu mẫu để web không trắng trang. */
async function loadPublicData(): Promise<PublicData> {
  try {
    return await fetchPublicData(await createClient());
  } catch (error) {
    // Lỗi nội bộ của Next (vd. báo "trang này phải render động vì đọc cookies") phải được ném tiếp,
    // nếu không trang sẽ bị build tĩnh với dữ liệu mẫu.
    unstable_rethrow(error);
    console.error("Không tải được dữ liệu từ Supabase, dùng tạm dữ liệu mẫu:", error);
    return {
      products: SEED_PRODUCTS,
      groups: SEED_PRODUCTS_PAGE_CONTENT.groups,
      reviews: SEED_REVIEWS,
      home: SEED_HOME_CONTENT,
      about: SEED_ABOUT_CONTENT,
      settings: SEED_SITE_SETTINGS,
      categoryPickerLabel: SEED_PRODUCTS_PAGE_CONTENT.categoryPickerLabel,
      loyalty: DEFAULT_LOYALTY,
      customOrder: SEED_CUSTOM_ORDER_CONTENT,
    };
  }
}

// Layout gốc giữ font + <body> và nạp sẵn dữ liệu công khai cho cả cửa hàng lẫn khu admin.
// Khung cửa hàng (Topbar/Header/Footer...) nằm ở (shop)/layout.tsx, khung quản trị (sidebar/topbar) nằm ở (admin)/admin/layout.tsx.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await loadPublicData();
  return (
    <html
      lang="vi"
      className={`${magnolia.variable} ${cariScriptVN.variable} ${nunitoSans.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-cream text-text-dark antialiased">
        <BusinessJsonLd settings={data.settings} />
        <PublicDataProvider data={data}>{children}</PublicDataProvider>
      </body>
    </html>
  );
}
