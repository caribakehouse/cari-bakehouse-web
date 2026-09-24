"use client";

import Link from "next/link";
import Image from "@/components/ui/SafeImage";
import { useHomeContent } from "@/lib/db";

// Lớp phủ trắng mờ cho nền sáng (ảnh vẫn hiện rõ phía sau); chữ màu xanh thương hiệu — chỉ dùng khi bật "Hiện tiêu đề"
const OVERLAY = "from-white/60 via-white/40 to-[#FFF8EF]/60";

export default function DualBanner() {
  // Banner đôi Bánh / Đồ uống do admin chỉnh ở /admin/noi-dung-trang-chu.
  // Khung luôn giữ tỉ lệ 1200 × 440 nên ảnh admin tự thiết kế hiện trọn vẹn, không bị cắt mép trên mọi màn hình.
  const { banners } = useHomeContent();

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 pb-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.map((b, i) => (
          <Link
            key={`${b.label}-${i}`}
            href={b.href}
            aria-label={b.label}
            className="group relative flex aspect-[30/11] items-center justify-center overflow-hidden rounded-2xl border border-[#E5D9C3] shadow-md transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={b.image}
                alt={b.label}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>

            {b.showText && (
              <>
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${OVERLAY} transition-opacity duration-300 group-hover:opacity-85`}
                />
                <div className="relative z-10 px-4 text-center">
                  <h2 className="font-heading text-4xl font-black tracking-wide text-[#1B4B5A] [text-shadow:0_1px_12px_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover:scale-105 sm:text-5xl">
                    {b.label}
                  </h2>
                </div>
              </>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
