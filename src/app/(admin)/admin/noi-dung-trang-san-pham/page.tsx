"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import ContentTabs from "@/components/admin/ContentTabs";
import { useAdmin } from "@/components/admin/AdminContext";
import { BTN_ICON, BTN_OUTLINE, BTN_SOLID, Card, Field, INPUT } from "@/components/admin/ui";
import { generateGroupId, productCountInGroup, saveProductsPageContent, useProducts, useProductsPageContent } from "@/lib/db";
import type { ProductGroupContent, ProductsPageContent } from "@/types/content";

function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function GroupSection({
  category,
  groups,
  productCounts,
  onChange,
}: {
  category: "Bánh" | "Đồ uống";
  groups: ProductGroupContent[];
  /** Số sản phẩm hiện có trong mỗi nhóm (id → số lượng), tính từ dữ liệu sản phẩm thật */
  productCounts: Record<string, number>;
  onChange: (groups: ProductGroupContent[]) => void;
}) {
  const list = groups.filter((g) => g.category === category);
  const [blockedId, setBlockedId] = useState<string | null>(null);

  const updateAt = (id: string, patch: Partial<ProductGroupContent>) =>
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const moveInCategory = (index: number, delta: -1 | 1) => {
    const reordered = move(list, index, delta);
    if (reordered === list) return;
    // Ghép lại đúng vị trí trong mảng đầy đủ: giữ nguyên các nhóm của danh mục kia, thay riêng phần của danh mục này
    const others = groups.filter((g) => g.category !== category);
    onChange([...others, ...reordered]);
  };

  const handleAdd = () => {
    const created: ProductGroupContent = { id: generateGroupId(), category, title: "", description: "" };
    onChange([...groups, created]);
  };

  const handleDelete = (g: ProductGroupContent) => {
    const count = productCounts[g.id] ?? 0;
    if (count > 0) {
      setBlockedId(g.id);
      return;
    }
    onChange(groups.filter((x) => x.id !== g.id));
  };

  return (
    <div className="space-y-3">
      {list.map((g, i) => {
        const count = productCounts[g.id] ?? 0;
        return (
          <div key={g.id} className="space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#2b2b2b]">
                {count > 0 ? `${count} sản phẩm đang thuộc nhóm này` : "Chưa có sản phẩm nào"}
              </span>
              <div className="flex gap-1.5">
                <button type="button" className={BTN_ICON} aria-label="Đưa nhóm lên" disabled={i === 0} onClick={() => moveInCategory(i, -1)}>
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className={BTN_ICON}
                  aria-label="Đưa nhóm xuống"
                  disabled={i === list.length - 1}
                  onClick={() => moveInCategory(i, 1)}
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button type="button" className={BTN_ICON} aria-label={`Xóa nhóm ${g.title || "chưa đặt tên"}`} onClick={() => handleDelete(g)}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            <Field label="Tên nhóm hiển thị" required>
              <input
                value={g.title}
                onChange={(e) => updateAt(g.id, { title: e.target.value })}
                className={INPUT}
                placeholder="Ví dụ: Bánh Kem & Bánh Ổ"
              />
            </Field>
            <Field label="Mô tả ngắn dưới tên nhóm">
              <textarea
                value={g.description}
                onChange={(e) => updateAt(g.id, { description: e.target.value })}
                rows={2}
                className={`${INPUT} resize-y`}
                placeholder="Không bắt buộc"
              />
            </Field>

            {blockedId === g.id && (
              <p className="text-[11px] text-rose-600">
                Nhóm này còn {count} sản phẩm. Hãy đổi nhóm cho các sản phẩm đó ở màn hình Sản phẩm trước khi xóa.
              </p>
            )}
          </div>
        );
      })}
      {list.length === 0 && (
        <p className="text-[11px] text-[#9a9a9a]">
          Chưa có nhóm nào — mục &quot;{category}&quot; sẽ không hiện nhóm nào ở trang sản phẩm cho đến khi bạn thêm.
        </p>
      )}
      <button type="button" className={BTN_OUTLINE} onClick={handleAdd}>
        <Plus className="h-3.5 w-3.5" />
        Thêm nhóm {category}
      </button>
    </div>
  );
}

function ProductsPageForm({ initial }: { initial: ProductsPageContent }) {
  const { toast } = useAdmin();
  const products = useProducts();
  const [draft, setDraft] = useState<ProductsPageContent>(() => structuredClone(initial));
  const [error, setError] = useState("");

  const productCounts = products.reduce<Record<string, number>>((acc, p) => {
    if (p.subcategory) acc[p.subcategory] = (acc[p.subcategory] ?? 0) + 1;
    return acc;
  }, {});

  const setGroups = (groups: ProductGroupContent[]) => setDraft((d) => ({ ...d, groups }));

  const save = () => {
    if (!draft.categoryPickerLabel.trim()) {
      setError("Vui lòng nhập nhãn phía trên 2 danh mục.");
      return;
    }
    if (draft.groups.some((g) => !g.title.trim())) {
      setError("Mỗi nhóm sản phẩm cần có tên hiển thị.");
      return;
    }
    // Nhóm nào ở bản nháp còn bị chặn xóa (còn sản phẩm) mà dữ liệu sản phẩm đã đổi từ lúc mở trang thì
    // kiểm tra lại lần cuối trước khi lưu, tránh trường hợp hiếm: sản phẩm vừa được gán vào nhóm sắp bị xóa.
    const removedIds = initial.groups.filter((g) => !draft.groups.some((d) => d.id === g.id)).map((g) => g.id);
    const stillInUse = removedIds.find((id) => productCountInGroup(products, id) > 0);
    if (stillInUse) {
      setError("Có nhóm bạn đã xóa nhưng vừa có sản phẩm được gán vào — vui lòng tải lại trang và thử lại.");
      return;
    }
    setError("");
    saveProductsPageContent({
      ...draft,
      categoryPickerLabel: draft.categoryPickerLabel.trim(),
      groups: draft.groups.map((g) => ({ ...g, title: g.title.trim(), description: g.description.trim() })),
    });
    toast("Đã lưu nội dung trang sản phẩm — mở /san-pham để xem thay đổi");
  };

  return (
    <div className="space-y-5 pb-20">
      <Card title="1. Nhãn khu chọn danh mục">
        <Field label="Nhãn nhỏ phía trên 2 biểu tượng Bánh / Đồ uống" required>
          <input
            value={draft.categoryPickerLabel}
            onChange={(e) => setDraft((d) => ({ ...d, categoryPickerLabel: e.target.value }))}
            className={INPUT}
            placeholder="Chọn danh mục"
          />
        </Field>
      </Card>

      <Card title="2. Nhóm sản phẩm — Bánh">
        <GroupSection category="Bánh" groups={draft.groups} productCounts={productCounts} onChange={setGroups} />
      </Card>

      <Card title="3. Nhóm sản phẩm — Đồ uống">
        <GroupSection category="Đồ uống" groups={draft.groups} productCounts={productCounts} onChange={setGroups} />
      </Card>

      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#d6d6d6] bg-white/95 px-4 py-3 backdrop-blur lg:left-[220px]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className={`text-[11px] ${error ? "text-rose-600" : "text-[#7a7a7a]"}`}>
            {error || "Thêm/xóa/đổi tên nhóm chỉ có hiệu lực sau khi bấm Lưu. Không thể xóa nhóm còn sản phẩm."}
          </p>
          <div className="flex gap-2">
            <button type="button" className={BTN_OUTLINE} onClick={() => setDraft(structuredClone(initial))}>
              Hoàn tác
            </button>
            <button type="button" className={BTN_SOLID} onClick={save}>
              Lưu nội dung trang sản phẩm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPageContentPage() {
  const content = useProductsPageContent();
  return (
    <div className="mx-auto max-w-5xl">
      <ContentTabs active="products" />
      <ProductsPageForm initial={content} />
    </div>
  );
}
