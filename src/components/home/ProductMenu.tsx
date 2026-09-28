"use client";

import Image from "@/components/ui/SafeImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { getProductStatus, useHomeContent, useProductsBySlugs } from "@/lib/db";

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

export default function ProductMenu() {
  const router = useRouter();
  // Thực đơn do admin chọn ở /admin/noi-dung-trang-chu (giá/ảnh/trạng thái lấy từ /admin/san-pham)
  const { menuSlugs } = useHomeContent();
  const menuProducts = useProductsBySlugs(menuSlugs, 8);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading (Only title, no subtitle, no top-right link) */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
            Thực đơn của Cari
          </h2>
        </div>

        {/* Grid 4 cols */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {menuProducts.map((product) => {
            const soldOut = getProductStatus(product) === "soldout";
            return (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image */}
              <Link
                href={`/san-pham/${product.slug}`}
                className="relative block aspect-square w-full overflow-hidden bg-[#FCE9C6]"
              >
                {product.badge && (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-[#1B4B5A] px-2.5 py-0.5 text-[10px] font-bold text-[#F6CE8B]">
                    {product.badge}
                  </span>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="text-[10px] font-semibold tracking-wide text-[#C97B3D] uppercase">
                  {product.category}
                </p>
                <Link href={`/san-pham/${product.slug}`}>
                  <h3 className="font-heading mt-1 text-sm font-bold text-[#2B2B2B] line-clamp-2 leading-snug hover:text-[#1B4B5A] transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Price + Round cart button + "Mua ngay" button */}
                <div className="mt-auto flex flex-col gap-2.5 pt-3 border-t border-[#F5EFE6]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-[#1B4B5A] sm:text-base">
                      {product.sizes?.length ? "Từ " : ""}
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && !product.sizes?.length && (
                      <span className="text-[10px] text-[#7A7A7A] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Existing round cart button */}
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={soldOut}
                      aria-label={`Thêm ${product.name} vào giỏ`}
                      className="disabled:cursor-not-allowed disabled:opacity-40 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#1B4B5A] text-[#F6CE8B] transition-all hover:bg-[#123640] hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>

                    {/* New "Mua ngay" button next to it */}
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product);
                        router.push("/gio-hang");
                      }}
                      disabled={soldOut}
                      className="disabled:cursor-not-allowed disabled:opacity-40 flex-1 flex items-center justify-center rounded-full bg-[#1B4B5A] px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white transition-all hover:bg-[#123640] hover:scale-102 active:scale-95 shadow-sm whitespace-nowrap"
                    >
                      {soldOut ? "Hết hàng" : "Mua ngay"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Centered button "Xem tất cả" at the bottom of the section */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 rounded-full bg-[#1B4B5A] px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-[#123640] hover:shadow-xl hover:scale-105"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
