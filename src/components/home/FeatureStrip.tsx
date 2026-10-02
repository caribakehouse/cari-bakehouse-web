"use client";

import Link from "next/link";
import { useHomeContent } from "@/lib/db";
import { FEATURE_DEFAULT_HREFS } from "@/types/content";
import RibbonIcon from "@/components/ui/RibbonIcon";


export default function FeatureStrip() {
  // 3 ô tính năng do admin chỉnh ở /admin/noi-dung-trang-chu
  const { features: giftBoxes } = useHomeContent();

  return (
    <section className="relative z-20 -mt-8 sm:-mt-16 lg:-mt-18 px-4">
      <div className="mx-auto max-w-5xl">
        {/* 3 hộp quà: kích thước bằng nhau, khoảng cách đều — điện thoại thu nhỏ để cả 3 hộp nằm vừa một hàng */}
        <div className="mx-auto grid max-w-[844px] grid-cols-3 justify-items-center gap-2.5 sm:gap-6 lg:gap-8 pt-9 sm:pt-14 pb-6 sm:pb-7 sm:px-2">
          {giftBoxes.map((box, i) => (
            <Link
              key={box.id}
              href={box.href || FEATURE_DEFAULT_HREFS[i] || "/"}
              aria-label={box.title}
              className="group relative flex w-full sm:max-w-[260px] h-[64px] sm:h-[108px] flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#225564] to-[#153D4A] shadow-xl border border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            >
              {/* Dải ruy băng dọc nhẹ trên thân hộp quà */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 sm:w-5 bg-gradient-to-b from-[#F6CE8B]/25 to-[#F6CE8B]/10 pointer-events-none" />

              {/* Nơ SVG bất đối xứng tự nhiên đè lên cạnh trên của hộp quà (điện thoại 76px, máy tính 130-140px) */}
              <div className="absolute -top-[29px] sm:-top-[54px] left-1/2 -translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-105 pointer-events-none drop-shadow-md">
                <RibbonIcon
                  width={135}
                  height={135}
                  className="w-[76px] h-[76px] sm:w-[140px] sm:h-[140px]"
                />
              </div>

              {/* Pill nhỏ nền kem-vàng nhạt (#FCE9C6) đè lên cạnh dưới của khối tối */}
              <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 z-10 w-[96%] sm:w-auto sm:whitespace-nowrap shadow-md rounded-full bg-[#FCE9C6] px-1.5 py-1 sm:px-5 sm:py-2 border border-[#F6CE8B]/70 transition-transform duration-300 group-hover:scale-102">
                <span className="font-heading text-[10px] leading-tight sm:text-sm sm:leading-normal font-bold text-[#1B4B5A] sm:tracking-wide block text-center">
                  {box.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
