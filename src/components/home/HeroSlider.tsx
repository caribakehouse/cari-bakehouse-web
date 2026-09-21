"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/lib/mock-data";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const go = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + heroSlides.length) % heroSlides.length);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning]
  );

  const prev = () => go(current - 1);
  const next = useCallback(() => go(current + 1), [current, go]);

  // Auto-play every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-[#1B4B5A] aspect-[16/8] sm:aspect-[21/8] min-h-[260px] sm:min-h-[420px] lg:min-h-[520px]">
      {/* Slides (Carousel images only, no text overlay) */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
            zIndex: i === current ? 1 : 0,
          }}
        >
          {s.image ? (
            <Image
              src={s.image}
              alt={`Banner slide ${s.id}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${s.bgColor} 0%, ${s.bgColor}cc 60%, ${s.bgColor}88 100%)`,
              }}
            />
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
                i === current
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
