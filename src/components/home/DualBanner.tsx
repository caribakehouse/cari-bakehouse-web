"use client";

import Link from "next/link";
import Image from "@/components/ui/SafeImage";
import { useHomeContent } from "@/lib/db";

// Màu phủ gradient theo thứ tự banner (giữ nguyên thiết kế gốc)
const GRADIENTS = [
  "from-[#1B4B5A]/85 via-[#1B4B5A]/70 to-[#123640]/90",
  "from-[#C97B3D]/85 via-[#C97B3D]/70 to-[#8C4A18]/90",
];

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
            className="group relative flex min-h-[180px] sm:min-h-[220px] items-center justify-center overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl"
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
              className={`absolute inset-0 bg-gradient-to-tr ${GRADIENTS[i % GRADIENTS.length]} transition-opacity duration-300 group-hover:opacity-90`}
            />

            {/* Title only (no description, no button) */}
            <div className="relative z-10 text-center px-4">
              <h2 className="font-heading text-4xl sm:text-5xl font-black text-white tracking-wide drop-shadow-md transition-transform duration-300 group-hover:scale-105">
                {b.label}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
