"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, ArrowRight } from "lucide-react";
import { menuProducts } from "@/lib/mock-data";

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

export default function ProductMenu() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
              Thực đơn của Cari
            </h2>
            <p className="mt-1 text-sm text-[#7A7A7A]">Tất cả món đều làm tươi theo đơn</p>
          </div>
          <Link
            href="/san-pham"
            className="hidden items-center gap-1 text-sm font-semibold text-[#1B4B5A] hover:text-[#C97B3D] sm:flex"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid 4 cols */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {menuProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image */}
              <Link href={`/san-pham/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-[#FCE9C6]">
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
                  <h3 className="font-heading mt-1 text-sm font-bold text-[#2B2B2B] line-clamp-2 leading-snug hover:text-[#1B4B5A]">
                    {product.name}
                  </h3>
                </Link>

                {/* Stars */}
                <div className="mt-1.5 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-3 w-3 ${j < product.rating ? "fill-[#F6CE8B] text-[#F6CE8B]" : "text-[#E5D9C3]"}`}
                    />
                  ))}
                  <span className="ml-1 text-[10px] text-[#7A7A7A]">({product.reviews})</span>
                </div>

                {/* Price + Cart button */}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div>
                    <span className="font-heading text-sm font-black text-[#1B4B5A] sm:text-base">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-1 text-[10px] text-[#7A7A7A] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    aria-label={`Thêm ${product.name} vào giỏ`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4B5A] text-[#F6CE8B] transition-all hover:bg-[#123640] hover:scale-110 sm:h-9 sm:w-9"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/san-pham"
            className="flex items-center gap-2 rounded-full border border-[#1B4B5A] px-6 py-2.5 text-sm font-semibold text-[#1B4B5A] hover:bg-[#1B4B5A] hover:text-white transition-colors"
          >
            Xem tất cả sản phẩm <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
