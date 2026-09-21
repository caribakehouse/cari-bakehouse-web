"use client";

import Image from "@/components/ui/SafeImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Trophy, ShoppingBag } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { getProductStatus, useHomeContent, useProductsBySlugs } from "@/lib/db";

const rankColors = [
  { bg: "bg-[#F6CE8B]", text: "text-[#1B4B5A]", border: "border-[#F6CE8B]" },
  { bg: "bg-[#E5D9C3]", text: "text-[#2B2B2B]", border: "border-[#E5D9C3]" },
  { bg: "bg-[#C97B3D]/20", text: "text-[#C97B3D]", border: "border-[#C97B3D]/40" },
];

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

export default function TopOrder() {
  const router = useRouter();
  // Sản phẩm nổi bật do admin chọn ở /admin/noi-dung-trang-chu (giá/ảnh/trạng thái lấy từ /admin/san-pham)
  const { topOrderSlugs } = useHomeContent();
  const topProducts = useProductsBySlugs(topOrderSlugs);
  if (topProducts.length === 0) return null;

  return (
    <section className="bg-[#FFF8EF] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-[#C97B3D]" />
          <div>
            <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
              Top Order
            </h2>
            <p className="text-sm text-[#7A7A7A]">Được yêu thích &amp; đặt nhiều nhất tuần này</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {topProducts.map((product, i) => {
            const rank = rankColors[Math.min(i, rankColors.length - 1)];
            const soldOut = getProductStatus(product) === "soldout";
            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Rank badge */}
                <div
                  className={`absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 font-heading text-sm font-black shadow-md ${rank.bg} ${rank.text} ${rank.border}`}
                >
                  {i + 1}
                </div>

                {/* Product image link */}
                <Link
                  href={`/san-pham/${product.slug}`}
                  className="relative aspect-square w-full overflow-hidden bg-[#FCE9C6]"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    priority={i === 0}
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-semibold text-[#C97B3D] uppercase tracking-wide">
                    {product.category}
                  </p>
                  <Link href={`/san-pham/${product.slug}`}>
                    <h3 className="font-heading mt-1 text-base font-bold text-[#2B2B2B] line-clamp-2 hover:text-[#1B4B5A] transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Stars */}
                  <div className="mt-1.5 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-3.5 w-3.5 ${
                          j < product.rating
                            ? "fill-[#F6CE8B] text-[#F6CE8B]"
                            : "text-[#E5D9C3]"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-[#7A7A7A]">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-heading text-lg font-black text-[#1B4B5A]">
                      {product.sizes?.length ? "Từ " : ""}
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && !product.sizes?.length && (
                      <span className="text-xs text-[#7A7A7A] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* 2 Buttons side-by-side: "Giỏ hàng" and "Mua ngay" */}
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#F5EFE6]">
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={soldOut}
                      aria-label={`Thêm ${product.name} vào giỏ hàng`}
                      className="flex items-center justify-center gap-1.5 rounded-full border border-[#1B4B5A] px-3.5 py-2 text-xs font-semibold text-[#1B4B5A] transition-all hover:bg-[#1B4B5A]/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Giỏ hàng</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product);
                        router.push("/gio-hang");
                      }}
                      disabled={soldOut}
                      className="flex-1 flex items-center justify-center rounded-full bg-[#1B4B5A] px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#123640] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span>{soldOut ? "Hết hàng" : "Mua ngay"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
