// Google (qua Supabase) trả khách về đây kèm ?code=... sau khi đăng nhập.
// Đổi code lấy phiên đăng nhập (ghi cookie) rồi chuyển tới trang khách đang muốn vào.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/tai-khoan");

  // Supabase báo lỗi (khách bấm hủy, lỗi tạo tài khoản...) bằng ?error_description=... thay cho code
  let reason = searchParams.get("error_description") ?? searchParams.get("error") ?? "";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error(error);
    reason = error.message;
  } else if (reason) {
    console.error("Google OAuth:", reason);
  }

  // Về trang đăng nhập kèm thông báo (lý do kỹ thuật để dễ tìm lỗi)
  const back = new URL("/dang-nhap", origin);
  back.searchParams.set("loi", "google");
  if (reason) back.searchParams.set("ly_do", reason.slice(0, 200));
  return NextResponse.redirect(back);
}
