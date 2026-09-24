"use client";

import { useState } from "react";
import { Phone, Mail, Heart } from "lucide-react";
import LetterModal from "@/components/ui/LetterModal";
import { useSiteSettings } from "@/lib/db";
import { formatHotline } from "@/lib/utils";
import { openZaloChat } from "@/lib/zalo";

interface FloatingAction {
  name: string;
  href: string;
  ariaLabel: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  pulse?: boolean;
  /** Thay cho mở link thường (vd. Zalo: thử mở app Zalo PC trước) */
  onClick?: () => void;
}

export default function FloatingContact() {
  const [isOpenLetter, setIsOpenLetter] = useState(false);
  const settings = useSiteSettings();

  const actions: FloatingAction[] = [
    // 1. TikTok
    {
      name: "TikTok",
      href: settings.tiktok || "#",
      ariaLabel: "Kênh TikTok Cari Bakehouse",
      bgColor: "bg-black hover:bg-neutral-800",
      textColor: "text-white",
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.87-4.47V8.71a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.87-.14z" />
        </svg>
      ),
    },
    // 2. Facebook / Messenger
    {
      name: "Facebook",
      href: settings.facebook || "#",
      ariaLabel: "Fanpage Facebook Cari Bakehouse",
      bgColor: "bg-[#1877F2] hover:bg-[#166fe5]",
      textColor: "text-white",
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    // 3. Zalo
    {
      name: "Zalo",
      href: settings.zalo,
      onClick: () => openZaloChat(settings.hotline, settings.zalo),
      ariaLabel: `Chat Zalo tiệm bánh ${settings.hotline}`,
      bgColor: "bg-[#0068FF] hover:bg-[#0057d6]",
      textColor: "text-white",
      icon: (
        <span className="font-sans text-xs font-black tracking-tight">
          Zalo
        </span>
      ),
    },
    // 4. Hotline gọi điện
    {
      name: formatHotline(settings.hotline),
      href: `tel:${settings.hotline}`,
      ariaLabel: `Gọi hotline ${settings.hotline}`,
      bgColor: "bg-caramel hover:bg-caramel/90",
      textColor: "text-white",
      pulse: true,
      icon: <Phone className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <aside
        aria-label="Liên hệ và quà tặng nhanh"
        className="fixed right-3.5 sm:right-5 bottom-20 md:bottom-6 z-40 flex flex-col items-center gap-2.5 sm:gap-3"
      >
        {/* Nút mới: Lá thư ngẫu nhiên */}
        <div className="group relative flex items-center">
          {/* Tooltip hiển thị khi hover trên desktop */}
          <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-md bg-[#1B4B5A]/95 px-2.5 py-1 text-xs font-medium text-[#FFF8EF] shadow-md opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-x-1 lg:block">
            Lá thư ngẫu nhiên 💌
          </span>

          {/* Nút tròn màu hồng pastel nổi bật */}
          <button
            type="button"
            onClick={() => setIsOpenLetter(true)}
            aria-label="Mở lá thư ngẫu nhiên từ Cari Bakehouse"
            className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF5E8E] via-[#FF7597] to-[#FFA2B8] text-white shadow-lg shadow-pink-500/25 ring-2 ring-pink-200/90 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          >
            {/* Hiệu ứng pulse sóng nhẹ màu hồng pastel */}
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-pink-400/40 opacity-75 duration-1000" />

            <Mail className="h-5 w-5 text-white" />

            {/* Trái tim nhỏ xinh đính kèm góc nút */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm ring-1 ring-white">
              <Heart className="h-2.5 w-2.5 fill-current" />
            </span>
          </button>
        </div>

        {/* Các nút liên hệ hiện có */}
        {actions.map((item) => (
          <div key={item.name} className="group relative flex items-center">
            {/* Tooltip hiển thị khi hover trên desktop */}
            <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-md bg-primary-dark/95 px-2.5 py-1 text-xs font-medium text-cream shadow-md opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-x-1 lg:block">
              {item.name}
            </span>

            {/* Nút tròn */}
            <a
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              onClick={
                item.onClick
                  ? (e) => {
                      e.preventDefault();
                      item.onClick?.();
                    }
                  : undefined
              }
              aria-label={item.ariaLabel}
              className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full ${item.bgColor} ${item.textColor} shadow-lg ring-2 ring-cream/80 transition-all duration-300 hover:scale-110 active:scale-95`}
            >
              {/* Hiệu ứng pulse sóng nhẹ cho nút hotline */}
              {item.pulse && (
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-caramel/40 opacity-75 duration-1000" />
              )}
              {item.icon}
            </a>
          </div>
        ))}
      </aside>

      {/* Modal lá thư ngẫu nhiên */}
      <LetterModal
        isOpen={isOpenLetter}
        onClose={() => setIsOpenLetter(false)}
      />
    </>
  );
}
