import { pageMetadata } from "@/lib/site";

// Tiêu đề / mô tả cho Google (trang dùng "use client" nên khai báo metadata ở layout)
export const metadata = pageMetadata({
  title: "Đặt bánh sinh nhật theo yêu cầu tại Hà Nội",
  description:
    "Cari Bakehouse nhận làm bánh sinh nhật, bánh kỷ niệm và bánh sự kiện theo yêu cầu: chọn vị, kích cỡ, cách trang trí. Gửi ý tưởng online, tiệm báo giá và xác nhận.",
  path: "/dat-theo-yeu-cau",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
