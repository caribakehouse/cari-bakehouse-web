import Link from "next/link";
import { ChevronRight, CakeSlice } from "lucide-react";

export default function CustomOrderBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B4B5A] via-[#1B4B5A] to-[#123640] px-8 py-10 shadow-lg sm:px-12 sm:py-14">
        {/* Decorative */}
        <div className="absolute right-[-40px] top-[-40px] h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute right-[60px] bottom-[-30px] h-40 w-40 rounded-full bg-[#F6CE8B]/10" />

        <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Burnt Cheesecake line-art icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F6CE8B]/20 sm:h-16 sm:w-16">
              <CakeSlice className="h-7 w-7 text-[#F6CE8B] sm:h-8 sm:w-8" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#F6CE8B]/70 uppercase">
                Thiết kế theo ý bạn
              </p>
              <h2 className="font-heading mt-1 text-2xl font-black text-white sm:text-3xl">
                Đặt bánh theo yêu cầu
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-white/70">
                Sinh nhật, lễ kỷ niệm hay sự kiện đặc biệt, Cari sẽ tạo ra chiếc bánh hoàn toàn là của bạn.
              </p>
            </div>
          </div>

          <Link
            href="/dat-theo-yeu-cau"
            className="inline-flex items-center gap-2 rounded-full bg-[#F6CE8B] px-7 py-3.5 text-sm font-bold text-[#1B4B5A] shadow-md transition-all hover:bg-white hover:shadow-lg hover:scale-105 whitespace-nowrap"
          >
            Đặt ngay
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
