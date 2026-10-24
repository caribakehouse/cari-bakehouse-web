import { pageMetadata } from "@/lib/site";

// Trang riêng của khách: không cho hiện trên Google (noindex)
export const metadata = pageMetadata({
  title: "Quên mật khẩu",
  description: "Lấy lại mật khẩu tài khoản Cari Bakehouse.",
  path: "/quen-mat-khau",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
