// Google (qua Supabase) trả khách về đây kèm ?code=... sau khi đăng nhập.
// Đổi code lấy phiên đăng nhập (ghi cookie) rồi chuyển tới trang khách đang muốn vào.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/tai-khoan");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error(error);
  }

  // Khách bấm hủy ở trang Google hoặc có lỗi → về trang đăng nhập kèm thông báo
  return NextResponse.redirect(`${origin}/dang-nhap?loi=google`);
}
