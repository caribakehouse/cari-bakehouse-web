"use client";

import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import { useAdmin } from "@/components/admin/AdminContext";
import { BTN_ICON, BTN_OUTLINE, BTN_SOLID, Field, INPUT, INPUT_INVALID, Modal } from "@/components/admin/ui";
import { PRODUCT_STATUS_LABELS, saveProduct, useProductGroupOptions } from "@/lib/db";
import type { Product, ProductStatus } from "@/lib/mock-data";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x600/FFF8EF/1B4B5A?text=Cari";

type Category = "Bánh" | "Đồ uống";

/** Tên mặc định của cỡ gốc (cỡ đầu tiên khách được chọn) */
const DEFAULT_BASE_SIZE = "Full size";

type OptionDraft = { name: string; choices: { label: string; price: string }[] };

/** Mẫu tùy chọn hay dùng — bấm là thêm sẵn, sửa lại tùy ý (lựa chọn đầu tiên là mặc định) */
const OPTION_PRESETS: OptionDraft[] = [
  {
    name: "Sốt đi kèm",
    choices: [
      { label: "Sữa đặc", price: "0" },
      { label: "Sốt Caramel muối", price: "6000" },
    ],
  },
  {
    name: "Loại sữa",
    choices: [
      { label: "Sữa bò", price: "0" },
      { label: "Sữa hạt", price: "0" },
    ],
  },
  {
    name: "Lượng đường",
    choices: [
      { label: "100%", price: "0" },
      { label: "50%", price: "0" },
      { label: "0%", price: "0" },
    ],
  },
  {
    name: "Lượng đá",
    choices: [
      { label: "100%", price: "0" },
      { label: "50%", price: "0" },
      { label: "0%", price: "0" },
    ],
  },
  {
    name: "Lượng matcha",
    choices: [
      { label: "4 gram", price: "0" },
      { label: "5 gram", price: "0" },
      { label: "6 gram", price: "0" },
    ],
  },
];

interface Draft {
  name: string;
  description: string;
  category: Category;
  subcategory: string;
  image: string;
  /** Tên cỡ gốc — chỉ hiện cho khách chọn khi có thêm cỡ khác */
  baseLabel: string;
  /** Giá của cỡ gốc (hoặc giá duy nhất nếu chỉ có một cỡ) */
  price: string;
  /** Kích thước / khẩu phần của cỡ gốc, vd "Ø20cm · 8–10 người" */
  baseDimension: string;
  originalPrice: string;
  stock: string;
  status: ProductStatus;
  badge: string;
  /** Các cỡ khác ngoài cỡ gốc (Half size, Mini...) */
  sizes: { label: string; price: string; dimension: string }[];
  /** Tùy chọn thêm: sốt, loại sữa, % đường... */
  options: OptionDraft[];
}

type Errors = Partial<
  Record<"name" | "baseLabel" | "price" | "originalPrice" | "stock" | "sizes" | "options" | "image", string>
>;

function toDraft(p: Product | null): Draft {
  if (!p) {
    return {
      name: "",
      description: "",
      category: "Bánh",
      // Danh sách nhóm chỉ có được sau khi component mount (useProductGroupOptions); chọn mặc định
      // nhóm đầu tiên được thực hiện ở effect bên dưới, ngay khi mở form thêm mới.
      subcategory: "",
      image: "",
      baseLabel: DEFAULT_BASE_SIZE,
      price: "",
      baseDimension: "",
      originalPrice: "",
      stock: "20",
      status: "active",
      badge: "",
      sizes: [],
      options: [],
    };
  }
  // Cỡ đầu tiên trong danh sách là cỡ gốc; các cỡ còn lại là "cỡ khác"
  const [base, ...others] = p.sizes ?? [];
  return {
    name: p.name,
    description: p.description ?? "",
    category: p.category === "Đồ uống" ? "Đồ uống" : "Bánh",
    subcategory: p.subcategory ?? "",
    image: p.image,
    baseLabel: base?.label ?? DEFAULT_BASE_SIZE,
    price: String(base?.price ?? p.price),
    baseDimension: base?.dimension ?? "",
    originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    stock: String(p.stock ?? 0),
    status: p.status ?? "active",
    badge: p.badge ?? "",
    sizes: others.map((s) => ({ label: s.label, price: String(s.price), dimension: s.dimension ?? "" })),
    options: (p.options ?? []).map((g) => ({
      name: g.name,
      choices: g.choices.map((c) => ({ label: c.label, price: String(c.price) })),
    })),
  };
}

const toInt = (v: string) => (v.trim() === "" ? NaN : Number(v));

/** Form thêm / sửa sản phẩm. Mount mới (key khác) cho mỗi lần mở để state khởi tạo lại. */
export default function ProductFormModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { toast } = useAdmin();
  const [draft, setDraft] = useState<Draft>(() => toDraft(product));
  const [errors, setErrors] = useState<Errors>({});
  // Nhãn nhóm hiển thị theo nội dung mới nhất (admin chỉnh ở /admin/noi-dung-trang-san-pham);
  // giá trị lưu vào sản phẩm vẫn là tiêu đề gốc (g.value) nên đổi tên hiển thị không làm mất liên kết.
  const groupOptions = useProductGroupOptions();
  const groupsOf = (category: Category) => groupOptions.filter((g) => g.category === category);
  // Chưa chọn nhóm (sản phẩm mới mở form lần đầu) thì ngầm định nhóm đầu tiên của danh mục đang chọn —
  // tính trực tiếp lúc render, không cần effect đồng bộ state.
  const effectiveSubcategory = draft.subcategory || groupsOf(draft.category)[0]?.value || "";

  // Sửa ô nào thì xóa lỗi cũ của ô đó (đổi cỡ bánh thì cũng bỏ lỗi giá)
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, ...(key === "sizes" ? { price: undefined } : {}) }));
  };

  // Có thêm cỡ khác → khách chọn giữa cỡ gốc và các cỡ đó; không có → bán một cỡ duy nhất
  const hasSizes = draft.sizes.length > 0;
  // Sản phẩm một cỡ nhưng có ghi kích thước → vẫn lưu thành danh sách 1 cỡ để trang chi tiết hiện kích thước
  const keepSizeList = hasSizes || !!draft.baseDimension.trim();

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    const next: Errors = {};
    if (!draft.name.trim()) next.name = "Vui lòng nhập tên sản phẩm";

    if (!(toInt(draft.price) > 0)) next.price = "Vui lòng nhập giá lớn hơn 0";
    if (keepSizeList && !hasSizes && !draft.baseLabel.trim()) {
      next.baseLabel = "Vui lòng đặt tên cỡ (vd: Full size) để hiện kèm kích thước";
    }
    if (hasSizes) {
      if (!draft.baseLabel.trim()) next.baseLabel = "Vui lòng đặt tên cỡ gốc (vd: Full size)";
      const bad = draft.sizes.some((s) => !s.label.trim() || !(toInt(s.price) > 0));
      const labels = [draft.baseLabel, ...draft.sizes.map((s) => s.label)].map((l) => l.trim().toLowerCase());
      if (bad) next.sizes = "Mỗi cỡ cần có tên và giá lớn hơn 0";
      else if (new Set(labels).size !== labels.length) next.sizes = "Tên các cỡ không được trùng nhau";
    }

    const groupNames = draft.options.map((g) => g.name.trim().toLowerCase());
    if (draft.options.some((g) => !g.name.trim() || g.choices.length === 0)) {
      next.options = "Mỗi nhóm tùy chọn cần có tên và ít nhất 1 lựa chọn";
    } else if (new Set(groupNames).size !== groupNames.length) {
      next.options = "Tên các nhóm tùy chọn không được trùng nhau";
    } else if (
      draft.options.some(
        (g) =>
          g.choices.some((c) => !c.label.trim() || !Number.isInteger(toInt(c.price || "0")) || toInt(c.price || "0") < 0) ||
          new Set(g.choices.map((c) => c.label.trim().toLowerCase())).size !== g.choices.length,
      )
    ) {
      next.options = "Mỗi lựa chọn cần có tên (không trùng trong nhóm) và phụ thu từ 0đ";
    }
    if (draft.originalPrice.trim() && !(toInt(draft.originalPrice) > 0)) next.originalPrice = "Giá gốc không hợp lệ";
    const stock = toInt(draft.stock);
    if (!Number.isInteger(stock) || stock < 0) next.stock = "Tồn kho phải là số nguyên từ 0";
    if (draft.image && !/^(https?:\/\/|data:image\/|\/)/.test(draft.image)) next.image = "Link ảnh phải bắt đầu bằng https://";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const withDimension = <T extends { label: string; price: number }>(size: T, dimension: string) =>
      dimension.trim() ? { ...size, dimension: dimension.trim() } : size;
    const allSizes = keepSizeList
      ? [
          withDimension({ label: draft.baseLabel.trim(), price: toInt(draft.price) }, draft.baseDimension),
          ...draft.sizes.map((s) => withDimension({ label: s.label.trim(), price: toInt(s.price) }, s.dimension)),
        ]
      : undefined;

    setSaving(true);
    const saveError = await saveProduct({
      id: product?.id,
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      category: draft.category,
      subcategory: effectiveSubcategory || undefined,
      image: draft.image || PLACEHOLDER_IMAGE,
      price: allSizes ? Math.min(...allSizes.map((s) => s.price)) : toInt(draft.price),
      originalPrice: draft.originalPrice.trim() ? toInt(draft.originalPrice) : undefined,
      stock,
      status: draft.status,
      badge: draft.badge.trim() || undefined,
      sizes: allSizes,
      options:
        draft.options.length > 0
          ? draft.options.map((g) => ({
              name: g.name.trim(),
              choices: g.choices.map((c) => ({ label: c.label.trim(), price: toInt(c.price || "0") })),
            }))
          : undefined,
    });
    setSaving(false);
    if (saveError) return toast(saveError, "error");
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
          <button type="button" className={`${BTN_SOLID} disabled:opacity-60`} onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : product ? "Lưu thay đổi" : "Thêm sản phẩm"}
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
              setDraft((d) => ({ ...d, category, subcategory: groupsOf(category)[0]?.value ?? "" }));
            }}
            className={INPUT}
          >
            <option value="Bánh">Bánh</option>
            <option value="Đồ uống">Đồ uống</option>
          </select>
        </Field>

        <Field
          label="Nhóm sản phẩm"
          hint={
            groupsOf(draft.category).length === 0
              ? "Chưa có nhóm nào cho danh mục này — tạo ở Nội dung trang → Trang sản phẩm"
              : undefined
          }
        >
          <select
            value={effectiveSubcategory}
            onChange={(e) => set("subcategory", e.target.value)}
            disabled={groupsOf(draft.category).length === 0}
            className={`${INPUT} disabled:bg-[#efefef]`}
          >
            <option value="">— Chưa chọn nhóm —</option>
            {groupsOf(draft.category).map((g) => (
              <option key={g.id} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <ImageField label="Ảnh sản phẩm (khuyên dùng ảnh vuông 1200 × 1200)" value={draft.image} onChange={(v) => set("image", v)} maxSize={1200} />
          {errors.image && <p className="mt-1 text-[11px] text-rose-600">{errors.image}</p>}
        </div>

        {/* Giá & kích cỡ: cỡ gốc (luôn có) + các cỡ khác (tùy chọn) */}
        <div className="space-y-3 rounded-md border border-[#d6d6d6] bg-[#fafafa] p-3 sm:col-span-2">
          <div>
            <div className="text-[11px] font-bold text-[#2b2b2b]">Giá &amp; kích cỡ</div>
            <div className="text-[11px] text-[#9a9a9a]">
              Chỉ có một cỡ: nhập giá rồi bỏ qua phần &quot;Cỡ khác&quot;. Nhiều cỡ: thêm cỡ khác, khách sẽ chọn giữa cỡ gốc
              và các cỡ đó.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field
              label="Tên cỡ gốc"
              required={hasSizes}
              error={errors.baseLabel}
              hint={hasSizes ? undefined : "Chỉ hiện cho khách khi có thêm cỡ khác"}
            >
              <input
                value={draft.baseLabel}
                onChange={(e) => set("baseLabel", e.target.value)}
                aria-invalid={!!errors.baseLabel}
                className={`${INPUT} ${errors.baseLabel ? INPUT_INVALID : ""}`}
                placeholder={DEFAULT_BASE_SIZE}
              />
            </Field>
            <Field label="Kích thước" hint="Tùy chọn — hiện ở trang chi tiết">
              <input
                value={draft.baseDimension}
                onChange={(e) => set("baseDimension", e.target.value)}
                className={INPUT}
                placeholder="Ø20cm · 8–10 người"
              />
            </Field>
            <Field label={hasSizes ? "Giá cỡ gốc (đ)" : "Giá bán (đ)"} required error={errors.price}>
              <input
                value={draft.price}
                inputMode="numeric"
                onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))}
                aria-invalid={!!errors.price}
                className={`${INPUT} ${errors.price ? INPUT_INVALID : ""}`}
                placeholder="350000"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[#e3e3e3] pt-3">
            <div className="text-[11px] font-bold text-[#2b2b2b]">Cỡ khác (tùy chọn)</div>
            <button
              type="button"
              className={BTN_OUTLINE}
              onClick={() => set("sizes", [...draft.sizes, { label: "", price: "", dimension: "" }])}
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
                placeholder={i === 0 ? "Tên cỡ (vd: Half size)" : "Tên cỡ"}
                aria-label={`Tên cỡ khác ${i + 1}`}
                className={INPUT}
              />
              <input
                value={s.dimension}
                onChange={(e) => set("sizes", draft.sizes.map((x, j) => (j === i ? { ...x, dimension: e.target.value } : x)))}
                placeholder="Kích thước (vd: Ø14cm)"
                aria-label={`Kích thước cỡ khác ${i + 1}`}
                className={INPUT}
              />
              <input
                value={s.price}
                inputMode="numeric"
                onChange={(e) => set("sizes", draft.sizes.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/[^\d]/g, "") } : x)))}
                placeholder="Giá (đ)"
                aria-label={`Giá cỡ khác ${i + 1}`}
                className={INPUT}
              />
              <button
                type="button"
                className={BTN_ICON}
                aria-label={`Xóa cỡ khác ${i + 1}`}
                onClick={() => set("sizes", draft.sizes.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {errors.sizes && <p className="text-[11px] text-rose-600">{errors.sizes}</p>}
          {hasSizes && draft.baseLabel.trim() && (
            <p className="text-[11px] text-[#5b5b5b]">
              Khách sẽ chọn giữa:{" "}
              <strong>
                {[draft.baseLabel, ...draft.sizes.map((x) => x.label)]
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .join(" · ")}
              </strong>
            </p>
          )}
        </div>

        {/* Tùy chọn thêm: sốt đi kèm, loại sữa, % đường, % đá, lượng matcha... */}
        <div className="space-y-3 rounded-md border border-[#d6d6d6] bg-[#fafafa] p-3 sm:col-span-2">
          <div>
            <div className="text-[11px] font-bold text-[#2b2b2b]">Tùy chọn thêm</div>
            <div className="text-[11px] text-[#9a9a9a]">
              Khách chọn 1 lựa chọn trong mỗi nhóm ở trang chi tiết. Lựa chọn đầu tiên (★) là mặc định. Phụ thu cộng thêm vào
              giá.
            </div>
          </div>

          {/* Mẫu nhanh */}
          <div className="flex flex-wrap gap-1.5">
            {OPTION_PRESETS.map((preset) => {
              const exists = draft.options.some((g) => g.name.trim().toLowerCase() === preset.name.toLowerCase());
              return (
                <button
                  key={preset.name}
                  type="button"
                  disabled={exists}
                  className={`${BTN_OUTLINE} disabled:opacity-40`}
                  onClick={() => set("options", [...draft.options, structuredClone(preset)])}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {preset.name}
                </button>
              );
            })}
            <button
              type="button"
              className={BTN_OUTLINE}
              onClick={() => set("options", [...draft.options, { name: "", choices: [{ label: "", price: "0" }] }])}
            >
              <Plus className="h-3.5 w-3.5" />
              Nhóm trống
            </button>
          </div>

          {draft.options.map((g, gi) => {
            const update = (patch: Partial<OptionDraft>) =>
              set("options", draft.options.map((x, j) => (j === gi ? { ...x, ...patch } : x)));
            const updateChoice = (ci: number, patch: Partial<OptionDraft["choices"][number]>) =>
              update({ choices: g.choices.map((c, j) => (j === ci ? { ...c, ...patch } : c)) });
            return (
              <div key={gi} className="space-y-2 rounded-md border border-[#e3e3e3] bg-white p-2.5">
                <div className="flex items-center gap-2">
                  <input
                    value={g.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Tên nhóm (vd: Sốt đi kèm)"
                    aria-label={`Tên nhóm tùy chọn ${gi + 1}`}
                    className={`${INPUT} font-bold`}
                  />
                  <button
                    type="button"
                    className={BTN_ICON}
                    aria-label={`Xóa nhóm ${g.name || gi + 1}`}
                    onClick={() => set("options", draft.options.filter((_, j) => j !== gi))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {g.choices.map((c, ci) => (
                  <div key={ci} className="flex items-center gap-2 pl-3">
                    <button
                      type="button"
                      className={BTN_ICON}
                      title={ci === 0 ? "Lựa chọn mặc định" : "Đặt làm mặc định"}
                      aria-label={ci === 0 ? `${c.label || "Lựa chọn"} là mặc định` : `Đặt ${c.label || "lựa chọn"} làm mặc định`}
                      onClick={() => ci > 0 && update({ choices: [c, ...g.choices.filter((_, j) => j !== ci)] })}
                    >
                      <Star className={`h-3.5 w-3.5 ${ci === 0 ? "fill-[#F6CE8B] text-[#C97B3D]" : "text-[#b0b0b0]"}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <input
                        value={c.label}
                        onChange={(e) => updateChoice(ci, { label: e.target.value })}
                        placeholder="Lựa chọn (vd: Sữa đặc)"
                        aria-label={`Lựa chọn ${ci + 1} của ${g.name || "nhóm"}`}
                        className={INPUT}
                      />
                    </div>
                    <div className="w-32 shrink-0">
                      <input
                        value={c.price}
                        inputMode="numeric"
                        onChange={(e) => updateChoice(ci, { price: e.target.value.replace(/[^\d]/g, "") })}
                        placeholder="Phụ thu (đ)"
                        aria-label={`Phụ thu của ${c.label || "lựa chọn"}`}
                        className={INPUT}
                      />
                    </div>
                    <button
                      type="button"
                      className={BTN_ICON}
                      aria-label={`Xóa lựa chọn ${c.label || ci + 1}`}
                      onClick={() => update({ choices: g.choices.filter((_, j) => j !== ci) })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={`${BTN_OUTLINE} ml-3`}
                  onClick={() => update({ choices: [...g.choices, { label: "", price: "0" }] })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm lựa chọn
                </button>
              </div>
            );
          })}
          {errors.options && <p className="text-[11px] text-rose-600">{errors.options}</p>}
        </div>

        <Field label="Giá trước giảm (đ)" error={errors.originalPrice} hint="Tùy chọn — hiện gạch ngang cạnh giá cỡ gốc">
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
