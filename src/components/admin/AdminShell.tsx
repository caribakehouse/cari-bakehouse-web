"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Bell,
  Cake,
  CheckCircle2,
  LayoutDashboard,
  LayoutTemplate,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import { AdminContext, type ToastTone } from "@/components/admin/AdminContext";
import { PageSpinner } from "@/components/account/PageSpinner";
import { logout, useRequireAuth } from "@/lib/auth";
import { useCustomRequests, useOrders } from "@/lib/db";

interface MenuItem {
  href: string;
  label: string;
  title: string;
  icon: typeof LayoutDashboard;
  /** Các đường dẫn con/anh em cũng làm mục này sáng lên */
  alsoActive?: string[];
  exact?: boolean;
}

// Menu sidebar theo wireframe: Dashboard, Sản phẩm, Đơn hàng, Khách hàng, Bánh đặt theo yêu cầu, Tích điểm, Nội dung trang, Cài đặt
const MENU: MenuItem[] = [
  { href: "/admin", label: "Dashboard", title: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/san-pham", label: "Sản phẩm", title: "Quản lý sản phẩm", icon: Package },
  { href: "/admin/don-hang", label: "Đơn hàng", title: "Quản lý đơn hàng", icon: ShoppingBag },
  { href: "/admin/khach-hang", label: "Khách hàng", title: "Khách hàng & điểm", icon: Users },
  { href: "/admin/dat-theo-yeu-cau", label: "Bánh đặt theo yêu cầu", title: "Bánh đặt theo yêu cầu", icon: Cake },
  { href: "/admin/tich-diem", label: "Tích điểm", title: "Tích điểm", icon: Award },
  {
    href: "/admin/noi-dung-trang-chu",
    label: "Nội dung trang",
    title: "Nội dung trang",
    icon: LayoutTemplate,
    alsoActive: ["/admin/noi-dung-trang-san-pham", "/admin/gioi-thieu-chinh-sach"],
  },
  { href: "/admin/cai-dat", label: "Cài đặt", title: "Cài đặt chung", icon: Settings },
];

function isActive(item: MenuItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return [item.href, ...(item.alsoActive ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/gioi-thieu-chinh-sach")) return "Giới thiệu & chính sách";
  if (pathname.startsWith("/admin/noi-dung-trang-san-pham")) return "Nội dung trang sản phẩm";
  if (pathname.startsWith("/admin/noi-dung-trang-chu")) return "Nội dung trang chủ";
  return MENU.find((m) => isActive(m, pathname))?.title ?? "Khu quản trị";
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Chỉ hiện khu quản trị cho tài khoản có profiles.role = 'admin' (quyền ghi dữ liệu do RLS kiểm soát).
  const auth = useRequireAuth(pathname, "admin");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [search, setSearch] = useState({ path: "", q: "" });
  const [toastState, setToastState] = useState<{ id: number; message: string; tone: ToastTone } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orders = useOrders();
  const requests = useCustomRequests();
  const pendingOrders = orders.filter((o) => o.status === "Chờ xử lý").length;
  const newRequests = requests.filter((r) => r.status === "Mới").length;

  // Ô tìm kiếm chỉ có hiệu lực trên màn hình hiện tại
  const query = search.path === pathname ? search.q : "";

  const toast = (message: string, tone: ToastTone = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastState({ id: Date.now(), message, tone });
    toastTimer.current = setTimeout(() => setToastState(null), 3500);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  if (auth.status === "loading") return <PageSpinner />;

  if (auth.status === "signed-out") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-2xl font-black text-[#2b2b2b]">Bạn đã đăng xuất</h1>
        <div className="flex gap-3">
          <Link href="/dang-nhap?next=/admin" className="rounded-md bg-[#2b2b2b] px-5 py-2.5 text-sm font-bold text-white">
            Đăng nhập lại
          </Link>
          <Link href="/" className="rounded-md border border-[#4a4a4a] px-5 py-2.5 text-sm font-bold text-[#2b2b2b]">
            Về cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  if (auth.status === "forbidden") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="font-heading text-2xl font-black text-[#2b2b2b]">Bạn không có quyền truy cập khu quản trị</h1>
        <p className="max-w-md text-sm text-[#7a7a7a]">
          Tài khoản <strong className="text-[#2b2b2b]">{auth.user.email}</strong> là tài khoản khách hàng. Đăng nhập bằng tài
          khoản quản trị để vào khu này.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/tai-khoan" className="rounded-md bg-[#2b2b2b] px-5 py-2.5 text-sm font-bold text-white">
            Về trang tài khoản
          </Link>
          <Link href="/" className="rounded-md border border-[#4a4a4a] px-5 py-2.5 text-sm font-bold text-[#2b2b2b]">
            Về cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const user = auth.user;
  const initial = (user.fullName.trim()[0] ?? "A").toUpperCase();

  return (
    <AdminContext.Provider value={{ query, toast }}>
      <div className="flex min-h-screen w-full bg-white text-[#2b2b2b]">
        {/* Nền mờ khi mở sidebar trên điện thoại */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
        )}

        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside
          aria-label="Menu quản trị"
          className={`fixed inset-y-0 left-0 z-50 flex w-[220px] shrink-0 flex-col justify-between bg-[#2b2b2b] py-[18px] text-[#e8e8e8] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 flex items-center gap-2.5 border-b border-[#454545] px-[18px] pb-[18px]">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[#F6CE8B] bg-[#f0e6c8]">
                <Image src="/images/logo.jpg" alt="" width={28} height={28} className="h-full w-full object-cover" />
              </div>
              <div className="text-xs font-bold leading-tight text-white">Cari Bakehouse — Admin</div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Đóng menu"
                className="ml-auto cursor-pointer text-[#c9c9c9] lg:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              {MENU.map((item) => {
                const active = isActive(item, pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 border-l-[3px] px-[15px] py-2.5 text-xs transition-colors ${
                      active
                        ? "border-[#F6CE8B] bg-[#3d3d3d] font-semibold text-white"
                        : "border-transparent text-[#c9c9c9] hover:bg-[#333] hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-[#454545] px-[18px] pt-3.5">
            <Link href="/" className="flex items-center gap-2.5 text-xs text-[#f0e6c8] transition-colors hover:text-white">
              ← Quay lại cửa hàng
            </Link>
          </div>
        </aside>

        {/* ═══════════ MAIN ═══════════ */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOPBAR */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-dashed border-[#9a9a9a] bg-white px-4 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Mở menu quản trị"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#c9c9c9] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="truncate text-base font-bold text-[#2b2b2b]">{pageTitle(pathname)}</h1>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#9a9a9a]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setSearch({ path: pathname, q: e.target.value })}
                  placeholder="Tìm kiếm..."
                  aria-label="Tìm kiếm trong màn hình này"
                  className="h-[30px] w-[200px] border border-[#9a9a9a] bg-[#fafafa] pr-2.5 pl-8 text-[11px] text-[#2b2b2b] placeholder:text-[#7a7a7a] focus:border-[#2b2b2b] focus:outline-none"
                />
              </div>

              {/* Chuông thông báo (placeholder: chỉ tóm tắt việc cần xử lý) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBellOpen((v) => !v)}
                  aria-label="Thông báo"
                  aria-expanded={bellOpen}
                  className="relative flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-full border border-[#9a9a9a] text-[#5b5b5b] hover:bg-[#f0e6c8]"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {pendingOrders + newRequests > 0 && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>
                {bellOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-[#d6d6d6] bg-white p-3 text-xs shadow-lg">
                      <div className="mb-2 font-bold text-[#2b2b2b]">Việc cần xử lý</div>
                      <Link
                        href="/admin/don-hang"
                        onClick={() => setBellOpen(false)}
                        className="flex justify-between rounded px-2 py-1.5 hover:bg-[#f3f3f3]"
                      >
                        <span>Đơn chờ xử lý</span>
                        <strong>{pendingOrders}</strong>
                      </Link>
                      <Link
                        href="/admin/dat-theo-yeu-cau"
                        onClick={() => setBellOpen(false)}
                        className="flex justify-between rounded px-2 py-1.5 hover:bg-[#f3f3f3]"
                      >
                        <span>Yêu cầu bánh mới</span>
                        <strong>{newRequests}</strong>
                      </Link>
                      <p className="mt-2 border-t border-[#e3e3e3] pt-2 text-[11px] text-[#9a9a9a]">
                        Thông báo tự động sẽ được bổ sung ở giai đoạn sau.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Avatar admin (mock) */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-[#9a9a9a] bg-[#e8e8e8] text-[11px] font-bold text-[#2b2b2b]">
                  {initial}
                </div>
                <div className="hidden text-[11px] leading-tight md:block">
                  <div className="font-bold text-[#2b2b2b]">{user.fullName}</div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="cursor-pointer text-[#7a7a7a] underline-offset-2 hover:underline"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden whitespace-nowrap rounded-full border border-[#9a9a9a] px-3 py-1.5 text-[10px] text-[#5b5b5b] hover:bg-[#f0e6c8] sm:block"
              >
                Xem cửa hàng ↗
              </Link>
            </div>
          </header>

          {/* Ô tìm kiếm cho điện thoại */}
          <div className="border-b border-[#e3e3e3] px-4 py-2 sm:hidden">
            <input
              type="search"
              value={query}
              onChange={(e) => setSearch({ path: pathname, q: e.target.value })}
              placeholder="Tìm kiếm..."
              aria-label="Tìm kiếm trong màn hình này"
              className="h-9 w-full border border-[#9a9a9a] bg-[#fafafa] px-3 text-xs placeholder:text-[#7a7a7a] focus:border-[#2b2b2b] focus:outline-none"
            />
          </div>

          {/* CONTENT */}
          <main className="flex-1 bg-[#fcfbf8] px-4 py-5 sm:px-6 sm:py-[22px]">{children}</main>
        </div>

        {/* Toast */}
        {toastState && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-5 left-1/2 z-[70] flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white shadow-xl ${
              toastState.tone === "error" ? "bg-rose-600" : "bg-[#2b2b2b]"
            }`}
          >
            {toastState.tone === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            )}
            <span>{toastState.message}</span>
          </div>
        )}
      </div>
    </AdminContext.Provider>
  );
}
