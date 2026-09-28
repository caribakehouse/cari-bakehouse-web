"use client";

import Image from "@/components/ui/SafeImage";
import { Star } from "lucide-react";
import { useHomeContent, useReviews } from "@/lib/db";
import type { Review } from "@/lib/mock-data";

/** Chữ cái đầu của 2 từ cuối trong tên, vd "Nguyễn Minh Thư" → "MT" (khi đánh giá không có ảnh đại diện) */
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Reviews() {
  // Đánh giá nổi bật do admin chọn ở /admin/noi-dung-trang-chu
  const { featuredReviewIds, reviewsTitle, reviewsSubtitle } = useHomeContent();
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
          <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">{reviewsTitle}</h2>
          {reviewsSubtitle && <p className="mt-2 text-sm text-[#7A7A7A]">{reviewsSubtitle}</p>}
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-5">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex w-full flex-col gap-4 rounded-2xl border border-[#E5D9C3] bg-[#FFF8EF] p-6 shadow-sm transition-all hover:shadow-md sm:w-[calc((100%-2.5rem)/3)]"
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
              <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-[#2B2B2B]">
                &ldquo;{r.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-[#E5D9C3] pt-4">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F6CE8B] text-sm font-black text-[#1B4B5A]">
                  {r.avatar ? (
                    <Image src={r.avatar} alt={r.name} fill className="object-cover" sizes="40px" />
                  ) : (
                    initials(r.name)
                  )}
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
