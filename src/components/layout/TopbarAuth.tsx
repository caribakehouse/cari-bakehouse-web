"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "@/lib/auth";

// Liên kết đăng nhập / tài khoản ở góc phải Topbar (phụ thuộc trạng thái đăng nhập mock)
export default function TopbarAuth() {
  const { user } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/tai-khoan" className="transition-colors hover:text-accent">
          Xin chào, <strong className="font-semibold text-cream">{user.fullName}</strong>
        </Link>
        <span className="text-cream/40">|</span>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="cursor-pointer transition-colors hover:text-accent"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/dang-nhap" className="transition-colors hover:text-accent">
        Đăng nhập
      </Link>
      <span className="text-cream/40">|</span>
      <Link href="/dang-ky" className="transition-colors hover:text-accent">
        Đăng ký
      </Link>
    </div>
  );
}
