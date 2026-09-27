"use client";

// Nội dung trang /dat-theo-yeu-cau: banner, quy trình, ảnh mẫu bánh, giá tham khảo, dịp đặt bánh, câu hỏi thường gặp.

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import ContentTabs from "@/components/admin/ContentTabs";
import ImageField from "@/components/admin/ImageField";
import { useAdmin } from "@/components/admin/AdminContext";
import { BTN_ICON, BTN_OUTLINE, BTN_SOLID, Card, Field, INPUT } from "@/components/admin/ui";
import { saveCustomOrderContent, useCustomOrderContent } from "@/lib/db";
import type { CustomOrderContent } from "@/types/content";

function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Tiêu đề 1 mục trong danh sách + nút lên / xuống / xóa */
function ItemHeader<T>({
  label,
  list,
  index,
  onChange,
}: {
  label: ReactNode;
  list: T[];
  index: number;
  onChange: (next: T[]) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <strong className="text-xs text-[#2b2b2b]">{label}</strong>
      <div className="flex gap-1.5">
        <button type="button" className={BTN_ICON} aria-label="Đưa lên" disabled={index === 0} onClick={() => onChange(move(list, index, -1))}>
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          className={BTN_ICON}
          aria-label="Đưa xuống"
          disabled={index === list.length - 1}
          onClick={() => onChange(move(list, index, 1))}
        >
          <ArrowDown className="h-3 w-3" />
        </button>
        <button type="button" className={BTN_ICON} aria-label="Xóa" onClick={() => onChange(list.filter((_, j) => j !== index))}>
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

const ITEM_BOX = "space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3";
const toPrice = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;

function CustomOrderForm({ initial }: { initial: CustomOrderContent }) {
  const { toast } = useAdmin();
  const [draft, setDraft] = useState<CustomOrderContent>(() => structuredClone(initial));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const set = <K extends keyof CustomOrderContent>(key: K, value: CustomOrderContent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // Còn thay đổi chưa lưu mà đóng tab / tải lại trang → trình duyệt hỏi lại
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const fail = (message: string) => {
    setError(message);
    toast(message, "error");
  };

  const save = async () => {
    if (!draft.title.trim()) return fail("Banner cần có tiêu đề lớn.");
    if (draft.steps.some((s) => !s.title.trim() || !s.desc.trim())) return fail("Mỗi bước trong quy trình cần có tên và mô tả.");
    if (draft.priceTiers.some((t) => !t.name.trim())) return fail("Mỗi mức giá cần có tên (vd: Bánh vừa).");
    if (draft.priceTiers.some((t) => t.prices.some((p) => !p.label.trim() || p.price <= 0))) {
      return fail("Mỗi dòng giá cần có tên vị/loại và giá lớn hơn 0.");
    }
    if (draft.faq.some((f) => !f.question.trim() || !f.answer.trim())) return fail("Mỗi câu hỏi thường gặp cần có cả câu hỏi và câu trả lời.");
    setError("");
    setSaving(true);
    const saveError = await saveCustomOrderContent({
      ...draft,
      occasions: draft.occasions.map((o) => o.trim()).filter(Boolean),
      samples: draft.samples.filter((s) => s.image.trim()),
    });
    setSaving(false);
    if (saveError) return fail(saveError);
    toast("Đã lưu — mở trang Đặt theo yêu cầu để xem thay đổi");
  };

  const sampleTags = [...new Set(draft.samples.map((s) => s.tag.trim()).filter(Boolean))];

  return (
    <div className="space-y-5 pb-20">
      {/* 1. Banner */}
      <Card title="1. Banner">
        <div className="space-y-3">
          <Field label="Tagline (dòng nhỏ phía trên)">
            <input value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Tiêu đề lớn" required>
            <input value={draft.title} onChange={(e) => set("title", e.target.value)} className={INPUT} />
          </Field>
        </div>
      </Card>

      {/* 2. Quy trình */}
      <Card
        title="2. Quy trình đặt bánh"
        action={
          <button type="button" className={BTN_OUTLINE} onClick={() => set("steps", [...draft.steps, { title: "", desc: "" }])}>
            <Plus className="h-3.5 w-3.5" />
            Thêm bước
          </button>
        }
      >
        <div className="space-y-3">
          {draft.steps.map((step, i) => {
            const update = (patch: Partial<typeof step>) => set("steps", draft.steps.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className={ITEM_BOX}>
                <ItemHeader label={`Bước ${i + 1}`} list={draft.steps} index={i} onChange={(v) => set("steps", v)} />
                <Field label="Tên bước" required>
                  <input value={step.title} onChange={(e) => update({ title: e.target.value })} className={INPUT} />
                </Field>
                <Field label="Mô tả" required>
                  <textarea value={step.desc} onChange={(e) => update({ desc: e.target.value })} rows={2} className={`${INPUT} resize-y`} />
                </Field>
              </div>
            );
          })}
          <Field label="Hộp “Lưu ý quan trọng” dưới quy trình" hint="Bỏ trống để ẩn hộp này">
            <textarea value={draft.note} onChange={(e) => set("note", e.target.value)} rows={3} className={`${INPUT} resize-y`} />
          </Field>
        </div>
      </Card>

      {/* 3. Mẫu bánh đã thực hiện */}
      <Card
        title="3. Một số mẫu bánh đã thực hiện"
        action={
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() =>
              set("samples", [...draft.samples, { id: Math.max(0, ...draft.samples.map((s) => s.id)) + 1, image: "", title: "", tag: "" }])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm ảnh mẫu
          </button>
        }
      >
        <div className="space-y-3">
          <p className="text-[11px] text-[#7a7a7a]">
            Tải ảnh mẫu bánh (vd từ Drive về máy rồi bấm &quot;Tải ảnh từ máy&quot;). Ghi <strong>Nhóm</strong> (vd Sinh nhật, Thôi
            nôi...) để khách lọc theo nhóm. Mẫu nào chưa có ảnh sẽ không được lưu.
          </p>
          <datalist id="sample-tags">
            {sampleTags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {draft.samples.map((sample, i) => {
              const update = (patch: Partial<typeof sample>) =>
                set("samples", draft.samples.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={sample.id} className={ITEM_BOX}>
                  <ItemHeader label={`Mẫu ${i + 1}`} list={draft.samples} index={i} onChange={(v) => set("samples", v)} />
                  <ImageField label="Ảnh" value={sample.image} onChange={(v) => update({ image: v })} maxSize={1200} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Tên mẫu (tùy chọn)">
                      <input value={sample.title} onChange={(e) => update({ title: e.target.value })} className={INPUT} />
                    </Field>
                    <Field label="Nhóm (tùy chọn)">
                      <input
                        value={sample.tag}
                        list="sample-tags"
                        onChange={(e) => update({ tag: e.target.value })}
                        className={INPUT}
                        placeholder="Sinh nhật"
                      />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
          {draft.samples.length === 0 && (
            <p className="text-[11px] text-[#9a9a9a]">Chưa có ảnh mẫu — trang sẽ hiện dòng “Ảnh mẫu bánh đang được cập nhật”.</p>
          )}
        </div>
      </Card>

      {/* 4. Giá tham khảo */}
      <Card
        title="4. Giá tham khảo theo kích thước"
        action={
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() =>
              set("priceTiers", [
                ...draft.priceTiers,
                { name: "", size: "", image: "", prices: [{ label: "", price: 0 }], note: "", highlight: "" },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm mức giá
          </button>
        }
      >
        <div className="space-y-3">
          <Field label="Ghi chú dưới tiêu đề">
            <input value={draft.priceNote} onChange={(e) => set("priceNote", e.target.value)} className={INPUT} />
          </Field>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {draft.priceTiers.map((tier, i) => {
              const update = (patch: Partial<typeof tier>) =>
                set("priceTiers", draft.priceTiers.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              const updatePrice = (pi: number, patch: Partial<(typeof tier.prices)[number]>) =>
                update({ prices: tier.prices.map((p, j) => (j === pi ? { ...p, ...patch } : p)) });
              return (
                <div key={i} className={ITEM_BOX}>
                  <ItemHeader label={tier.name || `Mức giá ${i + 1}`} list={draft.priceTiers} index={i} onChange={(v) => set("priceTiers", v)} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Tên" required>
                      <input value={tier.name} onChange={(e) => update({ name: e.target.value })} className={INPUT} placeholder="Bánh vừa" />
                    </Field>
                    <Field label="Kích thước / loại bánh">
                      <input value={tier.size} onChange={(e) => update({ size: e.target.value })} className={INPUT} placeholder="Cheesecake 12cm" />
                    </Field>
                  </div>
                  <ImageField label="Ảnh mẫu" value={tier.image} onChange={(v) => update({ image: v })} maxSize={1000} />
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#5b5b5b]">Bảng giá</span>
                    {tier.prices.map((p, pi) => (
                      <div key={pi} className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <input
                            value={p.label}
                            onChange={(e) => updatePrice(pi, { label: e.target.value })}
                            placeholder="Vị Original / Matcha"
                            aria-label={`Tên dòng giá ${pi + 1}`}
                            className={INPUT}
                          />
                        </div>
                        <div className="w-32 shrink-0">
                          <input
                            value={p.price ? String(p.price) : ""}
                            inputMode="numeric"
                            onChange={(e) => updatePrice(pi, { price: toPrice(e.target.value) })}
                            placeholder="Giá (đ)"
                            aria-label={`Giá dòng ${pi + 1}`}
                            className={INPUT}
                          />
                        </div>
                        <button
                          type="button"
                          className={BTN_ICON}
                          aria-label={`Xóa dòng giá ${pi + 1}`}
                          onClick={() => update({ prices: tier.prices.filter((_, j) => j !== pi) })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button type="button" className={BTN_OUTLINE} onClick={() => update({ prices: [...tier.prices, { label: "", price: 0 }] })}>
                      <Plus className="h-3.5 w-3.5" />
                      Thêm dòng giá
                    </button>
                  </div>
                  <Field label="Ghi chú nhỏ cuối thẻ (tùy chọn)">
                    <input value={tier.note} onChange={(e) => update({ note: e.target.value })} className={INPUT} />
                  </Field>
                  <Field label="Nhãn nổi bật (tùy chọn)" hint="Vd: Được đặt nhiều nhất — thẻ có nhãn sẽ có viền đậm">
                    <input value={tier.highlight} onChange={(e) => update({ highlight: e.target.value })} className={INPUT} />
                  </Field>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 5. Dịp đặt bánh */}
      <Card title="5. Dịp đặt bánh (ô chọn trong form)">
        <Field label="Mỗi dòng một dịp" hint="Hiện trong ô “Dịp đặt bánh” của form gửi yêu cầu">
          <textarea
            value={draft.occasions.join("\n")}
            onChange={(e) => set("occasions", e.target.value.split("\n"))}
            rows={6}
            className={`${INPUT} resize-y`}
          />
        </Field>
      </Card>

      {/* 6. FAQ */}
      <Card
        title="6. Câu hỏi thường gặp"
        action={
          <button type="button" className={BTN_OUTLINE} onClick={() => set("faq", [...draft.faq, { question: "", answer: "" }])}>
            <Plus className="h-3.5 w-3.5" />
            Thêm câu hỏi
          </button>
        }
      >
        <div className="space-y-3">
          {draft.faq.map((f, i) => {
            const update = (patch: Partial<typeof f>) => set("faq", draft.faq.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className={ITEM_BOX}>
                <ItemHeader label={`Câu hỏi ${i + 1}`} list={draft.faq} index={i} onChange={(v) => set("faq", v)} />
                <Field label="Câu hỏi" required>
                  <input value={f.question} onChange={(e) => update({ question: e.target.value })} className={INPUT} />
                </Field>
                <Field label="Câu trả lời" required>
                  <textarea value={f.answer} onChange={(e) => update({ answer: e.target.value })} rows={3} className={`${INPUT} resize-y`} />
                </Field>
              </div>
            );
          })}
          {draft.faq.length === 0 && <p className="text-[11px] text-[#9a9a9a]">Chưa có câu hỏi nào.</p>}
        </div>
      </Card>

      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#d6d6d6] bg-white/95 px-4 py-3 backdrop-blur lg:left-[220px]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className={`text-[11px] ${error ? "font-bold text-rose-600" : dirty ? "font-bold text-amber-700" : "text-[#7a7a7a]"}`}>
            {error || (dirty ? "Bạn có thay đổi chưa lưu — bấm Lưu để áp dụng lên web." : "Thay đổi chỉ có hiệu lực sau khi bấm Lưu.")}
          </p>
          <div className="flex gap-2">
            <button type="button" className={BTN_OUTLINE} onClick={() => setDraft(structuredClone(initial))}>
              Hoàn tác
            </button>
            <button type="button" className={`${BTN_SOLID} disabled:opacity-60`} onClick={save} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu nội dung"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomOrderContentPage() {
  const content = useCustomOrderContent();
  return (
    <div className="mx-auto max-w-5xl">
      <ContentTabs active="custom" />
      <CustomOrderForm key={JSON.stringify(content)} initial={content} />
    </div>
  );
}
