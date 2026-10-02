import { pageMetadata } from "@/lib/site";

// Trang riêng của khách: không cho hiện trên Google (noindex)
export const metadata = pageMetadata({
  title: "Đặt hàng",
  description: "Hoàn tất đơn đặt bánh tại Cari Bakehouse.",
  path: "/dat-hang",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
