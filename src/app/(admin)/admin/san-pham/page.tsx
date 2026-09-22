"use client";

import { useState } from "react";
import { EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { matchesQuery, useAdmin } from "@/components/admin/AdminContext";
import { productTone } from "@/components/admin/helpers";
import {
  BTN_ICON,
  BTN_OUTLINE,
  BTN_SOLID,
  Chip,
  ChipRow,
  ConfirmDialog,
  EmptyRow,
  Pagination,
  StatusPill,
  TABLE,
  TABLE_WRAP,
  TD,
  TH,
  Toolbar,
} from "@/components/admin/ui";
import {
  PRODUCT_STATUS_LABELS,
  deleteProducts,
  getProductStatus,
  setProductsStatus,
  useProductGroupOptions,
  useProducts,
} from "@/lib/db";
import type { Product } from "@/lib/mock-data";
import { formatVND } from "@/lib/utils";

type Filter = "all" | "Bánh" | "Đồ uống" | "soldout" | "hidden";

const PAGE_SIZE = 8;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "Bánh", label: "Bánh" },
  { key: "Đồ uống", label: "Đồ uống" },
  { key: "soldout", label: "Hết hàng" },
  { key: "hidden", label: "Đang ẩn" },
];

function matchesFilter(p: Product, filter: Filter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "soldout":
      return getProductStatus(p) === "soldout";
    case "hidden":
      return getProductStatus(p) === "hidden";
    default:
      return p.category === filter;
  }
}

export default function AdminProductsPage() {
  const { query, toast } = useAdmin();
  const products = useProducts();
  // Nhóm sản phẩm hiện có (thêm/xóa/đổi tên ở Nội dung trang → Trang sản phẩm) — dùng để hiện đúng
  // tên nhóm hiện tại thay vì id lưu trong product.subcategory.
  const groupOptions = useProductGroupOptions();
  const groupTitle = (subcategory: string | undefined) =>
    groupOptions.find((g) => g.value === subcategory)?.label;

  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[] | null>(null);

  const filtered = products.filter(
    (p) => matchesFilter(p, filter) && matchesQuery(query, p.name, groupTitle(p.subcategory), p.category, p.slug),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.includes(p.id));
  const toggleAllVisible = () =>
    setSelected((prev) =>
      allVisibleSelected ? prev.filter((id) => !visible.some((p) => p.id === id)) : [...new Set([...prev, ...visible.map((p) => p.id)])],
    );
  const toggleOne = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const countOf = (f: Filter) => products.filter((p) => matchesFilter(p, f)).length;

  return (
    <div>
      <Toolbar>
        <ChipRow>
          {FILTERS.map((f) => (
            <Chip key={f.key} active={filter === f.key} onClick={() => changeFilter(f.key)} count={countOf(f.key)}>
              {f.label}
            </Chip>
          ))}
        </ChipRow>
        <div className="flex flex-wrap items-center gap-2">
          {selected.length > 0 && (
            <>
              <span className="text-[11px] text-[#7a7a7a]">Đã chọn {selected.length}</span>
              <button
                type="button"
                className={BTN_OUTLINE}
                onClick={() => {
                  setProductsStatus(selected, "hidden");
                  toast(`Đã ẩn ${selected.length} sản phẩm khỏi cửa hàng`);
                  setSelected([]);
                }}
              >
                <EyeOff className="h-3.5 w-3.5" />
                Ẩn
              </button>
              <button type="button" className={BTN_OUTLINE} onClick={() => setDeleteIds(selected)}>
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
              </button>
            </>
          )}
          <button type="button" className={BTN_SOLID} onClick={() => setEditing("new")}>
            <Plus className="h-3.5 w-3.5" />
            Thêm sản phẩm
          </button>
        </div>
      </Toolbar>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={`${TH} w-6`}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  aria-label="Chọn tất cả sản phẩm ở trang này"
                  className="h-3.5 w-3.5 cursor-pointer accent-[#2b2b2b]"
                />
              </th>
              <th className={TH}>Ảnh</th>
              <th className={TH}>Tên sản phẩm</th>
              <th className={TH}>Danh mục</th>
              <th className={TH}>Giá</th>
              <th className={TH}>Tồn kho</th>
              <th className={TH}>Trạng thái</th>
              <th className={TH}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <EmptyRow colSpan={8}>Không có sản phẩm nào phù hợp.</EmptyRow>}
            {visible.map((p) => {
              const status = getProductStatus(p);
              return (
                <tr key={p.id} className={selected.includes(p.id) ? "bg-[#fbf6e6]" : ""}>
                  <td className={TD}>
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleOne(p.id)}
                      aria-label={`Chọn ${p.name}`}
                      className="h-3.5 w-3.5 cursor-pointer accent-[#2b2b2b]"
                    />
                  </td>
                  <td className={TD}>
                    <div className="relative h-[38px] w-[38px] overflow-hidden rounded border border-dashed border-[#9a9a9a] bg-[#e8e8e8]">
                      <SafeImage src={p.image} alt="" fill sizes="38px" className="object-cover" />
                    </div>
                  </td>
                  <td className={`${TD} min-w-[180px] font-semibold text-[#2b2b2b]`}>
                    {p.name}
                    {p.sizes && p.sizes.length > 0 && (
                      <div className="mt-0.5 text-[10px] font-normal text-[#9a9a9a]">
                        {p.sizes.length} cỡ: {p.sizes.map((s) => s.label).join(", ")}
                      </div>
                    )}
                  </td>
                  <td className={TD}>
                    {groupTitle(p.subcategory) ?? <span className="text-[#9a9a9a] italic">Chưa phân nhóm</span>}
                    <div className="text-[10px] text-[#9a9a9a]">{p.category}</div>
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>
                    {p.sizes && p.sizes.length > 0 ? "Từ " : ""}
                    {formatVND(p.price)}
                  </td>
                  <td className={TD}>{p.stock ?? 0}</td>
                  <td className={TD}>
                    <StatusPill tone={productTone(status)}>{PRODUCT_STATUS_LABELS[status]}</StatusPill>
                  </td>
                  <td className={TD}>
                    <div className="flex gap-1.5">
                      <button type="button" className={BTN_ICON} aria-label={`Sửa ${p.name}`} onClick={() => setEditing(p)}>
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button type="button" className={BTN_ICON} aria-label={`Xóa ${p.name}`} onClick={() => setDeleteIds([p.id])}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pages={pages} onChange={setPage} />

      {editing !== null && (
        <ProductFormModal
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleteIds !== null}
        danger
        title="Xóa sản phẩm"
        confirmLabel="Xóa"
        message={
          <>
            Xóa <strong>{deleteIds?.length ?? 0}</strong> sản phẩm khỏi dữ liệu? Sản phẩm sẽ biến mất khỏi cửa hàng và
            các khối trang chủ đang dùng nó. Hành động này không hoàn tác được (chỉ có thể khôi phục toàn bộ dữ liệu mẫu ở
            màn hình Cài đặt).
          </>
        }
        onConfirm={() => {
          if (!deleteIds) return;
          deleteProducts(deleteIds);
          setSelected((prev) => prev.filter((id) => !deleteIds.includes(id)));
          toast(`Đã xóa ${deleteIds.length} sản phẩm`);
        }}
        onClose={() => setDeleteIds(null)}
      />
    </div>
  );
}
