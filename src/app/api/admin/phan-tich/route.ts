// Cầu nối trang /admin/phan-tich → quy trình n8n "hỏi phân tích".
// Link n8n (N8N_ADMIN_URL) chỉ nằm trên máy chủ, trình duyệt không thấy.
// Chỉ admin đăng nhập bằng mật khẩu mới gọi được (database kiểm tra qua is_admin()).
// Không lưu câu hỏi / kết quả vào database.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// n8n có thể mất 30–90 giây để trả lời
export const maxDuration = 120;

const MAX_QUESTION_LENGTH = 2000;

export async function POST(request: Request) {
  const n8nUrl = process.env.N8N_ADMIN_URL;
  if (!n8nUrl) return NextResponse.json({ error: "Chưa cấu hình địa chỉ n8n (N8N_ADMIN_URL)." }, { status: 500 });

  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return NextResponse.json({ error: "Bạn không có quyền dùng chức năng này." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { question?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) return NextResponse.json({ error: "Câu hỏi đang trống." }, { status: 400 });
  if (question.length > MAX_QUESTION_LENGTH)
    return NextResponse.json({ error: `Câu hỏi dài quá ${MAX_QUESTION_LENGTH} ký tự.` }, { status: 400 });

  try {
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(110_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("phan-tich: n8n trả mã", res.status);
      return NextResponse.json({ error: `Máy chủ phân tích báo lỗi (mã ${res.status}).` }, { status: 502 });
    }
    const data = (await res.json().catch(() => null)) as { output?: unknown } | null;
    if (typeof data?.output !== "string" || !data.output.trim())
      return NextResponse.json({ error: "Không nhận được câu trả lời hợp lệ." }, { status: 502 });
    return NextResponse.json({ output: data.output });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error("phan-tich: không gọi được n8n", error);
    return NextResponse.json(
      { error: timedOut ? "Phân tích quá lâu (hơn 110 giây). Thử lại hoặc hỏi ngắn gọn hơn." : "Không kết nối được tới máy chủ phân tích." },
      { status: 502 },
    );
  }
}
