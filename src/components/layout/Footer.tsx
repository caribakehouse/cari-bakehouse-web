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

export default function Footer() {
  return (
    <footer className="border-t border-primary-dark/20 bg-primary text-cream">
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
                <span>Mở cửa: 10:00 a.m - 12:00 p.m</span>
              </div>
            </div>
          </div>

          {/* ================= Cột 2: Điều hướng ================= */}
          <div>
            <h3 className="font-heading text-base font-bold tracking-wide text-accent uppercase">
              Điều Hướng
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
            <h3 className="font-heading text-base font-bold tracking-wide text-accent uppercase">
              Chính Sách
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/chinh-sach-giao-hang"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-doi-tra"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Chính sách đổi trả & hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  href="/huong-dan-bao-quan"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Hướng dẫn bảo quản bánh
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-bao-mat"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/dieu-khoan-dich-vu"
                  className="text-cream/80 transition-colors hover:text-accent"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= Cột 4: Liên hệ & Mạng xã hội ================= */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold tracking-wide text-accent uppercase">
              Liên Hệ & Kết Nối
            </h3>

            <div className="space-y-2.5 text-sm text-cream/90">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href="tel:0338975925"
                  className="transition-colors hover:text-accent"
                >
                  Hotline: <strong className="font-semibold text-cream">0338 975 925</strong>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href="mailto:cari.bakehouse07@gmail.com"
                  className="transition-colors hover:text-accent break-all"
                >
                  cari.bakehouse07@gmail.com
                </a>
              </div>
            </div>

            {/* Mạng xã hội */}
            <div className="pt-2">
              <span className="text-xs text-cream/70">Theo dõi tiệm tại:</span>
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                {/* Facebook */}
                <a
                  href="#"
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
                  href="https://www.instagram.com/cari.bakehouse.hn?stkn=ZzdzcG1iNThrMmdk"
                  target="_blank"
                  rel="noopener noreferrer"
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
                  href="https://www.threads.com/@cari.bakehouse.hn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Threads Cari Bakehouse"
                  title="Threads Cari Bakehouse"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-black hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 192 192">
                    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.3853 71.5544C80.8932 63.208 89.2891 58.7403 97.2407 58.7403C111.459 58.7403 121.722 69.5772 122.997 88.8924C114.73 87.671 105.748 87.1517 96.0697 87.3346C65.5463 87.9125 47.9942 104.287 48.5204 125.77C48.8105 137.603 55.4542 147.288 66.0827 151.785C74.6547 155.412 85.3435 155.776 95.8922 152.793C110.82 148.572 121.399 137.896 127.348 121.03C132.894 130.655 141.056 136.759 152.029 137.289C152.628 137.318 153.228 137.333 153.83 137.333C165.703 137.333 175.775 132.062 181.764 122.181C187.933 112.001 188.75 97.6441 184.093 81.6562C177.306 58.3547 159.988 40.5898 135.295 31.6022C112.195 23.1952 87.2721 24.3168 65.2346 34.7573C43.2778 45.1587 27.2729 63.4842 20.2526 86.2573C11.5361 114.53 14.5407 144.15 28.7061 169.611C38.4554 187.135 53.6496 199.967 72.5855 206.671C80.3704 209.427 88.6657 210.835 97.2662 210.835C110.748 210.835 123.639 207.397 135.203 200.743L127.025 186.495C118.069 191.649 108.06 194.316 97.5852 194.316C90.7303 194.316 84.1206 193.193 77.9255 191C62.836 185.656 50.7262 175.432 42.9554 161.472C31.5794 141.026 29.1714 117.218 36.1742 94.4981C41.7766 76.3216 54.5414 61.7042 72.0604 53.4074C89.6208 45.0903 109.493 44.1957 127.915 50.9002C147.606 58.0673 161.417 72.2359 166.828 90.7984C170.528 103.498 169.839 114.619 164.887 122.784C161.127 128.982 154.27 131.604 146.401 130.638C136.009 129.359 130.297 120.473 129.378 104.225C134.199 100.865 138.411 96.6575 141.537 91.815V88.9883ZM96.4883 138.618C83.5658 139.117 73.123 132.887 72.8251 122.185C72.5447 112.115 80.9572 101.447 96.7909 101.147C104.743 100.997 112.247 101.896 118.995 103.744C116.892 127.351 106.845 138.219 96.4883 138.618Z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="#"
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
              <div className="mt-2 flex items-center">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="w-full rounded-l-md border-0 bg-cream/15 px-3 py-2 text-xs text-cream placeholder-cream/50 focus:bg-cream/25 focus:outline-hidden focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  aria-label="Gửi email nhận ưu đãi"
                  className="flex items-center justify-center rounded-r-md bg-accent px-3 py-2 text-xs font-semibold text-primary-dark transition-colors hover:bg-accent-light"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
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
