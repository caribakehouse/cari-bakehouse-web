// Đăng nhập MOCK: chỉ lưu tạm thông tin người dùng vào localStorage để các trang khác kiểm tra.
// Có 2 vai trò: khách thường và admin (tài khoản demo ADMIN_EMAIL).
// TODO: thay bằng kiểm tra vai trò thật qua Supabase Auth ở Giai đoạn 4.

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createPersistentStore } from "@/lib/persistent-store";
import { ADMIN_EMAIL } from "@/lib/mock-data";
import { getCustomerByEmail } from "@/lib/db";
import type { AuthUser, UserRole } from "@/types/user";

function sanitizeUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<AuthUser>;
  if (typeof v.fullName !== "string" || typeof v.email !== "string") return null;
  return {
    fullName: v.fullName,
    email: v.email,
    phone: typeof v.phone === "string" ? v.phone : "",
    role: v.role === "admin" ? "admin" : undefined,
  };
}

const authStore = createPersistentStore<AuthUser | null>("cari-auth", null, sanitizeUser);

const subscribeNoop = () => () => {};

/** false khi render trên server và lần render hydrate đầu tiên, true sau đó. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function login(user: AuthUser) {
  authStore.set(user);
}

export function logout() {
  authStore.set(null);
}

/**
 * Dựng hồ sơ đăng nhập mock từ email (chưa kiểm tra mật khẩu):
 * - ADMIN_EMAIL → vai trò admin
 * - email đã có trong danh sách khách hàng → dùng hồ sơ đó (thấy đơn hàng + điểm mẫu)
 * - email lạ → khách mới, tên lấy từ phần trước dấu @
 */
export function buildMockUser(rawEmail: string): AuthUser {
  const email = rawEmail.trim();
  if (email.toLowerCase() === ADMIN_EMAIL) {
    return { fullName: "Quản trị viên Cari", email, phone: "", role: "admin" };
  }
  const customer = getCustomerByEmail(email);
  if (customer) {
    return { fullName: customer.fullName, email: customer.email, phone: customer.phone };
  }
  return { fullName: email.split("@")[0] || "Khách", email, phone: "" };
}

export function useAuth() {
  const user = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );
  const hydrated = useHydrated();
  return { user, isLoggedIn: user !== null, isAdmin: user?.role === "admin", hydrated };
}

type RequireAuthResult =
  | { status: "ready"; user: AuthUser }
  | { status: "forbidden"; user: AuthUser }
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null };

/**
 * Guard cho các trang chỉ dành cho khách đã đăng nhập (và tùy chọn: đúng vai trò).
 * - Chưa từng đăng nhập khi vào trang → chuyển sang /dang-nhap?next=<nextPath>.
 * - Đang đăng nhập rồi bấm Đăng xuất ngay trên trang → KHÔNG tự chuyển hướng (nơi bấm đăng xuất
 *   đã tự điều hướng), tránh hai lần điều hướng chạy đua nhau; trả về "signed-out" để trang hiện thông báo.
 * - Đã đăng nhập nhưng sai vai trò → "forbidden".
 */
export function useRequireAuth(nextPath: string, requiredRole?: UserRole): RequireAuthResult {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [hadUser, setHadUser] = useState(false);
  if (user && !hadUser) setHadUser(true);

  useEffect(() => {
    if (hydrated && !user && !hadUser) router.replace(`/dang-nhap?next=${nextPath}`);
  }, [hydrated, user, hadUser, router, nextPath]);

  if (user) {
    const role: UserRole = user.role ?? "customer";
    if (requiredRole && role !== requiredRole) return { status: "forbidden", user };
    return { status: "ready", user };
  }
  return hydrated && hadUser ? { status: "signed-out", user: null } : { status: "loading", user: null };
}
