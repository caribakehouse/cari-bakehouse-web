"use client";

import { Phone, Mail } from "lucide-react";
import TopbarAuth from "@/components/layout/TopbarAuth";
import { useSiteSettings } from "@/lib/db";
import { formatHotline } from "@/lib/utils";

export default function Topbar() {
  const settings = useSiteSettings();

  return (
    <div className="hidden border-b border-primary-dark/20 bg-primary-dark text-xs text-cream/90 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Left: Hotline & Email (lấy từ Cài đặt chung trong admin) */}
        <div className="flex items-center gap-6">
          <a
            href={`tel:${settings.hotline}`}
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Phone className="h-3.5 w-3.5 text-accent" />
            <span>Hotline: <strong className="font-semibold text-cream">{formatHotline(settings.hotline)}</strong></span>
          </a>
          <span className="text-cream/40">|</span>
          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Mail className="h-3.5 w-3.5 text-accent" />
            <span>{settings.email}</span>
          </a>
        </div>

        {/* Right: Auth links */}
        <TopbarAuth />
      </div>
    </div>
  );
}
