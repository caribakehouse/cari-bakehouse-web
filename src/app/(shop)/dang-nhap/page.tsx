"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import AuthShell from "@/components/account/AuthShell";
import {
  INPUT_CLASS,
  INPUT_ERROR_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/components/ui/form-styles";
import { signIn, useAuth } from "@/lib/auth";
import { safeInternalPath } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Vui lòng nhập email hợp lệ";
    if (!password) nextErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if ("error" in result) {
      setErrors({ form: result.error });
      return;
    }
    setRedirecting(true);

    // Quay lại trang khách đang muốn tới (vd. /dat-hang); mặc định: admin → /admin, khách → /tai-khoan
    const next = safeInternalPath(
      new URLSearchParams(window.location.search).get("next"),
      result.user.role === "admin" ? "/admin" : "/tai-khoan",
    );
    router.push(next);
  };

  const alreadyLoggedIn = hydrated && user !== null && !redirecting;

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại với Cari Bakehouse"
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="font-bold text-[#1B4B5A] underline-offset-4 hover:underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      {alreadyLoggedIn ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-[#2b2b2b]">
            Bạn đang đăng nhập với <strong className="text-[#1B4B5A]">{user.email}</strong>.
          </p>
          <Link href="/tai-khoan" className={PRIMARY_BUTTON_CLASS}>
            Đến trang tài khoản
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className={LABEL_CLASS}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              className={`${INPUT_CLASS} ${errors.email ? INPUT_ERROR_CLASS : ""}`}
            />
            {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className={LABEL_CLASS}>
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                className={`${INPUT_CLASS} pr-11 ${errors.password ? INPUT_ERROR_CLASS : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-muted hover:text-[#1B4B5A]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
          </div>

          {errors.form && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || redirecting}
            className={`${PRIMARY_BUTTON_CLASS} w-full disabled:cursor-wait disabled:opacity-70`}
          >
            <LogIn className="h-4 w-4 text-[#F6CE8B]" />
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
