"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { BTN_OUTLINE, INPUT } from "@/components/admin/ui";
import { uploadImage } from "@/lib/storage";

const IS_UPLOADED = (v: string) => v.startsWith("data:");

/**
 * Ô nhập ảnh: dán link ảnh (https://...) hoặc tải ảnh từ máy (thu nhỏ rồi đẩy lên Supabase Storage,
 * ô link tự điền link ảnh vừa tải).
 */
export default function ImageField({
  label,
  value,
  onChange,
  maxSize = 1200,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxSize?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      onChange(await uploadImage(file, maxSize));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không đọc được ảnh");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1">
      <span className="text-[11px] font-bold text-[#5b5b5b]">{label}</span>
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-dashed border-[#9a9a9a] bg-[#e8e8e8]">
          {value ? (
            <SafeImage src={value} alt="Ảnh xem trước" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[#9a9a9a]">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={IS_UPLOADED(value) ? "(Ảnh tải lên từ máy)" : value}
            readOnly={IS_UPLOADED(value)}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="Dán link ảnh https://..."
            aria-label={`${label} — link ảnh`}
            className={INPUT}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label={`${label} — tải ảnh từ máy`}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button type="button" className={BTN_OUTLINE} onClick={() => fileRef.current?.click()} disabled={loading}>
              <ImagePlus className="h-3.5 w-3.5" />
              {loading ? "Đang tải lên..." : "Tải ảnh từ máy"}
            </button>
            {value && (
              <button type="button" className={BTN_OUTLINE} onClick={() => onChange("")}>
                <Trash2 className="h-3.5 w-3.5" />
                Xóa ảnh
              </button>
            )}
          </div>
          {error && <p className="text-[11px] text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
