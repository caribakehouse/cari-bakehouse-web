"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import AuthShell from "@/components/account/AuthShell";
import { INPUT_CLASS, INPUT_ERROR_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from "@/components/ui/form-styles";
import { requestPasswordReset } from "@/lib/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Quên mật khẩu: nhập email → nhận link đặt lại mật khẩu (gửi qua SMTP riêng cấu hình trong Supabase)
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    setSending(true);
    const message = await requestPasswordReset(email);
    setSending(false);
    if (message) {
      setError(message);
      return;
    }
    setSentTo(email.trim());
  };

  return (
    <AuthShell
      title="Quên mật khẩu"
      subtitle="Nhập email tài khoản, Cari sẽ gửi link đặt lại mật khẩu"
      footer={
        <>
          Nhớ ra mật khẩu rồi?{" "}
          <Link href="/dang-nhap" className="font-bold text-[#1B4B5A] underline-offset-4 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-[#2b2b2b]">
            Nếu <strong className="text-[#1B4B5A]">{sentTo}</strong> đã có tài khoản, Cari vừa gửi link đặt lại mật khẩu tới
            email này.
          </p>
          <p className="text-sm text-text-muted">
            Mở hộp thư (kể cả mục Spam / Quảng cáo) và bấm link trong vòng 1 giờ. Không thấy email? Đợi vài phút rồi gửi lại.
          </p>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="cursor-pointer text-sm font-bold text-[#1B4B5A] underline-offset-4 hover:underline"
          >
            Gửi lại
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="forgot-email" className={LABEL_CLASS}>
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              aria-invalid={!!error}
              className={`${INPUT_CLASS} ${error ? INPUT_ERROR_CLASS : ""}`}
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={sending}
            className={`${PRIMARY_BUTTON_CLASS} w-full disabled:cursor-wait disabled:opacity-70`}
          >
            <Mail className="h-4 w-4 text-[#F6CE8B]" />
            {sending ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
          </button>
          <p className="text-center text-xs text-text-muted">
            Tài khoản tạo bằng nút &quot;Tiếp tục với Google&quot; không cần mật khẩu — hãy đăng nhập bằng Google.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
