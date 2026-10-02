import { pageMetadata } from "@/lib/site";

// Trang riêng của khách: không cho hiện trên Google (noindex)
export const metadata = pageMetadata({
  title: "Đăng nhập",
  description: "Đăng nhập tài khoản Cari Bakehouse.",
  path: "/dang-nhap",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
