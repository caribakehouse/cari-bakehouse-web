"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Check,
  Sparkles,
} from "lucide-react";
import { getProductGroups, Product } from "@/lib/mock-data";
import RibbonIcon from "@/components/ui/RibbonIcon";

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

type MainCategory = "Bánh" | "Đồ uống";

// ─── Badge huy hiệu con dấu răng cưa (tái sử dụng phong cách Hero Slider) ───
interface SealBadgeProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function SealBadge({ label, active, onClick }: SealBadgeProps) {
  // SVG path con dấu răng cưa 12 đỉnh, đối xứng hoàn hảo trên viewBox 220x220
  const teeth = 12;
  const outerR = 96;
  const innerR = 80;
  const cx = 110;
  const cy = 110;
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (Math.PI * i) / teeth - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  const polygonPoints = points.join(" ");

  const bgFill = active ? "#1B4B5A" : "#EDE0C8";
  const textColor = active ? "#F6CE8B" : "#1B4B5A";
  const strokeColor = active ? "#F6CE8B" : "#C97B3D";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Xem danh mục ${label}`}
      className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 select-none focus:outline-none ${
        active
          ? "scale-105 drop-shadow-[0_10px_20px_rgba(27,75,90,0.25)]"
          : "scale-100 opacity-85 hover:opacity-100 hover:scale-103 drop-shadow-md"
      }`}
      style={{ width: "150px" }}
    >
      {/* 1. Lớp nền: Con dấu răng cưa */}
      <svg
        width="145"
        height="145"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Bóng đổ khi active */}
        {active && (
          <polygon
            points={polygonPoints}
            fill="#1B4B5A"
            opacity="0.22"
            transform="translate(3, 5)"
          />
        )}

        {/* Thân badge răng cưa */}
        <polygon
          points={polygonPoints}
          fill={bgFill}
          stroke={strokeColor}
          strokeWidth={active ? "3.5" : "2.5"}
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Vòng trang trí chấm gạch bên trong badge */}
        <circle
          cx={cx}
          cy={cy}
          r="72"
          fill="none"
          stroke={active ? "#F6CE8B" : "#C97B3D"}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.6"
        />

        {/* Chữ tên danh mục — CĂN GIỮA HOÀN HẢO CẢ CHIỀU NGANG VÀ CHIỀU DỌC TRONG VÒNG TRÒN CHẤM */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-heading), Lato, sans-serif"
          fontWeight="900"
          fontSize="20"
          letterSpacing="1.5"
          fill={textColor}
          className="select-none uppercase transition-all duration-300"
        >
          {label.toUpperCase()}
        </text>
      </svg>

      {/* 2. Lớp nơ ruy băng — Giữ nguyên kích thước (96px), 
          dịch chuyển lên cao hơn, tiến sát ngay dưới chữ BÁNH/ĐỒ UỐNG mà không đè/che lên chữ */}
      <div className="absolute top-[66px] sm:top-[67px] left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-105">
        <RibbonIcon
          width={96}
          height={96}
          className="w-[92px] h-[92px] sm:w-[96px] sm:h-[96px]"
        />
      </div>
    </button>
  );
}

// ─── Nội dung chính ──────────────────────────────────────────────────────────
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

  // Đồng bộ khi query param thay đổi (khi bấm link từ trang khác điều hướng sang)
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
          CHỌN DANH MỤC: BADGE CON DẤU RĂNG CƯA & NƠ RUY BĂNG
          ============================================================ */}
      <section className="pt-8 pb-10 sm:pt-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Nhãn hướng dẫn nhỏ phía trên */}
          <p className="text-center text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#C97B3D]/80 mb-5">
            Chọn danh mục
          </p>
          <div className="flex justify-center items-end gap-10 sm:gap-16">
            <SealBadge
              label="Bánh"
              active={activeTab === "Bánh"}
              onClick={() => handleTabChange("Bánh")}
            />
            <SealBadge
              label="Đồ uống"
              active={activeTab === "Đồ uống"}
              onClick={() => handleTabChange("Đồ uống")}
            />
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

                    {/* 2 Nút: "Đặt ngay" (solid) và "Thêm vào giỏ" (outline) */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#F5EFE6]">
                      {/* Nút Đặt ngay */}
                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(e, product)}
                        className="flex-1 flex items-center justify-center rounded-full bg-[#1B4B5A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#123640] hover:shadow-md active:scale-95 cursor-pointer"
                      >
                        <span>Đặt ngay</span>
                      </button>

                      {/* Nút Thêm vào giỏ */}
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
