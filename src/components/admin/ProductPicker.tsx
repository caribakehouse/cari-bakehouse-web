"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { BTN_ICON, INPUT } from "@/components/admin/ui";
import { getProductStatus, useProducts } from "@/lib/db";
import { formatVND } from "@/lib/utils";

/**
 * Chọn sản phẩm từ danh sách có sẵn (dữ liệu /admin/san-pham), giữ thứ tự và giới hạn số lượng tối đa.
 * Lưu dưới dạng danh sách slug.
 */
export default function ProductPicker({
  label,
  slugs,
  onChange,
  max,
}: {
  label: string;
  slugs: string[];
  onChange: (slugs: string[]) => void;
  max?: number;
}) {
  const products = useProducts();
  const selected = slugs.map((slug) => ({ slug, product: products.find((p) => p.slug === slug) }));
  const available = products.filter((p) => !slugs.includes(p.slug) && getProductStatus(p) !== "hidden");
  const full = max !== undefined && slugs.length >= max;

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= slugs.length) return;
    const next = [...slugs];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#5b5b5b]">{label}</span>
        {max !== undefined && (
          <span className="text-[11px] text-[#9a9a9a]">
            {slugs.length}/{max}
          </span>
        )}
      </div>

      <ol className="space-y-1.5">
        {selected.length === 0 && <li className="text-[11px] text-[#9a9a9a]">Chưa chọn sản phẩm nào.</li>}
        {selected.map(({ slug, product }, i) => (
          <li key={slug} className="flex items-center gap-2 rounded-md border border-[#d6d6d6] bg-white px-2.5 py-1.5 text-[12px]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0e6c8] text-[10px] font-bold text-[#2b2b2b]">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold text-[#2b2b2b]">
              {product ? product.name : `${slug} (đã bị xóa)`}
            </span>
            {product && <span className="hidden text-[11px] text-[#9a9a9a] sm:inline">{formatVND(product.price)}</span>}
            <button type="button" className={BTN_ICON} aria-label="Đưa lên" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp className="h-3 w-3" />
            </button>
            <button type="button" className={BTN_ICON} aria-label="Đưa xuống" disabled={i === slugs.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown className="h-3 w-3" />
            </button>
            <button type="button" className={BTN_ICON} aria-label={`Bỏ ${product?.name ?? slug}`} onClick={() => onChange(slugs.filter((s) => s !== slug))}>
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ol>

      <select
        value=""
        disabled={full || available.length === 0}
        onChange={(e) => e.target.value && onChange([...slugs, e.target.value])}
        aria-label={`Thêm sản phẩm vào ${label}`}
        className={INPUT}
      >
        <option value="">{full ? `Đã đủ ${max} sản phẩm` : "+ Thêm sản phẩm..."}</option>
        {available.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name} — {p.category}
          </option>
        ))}
      </select>
    </div>
  );
}
