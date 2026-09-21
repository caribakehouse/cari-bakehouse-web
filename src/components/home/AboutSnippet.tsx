import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutSnippet() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        {/* Decorative line */}
        <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-[#F6CE8B]" />

        <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
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
          className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#1B4B5A] px-7 py-3 text-sm font-semibold text-[#1B4B5A] transition-all hover:bg-[#1B4B5A] hover:text-white"
        >
          Xem thêm <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
