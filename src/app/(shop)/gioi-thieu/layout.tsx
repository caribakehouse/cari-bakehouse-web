import { pageMetadata } from "@/lib/site";

// Tiêu đề / mô tả cho Google (trang dùng "use client" nên khai báo metadata ở layout)
export const metadata = pageMetadata({
  title: "Giới thiệu tiệm bánh & chính sách giao hàng",
  description:
    "Câu chuyện của Cari Bakehouse, tiệm bánh nhỏ ở Tô Vĩnh Diện, Hà Nội, cùng các chính sách cần biết khi mua bánh: giao hàng, đặt trước, đặt cọc, đổi trả và thanh toán.",
  path: "/gioi-thieu",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
