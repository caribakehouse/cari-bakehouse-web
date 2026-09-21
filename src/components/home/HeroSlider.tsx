"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroSlides[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: "480px" }}>
      {/* Slides */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 flex items-center transition-opacity duration-700"
          style={{
            background: `linear-gradient(135deg, ${s.bgColor} 0%, ${s.bgColor}cc 60%, ${s.bgColor}88 100%)`,
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* Decorative circles */}
          <div className="absolute right-[-80px] top-[-80px] h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute right-[80px] bottom-[-60px] h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute left-[-40px] bottom-[-40px] h-48 w-48 rounded-full bg-white/5" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
            <div className="max-w-xl">
              {/* Tagline */}
              <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-semibold tracking-widest text-white/90 uppercase backdrop-blur-sm">
                {s.tagline}
              </span>

              {/* Title */}
              <h1 className="font-heading mt-3 whitespace-pre-line text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                {s.title}
              </h1>

              {/* Subtitle */}
              <p className="mt-4 whitespace-pre-line text-base text-white/75 sm:text-lg">
                {s.subtitle}
              </p>

              {/* CTA */}
              <Link
                href={s.ctaHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F6CE8B] px-8 py-3.5 text-sm font-bold text-[#1B4B5A] shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105"
              >
                {s.ctaLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Arrow buttons */}
      <button
        onClick={prev}
        aria-label="Slide trước"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 sm:left-5 sm:h-12 sm:w-12"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Slide tiếp"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 sm:right-5 sm:h-12 sm:w-12"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Đến slide ${i + 1}`}
            className="transition-all duration-300"
          >
            <span
              className={`block rounded-full bg-white transition-all duration-300 ${
                i === current ? "w-6 h-2.5 opacity-100" : "w-2.5 h-2.5 opacity-50"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
