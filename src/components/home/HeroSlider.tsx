"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "@/components/ui/SafeImage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useHomeContent } from "@/lib/db";

export default function HeroSlider() {
  // Nội dung slider do admin chỉnh ở /admin/noi-dung-trang-chu
  const { heroSlides } = useHomeContent();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const go = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + heroSlides.length) % heroSlides.length);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, heroSlides.length]
  );

  const prev = () => go(current - 1);
  const next = useCallback(() => go(current + 1), [current, go]);

  // Auto-play every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (heroSlides.length === 0) return null;
  // Nếu admin xóa bớt slide thì vị trí hiện tại có thể vượt quá số slide
  const activeIndex = current % heroSlides.length;

  return (
    <section className="relative w-full overflow-hidden bg-[#1B4B5A] aspect-[16/8] sm:aspect-[21/8] min-h-[260px] sm:min-h-[420px] lg:min-h-[520px]">
      {/* Slides (Carousel images only, no text overlay) */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            pointerEvents: i === activeIndex ? "auto" : "none",
            zIndex: i === activeIndex ? 1 : 0,
          }}
        >
          {s.image ? (
            <Image
              src={s.image}
              alt={s.title || `Banner slide ${s.id}`}
              fill
              priority={i === 0}
              quality={90}
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: "linear-gradient(135deg, #1B4B5A 0%, #1B4B5Acc 60%, #1B4B5A88 100%)" }}
            />
          )}

          {/* Chữ + nút CTA đè lên ảnh (chỉ khi admin bật "Hiện chữ trên ảnh") */}
          {s.showText && (s.title || s.ctaLabel) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/25 px-6 text-center">
              {s.title && (
                <h2 className="font-heading text-3xl font-black text-white drop-shadow-md sm:text-5xl">{s.title}</h2>
              )}
              {s.ctaLabel && s.ctaHref && (
                <Link
                  href={s.ctaHref}
                  className="rounded-full bg-[#F6CE8B] px-7 py-3 text-sm font-bold text-[#1B4B5A] shadow-md transition-all hover:bg-white"
                >
                  {s.ctaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Arrow buttons (prev / next) */}
      <button
        onClick={prev}
        aria-label="Slide trước"
        className="absolute left-3 sm:left-6 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/50 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={next}
        aria-label="Slide tiếp theo"
        className="absolute right-3 sm:right-6 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/50 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Small dot navigation */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Đến ảnh thứ ${i + 1}`}
            className="p-1 transition-all duration-300"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 h-2 bg-[#F6CE8B] shadow-md"
                  : "w-2 h-2 bg-white/70 hover:bg-white"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
