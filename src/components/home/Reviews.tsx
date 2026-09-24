"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useHomeContent, useReviews } from "@/lib/db";
import type { Review } from "@/lib/mock-data";

export default function Reviews() {
  // Đánh giá nổi bật do admin chọn ở /admin/noi-dung-trang-chu
  const { featuredReviewIds } = useHomeContent();
  const allReviews = useReviews();
  const reviews = featuredReviewIds
    .map((id) => allReviews.find((r) => r.id === id))
    .filter((r): r is Review => !!r);
  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-[#E5D9C3] bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
            Khách hàng nói gì?
          </h2>
          <p className="mt-2 text-sm text-[#7A7A7A]">
            Hơn 500 đánh giá 5 sao từ khách hàng thân thiết
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#E5D9C3] bg-[#FFF8EF] p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < r.rating ? "fill-[#F6CE8B] text-[#F6CE8B]" : "text-[#E5D9C3]"}`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="flex-1 text-sm leading-relaxed text-[#2B2B2B]">
                &ldquo;{r.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-[#E5D9C3] pt-4">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2B2B2B]">{r.name}</p>
                  <p className="text-xs text-[#7A7A7A]">{r.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
