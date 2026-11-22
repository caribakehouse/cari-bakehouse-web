"use client";

// Khung chat tư vấn (n8n Chat) — nút chat nổi góc dưới phải, chạy trên các trang cửa hàng.
// Thư viện tải thẳng từ CDN lúc trình duyệt mở trang (không qua bundle của Next).
// Không hiện ở khu /admin.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STYLE_URL = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css";
const SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";
const WEBHOOK_URL = "https://thanhlee3105.app.n8n.cloud/webhook/31bd7460-7d72-4c64-9f0f-a04d3aa7acc8/chat";

type ChatApp = { unmount: () => void };
type N8nChatModule = { createChat: (options: Record<string, unknown>) => ChatApp };

export default function ChatWidget() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdmin) return;

    let cancelled = false;
    let app: ChatApp | null = null;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = STYLE_URL;
    document.head.appendChild(link);

    const container = document.createElement("div");
    container.id = "n8n-chat";
    document.body.appendChild(container);

    const url = SCRIPT_URL;
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
      .then((mod: N8nChatModule) => {
        // Đã rời trang (hoặc React chạy effect 2 lần ở chế độ dev) → không khởi tạo nữa
        if (cancelled) return;
        app = mod.createChat({
          webhookUrl: WEBHOOK_URL,
          target: "#n8n-chat",
          initialMessages: ["Chào bạn! Mình là trợ lý của Cari Bakehouse. Bạn cần tư vấn món nào?"],
          i18n: {
            en: {
              title: "Cari Bakehouse",
              subtitle: "Tư vấn bánh và đồ uống",
              footer: "",
              getStarted: "Bắt đầu chat",
              inputPlaceholder: "Nhập câu hỏi của bạn...",
            },
          },
        });
      })
      .catch((error) => console.error("Không tải được khung chat:", error));

    return () => {
      cancelled = true;
      app?.unmount();
      container.remove();
      link.remove();
    };
  }, [isAdmin]);

  return null;
}
