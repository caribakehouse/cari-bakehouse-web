"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import ContentTabs from "@/components/admin/ContentTabs";
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

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    if (!draft.storyTitle.trim() || !draft.storyBody.trim()) {
      setError("Khối câu chuyện thương hiệu cần có tiêu đề và nội dung.");
      return;
    }
    if (draft.values.some((v) => !v.title.trim())) {
      setError("Mỗi giá trị cốt lõi cần có tiêu đề.");
      return;
    }
    if (draft.faq.some((f) => !f.question.trim() || !f.answer.trim())) {
      setError("Mỗi câu hỏi thường gặp cần có cả câu hỏi và câu trả lời.");
      return;
    }
    setError("");
    const saveError = await saveAboutContent(draft);
    if (saveError) return toast(saveError, "error");
    toast("Đã lưu — mở trang Giới thiệu để xem thay đổi");
  };

  return (
    <div className="space-y-5 pb-20">
      <Card title="1. Câu chuyện thương hiệu">
        <div className="space-y-3">
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
        title="2. Giá trị cốt lõi"
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
        title="3. Câu hỏi thường gặp (FAQ chính sách)"
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
          <p className={`text-[11px] ${error ? "text-rose-600" : "text-[#7a7a7a]"}`}>{error || "Thay đổi chỉ có hiệu lực sau khi bấm Lưu."}</p>
          <div className="flex gap-2">
            <button type="button" className={BTN_OUTLINE} onClick={() => setDraft(structuredClone(initial))}>
              Hoàn tác
            </button>
            <button type="button" className={BTN_SOLID} onClick={save}>
              Lưu nội dung
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
      <AboutForm initial={content} />
    </div>
  );
}
