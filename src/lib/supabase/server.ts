// Supabase client dùng trong Server Component, Server Function và Route Handler.
// Mỗi request phải tạo client mới — không dùng chung giữa các request.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component không được ghi cookie — bỏ qua, proxy.ts đã làm mới phiên đăng nhập.
          }
        },
      },
    },
  );
}
