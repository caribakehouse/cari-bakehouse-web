"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import { safeInternalPath } from "@/lib/utils";

/** Nút "Tiếp tục với Google" + đường kẻ "hoặc" — dùng ở trang Đăng nhập và Đăng ký. */
export default function GoogleSignInButton() {
  // useSearchParams cần Suspense để trang vẫn dựng sẵn được
  return (
    <Suspense fallback={null}>
      <GoogleSignIn />
    </Suspense>
  );
}

function GoogleSignIn() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // /auth/callback trả về ?loi=google khi khách hủy ở trang Google hoặc đăng nhập lỗi
  const shownError = error || (searchParams.get("loi") === "google" ? "Đăng nhập Google chưa thành công, vui lòng thử lại" : "");

  const start = async () => {
    setLoading(true);
    setError("");
    const next = safeInternalPath(searchParams.get("next"), "/tai-khoan");
    const message = await signInWithGoogle(next);
    // Thành công thì trình duyệt đã chuyển sang trang Google; chỉ dừng lại khi có lỗi
    if (message) {
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="mb-5 space-y-4">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#dadce0] bg-white px-6 py-3 text-sm font-semibold text-[#3c4043] shadow-xs transition-colors hover:bg-[#f8f9fa] disabled:cursor-wait disabled:opacity-70"
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        {loading ? "Đang mở Google..." : "Tiếp tục với Google"}
      </button>
      {shownError && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {shownError}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-[#E5D9C3]" />
        hoặc dùng email
        <span className="h-px flex-1 bg-[#E5D9C3]" />
      </div>
    </div>
  );
}
