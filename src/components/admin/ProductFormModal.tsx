"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import { useAdmin } from "@/components/admin/AdminContext";
import { BTN_ICON, BTN_OUTLINE, BTN_SOLID, Field, INPUT, INPUT_INVALID, Modal } from "@/components/admin/ui";
import { PRODUCT_STATUS_LABELS, productGroupMeta, saveProduct } from "@/lib/db";
import type { Product, ProductStatus } from "@/lib/mock-data";
import { formatVND } from "@/lib/utils";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x600/FFF8EF/1B4B5A?text=Cari";

type Category = "Bánh" | "Đồ uống";

interface Draft {
  name: string;
  description: string;
  category: Category;
  subcategory: string;
  image: string;
  price: string;
  originalPrice: string;
  stock: string;
  status: ProductStatus;
  badge: string;
  sizes: { label: string; price: string }[];
}

type Errors = Partial<Record<"name" | "price" | "originalPrice" | "stock" | "sizes" | "image", string>>;

const groupsOf = (category: Category) => productGroupMeta.filter((g) => g.category === category);

function toDraft(p: Product | null): Draft {
  if (!p) {
    return {
      name: "",
      description: "",
      category: "Bánh",
      subcategory: groupsOf("Bánh")[0]?.title ?? "",
      image: "",
      price: "",
      originalPrice: "",
      stock: "20",
      status: "active",
      badge: "",
      sizes: [],
    };
  }
  return {
    name: p.name,
    description: p.description ?? "",
    category: p.category === "Đồ uống" ? "Đồ uống" : "Bánh",
    subcategory: p.subcategory ?? "",
    image: p.image,
    price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    stock: String(p.stock ?? 0),
    status: p.status ?? "active",
    badge: p.badge ?? "",
    sizes: (p.sizes ?? []).map((s) => ({ label: s.label, price: String(s.price) })),
  };
}

const toInt = (v: string) => (v.trim() === "" ? NaN : Number(v));

/** Form thêm / sửa sản phẩm. Mount mới (key khác) cho mỗi lần mở để state khởi tạo lại. */
export default function ProductFormModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { toast } = useAdmin();
  const [draft, setDraft] = useState<Draft>(() => toDraft(product));
  const [errors, setErrors] = useState<Errors>({});

  // Sửa ô nào thì xóa lỗi cũ của ô đó (đổi cỡ bánh thì cũng bỏ lỗi giá)
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, ...(key === "sizes" ? { price: undefined } : {}) }));
  };

  const hasSizes = draft.sizes.length > 0;
  const validSizePrices = draft.sizes.map((s) => toInt(s.price)).filter((n) => Number.isFinite(n) && n > 0);
  const minSizePrice = validSizePrices.length ? Math.min(...validSizePrices) : undefined;

  const handleSave = () => {
    const next: Errors = {};
    if (!draft.name.trim()) next.name = "Vui lòng nhập tên sản phẩm";

    if (hasSizes) {
      const bad = draft.sizes.some((s) => !s.label.trim() || !(toInt(s.price) > 0));
      const labels = draft.sizes.map((s) => s.label.trim().toLowerCase());
      if (bad) next.sizes = "Mỗi cỡ cần có tên và giá lớn hơn 0";
      else if (new Set(labels).size !== labels.length) next.sizes = "Tên các cỡ không được trùng nhau";
    } else if (!(toInt(draft.price) > 0)) {
      next.price = "Vui lòng nhập giá lớn hơn 0";
    }

    if (draft.originalPrice.trim() && !(toInt(draft.originalPrice) > 0)) next.originalPrice = "Giá gốc không hợp lệ";
    const stock = toInt(draft.stock);
    if (!Number.isInteger(stock) || stock < 0) next.stock = "Tồn kho phải là số nguyên từ 0";
    if (draft.image && !/^(https?:\/\/|data:image\/|\/)/.test(draft.image)) next.image = "Link ảnh phải bắt đầu bằng https://";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    saveProduct({
      id: product?.id,
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      category: draft.category,
      subcategory: draft.subcategory || undefined,
      image: draft.image || PLACEHOLDER_IMAGE,
      price: hasSizes ? (minSizePrice ?? 0) : toInt(draft.price),
      originalPrice: draft.originalPrice.trim() ? toInt(draft.originalPrice) : undefined,
      stock,
      status: draft.status,
      badge: draft.badge.trim() || undefined,
      sizes: hasSizes ? draft.sizes.map((s) => ({ label: s.label.trim(), price: toInt(s.price) })) : undefined,
    });
    toast(product ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm mới");
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={product ? `Sửa sản phẩm — ${product.name}` : "Thêm sản phẩm"}
      footer={
        <>
          <button type="button" className={BTN_OUTLINE} onClick={onClose}>
            Hủy
          </button>
          <button type="button" className={BTN_SOLID} onClick={handleSave}>
            {product ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tên sản phẩm" required error={errors.name} className="sm:col-span-2">
          <input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            className={`${INPUT} ${errors.name ? INPUT_INVALID : ""}`}
            placeholder="Ví dụ: Bánh kem dâu tây"
          />
        </Field>

        <Field label="Mô tả" className="sm:col-span-2">
          <textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className={`${INPUT} resize-none`}
            placeholder="Mô tả ngắn hiển thị ở trang sản phẩm"
          />
        </Field>

        <Field label="Danh mục">
          <select
            value={draft.category}
            onChange={(e) => {
              const category = e.target.value as Category;
              setDraft((d) => ({ ...d, category, subcategory: groupsOf(category)[0]?.title ?? "" }));
            }}
            className={INPUT}
          >
            <option value="Bánh">Bánh</option>
            <option value="Đồ uống">Đồ uống</option>
          </select>
        </Field>

        <Field label="Nhóm sản phẩm">
          <select value={draft.subcategory} onChange={(e) => set("subcategory", e.target.value)} className={INPUT}>
            {groupsOf(draft.category).map((g) => (
              <option key={g.id} value={g.title}>
                {g.title}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <ImageField label="Ảnh sản phẩm" value={draft.image} onChange={(v) => set("image", v)} maxSize={720} />
          {errors.image && <p className="mt-1 text-[11px] text-rose-600">{errors.image}</p>}
        </div>

        {/* Cỡ bánh kèm giá riêng từng cỡ */}
        <div className="space-y-2 rounded-md border border-[#d6d6d6] bg-[#fafafa] p-3 sm:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold text-[#2b2b2b]">Cỡ bánh &amp; giá từng cỡ</div>
              <div className="text-[11px] text-[#9a9a9a]">
                Bỏ trống nếu sản phẩm chỉ có một kích cỡ. Khi có cỡ, giá hiển thị là “Từ” giá thấp nhất.
              </div>
            </div>
            <button
              type="button"
              className={BTN_OUTLINE}
              onClick={() => set("sizes", [...draft.sizes, { label: "", price: "" }])}
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm cỡ
            </button>
          </div>
          {draft.sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={s.label}
                onChange={(e) => set("sizes", draft.sizes.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                placeholder="Tên cỡ (vd: 16cm)"
                aria-label={`Tên cỡ ${i + 1}`}
                className={INPUT}
              />
              <input
                value={s.price}
                inputMode="numeric"
                onChange={(e) => set("sizes", draft.sizes.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/[^\d]/g, "") } : x)))}
                placeholder="Giá (đ)"
                aria-label={`Giá cỡ ${i + 1}`}
                className={INPUT}
              />
              <button
                type="button"
                className={BTN_ICON}
                aria-label={`Xóa cỡ ${i + 1}`}
                onClick={() => set("sizes", draft.sizes.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {errors.sizes && <p className="text-[11px] text-rose-600">{errors.sizes}</p>}
        </div>

        <Field
          label="Giá bán (đ)"
          required={!hasSizes}
          error={errors.price}
          hint={hasSizes ? `Đang dùng giá theo cỡ${minSizePrice ? `: từ ${formatVND(minSizePrice)}` : ""}` : undefined}
        >
          <input
            value={hasSizes ? (minSizePrice ? String(minSizePrice) : "") : draft.price}
            disabled={hasSizes}
            inputMode="numeric"
            onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))}
            aria-invalid={!!errors.price}
            className={`${INPUT} disabled:bg-[#efefef] ${errors.price ? INPUT_INVALID : ""}`}
            placeholder="180000"
          />
        </Field>

        <Field label="Giá gốc trước giảm (đ)" error={errors.originalPrice} hint="Tùy chọn — hiển thị gạch ngang">
          <input
            value={draft.originalPrice}
            inputMode="numeric"
            onChange={(e) => set("originalPrice", e.target.value.replace(/[^\d]/g, ""))}
            className={`${INPUT} ${errors.originalPrice ? INPUT_INVALID : ""}`}
          />
        </Field>

        <Field label="Tồn kho" error={errors.stock} hint="Về 0 thì tự tính là hết hàng">
          <input
            value={draft.stock}
            inputMode="numeric"
            onChange={(e) => set("stock", e.target.value.replace(/[^\d]/g, ""))}
            className={`${INPUT} ${errors.stock ? INPUT_INVALID : ""}`}
          />
        </Field>

        <Field label="Trạng thái">
          <select value={draft.status} onChange={(e) => set("status", e.target.value as ProductStatus)} className={INPUT}>
            {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {PRODUCT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nhãn nổi bật" hint="Tùy chọn — ví dụ: Mới, Hot, Sale" className="sm:col-span-2">
          <input value={draft.badge} onChange={(e) => set("badge", e.target.value)} className={INPUT} />
        </Field>
      </div>
    </Modal>
  );
}
