"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Heart,
  Send,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { subscribeNewsletter, useSiteSettings } from "@/lib/db";
import { formatHotline } from "@/lib/utils";

// Chưa có trang riêng cho từng chính sách → dẫn tới mục "Chính sách & câu hỏi thường gặp" ở trang Giới thiệu
const POLICY_HREF = "/gioi-thieu#chinh-sach";

export default function Footer() {
  const settings = useSiteSettings();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const error = await subscribeNewsletter(email);
    setSending(false);
    if (error) {
      setNotice({ ok: false, text: error });
      return;
    }
    setEmail("");
    setNotice({ ok: true, text: "Cảm ơn bạn! Cari sẽ gửi ưu đãi ngọt ngào qua email này." });
  };

  // pb-16: chừa chỗ cho thanh menu dưới cùng trên điện thoại (BottomNav) để không che dòng cuối footer
  return (
    <footer className="border-t border-primary-dark/20 bg-primary pb-16 text-cream md:pb-0">
      {/* Khối chính 4 cột */}
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* ================= Cột 1: Cửa hàng ================= */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent bg-accent/20">
                <Image
                  src="/images/logo.jpg"
                  alt="Cari Bakehouse Logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold tracking-tight text-cream">
                  Cari Bakehouse
                </span>
                <span className="text-[9px] font-medium tracking-wider text-accent uppercase">
                  Indulgence in every bite
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-cream/80">
              Tiệm bánh nhỏ, làm bằng thật nhiều yêu thương. Mỗi chiếc bánh là
              một khoảnh khắc vui nho nhỏ Cari muốn gửi đến bạn mỗi ngày.
            </p>

            <div className="space-y-2.5 pt-2 text-sm text-cream/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>Số 34, ngõ 40, Tô Vĩnh Diện, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-accent" />
                <span>Mở cửa: 10:00 – 24:00</span>
              </div>
            </div>
          </div>

          {/* ================= Cột 2: Điều hướng ================= */}
          <div>
            <h3 className="font-heading text-lg font-bold text-accent">
              Điều hướng
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/san-pham"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/dat-theo-yeu-cau"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Bánh đặt theo yêu cầu
                </Link>
              </li>
              <li>
                <Link
                  href="/gioi-thieu"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Về Cari Bakehouse
                </Link>
              </li>
              <li>
                <Link
                  href="/tich-diem"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Chương trình tích điểm
                </Link>
              </li>
              <li>
                <Link
                  href="/lien-he"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Liên hệ & Hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= Cột 3: Chính sách ================= */}
          <div>
            <h3 className="font-heading text-lg font-bold text-accent">
              Chính sách
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href={POLICY_HREF}
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link
                  href={POLICY_HREF}
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Chính sách đổi trả & hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  href={POLICY_HREF}
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Hướng dẫn bảo quản bánh
                </Link>
              </li>
              <li>
                <Link
                  href={POLICY_HREF}
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href={POLICY_HREF}
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= Cột 4: Liên hệ & Mạng xã hội ================= */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-accent">
              Liên hệ & kết nối
            </h3>

            <div className="space-y-2.5 text-sm text-cream/90">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href={`tel:${settings.hotline}`}
                  className="transition-colors hover:text-accent"
                >
                  Hotline: <strong className="font-semibold text-cream">{formatHotline(settings.hotline)}</strong>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-accent break-all"
                >
                  {settings.email}
                </a>
              </div>
            </div>

            {/* Mạng xã hội */}
            <div className="pt-2">
              <span className="text-xs text-cream/70">Theo dõi tiệm tại:</span>
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                {/* Facebook */}
                <a
                  href={settings.facebook || "#"}
                  {...(settings.facebook ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label="Facebook Cari Bakehouse"
                  title="Facebook Cari Bakehouse"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-[#1877F2] hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={settings.instagram || "#"}
                  {...(settings.instagram ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label="Instagram Cari Bakehouse"
                  title="Instagram Cari Bakehouse"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Threads */}
                <a
                  href={settings.threads || "#"}
                  {...(settings.threads ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label="Threads Cari Bakehouse"
                  title="Threads Cari Bakehouse"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-black hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href={settings.tiktok || "#"}
                  {...(settings.tiktok ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label="TikTok Cari Bakehouse"
                  title="TikTok Cari Bakehouse"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-black hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.87-4.47V8.71a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.87-.14z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Form nhận ưu đãi */}
            <div className="pt-2">
              <span className="text-xs text-cream/70">Nhận ưu đãi ngọt ngào:</span>
              <form onSubmit={subscribe} className="mt-2 flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNotice(null);
                  }}
                  placeholder="Email của bạn..."
                  aria-label="Email nhận ưu đãi"
                  className="w-full rounded-l-md border-0 bg-cream/15 px-3 py-2 text-xs text-cream placeholder-cream/50 focus:bg-cream/25 focus:outline-hidden focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={sending}
                  aria-label="Gửi email nhận ưu đãi"
                  className="flex items-center justify-center rounded-r-md bg-accent px-3 py-2 text-xs font-semibold text-primary-dark transition-colors hover:bg-accent-light disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              {notice && (
                <p role="status" className={`mt-2 text-xs ${notice.ok ? "text-accent" : "text-rose-300"}`}>
                  {notice.text}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= Dòng Copyright cuối ================= */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Cari Bakehouse. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1">
            <span>Bánh ngọt thủ công nướng bằng cả</span>
            <Heart className="h-3 w-3 fill-accent text-accent" />
            <span>tại Hà Nội</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
