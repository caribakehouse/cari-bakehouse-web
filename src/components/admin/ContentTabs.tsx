"use client";

import Link from "next/link";

type ContentTabKey = "home" | "products" | "about";

// Tab chuyển giữa các màn hình thuộc mục "Nội dung trang"
export default function ContentTabs({ active }: { active: ContentTabKey }) {
  const tab = (href: string, label: string, key: ContentTabKey) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`border-b-2 px-4 py-2.5 text-xs font-bold ${
        active === key ? "border-[#2b2b2b] text-[#2b2b2b]" : "border-transparent text-[#7a7a7a] hover:text-[#2b2b2b]"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-5 flex border-b border-[#d6d6d6]">
      {tab("/admin/noi-dung-trang-chu", "Trang chủ", "home")}
      {tab("/admin/noi-dung-trang-san-pham", "Trang sản phẩm", "products")}
      {tab("/admin/gioi-thieu-chinh-sach", "Giới thiệu & chính sách", "about")}
    </div>
  );
}
