"use client";

// Phân tích AI: admin đặt câu hỏi → /api/admin/phan-tich (kiểm tra quyền, chuyển sang n8n) → hiện câu trả lời.
// Chỉ hiển thị, không lưu kết quả vào database.
import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { BTN_OUTLINE, BTN_SOLID, Card, INPUT } from "@/components/admin/ui";

const SAMPLE_QUESTIONS = [
  "Dạo này khách hỏi gì nhiều nhất?",
  "Làm báo cáo tổng quan và đề xuất cách tăng doanh thu",
  "Gợi ý 3 bài đăng Facebook cho món được quan tâm nhất",
];

// ---------- Markdown đơn giản (tiêu đề, gạch đầu dòng, danh sách số, **đậm**, *nghiêng*, `mã`) ----------
// Tự dựng thành phần React (không chèn HTML thô) nên nội dung trả về không chạy được mã lạ.

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return <strong key={i} className="font-bold text-[#2b2b2b]">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return <code key={i} className="rounded bg-[#f3f3f3] px-1 py-0.5 text-[12px]">{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function SimpleMarkdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    const lines = para;
    blocks.push(
      <p key={blocks.length} className="leading-relaxed">
        {lines.map((l, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {inline(l)}
          </span>
        ))}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const { ordered, items } = list;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={blocks.length} className={`space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}>
        {items.map((it, i) => (
          <li key={i} className="leading-relaxed">{inline(it)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (line.trim() === "") {
      flushPara();
      flushList();
    } else if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      flushPara();
      flushList();
      blocks.push(<hr key={blocks.length} className="border-[#e3e3e3]" />);
    } else if (heading) {
      flushPara();
      flushList();
      const size = heading[1].length <= 2 ? "text-base" : "text-sm";
      blocks.push(
        <h3 key={blocks.length} className={`${size} pt-1 font-bold text-[#2b2b2b]`}>
          {inline(heading[2])}
        </h3>,
      );
    } else if (bullet || numbered) {
      flushPara();
      const ordered = !bullet;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-3 text-[13px] text-[#4a4a4a]">{blocks}</div>;
}

// ---------- Trang ----------

export default function AdminAiAnalysisPage() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || loading) return;
    setQuestion(text);
    setAsked(text);
    setAnswer("");
    setError("");
    setLoading(true);
    try {
      // Gọi qua API nội bộ: máy chủ kiểm tra quyền admin rồi mới chuyển câu hỏi sang n8n
      const res = await fetch("/api/admin/phan-tich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = (await res.json().catch(() => null)) as { output?: unknown; error?: unknown } | null;
      if (!res.ok || typeof data?.output !== "string") {
        throw new Error(typeof data?.error === "string" ? data.error : `Có lỗi xảy ra (mã ${res.status}).`);
      }
      setAnswer(data.output);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(msg && !/fetch|network/i.test(msg) ? msg : "Không kết nối được. Kiểm tra mạng rồi thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(question);
  };

  return (
    <div className="space-y-4">
      <Card title="Hỏi trợ lý phân tích">
        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            className={`${INPUT} min-h-[90px] resize-y`}
            placeholder="Nhập câu hỏi, ví dụ: Tuần này món nào bán chạy nhất?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              // Enter để gửi, Shift+Enter để xuống dòng
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void ask(question);
              }
            }}
            disabled={loading}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={BTN_SOLID} disabled={loading || !question.trim()}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Gửi
            </button>
            <span className="text-[11px] text-[#7a7a7a]">Enter để gửi · Shift+Enter để xuống dòng</span>
          </div>
        </form>

        <div className="mt-4 border-t border-[#e3e3e3] pt-3">
          <p className="mb-2 text-[11px] font-bold text-[#7a7a7a]">Câu hỏi mẫu</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <button key={q} type="button" className={BTN_OUTLINE} disabled={loading} onClick={() => void ask(q)}>
                <Sparkles className="h-3.5 w-3.5" />
                {q}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {(loading || answer || error) && (
        <Card title={asked ? `Kết quả: ${asked}` : "Kết quả"}>
          {loading && (
            <div className="flex items-center gap-2 text-[13px] text-[#5b5b5b]" role="status">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang phân tích... (có thể mất 30–90 giây)
            </div>
          )}
          {!loading && error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700" role="alert">
              {error}
            </p>
          )}
          {!loading && answer && <SimpleMarkdown text={answer} />}
        </Card>
      )}
    </div>
  );
}
