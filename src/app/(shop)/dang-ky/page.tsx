"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import AuthShell from "@/components/account/AuthShell";
import {
  INPUT_CLASS,
  INPUT_ERROR_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/components/ui/form-styles";
import { login, useAuth } from "@/lib/auth";
import { ensureCustomer } from "@/lib/db";
import { safeInternalPath } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// SĐT Việt Nam: 10 số bắt đầu bằng 0, hoặc dạng +84
const PHONE_PATTERN = /^(0|\+84)\d{9}$/;

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  const [values, setValues] = useState<FormValues>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [redirecting, setRedirecting] = useState(false);

  const setField = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ và tên";
    if (!EMAIL_PATTERN.test(values.email.trim())) nextErrors.email = "Vui lòng nhập email hợp lệ";
    if (!PHONE_PATTERN.test(values.phone.replace(/[\s.-]/g, ""))) {
      nextErrors.phone = "Số điện thoại chưa hợp lệ (ví dụ: 0901234567)";
    }
    if (values.password.length < 6) nextErrors.password = "Mật khẩu cần ít nhất 6 ký tự";
    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu để xác nhận";
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // MOCK: chưa tạo tài khoản thật — lưu tạm thông tin và coi như đã đăng nhập.
    // TODO: gọi API đăng ký thật khi nối backend.
    const profile = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    };
    ensureCustomer(profile); // tạo hồ sơ khách trong dữ liệu chung (hiện ở /admin/khach-hang)
    login(profile);
    setRedirecting(true);

    const next = safeInternalPath(new URLSearchParams(window.location.search).get("next"), "/tai-khoan");
    router.push(next);
  };

  const alreadyLoggedIn = hydrated && user !== null && !redirecting;

  const fields: {
    key: keyof FormValues;
    label: string;
    type: string;
    autoComplete: string;
    placeholder: string;
  }[] = [
    { key: "fullName", label: "Họ và tên", type: "text", autoComplete: "name", placeholder: "Nguyễn Văn A" },
    { key: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "ban@example.com" },
    { key: "phone", label: "Số điện thoại", type: "tel", autoComplete: "tel", placeholder: "0901234567" },
    { key: "password", label: "Mật khẩu", type: "password", autoComplete: "new-password", placeholder: "Ít nhất 6 ký tự" },
    {
      key: "confirmPassword",
      label: "Xác nhận mật khẩu",
      type: "password",
      autoComplete: "new-password",
      placeholder: "Nhập lại mật khẩu",
    },
  ];

  return (
    <AuthShell
      title="Đăng ký tài khoản"
      subtitle="Tạo tài khoản để đặt bánh nhanh hơn và tích điểm mỗi đơn hàng"
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link href="/dang-nhap" className="font-bold text-[#1B4B5A] underline-offset-4 hover:underline">
            Đăng nhập
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
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label htmlFor={`register-${field.key}`} className={LABEL_CLASS}>
                {field.label}
              </label>
              <input
                id={`register-${field.key}`}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={setField(field.key)}
                aria-invalid={!!errors[field.key]}
                className={`${INPUT_CLASS} ${errors[field.key] ? INPUT_ERROR_CLASS : ""}`}
              />
              {errors[field.key] && <p className="text-xs text-rose-600">{errors[field.key]}</p>}
            </div>
          ))}

          <button type="submit" className={`${PRIMARY_BUTTON_CLASS} w-full`}>
            <UserPlus className="h-4 w-4 text-[#F6CE8B]" />
            Đăng ký
          </button>

          <p className="text-center text-[11px] text-text-muted">
            Bản demo: thông tin chỉ được lưu tạm trên trình duyệt này.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
