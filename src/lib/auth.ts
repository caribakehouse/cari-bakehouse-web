// Đăng nhập thật qua Supabase Auth. Có 2 vai trò: khách thường và admin (profiles.role = 'admin',
// chỉ cấp được trong Supabase SQL Editor). Trang chặn quyền ở đây chỉ để hiển thị cho đúng —
// quyền đọc/ghi dữ liệu thật do RLS trong database quyết định (supabase/migrations/0001_init.sql).

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { AuthError, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser, UserRole } from "@/types/user";

interface AuthState {
  user: AuthUser | null;
  /** Đã biết chắc đang đăng nhập hay chưa (đã hỏi Supabase xong) */
  ready: boolean;
}

const SERVER_STATE: AuthState = { user: null, ready: false };

let state: AuthState = SERVER_STATE;
let started = false;
const listeners = new Set<() => void>();

function setState(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

let supabase: ReturnType<typeof createClient> | null = null;
function client() {
  supabase ??= createClient();
  return supabase;
}

/** Ghép thông tin đăng nhập với hồ sơ (tên, sđt, vai trò) trong bảng profiles */
async function loadUser(user: User | null): Promise<AuthUser | null> {
  if (!user) return null;
  const { data } = await client().from("profiles").select("full_name, phone, role, birthday").eq("id", user.id).maybeSingle();
  const meta = user.user_metadata ?? {};
  return {
    fullName: data?.full_name || meta.full_name || user.email?.split("@")[0] || "Khách",
    email: user.email ?? "",
    phone: data?.phone || meta.phone || "",
    role: data?.role === "admin" ? "admin" : undefined,
    birthday: data?.birthday ?? undefined,
  };
}

let loadSeq = 0;
async function refresh(user: User | null) {
  const seq = ++loadSeq;
  const next = await loadUser(user);
  if (seq === loadSeq) setState({ user: next, ready: true });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const auth = client().auth;
  auth.getUser().then(({ data }) => refresh(data.user));
  auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION") return;
    // Không gọi Supabase trực tiếp trong callback này (dễ bị treo) — đẩy sang lượt sau.
    setTimeout(() => refresh(session?.user ?? null), 0);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const subscribeNoop = () => () => {};

/** false khi render trên server và lần render hydrate đầu tiên, true sau đó. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function useAuth() {
  const { user, ready } = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
  return { user, isLoggedIn: user !== null, isAdmin: user?.role === "admin", hydrated: ready };
}

// ─── Đăng nhập / đăng ký / đăng xuất ─────────────────────────

function translateError(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Email hoặc mật khẩu không đúng";
    case "email_not_confirmed":
      return "Email chưa được xác nhận — vui lòng mở hộp thư và bấm link xác nhận";
    case "user_already_exists":
    case "email_exists":
      return "Email này đã được đăng ký — vui lòng đăng nhập";
    case "weak_password":
      return "Mật khẩu quá yếu, vui lòng chọn mật khẩu khác";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút";
    default:
      return "Có lỗi xảy ra, vui lòng thử lại";
  }
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser } | { error: string }> {
  const { data, error } = await client().auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { error: translateError(error) };
  const user = await loadUser(data.user);
  if (!user) return { error: "Có lỗi xảy ra, vui lòng thử lại" };
  loadSeq++;
  setState({ user, ready: true });
  return { user };
}

/**
 * Đăng nhập bằng Google: chuyển sang trang Google, xong quay về /auth/callback rồi tới `next`.
 * Lần đầu đăng nhập, trigger trong database tự tạo hồ sơ khách (tên lấy từ tài khoản Google).
 * Trả về thông báo lỗi nếu không mở được trang Google.
 */
export async function signInWithGoogle(next: string): Promise<string | null> {
  const { error } = await client().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  return error ? translateError(error) : null;
}

/**
 * Tạo tài khoản. Hồ sơ khách (profiles + customers) do trigger trong database tự tạo.
 * Nếu Supabase đang bật "Confirm email" thì chưa đăng nhập ngay: needsConfirmation = true.
 */
export async function signUp(info: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  /** yyyy-mm-dd, tùy chọn */
  birthday?: string;
}): Promise<{ needsConfirmation: boolean } | { error: string }> {
  const { data, error } = await client().auth.signUp({
    email: info.email.trim(),
    password: info.password,
    options: {
      data: { full_name: info.fullName.trim(), phone: info.phone.trim(), birthday: info.birthday || undefined },
      emailRedirectTo: `${window.location.origin}/tai-khoan`,
    },
  });
  if (error) return { error: translateError(error) };
  // Email đã tồn tại: Supabase không báo lỗi (tránh lộ email) mà trả về user không có identity
  if (data.user && data.user.identities?.length === 0) return { error: "Email này đã được đăng ký — vui lòng đăng nhập" };
  if (!data.session) return { needsConfirmation: true };
  await refresh(data.user);
  return { needsConfirmation: false };
}

/** Lưu ngày sinh (yyyy-mm-dd). Database chỉ cho lưu 1 lần — muốn sửa phải nhắn tiệm. */
export async function saveBirthday(birthday: string): Promise<string | null> {
  const sb = client();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return "Vui lòng đăng nhập lại";
  const { error } = await sb.from("profiles").update({ birthday }).eq("id", auth.user.id);
  if (error) {
    console.error(error);
    if (error.code === "P0001" && error.message) return error.message;
    if (error.code === "PGRST204" || error.code === "42703") {
      return "Database chưa được cập nhật — cần chạy file SQL mới nhất trong supabase/migrations trên Supabase";
    }
    return "Lưu ngày sinh thất bại, vui lòng thử lại";
  }
  await refresh(auth.user);
  return null;
}

export function logout() {
  loadSeq++;
  setState({ user: null, ready: true });
  void client().auth.signOut();
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
