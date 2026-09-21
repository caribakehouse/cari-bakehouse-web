"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

interface BottomNavItem {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: number;
  /** Các đường dẫn khác cũng được tính là "đang ở mục này" */
  activePaths?: string[];
}

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count } = useCart();

  const items: BottomNavItem[] = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Danh mục", href: "/san-pham", icon: LayoutGrid },
    {
      label: "Giỏ hàng",
      href: "/gio-hang",
      icon: ShoppingBag,
      badge: count,
      activePaths: ["/dat-hang"],
    },
    {
      label: "Tài khoản",
      href: user ? "/tai-khoan" : "/dang-nhap",
      icon: User,
      activePaths: ["/tai-khoan", "/dang-nhap", "/dang-ky"],
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-cream/95 backdrop-blur-lg shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : [item.href, ...(item.activePaths ?? [])].some((p) => pathname.startsWith(p));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all ${
                isActive ? "text-primary" : "text-text-muted hover:text-text-dark"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-caramel px-1 text-[9px] font-bold text-white shadow-xs">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`mt-1 text-[11px] leading-tight ${
                  isActive ? "font-semibold text-primary" : "font-medium"
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
