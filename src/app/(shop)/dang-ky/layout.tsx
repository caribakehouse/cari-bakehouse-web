import { pageMetadata } from "@/lib/site";

// Trang riêng của khách: không cho hiện trên Google (noindex)
export const metadata = pageMetadata({
  title: "Đăng ký",
  description: "Tạo tài khoản Cari Bakehouse để tích điểm.",
  path: "/dang-ky",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
