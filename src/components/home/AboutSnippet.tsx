import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutSnippet() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2 columns layout: Left is Image, Right is Text */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Left: Image (on mobile: on top) */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#FCE9C6] shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=900&auto=format&fit=crop&q=80"
              alt="Về Cari Bakehouse — Không gian tiệm bánh thủ công"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Soft decorative badge or corner accent */}
            <div className="absolute bottom-4 left-4 rounded-2xl bg-[#1B4B5A]/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-md">
              Tiệm bánh thủ công từ 2024
            </div>
          </div>

          {/* Right: Text content (left-aligned) */}
          <div className="flex flex-col items-start text-left">
            {/* Decorative line */}
            <div className="mb-4 h-1.5 w-14 rounded-full bg-[#F6CE8B]" />

            <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl lg:text-4xl leading-tight">
              Về Cari Bakehouse
            </h2>

            <p className="mt-5 text-base leading-relaxed text-[#2B2B2B] sm:text-lg sm:leading-loose">
              <em>
                &ldquo;Cari. bắt đầu từ một tình yêu rất đơn giản: thích làm bánh và thích nhìn mọi
                người ăn bánh mình làm. Tụi mình làm bánh với mong muốn mang đến những món ngọt thật
                dễ thương, thật ngon và đủ gần gũi để bạn có thể ghé Cari. bất cứ khi nào muốn tự
                thưởng cho mình một chút.&rdquo;
              </em>
            </p>

            <Link
              href="/gioi-thieu"
              className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#1B4B5A] px-7 py-3 text-sm font-semibold text-[#1B4B5A] transition-all hover:bg-[#1B4B5A] hover:text-white hover:shadow-md"
            >
              <span>Xem thêm</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
