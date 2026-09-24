// Vercel Cron gọi mỗi ngày (xem vercel.json) để Supabase luôn có hoạt động — project gói miễn phí
// bị tạm dừng nếu 7 ngày liền không có truy cập. Chỉ đọc 1 dòng dữ liệu công khai, không ghi gì.

import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  // Nếu có đặt CRON_SECRET trên Vercel thì chỉ Vercel Cron (gửi kèm mã này) mới gọi được
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const { error } = await supabase.from("products").select("id").limit(1);
  if (error) {
    console.error("keep-alive: không gọi được Supabase", error);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: true, at: new Date().toISOString() });
}
