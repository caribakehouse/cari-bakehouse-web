import { pageMetadata } from "@/lib/site";

// Tiêu đề / mô tả cho Google (trang dùng "use client" nên khai báo metadata ở layout)
export const metadata = pageMetadata({
  title: "Liên hệ & địa chỉ tiệm bánh",
  description:
    "Cari Bakehouse ở Số 34, ngõ 40, Tô Vĩnh Diện, Hà Nội, mở cửa 10:00 – 24:00. Gọi hotline, nhắn Zalo hoặc Facebook để đặt bánh, hỏi giá và nhận tư vấn.",
  path: "/lien-he",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
