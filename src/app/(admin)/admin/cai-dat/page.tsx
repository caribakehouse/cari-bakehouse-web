"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { BTN_OUTLINE, BTN_SOLID, Card, Field, INPUT, INPUT_INVALID } from "@/components/admin/ui";
import { saveSiteSettings, useSiteSettings } from "@/lib/db";
import { formatHotline, isHttpUrl } from "@/lib/utils";
import type { SiteSettings } from "@/types/content";

type Errors = Partial<Record<keyof SiteSettings, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const URL_FIELDS: { key: "zalo" | "instagram" | "facebook" | "tiktok" | "threads"; label: string; placeholder: string; required?: boolean }[] = [
  { key: "zalo", label: "Link Zalo", placeholder: "https://zalo.me/0338975925", required: true },
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/ten-tai-khoan/" },
  { key: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/ten-trang" },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@ten-tai-khoan" },
  { key: "threads", label: "Threads", placeholder: "https://www.threads.com/@ten-tai-khoan" },
];

function SettingsForm({ initial }: { initial: SiteSettings }) {
  const { toast } = useAdmin();
  const [draft, setDraft] = useState<SiteSettings>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const save = async () => {
    const next: Errors = {};
    const hotlineDigits = draft.hotline.replace(/\D/g, "");
    if (hotlineDigits.length < 9 || hotlineDigits.length > 11) next.hotline = "Hotline cần 9–11 chữ số";
    if (!EMAIL_PATTERN.test(draft.email.trim())) next.email = "Email chưa hợp lệ";
    for (const f of URL_FIELDS) {
      const value = draft[f.key].trim();
      if (f.required && !value) next[f.key] = "Không được để trống";
      else if (value && !isHttpUrl(value)) next[f.key] = "Link phải bắt đầu bằng https://";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const error = await saveSiteSettings({
      hotline: hotlineDigits,
      email: draft.email.trim(),
      zalo: draft.zalo.trim(),
      instagram: draft.instagram.trim(),
      facebook: draft.facebook.trim(),
      tiktok: draft.tiktok.trim(),
      threads: draft.threads.trim(),
    });
    if (error) return toast(error, "error");
    toast("Đã lưu cài đặt chung");
  };

  return (
    <div className="space-y-5">
      <Card title="Thông tin liên hệ">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Hotline"
            required
            error={errors.hotline}
            hint={`Hiển thị: ${formatHotline(draft.hotline.replace(/\D/g, ""))} — dùng ở Topbar, Footer, menu, nút gọi và trang Liên hệ`}
          >
            <input
              value={draft.hotline}
              inputMode="tel"
              onChange={(e) => set("hotline", e.target.value)}
              aria-invalid={!!errors.hotline}
              className={`${INPUT} ${errors.hotline ? INPUT_INVALID : ""}`}
              placeholder="0338975925"
            />
          </Field>
          <Field label="Email" required error={errors.email} hint="Dùng ở Topbar, Footer, menu và trang Liên hệ">
            <input
              value={draft.email}
              type="email"
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email}
              className={`${INPUT} ${errors.email ? INPUT_INVALID : ""}`}
              placeholder="lienhe@example.com"
            />
          </Field>
        </div>
      </Card>

      <Card title="Zalo & mạng xã hội">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {URL_FIELDS.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              required={f.required}
              error={errors[f.key]}
              hint={f.key === "zalo" ? "Nút Zalo ở bước đặt hàng và nút liên hệ nổi mở link này" : "Để trống nếu chưa có — biểu tượng sẽ không dẫn đi đâu"}
            >
              <input
                value={draft[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                aria-invalid={!!errors[f.key]}
                className={`${INPUT} ${errors[f.key] ? INPUT_INVALID : ""}`}
                placeholder={f.placeholder}
              />
            </Field>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <button type="button" className={BTN_OUTLINE} onClick={() => setDraft(initial)}>
          Hoàn tác
        </button>
        <button type="button" className={BTN_SOLID} onClick={save}>
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const settings = useSiteSettings();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SettingsForm key={JSON.stringify(settings)} initial={settings} />
    </div>
  );
}
