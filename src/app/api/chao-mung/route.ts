// Trang Đăng ký gọi route này ngay sau khi tạo tài khoản thành công → gửi email chào mừng.
// Chỉ gửi cho chính tài khoản đang đăng nhập (đọc từ cookie phiên), nên không thể dùng để gửi mail cho người khác.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmailIfNew } from "@/lib/welcome-email";

export async function POST() {
  await sendWelcomeEmailIfNew(await createClient());
  return NextResponse.json({ ok: true });
}
