import Link from "next/link";
import { ChevronRight } from "lucide-react";

const banners = [
  {
    label: "Bánh",
    tagline: "Nướng tươi mỗi ngày",
    href: "/danh-muc/banh",
    bg: "from-[#1B4B5A] to-[#123640]",
    accent: "#F6CE8B",
  },
  {
    label: "Đồ uống",
    tagline: "Sánh đôi cùng bánh ngọt",
    href: "/danh-muc/do-uong",
    bg: "from-[#C97B3D] to-[#A5602A]",
    accent: "#FFF8EF",
  },
];

export default function DualBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.map((b) => (
          <Link
            key={b.label}
            href={b.href}
            className={`group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${b.bg} p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[240px]`}
          >
            {/* Decorative circles */}
            <div className="absolute right-[-30px] top-[-30px] h-44 w-44 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute right-[40px] top-[20px] h-24 w-24 rounded-full bg-white/5" />

            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-widest text-white/60 uppercase">
                {b.tagline}
              </p>
              <h2
                className="font-heading mt-1 text-4xl font-black text-white sm:text-5xl"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}
              >
                {b.label}
              </h2>
              <span
                className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 group-hover:gap-3"
                style={{ background: b.accent, color: "#1B4B5A" }}
              >
                Xem tất cả
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
