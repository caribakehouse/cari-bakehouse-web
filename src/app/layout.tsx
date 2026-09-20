import type { Metadata } from "next";
import { Lato, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/layout/Topbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FloatingContact from "@/components/layout/FloatingContact";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${lato.variable} ${nunitoSans.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-cream text-text-dark antialiased">
        <Topbar />
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <FloatingContact />
      </body>
    </html>
  );
}
