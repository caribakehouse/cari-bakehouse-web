import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Quản trị · Cari Bakehouse",
  robots: { index: false, follow: false },
};

// Khung khu quản trị: sidebar tối bên trái + topbar + vùng nội dung (xem AdminShell).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
