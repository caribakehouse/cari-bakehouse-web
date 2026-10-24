"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import AuthShell from "@/components/account/AuthShell";
import { INPUT_CLASS, INPUT_ERROR_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from "@/components/ui/form-styles";
import { updatePassword, useAuth } from "@/lib/auth";

type Errors = { password?: string; confirm?: string; form?: string };

// Đặt mật khẩu mới: mở từ link trong email "Quên mật khẩu" (đã đăng nhập tạm qua /auth/callback)
// hoặc từ trang tài khoản. Xong → đăng xuất → đăng nhập lại bằng mật khẩu mới.
export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  // Đổi xong thì tài khoản bị đăng xuất → không hiện thông báo "link hết hạn" trong lúc chuyển trang
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (password.length < 8) next.password = "Mật khẩu cần ít nhất 8 ký tự";
    if (confirm !== password) next.confirm = "Hai mật khẩu chưa khớp nhau";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const message = await updatePassword(password);
    if (message) {
      setSaving(false);
      setErrors({ form: message });
      return;
    }
    setDone(true);
    router.push("/dang-nhap?doi_mk=1");
  };

  const footer = (
    <Link href="/dang-nhap" className="font-bold text-[#1B4B5A] underline-offset-4 hover:underline">
      Về trang đăng nhập
    </Link>
  );

  if (hydrated && !user && !saving && !done) {
    return (
      <AuthShell title="Đặt mật khẩu mới" subtitle="Link đặt lại mật khẩu không còn hiệu lực" footer={footer}>
        <div className="space-y-4 text-center">
          <p className="text-sm text-text-muted">
            Link có thể đã hết hạn hoặc đã được dùng. Vui lòng gửi lại yêu cầu quên mật khẩu để nhận link mới.
          </p>
          <Link href="/quen-mat-khau" className={PRIMARY_BUTTON_CLASS}>
            Gửi lại link
          </Link>
        </div>
      </AuthShell>
    );
  }

  const field = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    error: string | undefined,
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setErrors({});
          }}
          aria-invalid={!!error}
          className={`${INPUT_CLASS} pr-11 ${error ? INPUT_ERROR_CLASS : ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-muted hover:text-[#1B4B5A]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );

  return (
    <AuthShell
      title="Đặt mật khẩu mới"
      subtitle={user ? `Tài khoản ${user.email}` : "Đang kiểm tra link..."}
      footer={footer}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {field("new-password", "Mật khẩu mới", password, setPassword, errors.password)}
        {field("confirm-password", "Nhập lại mật khẩu mới", confirm, setConfirm, errors.confirm)}
        {errors.form && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errors.form}
          </p>
        )}
        <button
          type="submit"
          disabled={saving || !user}
          className={`${PRIMARY_BUTTON_CLASS} w-full disabled:cursor-wait disabled:opacity-70`}
        >
          <KeyRound className="h-4 w-4 text-[#F6CE8B]" />
          {saving ? "Đang lưu..." : "Lưu mật khẩu mới"}
        </button>
        <p className="text-center text-xs text-text-muted">Lưu xong, bạn đăng nhập lại bằng mật khẩu mới.</p>
      </form>
    </AuthShell>
  );
}
