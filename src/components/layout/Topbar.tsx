import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export default function Topbar() {
  return (
    <div className="hidden border-b border-primary-dark/20 bg-primary-dark text-xs text-cream/90 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Left: Hotline & Email */}
        <div className="flex items-center gap-6">
          <a
            href="tel:0338975925"
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Phone className="h-3.5 w-3.5 text-accent" />
            <span>Hotline: <strong className="font-semibold text-cream">0338 975 925</strong></span>
          </a>
          <span className="text-cream/40">|</span>
          <a
            href="mailto:cari.bakehouse07@gmail.com"
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Mail className="h-3.5 w-3.5 text-accent" />
            <span>cari.bakehouse07@gmail.com</span>
          </a>
        </div>

        {/* Right: Auth links */}
        <div className="flex items-center gap-3">
          <Link
            href="/dang-nhap"
            className="transition-colors hover:text-accent"
          >
            Đăng nhập
          </Link>
          <span className="text-cream/40">|</span>
          <Link
            href="/dang-ky"
            className="transition-colors hover:text-accent"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
