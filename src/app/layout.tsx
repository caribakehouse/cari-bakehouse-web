import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cari Bakehouse — Bánh Ngọt Thủ Công",
  description:
    "Cari Bakehouse — Tiệm bánh thủ công với những chiếc bánh được làm từ nguyên liệu tự nhiên, tươi ngon mỗi ngày.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        {/* Google Fonts — Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
