import { pageMetadata } from "@/lib/site";

// Tiêu đề / mô tả cho Google (trang dùng "use client" nên khai báo metadata ở layout)
export const metadata = pageMetadata({
  title: "Chương trình tích điểm thành viên",
  description:
    "Tích điểm mỗi lần mua bánh tại Cari Bakehouse và đổi điểm lấy bánh miễn phí. Lên hạng Thân thiết, VIP để nhận giảm giá cùng ưu đãi riêng trong tháng sinh nhật.",
  path: "/tich-diem",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
