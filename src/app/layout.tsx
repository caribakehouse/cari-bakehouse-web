import type { Metadata } from "next";
import { Lato, Nunito_Sans } from "next/font/google";
import { unstable_rethrow } from "next/navigation";
import "./globals.css";
import { PublicDataProvider } from "@/components/PublicDataProvider";
import {
  SEED_ABOUT_CONTENT,
  SEED_HOME_CONTENT,
  SEED_PRODUCTS,
  SEED_PRODUCTS_PAGE_CONTENT,
  SEED_SITE_SETTINGS,
  reviews as SEED_REVIEWS,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { fetchPublicData, type PublicData } from "@/lib/supabase/public-data";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cari Bakehouse — Indulgence In Every Bite",
  description:
    "Cari Bakehouse — Tiệm bánh thủ công tại Hà Nội với những chiếc bánh tươi ngon, làm từ nguyên liệu tự nhiên mỗi ngày.",
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
      className={`${lato.variable} ${nunitoSans.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-cream text-text-dark antialiased">
        <PublicDataProvider data={data}>{children}</PublicDataProvider>
      </body>
    </html>
  );
}
