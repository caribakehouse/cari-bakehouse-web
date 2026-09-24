"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import ContentTabs from "@/components/admin/ContentTabs";
import ImageField from "@/components/admin/ImageField";
import ProductPicker from "@/components/admin/ProductPicker";
import { useAdmin } from "@/components/admin/AdminContext";
import { BTN_ICON, BTN_OUTLINE, BTN_SOLID, Card, Field, INPUT } from "@/components/admin/ui";
import { saveHomeContent, useHomeContent, useReviews } from "@/lib/db";
import type { HomeContent } from "@/types/content";

function HomeContentForm({ initial }: { initial: HomeContent }) {
  const { toast } = useAdmin();
  const reviews = useReviews();
  const [draft, setDraft] = useState<HomeContent>(() => structuredClone(initial));
  const [error, setError] = useState("");

  const set = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const move = <T,>(list: T[], index: number, delta: -1 | 1): T[] => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return list;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };

  const save = async () => {
    if (draft.heroSlides.some((s) => !s.image.trim())) {
      setError("Mỗi slide trong hero cần có ảnh.");
      return;
    }
    if (draft.features.some((f) => !f.title.trim()) || draft.banners.some((b) => !b.label.trim() || !b.image.trim())) {
      setError("Dải tính năng và banner đôi không được để trống tiêu đề/ảnh.");
      return;
    }
    setError("");
    const saveError = await saveHomeContent({ ...draft, gallery: draft.gallery.filter((g) => g.image.trim()) });
    if (saveError) return toast(saveError, "error");
    toast("Đã lưu nội dung trang chủ — mở cửa hàng để xem thay đổi");
  };

  const reviewToggle = (id: number) =>
    set(
      "featuredReviewIds",
      draft.featuredReviewIds.includes(id) ? draft.featuredReviewIds.filter((x) => x !== id) : [...draft.featuredReviewIds, id],
    );

  return (
    <div className="space-y-5 pb-20">
      {/* 1. Hero slider */}
      <Card
        title="1. Hero slider"
        action={
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() =>
              set("heroSlides", [
                ...draft.heroSlides,
                { id: Math.max(0, ...draft.heroSlides.map((s) => s.id)) + 1, image: "", title: "", ctaLabel: "", ctaHref: "/san-pham", showText: false },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm slide
          </button>
        }
      >
        <div className="space-y-4">
          {draft.heroSlides.map((s, i) => {
            const update = (patch: Partial<typeof s>) =>
              set("heroSlides", draft.heroSlides.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={s.id} className="space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#2b2b2b]">Slide {i + 1}</strong>
                  <div className="flex gap-1.5">
                    <button type="button" className={BTN_ICON} aria-label={`Đưa slide ${i + 1} lên`} disabled={i === 0} onClick={() => set("heroSlides", move(draft.heroSlides, i, -1))}>
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label={`Đưa slide ${i + 1} xuống`} disabled={i === draft.heroSlides.length - 1} onClick={() => set("heroSlides", move(draft.heroSlides, i, 1))}>
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button type="button" className={BTN_ICON} aria-label={`Xóa slide ${i + 1}`} onClick={() => set("heroSlides", draft.heroSlides.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <ImageField label="Ảnh slide (khuyên dùng 2100 × 800)" value={s.image} onChange={(v) => update({ image: v })} maxSize={2400} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Tiêu đề">
                    <input value={s.title} onChange={(e) => update({ title: e.target.value })} className={INPUT} />
                  </Field>
                  <Field label="Chữ trên nút CTA">
                    <input value={s.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value })} className={INPUT} placeholder="Khám phá ngay" />
                  </Field>
                  <Field label="Link nút CTA">
                    <input value={s.ctaHref} onChange={(e) => update({ ctaHref: e.target.value })} className={INPUT} placeholder="/san-pham" />
                  </Field>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[#5b5b5b]">
                  <input
                    type="checkbox"
                    checked={!!s.showText}
                    onChange={(e) => update({ showText: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[#2b2b2b]"
                  />
                  Hiện tiêu đề và nút CTA đè lên ảnh (mặc định tắt: slider chỉ hiện ảnh)
                </label>
              </div>
            );
          })}
          {draft.heroSlides.length === 0 && <p className="text-[11px] text-[#9a9a9a]">Chưa có slide — khối hero sẽ bị ẩn ở trang chủ.</p>}
        </div>
      </Card>

      {/* 2. Dải tính năng */}
      <Card title="2. Dải tính năng (3 ô)">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {draft.features.map((f, i) => (
            <Field key={f.id} label={`Ô ${i + 1}`} required>
              <input
                value={f.title}
                onChange={(e) => set("features", draft.features.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                className={INPUT}
              />
            </Field>
          ))}
        </div>
      </Card>

      {/* 3. Banner đôi */}
      <Card title="3. Banner đôi Bánh / Đồ uống">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {draft.banners.map((b, i) => {
            const update = (patch: Partial<typeof b>) => set("banners", draft.banners.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="space-y-3 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
                <strong className="text-xs text-[#2b2b2b]">Banner {i + 1}</strong>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Tiêu đề (mô tả ảnh)" required>
                    <input value={b.label} onChange={(e) => update({ label: e.target.value })} className={INPUT} />
                  </Field>
                  <Field label="Link khi bấm">
                    <input value={b.href} onChange={(e) => update({ href: e.target.value })} className={INPUT} />
                  </Field>
                </div>
                <ImageField
                  label="Ảnh banner (khuyên dùng 1200 × 440)"
                  value={b.image}
                  onChange={(v) => update({ image: v })}
                  maxSize={1200}
                />
                <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[#5b5b5b]">
                  <input
                    type="checkbox"
                    checked={!!b.showText}
                    onChange={(e) => update({ showText: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[#2b2b2b]"
                  />
                  Hiện tiêu đề đè lên ảnh (mặc định tắt: chỉ hiện ảnh bạn tự thiết kế)
                </label>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4. Top order */}
      <Card title="4. Top order">
        <ProductPicker label="Sản phẩm nổi bật (theo thứ hạng)" slugs={draft.topOrderSlugs} onChange={(v) => set("topOrderSlugs", v)} max={3} />
      </Card>

      {/* 5. Thực đơn */}
      <Card title="5. Thực đơn của Cari">
        <ProductPicker label="Sản phẩm hiển thị ở lưới thực đơn" slugs={draft.menuSlugs} onChange={(v) => set("menuSlugs", v)} max={12} />
      </Card>

      {/* 6. Gallery */}
      <Card
        title="6. Ảnh gallery"
        action={
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() => set("gallery", [...draft.gallery, { id: Math.max(0, ...draft.gallery.map((g) => g.id)) + 1, image: "", alt: "" }])}
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm ảnh
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {draft.gallery.map((g, i) => {
            const update = (patch: Partial<typeof g>) => set("gallery", draft.gallery.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={g.id} className="space-y-2 rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#2b2b2b]">Ảnh {i + 1}</strong>
                  <button type="button" className={BTN_ICON} aria-label={`Xóa ảnh ${i + 1}`} onClick={() => set("gallery", draft.gallery.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <ImageField label="Ảnh" value={g.image} onChange={(v) => update({ image: v })} maxSize={800} />
                <Field label="Mô tả ảnh (alt)">
                  <input value={g.alt} onChange={(e) => update({ alt: e.target.value })} className={INPUT} />
                </Field>
              </div>
            );
          })}
          {draft.gallery.length === 0 && <p className="text-[11px] text-[#9a9a9a]">Chưa có ảnh — khối gallery sẽ bị ẩn ở trang chủ.</p>}
        </div>
      </Card>

      {/* 7. Giới thiệu ngắn */}
      <Card title="7. Đoạn giới thiệu ngắn">
        <div className="space-y-3">
          <ImageField label="Ảnh bên trái" value={draft.about.image} onChange={(v) => set("about", { ...draft.about, image: v })} maxSize={900} />
          <Field label="Nhãn trên ảnh">
            <input value={draft.about.badge} onChange={(e) => set("about", { ...draft.about, badge: e.target.value })} className={INPUT} />
          </Field>
          <Field label="Đoạn giới thiệu">
            <textarea
              value={draft.about.quote}
              onChange={(e) => set("about", { ...draft.about, quote: e.target.value })}
              rows={4}
              className={`${INPUT} resize-y`}
            />
          </Field>
        </div>
      </Card>

      {/* 8. Đánh giá nổi bật */}
      <Card title="8. Đánh giá nổi bật">
        <div className="space-y-2">
          {reviews.map((r) => (
            <label key={r.id} className="flex cursor-pointer items-start gap-3 rounded-md border border-[#e3e3e3] bg-white p-3 text-[12px]">
              <input
                type="checkbox"
                checked={draft.featuredReviewIds.includes(r.id)}
                onChange={() => reviewToggle(r.id)}
                className="mt-0.5 h-3.5 w-3.5 accent-[#2b2b2b]"
              />
              <span>
                <strong className="text-[#2b2b2b]">{r.name}</strong>
                <span className="ml-2 text-[#9a9a9a]">
                  {"★".repeat(r.rating)} • {r.date}
                </span>
                <span className="mt-0.5 block line-clamp-2 text-[#5b5b5b]">{r.content}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      {/* Thanh lưu cố định */}
      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#d6d6d6] bg-white/95 px-4 py-3 backdrop-blur lg:left-[220px]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className={`text-[11px] ${error ? "text-rose-600" : "text-[#7a7a7a]"}`}>
            {error || "Thay đổi chỉ có hiệu lực sau khi bấm Lưu."}
          </p>
          <div className="flex gap-2">
            <button type="button" className={BTN_OUTLINE} onClick={() => setDraft(structuredClone(initial))}>
              Hoàn tác
            </button>
            <button type="button" className={BTN_SOLID} onClick={save}>
              Lưu nội dung trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminHomeContentPage() {
  const content = useHomeContent();
  return (
    <div className="mx-auto max-w-5xl">
      <ContentTabs active="home" />
      <HomeContentForm initial={content} />
    </div>
  );
}
