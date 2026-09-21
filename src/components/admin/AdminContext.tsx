"use client";

import { createContext, useContext } from "react";

export type ToastTone = "success" | "error";

interface AdminContextValue {
  /** Nội dung ô tìm kiếm ở topbar (tự xóa khi chuyển màn hình) */
  query: string;
  toast: (message: string, tone?: ToastTone) => void;
}

export const AdminContext = createContext<AdminContextValue>({ query: "", toast: () => {} });

export function useAdmin() {
  return useContext(AdminContext);
}

/** So khớp không phân biệt hoa thường và dấu tiếng Việt */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function matchesQuery(query: string, ...fields: (string | number | undefined)[]): boolean {
  const q = normalizeText(query.trim());
  if (!q) return true;
  return fields.some((f) => f !== undefined && normalizeText(String(f)).includes(q));
}
