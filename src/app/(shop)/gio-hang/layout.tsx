import { pageMetadata } from "@/lib/site";

// Trang riêng của khách: không cho hiện trên Google (noindex)
export const metadata = pageMetadata({
  title: "Giỏ hàng",
  description: "Giỏ hàng của bạn tại Cari Bakehouse.",
  path: "/gio-hang",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
