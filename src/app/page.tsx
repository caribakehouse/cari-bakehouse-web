import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent/20 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5 text-caramel" />
          <span>Bánh ngọt thủ công nướng tươi mỗi ngày</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Chào mừng đến với{" "}
          <span className="relative whitespace-nowrap text-primary-dark">
            <span className="relative">Cari Bakehouse</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
          Nơi hội tụ những chiếc bánh thơm lừng, được làm thủ công bằng tình yêu
          và nguyên liệu tự nhiên tinh túy nhất.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-cream shadow-md transition-all hover:bg-primary-dark hover:shadow-lg"
          >
            <span>Khám phá sản phẩm</span>
            <ArrowRight className="h-4 w-4 text-accent" />
          </Link>
          <Link
            href="/dat-theo-yeu-cau"
            className="inline-flex items-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-text-dark transition-all hover:border-primary hover:bg-accent/15 hover:text-primary"
          >
            Đặt bánh theo yêu cầu
          </Link>
        </div>
      </div>
    </div>
  );
}
