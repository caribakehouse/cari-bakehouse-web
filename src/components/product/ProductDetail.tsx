"use client";

// Trang chi tiết sản phẩm (/san-pham/<slug>): ảnh lớn, chọn kích cỡ kèm giá từng cỡ, tùy chọn thêm
// (sốt, loại sữa, % đường...), số lượng,
// thêm vào giỏ / đặt ngay, và các sản phẩm cùng nhóm.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Gift, Minus, Plus, ShoppingBag, Sparkles, Truck } from "lucide-react";
import Image from "@/components/ui/SafeImage";
import { useAuth } from "@/lib/auth";
import { MAX_ITEM_QUANTITY, addToCart } from "@/lib/cart";
import {
  defaultSize,
  getProductStatus,
  pointsForOrder,
  priceForSize,
  unitPriceFor,
  useLoyaltyConfig,
  useProducts,
  useProductsPageContent,
} from "@/lib/db";
import { formatVND } from "@/lib/utils";

export default function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const products = useProducts();
  const { groups } = useProductsPageContent();
  const loyalty = useLoyaltyConfig();

  const product = products.find((p) => p.slug === slug);
  const status = product ? getProductStatus(product) : "hidden";
  const group = groups.find((g) => g.id === product?.subcategory);

  const [size, setSize] = useState<string | undefined>(() => (product ? defaultSize(product) : undefined));
  const [quantity, setQuantity] = useState(1);
  // Tùy chọn khách đã bấm chọn: tên nhóm → lựa chọn
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const related = useMemo(
    () =>
      product
        ? products
            .filter((p) => p.id !== product.id && p.subcategory === product.subcategory && getProductStatus(p) !== "hidden")
            .slice(0, 4)
        : [],
    [products, product],
  );

  // Không có sản phẩm, hoặc sản phẩm đang ẩn (chỉ admin mới xem trước được)
  if (!product || (status === "hidden" && !isAdmin)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-2xl font-black text-[#1B4B5A]">Không tìm thấy sản phẩm</h1>
        <p className="text-sm text-text-muted">Sản phẩm này không còn bán hoặc đường dẫn chưa đúng.</p>
        <Link href="/san-pham" className="rounded-full bg-[#1B4B5A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#123640]">
          Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  const hasSizes = !!product.sizes && product.sizes.length > 0;
  // Chỉ một cỡ (admin nhập kèm kích thước) → hiện thông tin kích thước, không cần ô chọn
  const canChooseSize = hasSizes && product.sizes!.length > 1;
  const singleSize = hasSizes && !canChooseSize ? product.sizes![0] : undefined;
  // Cỡ đang chọn phải còn trong danh sách (admin có thể vừa đổi tên / xóa cỡ)
  const selectedSize = hasSizes && product.sizes!.some((s) => s.label === size) ? size : defaultSize(product);
  // Tùy chọn hiệu lực: lựa chọn khách bấm (nếu vẫn còn) hoặc lựa chọn đầu tiên của mỗi nhóm
  const optionGroups = (product.options ?? []).filter((g) => g.choices.length > 0);
  const chosen: Record<string, string> = Object.fromEntries(
    optionGroups.map((g) => [
      g.name,
      g.choices.some((c) => c.label === picked[g.name]) ? picked[g.name] : g.choices[0].label,
    ]),
  );
  const chosenOptions = optionGroups.length > 0 ? chosen : undefined;
  const sizePrice = priceForSize(product, selectedSize);
  const unitPrice = unitPriceFor(product, selectedSize, chosenOptions);
  // Giá trước giảm gắn với cỡ gốc (cỡ đầu tiên) hoặc sản phẩm chỉ một cỡ
  const showOriginal =
    !!product.originalPrice && (!hasSizes || selectedSize === product.sizes![0].label) && product.originalPrice > sizePrice;
  const soldOut = status === "soldout";
  const categorySlug = product.category === "Đồ uống" ? "do-uong" : "banh";

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = () => {
    addToCart(product, quantity, selectedSize, chosenOptions);
    showToast(`Đã thêm ${quantity} × "${product.name}"${selectedSize ? ` (${selectedSize})` : ""} vào giỏ 🛒`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, chosenOptions);
    router.push("/gio-hang");
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF]/50 pb-20">
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1B4B5A] px-5 py-2.5 text-xs font-semibold text-white shadow-xl sm:text-sm"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Đường dẫn */}
        <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
          <Link href="/" className="hover:text-[#1B4B5A]">
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/san-pham?danh-muc=${categorySlug}`} className="hover:text-[#1B4B5A]">
            {product.category}
          </Link>
          {group && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{group.title}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-[#1B4B5A]">{product.name}</span>
        </nav>

        {status === "hidden" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            Sản phẩm đang ẩn — chỉ tài khoản quản trị mới xem được trang này.
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Ảnh */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#E5D9C3]/70 bg-[#FCE9C6] shadow-sm">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 rounded-full bg-[#1B4B5A] px-3 py-1 text-[11px] font-black tracking-wider text-[#F6CE8B] uppercase shadow-sm">
                {product.badge}
              </span>
            )}
            {soldOut && (
              <span className="absolute top-4 right-4 z-10 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-black tracking-wider text-white uppercase shadow-sm">
                Hết hàng
              </span>
            )}
            <Image src={product.image} alt={product.name} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>

          {/* Thông tin */}
          <div className="flex flex-col">
            {group && <p className="text-xs font-bold tracking-wider text-[#C97B3D] uppercase">{group.title}</p>}
            <h1 className="mt-1 font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">{product.name}</h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#1B4B5A]">{formatVND(unitPrice)}</span>
              {showOriginal && <span className="text-sm text-text-muted line-through">{formatVND(product.originalPrice!)}</span>}
            </div>

            {product.description && <p className="mt-4 text-sm leading-relaxed text-[#2B2B2B]/80">{product.description}</p>}

            {/* Kích thước khi chỉ có một cỡ */}
            {singleSize?.dimension && (
              <p className="mt-5 text-sm text-[#2B2B2B]/80">
                <span className="font-bold text-[#1B4B5A]">Kích thước:</span> {singleSize.label} · {singleSize.dimension}
              </p>
            )}

            {/* Chọn kích cỡ */}
            {canChooseSize && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-[#1B4B5A]">Chọn kích cỡ</h2>
                <div role="radiogroup" aria-label="Chọn kích cỡ" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {product.sizes!.map((s) => {
                    const active = s.label === selectedSize;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSize(s.label)}
                        className={`flex cursor-pointer flex-col items-start rounded-2xl border-2 px-3.5 py-2.5 text-left transition-all ${
                          active
                            ? "border-[#1B4B5A] bg-[#1B4B5A] text-white shadow-md"
                            : "border-[#E5D9C3] bg-white text-[#1B4B5A] hover:border-[#1B4B5A]/50"
                        }`}
                      >
                        <span className="text-sm font-bold">{s.label}</span>
                        {s.dimension && (
                          <span className={`text-[11px] ${active ? "text-white/80" : "text-text-muted"}`}>{s.dimension}</span>
                        )}
                        <span className={`mt-0.5 text-xs font-semibold ${active ? "text-[#F6CE8B]" : "text-[#C97B3D]"}`}>
                          {formatVND(s.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tùy chọn thêm: sốt, loại sữa, % đường, % đá... (mỗi nhóm chọn 1) */}
            {optionGroups.map((g) => (
              <div key={g.name} className="mt-5">
                <h2 className="text-sm font-bold text-[#1B4B5A]">{g.name}</h2>
                <div role="radiogroup" aria-label={g.name} className="mt-2 flex flex-wrap gap-2">
                  {g.choices.map((c) => {
                    const active = chosen[g.name] === c.label;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setPicked((prev) => ({ ...prev, [g.name]: c.label }))}
                        className={`cursor-pointer rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-all ${
                          active
                            ? "border-[#1B4B5A] bg-[#1B4B5A] text-white"
                            : "border-[#E5D9C3] bg-white text-[#1B4B5A] hover:border-[#1B4B5A]/50"
                        }`}
                      >
                        {c.label}
                        {c.price > 0 && (
                          <span className={active ? "text-[#F6CE8B]" : "text-[#C97B3D]"}> +{formatVND(c.price)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Số lượng */}
            <div className="mt-6 flex items-center gap-4">
              <h2 className="text-sm font-bold text-[#1B4B5A]">Số lượng</h2>
              <div className="flex items-center rounded-full border border-[#E5D9C3] bg-white">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#1B4B5A] hover:bg-[#FCE9C6]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  onClick={() => setQuantity((q) => Math.min(MAX_ITEM_QUANTITY, q + 1))}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#1B4B5A] hover:bg-[#FCE9C6]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-text-muted">
                Tạm tính: <strong className="text-[#1B4B5A]">{formatVND(unitPrice * quantity)}</strong>
              </span>
            </div>

            {/* Nút mua */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={soldOut}
                className="flex-1 cursor-pointer rounded-full bg-[#1B4B5A] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#123640] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {soldOut ? "Tạm hết hàng" : "Đặt ngay"}
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#1B4B5A] px-5 py-3 text-sm font-bold text-[#1B4B5A] transition-all hover:bg-[#1B4B5A]/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4" />
                Thêm vào giỏ
              </button>
            </div>

            {/* Lợi ích */}
            <ul className="mt-6 space-y-2 rounded-2xl border border-[#E5D9C3]/70 bg-white p-4 text-xs text-[#2B2B2B]/80">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-[#C97B3D]" />
                Làm tươi theo đơn, không chất bảo quản
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 shrink-0 text-[#C97B3D]" />
                Giao tận nơi hoặc nhận tại tiệm
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 shrink-0 text-[#C97B3D]" />
                Nhận khoảng <strong className="text-[#1B4B5A]">{pointsForOrder(unitPrice * quantity, loyalty).toLocaleString("vi-VN")} điểm</strong>{" "}
                khi đơn hoàn tất ({loyalty.pointRateVnd.toLocaleString("vi-VN")}đ = 1 điểm)
              </li>
            </ul>
          </div>
        </div>

        {/* Sản phẩm cùng nhóm */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-heading text-xl font-black text-[#1B4B5A] sm:text-2xl">Có thể bạn cũng thích</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/san-pham/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#E5D9C3]/70 bg-white shadow-xs transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#FCE9C6]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-bold text-[#2B2B2B] group-hover:text-[#1B4B5A]">{p.name}</h3>
                    <p className="mt-0.5 text-sm font-black text-[#1B4B5A]">
                      {p.sizes && p.sizes.length > 1 ? "Từ " : ""}
                      {formatVND(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
