"use client";

// Bộ thành phần giao diện dùng chung cho khu admin (bám phong cách wireframe 07-khung-admin:
// sidebar #2b2b2b, chip lọc bo tròn, bảng viền mảnh, nút chữ nhật).

import { useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const BTN_SOLID =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#2b2b2b] bg-[#2b2b2b] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50";
export const BTN_OUTLINE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#4a4a4a] bg-white px-4 py-2 text-xs font-bold text-[#2b2b2b] transition-colors hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-50";
export const BTN_DANGER =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-rose-600 bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50";
export const BTN_ICON =
  "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#9a9a9a] text-[#5b5b5b] transition-colors hover:bg-[#f0e6c8] hover:text-[#2b2b2b]";

export const INPUT =
  "w-full rounded-md border border-[#c9c9c9] bg-white px-3 py-2 text-sm text-[#2b2b2b] placeholder:text-[#9a9a9a] focus:border-[#2b2b2b] focus:outline-none focus:ring-2 focus:ring-[#F6CE8B]/60";
export const INPUT_INVALID = "border-rose-400 focus:border-rose-500 focus:ring-rose-200";

export const TABLE_WRAP = "overflow-x-auto rounded-lg border border-[#d6d6d6] bg-white";
export const TABLE = "w-full border-collapse text-left";
export const TH = "whitespace-nowrap border-b border-[#9a9a9a]/60 bg-[#fafafa] px-3 py-2.5 text-[11px] font-bold text-[#2b2b2b]";
export const TD = "border-b border-[#e3e3e3] px-3 py-2.5 align-middle text-[12px] text-[#5b5b5b]";

export type Tone = "green" | "red" | "amber" | "blue" | "gray";

const TONES: Record<Tone, string> = {
  green: "bg-[#e3f3e6] text-[#2e7d32]",
  red: "bg-[#f3e3e3] text-[#c62828]",
  amber: "bg-[#fbefd0] text-[#8a5a00]",
  blue: "bg-[#e1edf8] text-[#1c5d99]",
  gray: "bg-[#ececec] text-[#5b5b5b]",
};

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/** Chip lọc bo tròn ở thanh công cụ */
export function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
        active
          ? "border-[#2b2b2b] bg-[#2b2b2b] text-white"
          : "border-[#9a9a9a] bg-white text-[#5b5b5b] hover:bg-[#f0e6c8]"
      }`}
    >
      {children}
      {count !== undefined && <span className={`ml-1.5 ${active ? "text-white/70" : "text-[#9a9a9a]"}`}>{count}</span>}
    </button>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center justify-between gap-3">{children}</div>;
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-[#d6d6d6] bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-[#e3e3e3] px-4 py-3">
          <h2 className="text-sm font-bold text-[#2b2b2b]">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-[11px] font-bold text-[#5b5b5b]">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-[#9a9a9a]">{hint}</span>}
      {error && <span className="block text-[11px] text-rose-600">{error}</span>}
    </label>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-[12px] text-[#9a9a9a]">
        {children}
      </td>
    </tr>
  );
}

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  const btn = "flex h-7 w-7 cursor-pointer items-center justify-center border border-[#9a9a9a] text-[11px] text-[#5b5b5b] hover:bg-[#f0e6c8] disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <nav aria-label="Phân trang" className="mt-5 flex justify-center gap-2">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${btn} ${n === page ? "border-[#2b2b2b] bg-[#2b2b2b] text-white hover:bg-[#2b2b2b]" : ""}`}
        >
          {n}
        </button>
      ))}
      <button type="button" className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}) {
  // Đóng bằng phím Esc + khóa cuộn nền khi đang mở
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl sm:rounded-xl ${
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#e3e3e3] px-5 py-3.5">
          <h2 className="text-sm font-bold text-[#2b2b2b]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className={BTN_ICON}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e3e3e3] bg-[#fafafa] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className={BTN_OUTLINE} onClick={onClose}>
            Hủy bỏ
          </button>
          <button
            type="button"
            className={danger ? BTN_DANGER : BTN_SOLID}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-[#2b2b2b]">{message}</div>
    </Modal>
  );
}

/** Ô thống kê ở Dashboard */
export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-[#d6d6d6] bg-white p-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-[#7a7a7a]">{label}</div>
        <div className="mt-1.5 text-3xl font-black text-[#2b2b2b]">{value}</div>
        {hint && <div className="mt-1 text-[11px] text-[#9a9a9a]">{hint}</div>}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e6c8] text-[#2b2b2b]">{icon}</div>
    </div>
  );
}
