import { pageMetadata } from "@/lib/site";

// Trang riêng của khách: không cho hiện trên Google (noindex)
export const metadata = pageMetadata({
  title: "Đặt mật khẩu mới",
  description: "Đặt mật khẩu mới cho tài khoản Cari Bakehouse.",
  path: "/doi-mat-khau",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
