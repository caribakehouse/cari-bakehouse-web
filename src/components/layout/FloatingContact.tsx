import { Phone } from "lucide-react";

interface FloatingAction {
  name: string;
  href: string;
  ariaLabel: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  pulse?: boolean;
}

export default function FloatingContact() {
  const actions: FloatingAction[] = [
    // 1. TikTok
    {
      name: "TikTok",
      href: "#",
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
      href: "#",
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
      href: "https://zalo.me/0338975925",
      ariaLabel: "Chat Zalo tiệm bánh 0338975925",
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
      name: "0338 975 925",
      href: "tel:0338975925",
      ariaLabel: "Gọi hotline 0338975925",
      bgColor: "bg-caramel hover:bg-caramel/90",
      textColor: "text-white",
      pulse: true,
      icon: <Phone className="h-5 w-5" />,
    },
  ];

  return (
    <aside
      aria-label="Liên hệ nhanh"
      className="fixed right-3.5 sm:right-5 bottom-20 md:bottom-6 z-40 flex flex-col items-center gap-2.5 sm:gap-3"
    >
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
  );
}
