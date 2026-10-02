import { pageMetadata } from "@/lib/site";

// Trang riêng của khách: không cho hiện trên Google (noindex)
export const metadata = pageMetadata({
  title: "Tài khoản",
  description: "Tài khoản thành viên Cari Bakehouse.",
  path: "/tai-khoan",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
