"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import ContentTabs from "@/components/admin/ContentTabs";
import ImageField from "@/components/admin/ImageField";
import { useAdmin } from "@/components/admin/AdminContext";
import { BTN_ICON, BTN_OUTLINE, BTN_SOLID, Card, Field, INPUT } from "@/components/admin/ui";
import { saveAboutContent, useAboutContent } from "@/lib/db";
import type { AboutContent, AboutIconKey } from "@/types/content";

const ICON_OPTIONS: { key: AboutIconKey; label: string }[] = [
  { key: "shield", label: "Khiên (chất lượng)" },
  { key: "heart", label: "Trái tim (chăm chút)" },
  { key: "clock", label: "Đồng hồ (làm mới mỗi ngày)" },
  { key: "calendar", label: "Lịch (đồng hành)" },
];

function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function AboutForm({ initial }: { initial: AboutContent }) {
  const { toast } = useAdmin();
  const [draft, setDraft] = useState<AboutContent>(() => structuredClone(initial));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

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

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    if (!draft.heroTitle.trim()) return fail("Banner đầu trang cần có câu chữ lớn.");
    if (!draft.storyTitle.trim() || !draft.storyBody.trim()) return fail("Khối câu chuyện thương hiệu cần có tiêu đề và nội dung.");
    if (draft.values.some((v) => !v.title.trim())) return fail("Mỗi giá trị cốt lõi cần có tiêu đề.");
    if (draft.stats.some((st) => !st.value.trim() || !st.label.trim())) return fail("Mỗi số liệu cần có con số và nhãn.");
    if (draft.spacePhotos.some((ph) => !ph.image.trim() && !ph.caption.trim())) {
      return fail("Mỗi ô không gian cửa hàng cần có ảnh hoặc chú thích (hoặc xóa ô trống đi).");
    }
    if (draft.faq.some((f) => !f.question.trim() || !f.answer.trim())) return fail("Mỗi câu hỏi thường gặp cần có cả câu hỏi và câu trả lời.");
    setError("");
    setSaving(true);
    const saveError = await saveAboutContent(draft);
    setSaving(false);
    if (saveError) return fail(saveError);
    toast("Đã lưu — mở trang Giới thiệu để xem thay đổi");
  };

  return (
    <div className="space-y-5 pb-20">
      <Card title="1. Banner đầu trang">
        <div className="space-y-3">
          <Field label="Câu chữ lớn" required>
            <input value={draft.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Dòng phụ bên dưới">
            <input value={draft.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} className={INPUT} />
          </Field>
          <ImageField
            label="Ảnh nền (tùy chọn, khuyên dùng 2100 × 700) — bỏ trống để dùng nền màu kem"
            value={draft.heroImage}
            onChange={(v) => set("heroImage", v)}
            maxSize={2400}
          />
        </div>
      </Card>

      <Card title="2. Câu chuyện thương hiệu">
        <div className="space-y-3">
          <ImageField
            label="Ảnh bên trái (khuyên dùng 1200 × 900) — ảnh cửa hàng / người sáng lập"
            value={draft.storyImage}
            onChange={(v) => set("storyImage", v)}
            maxSize={1200}
          />
          <Field label="Nhãn nhỏ phía trên">
            <input value={draft.storyBadge} onChange={(e) => set("storyBadge", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Tiêu đề" required>
            <input value={draft.storyTitle} onChange={(e) => set("storyTitle", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Nội dung" required>
            <textarea value={draft.storyBody} onChange={(e) => set("storyBody", e.target.value)} rows={6} className={`${INPUT} resize-y`} />
          </Field>
        </div>
      </Card>

      <Card
        title="3. Giá trị cốt lõi"
        action={
          <button
            type="button"
            className={BTN_OUTLINE}
            disabled={draft.values.length >= 8}
            onClick={() => set("values", [...draft.values, { icon: "heart", title: "", desc: "" }])}
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm giá trị
          </button>
        }
      >
        <div className="space-y-3">
          {draft.values.map((v, i) => {
            const update = (patch: Partial<typeof v>) => set("values", draft.values.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#2b2b2b]">Giá trị {i + 1}</strong>
                  <div className="flex gap-1.5">
                    <button type="button" className={BTN_ICON} aria-label={`Đưa giá trị ${i + 1} lên`} disabled={i === 0} onClick={() => set("values", move(draft.values, i, -1))}>
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label={`Đưa giá trị ${i + 1} xuống`} disabled={i === draft.values.length - 1} onClick={() => set("values", move(draft.values, i, 1))}>
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label={`Xóa giá trị ${i + 1}`} onClick={() => set("values", draft.values.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr]">
                  <Field label="Biểu tượng">
                    <select value={v.icon} onChange={(e) => update({ icon: e.target.value as AboutIconKey })} className={INPUT}>
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tiêu đề" required>
                    <input value={v.title} onChange={(e) => update({ title: e.target.value })} className={INPUT} />
                  </Field>
                </div>
                <Field label="Mô tả ngắn">
                  <textarea value={v.desc} onChange={(e) => update({ desc: e.target.value })} rows={2} className={`${INPUT} resize-y`} />
                </Field>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="4. Số liệu nổi bật"
        action={
          <button type="button" className={BTN_OUTLINE} onClick={() => set("stats", [...draft.stats, { value: "", label: "", desc: "" }])}>
            <Plus className="h-3.5 w-3.5" />
            Thêm số liệu
          </button>
        }
      >
        <div className="space-y-3">
          <p className="text-[11px] text-[#7a7a7a]">Chỉ ghi số liệu thật (vd: 3+ Năm hoạt động). Xóa hết để ẩn khối này.</p>
          {draft.stats.map((st, i) => {
            const update = (patch: Partial<typeof st>) => set("stats", draft.stats.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#2b2b2b]">Số liệu {i + 1}</strong>
                  <div className="flex gap-1.5">
                    <button type="button" className={BTN_ICON} aria-label="Đưa lên" disabled={i === 0} onClick={() => set("stats", move(draft.stats, i, -1))}>
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label="Đưa xuống" disabled={i === draft.stats.length - 1} onClick={() => set("stats", move(draft.stats, i, 1))}>
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label="Xóa" onClick={() => set("stats", draft.stats.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
                  <Field label="Con số" required>
                    <input value={st.value} onChange={(e) => update({ value: e.target.value })} className={INPUT} placeholder="3+" />
                  </Field>
                  <Field label="Nhãn" required>
                    <input value={st.label} onChange={(e) => update({ label: e.target.value })} className={INPUT} placeholder="Năm hoạt động" />
                  </Field>
                </div>
                <Field label="Dòng mô tả nhỏ (tùy chọn)">
                  <input value={st.desc} onChange={(e) => update({ desc: e.target.value })} className={INPUT} />
                </Field>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="5. Không gian cửa hàng"
        action={
          <button type="button" className={BTN_OUTLINE} onClick={() => set("spacePhotos", [...draft.spacePhotos, { image: "", caption: "" }])}>
            <Plus className="h-3.5 w-3.5" />
            Thêm ảnh
          </button>
        }
      >
        <div className="space-y-3">
          <p className="text-[11px] text-[#7a7a7a]">
            Ảnh khuyên dùng 1200 × 900 (tỉ lệ 4:3). Ô chưa có ảnh sẽ hiện khung chờ kèm chú thích. Xóa hết để ẩn ảnh.
          </p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {draft.spacePhotos.map((ph, i) => {
              const update = (patch: Partial<typeof ph>) =>
                set("spacePhotos", draft.spacePhotos.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={i} className="space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-[#2b2b2b]">Ảnh {i + 1}</strong>
                    <div className="flex gap-1.5">
                      <button type="button" className={BTN_ICON} aria-label="Đưa lên" disabled={i === 0} onClick={() => set("spacePhotos", move(draft.spacePhotos, i, -1))}>
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button type="button" className={BTN_ICON} aria-label="Đưa xuống" disabled={i === draft.spacePhotos.length - 1} onClick={() => set("spacePhotos", move(draft.spacePhotos, i, 1))}>
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button type="button" className={BTN_ICON} aria-label="Xóa" onClick={() => set("spacePhotos", draft.spacePhotos.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <ImageField label="Ảnh" value={ph.image} onChange={(v) => update({ image: v })} maxSize={1200} />
                  <Field label="Chú thích">
                    <input value={ph.caption} onChange={(e) => update({ caption: e.target.value })} className={INPUT} />
                  </Field>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card
        title="6. Câu hỏi thường gặp (FAQ chính sách)"
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
              <div key={i} className="space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#2b2b2b]">Câu hỏi {i + 1}</strong>
                  <div className="flex gap-1.5">
                    <button type="button" className={BTN_ICON} aria-label={`Đưa câu hỏi ${i + 1} lên`} disabled={i === 0} onClick={() => set("faq", move(draft.faq, i, -1))}>
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label={`Đưa câu hỏi ${i + 1} xuống`} disabled={i === draft.faq.length - 1} onClick={() => set("faq", move(draft.faq, i, 1))}>
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label={`Xóa câu hỏi ${i + 1}`} onClick={() => set("faq", draft.faq.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
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

export default function AdminAboutPage() {
  const content = useAboutContent();
  return (
    <div className="mx-auto max-w-5xl">
      <ContentTabs active="about" />
      <AboutForm key={JSON.stringify(content)} initial={content} />
    </div>
  );
}
