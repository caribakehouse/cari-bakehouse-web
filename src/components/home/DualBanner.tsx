"use client";

import Link from "next/link";
import Image from "@/components/ui/SafeImage";
import { useHomeContent } from "@/lib/db";

// Lớp phủ trắng mờ cho nền sáng (ảnh vẫn hiện rõ phía sau); chữ màu xanh thương hiệu
const OVERLAY = "from-white/60 via-white/40 to-[#FFF8EF]/60";

export default function DualBanner() {
  // Banner đôi Bánh / Đồ uống do admin chỉnh ở /admin/noi-dung-trang-chu
  const { banners } = useHomeContent();

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 pb-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.map((b, i) => (
          <Link
            key={`${b.label}-${i}`}
            href={b.href}
            className="group relative flex min-h-[180px] sm:min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-[#E5D9C3] shadow-md transition-all duration-300 hover:shadow-xl"
          >
            {/* Background Image with hover zoom & brightness effect */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={b.image}
                alt={b.label}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-108 group-hover:brightness-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>

            {/* Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${OVERLAY} transition-opacity duration-300 group-hover:opacity-85`}
            />

            {/* Title only (no description, no button) */}
            <div className="relative z-10 text-center px-4">
              <h2
                className={`font-heading text-4xl sm:text-5xl font-black text-[#1B4B5A] tracking-wide [text-shadow:0_1px_12px_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover:scale-105`}
              >
                {b.label}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
