import type { ReactNode } from "react";

// Khung chung cho trang đăng nhập / đăng ký
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-[#FFF8EF] px-4 py-10 sm:py-16">
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#F6CE8B]/25 blur-2xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#1B4B5A]/5 blur-2xl" />

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-xs sm:p-8">
          {children}
        </div>

        <p className="mt-5 text-center text-sm text-text-muted">{footer}</p>
      </div>
    </div>
  );
}
