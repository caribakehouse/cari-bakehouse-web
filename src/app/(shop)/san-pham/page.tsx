"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Cake,
  Coffee,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getProductGroups, Product } from "@/lib/mock-data";

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

type MainCategory = "Bánh" | "Đồ uống";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Đọc query param ?danh-muc=banh hoặc ?danh-muc=do-uong từ URL
  const paramCategory = searchParams.get("danh-muc");
  const initialCategory: MainCategory =
    paramCategory === "do-uong" || paramCategory === "douong"
      ? "Đồ uống"
      : "Bánh";

  const [activeTab, setActiveTab] = useState<MainCategory>(initialCategory);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Đồng bộ khi query param thay đổi (ví dụ khi bấm link điều hướng từ trang khác)
  useEffect(() => {
    const currentParam = searchParams.get("danh-muc");
    if (currentParam === "do-uong" || currentParam === "douong") {
      setActiveTab("Đồ uống");
    } else if (currentParam === "banh") {
      setActiveTab("Bánh");
    }
  }, [searchParams]);

  // Xử lý chuyển tab & cập nhật URL query param
  const handleTabChange = (tab: MainCategory) => {
    setActiveTab(tab);
    const slug = tab === "Bánh" ? "banh" : "do-uong";
    router.replace(`/san-pham?danh-muc=${slug}`, { scroll: false });
  };

  const productGroups = getProductGroups(activeTab);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng! 🛒`);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    showToast(`Đang chuyển đến thanh toán cho "${product.name}"... ✨`);
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF]/50 pb-20">
      {/* Toast thông báo tương tác nhanh */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#1B4B5A] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================
          1. BREADCRUMB & TIÊU ĐỀ TRANG (Bám sát wireframe)
          ============================================================ */}
      <section className="border-b border-[#E5D9C3]/70 bg-white/70 backdrop-blur-xs py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-[#7A7A7A]">
            <Link href="/" className="transition-colors hover:text-[#1B4B5A]">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link href="/san-pham" className="transition-colors hover:text-[#1B4B5A]">
              Sản phẩm
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <b className="font-bold text-[#1B4B5A]">{activeTab}</b>
          </nav>

          {/* Tiêu đề trang & Giới thiệu ngắn */}
          <div className="mt-3 sm:mt-4">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#1B4B5A]">
              Danh mục {activeTab}
            </h1>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-[#7A7A7A] leading-relaxed">
              {activeTab === "Bánh"
                ? "Tất cả các món bánh thủ công tươi mới mỗi ngày từ lò nướng Cari Bakehouse, sử dụng nguyên liệu cao cấp và chuẩn vị ngọt thanh."
                : "Menu thức uống thanh mát, được phối trộn từ trà mộc thảo mộc, trái cây tươi nguyên chất và hạt cà phê Arabica hảo hạng."}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. TAB DANH MỤC LỚN (2 Tab: "Bánh" & "Đồ uống" — Bám sát Wireframe)
          ============================================================ */}
      <section className="py-7 sm:py-9">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center gap-4 sm:gap-6">
            {/* Tab: Bánh */}
            <button
              type="button"
              onClick={() => handleTabChange("Bánh")}
              className={`group flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl px-6 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "Bánh"
                  ? "bg-[#1B4B5A] text-white shadow-lg shadow-[#1B4B5A]/20 scale-102 ring-2 ring-[#1B4B5A]"
                  : "bg-white text-[#5B5B5B] border border-[#E5D9C3] hover:border-[#1B4B5A]/40 hover:bg-[#FFF8EF] hover:text-[#1B4B5A]"
              }`}
              style={{ width: "220px", maxWidth: "48%" }}
            >
              <Cake className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === "Bánh" ? "text-[#F6CE8B]" : "text-[#C97B3D]"}`} />
              <span>Bánh</span>
            </button>

            {/* Tab: Đồ uống */}
            <button
              type="button"
              onClick={() => handleTabChange("Đồ uống")}
              className={`group flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl px-6 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "Đồ uống"
                  ? "bg-[#1B4B5A] text-white shadow-lg shadow-[#1B4B5A]/20 scale-102 ring-2 ring-[#1B4B5A]"
                  : "bg-white text-[#5B5B5B] border border-[#E5D9C3] hover:border-[#1B4B5A]/40 hover:bg-[#FFF8EF] hover:text-[#1B4B5A]"
              }`}
              style={{ width: "220px", maxWidth: "48%" }}
            >
              <Coffee className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === "Đồ uống" ? "text-[#F6CE8B]" : "text-[#C97B3D]"}`} />
              <span>Đồ uống</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. CÁC NHÓM SẢN PHẨM (Mỗi nhóm: Tiêu đề canh giữa + Lưới 3 cột)
          ============================================================ */}
      <div className="space-y-12 sm:space-y-16">
        {productGroups.map((group, groupIdx) => (
          <section key={group.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Tiêu đề nhóm canh giữa */}
            <div className="mb-6 sm:mb-8 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE9C6] px-3 py-1 text-[11px] font-bold text-[#1B4B5A] uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3 text-[#C97B3D]" />
                Nhóm {groupIdx + 1}
              </div>

              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black text-[#1B4B5A] tracking-tight">
                {group.title}
              </h2>

              {/* Gạch chỉ trang trí dưới tiêu đề nhóm */}
              <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-[#F6CE8B]" />

              {group.description && (
                <p className="mt-2 text-xs sm:text-sm text-[#7A7A7A] max-w-xl mx-auto">
                  {group.description}
                </p>
              )}
            </div>

            {/* Lưới sản phẩm: 3 cột desktop, 2 cột tablet, 1 cột mobile */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {group.products.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-[#E5D9C3]/70 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#1B4B5A]/20"
                >
                  {/* Ảnh sản phẩm + Badge */}
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden bg-[#FCE9C6] block"
                  >
                    {product.badge && (
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1B4B5A] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#F6CE8B] shadow-sm">
                        {product.badge}
                      </span>
                    )}

                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </Link>

                  {/* Thông tin sản phẩm */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#C97B3D]">
                      {product.subcategory || product.category}
                    </p>

                    <Link href={`/san-pham/${product.slug}`} className="mt-1">
                      <h3 className="font-heading text-base sm:text-lg font-bold text-[#2B2B2B] line-clamp-1 transition-colors group-hover:text-[#1B4B5A]">
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="mt-1 text-xs text-[#7A7A7A] line-clamp-2 leading-relaxed min-h-[32px]">
                        {product.description}
                      </p>
                    )}

                    {/* Đánh giá sao */}
                    <div className="mt-2.5 flex items-center gap-1">
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

                    {/* Giá tiền */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-heading text-lg font-black text-[#1B4B5A]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-[#7A7A7A] line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* 2 Nút: "Đặt ngay" (solid) và "Thêm vào giỏ" (outline) đồng bộ TopOrder & Thực đơn */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#F5EFE6]">
                      {/* Nút Đặt ngay (Mua ngay - Solid) */}
                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(e, product)}
                        className="flex-1 flex items-center justify-center rounded-full bg-[#1B4B5A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#123640] hover:shadow-md active:scale-95 cursor-pointer"
                      >
                        <span>Đặt ngay</span>
                      </button>

                      {/* Nút Thêm vào giỏ (Outline) */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        aria-label={`Thêm ${product.name} vào giỏ`}
                        className="flex items-center justify-center gap-1.5 rounded-full border border-[#1B4B5A] px-3.5 py-2.5 text-xs font-semibold text-[#1B4B5A] transition-all hover:bg-[#1B4B5A]/10 active:scale-95 cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Thêm vào giỏ</span>
                        <span className="sm:hidden">Giỏ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B4B5A] border-t-transparent" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
