"use client";

import Image from "@/components/ui/SafeImage";
import { useHomeContent } from "@/lib/db";

export default function Gallery() {
  // Ảnh gallery do admin chỉnh ở /admin/noi-dung-trang-chu
  const { gallery: galleryItems } = useHomeContent();
  if (galleryItems.length === 0) return null;

  return (
    <section className="bg-[#FFF8EF] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
            Góc ảnh Cari
          </h2>
          <p className="mt-2 text-sm text-[#7A7A7A]">
            Không gian &amp; những chiếc bánh được yêu thích
          </p>
        </div>

        {/* Masonry-like grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {galleryItems.map((item, i) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-xl bg-[#E5D9C3] shadow-sm transition-all duration-300 hover:shadow-md ${
                // Make first item span 2 cols on sm+
                i === 0 ? "col-span-2 sm:col-span-1 aspect-square" : "aspect-square"
              }`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-[#1B4B5A]/0 transition-colors duration-300 group-hover:bg-[#1B4B5A]/30" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
