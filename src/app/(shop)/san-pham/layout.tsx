import { pageMetadata } from "@/lib/site";

// Tiêu đề / mô tả cho Google (trang dùng "use client" nên khai báo metadata ở layout)
export const metadata = pageMetadata({
  title: "Thực đơn cheesecake, brownies & đồ uống",
  description:
    "Thực đơn bánh thủ công của Cari Bakehouse: cheesecake nhiều vị, brownies và đồ uống matcha, cacao. Chọn cỡ bánh, đặt online và nhận giao tận nơi trong Hà Nội.",
  path: "/san-pham",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
