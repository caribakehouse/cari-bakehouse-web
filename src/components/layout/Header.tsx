"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Bánh đặt theo yêu cầu", href: "/dat-theo-yeu-cau" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Tích điểm", href: "/tich-diem" },
  { label: "Liên hệ", href: "/lien-he" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Khóa cuộn trang khi drawer đang mở
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-cream/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ================= 1. Bên trái: Logo ================= */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-accent bg-accent/20 shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:border-primary">
            <Image
              src="/images/logo.jpg"
              alt="Cari Bakehouse Logo"
              width={48}
              height={48}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight text-primary transition-colors group-hover:text-primary-dark sm:text-2xl">
              Cari Bakehouse
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
              Indulgence in every bite
            </span>
          </div>
        </Link>

        {/* ================= 2. Ở giữa: Menu điều hướng Desktop ================= */}
        <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "font-semibold text-primary"
                    : "text-text-dark/80 hover:text-primary"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= 3. Bên phải: Actions ================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút Tìm kiếm */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Tìm kiếm sản phẩm"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-accent/20 hover:text-primary"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Nút Giỏ hàng */}
          <Link
            href="/gio-hang"
            aria-label="Giỏ hàng"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-accent/20 hover:text-primary"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-caramel px-1 text-[10px] font-bold text-white shadow-xs">
              0
            </span>
          </Link>

          {/* Nút Đăng nhập (Desktop) */}
          <Link
            href="/dang-nhap"
            className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary px-4 py-2 text-sm font-medium text-cream shadow-xs transition-all hover:bg-primary-dark hover:shadow-md md:inline-flex"
          >
            <User className="h-4 w-4 text-accent" />
            <span>Đăng nhập</span>
          </Link>

          {/* Nút Hamburger (Mobile / Tablet) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu điều hướng"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-accent/20 hover:text-primary lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* ================= Thanh Tìm kiếm mở rộng (Toggle Search Bar) ================= */}
      {isSearchOpen && (
        <div className="border-t border-border bg-cream/95 px-4 py-3 shadow-inner sm:px-6">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm bánh kem, sừng bò, tiramisu, cookie..."
                className="w-full rounded-full border border-border bg-white py-2 pr-4 pl-10 text-sm text-text-dark placeholder-text-muted focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="rounded-full px-3 py-2 text-xs font-medium text-text-muted hover:text-text-dark"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ================= Mobile Navigation Drawer & Overlay ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop mờ */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer trượt ra từ bên phải */}
          <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-cream shadow-2xl transition-transform">
            {/* Drawer Header */}
            <div className="flex h-20 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent">
                  <Image
                    src="/images/logo.jpg"
                    alt="Cari Bakehouse Logo"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-base font-bold text-primary">
                    Cari Bakehouse
                  </span>
                  <span className="text-[9px] font-semibold text-text-muted uppercase">
                    Indulgence in every bite
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-accent/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Search Input */}
            <div className="border-b border-border/60 p-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Tìm kiếm loại bánh..."
                  className="w-full rounded-lg border border-border bg-white py-2 pr-3 pl-9 text-xs text-text-dark placeholder-text-muted focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            {/* Drawer Menu Links */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <nav className="flex flex-col space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent/30 font-semibold text-primary"
                          : "text-text-dark hover:bg-accent/15 hover:text-primary"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-text-muted/60" />
                    </Link>
                  );
                })}
              </nav>

              {/* Phím Đăng nhập / Đăng ký trên Mobile */}
              <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-border">
                <Link
                  href="/dang-nhap"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-cream shadow-xs transition-colors hover:bg-primary-dark"
                >
                  <User className="h-4 w-4 text-accent" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  href="/dang-ky"
                  className="flex items-center justify-center rounded-lg border border-border bg-white py-2.5 text-sm font-medium text-text-dark transition-colors hover:bg-accent/10"
                >
                  Đăng ký tài khoản
                </Link>
              </div>
            </div>

            {/* Drawer Footer: Hotline & Email */}
            <div className="border-t border-border bg-cream/60 p-4 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-caramel" />
                <a href="tel:0338975925" className="hover:text-primary">
                  Hotline: <strong className="text-text-dark">0338 975 925</strong>
                </a>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-caramel" />
                <a href="mailto:cari.bakehouse07@gmail.com" className="hover:text-primary truncate">
                  cari.bakehouse07@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
