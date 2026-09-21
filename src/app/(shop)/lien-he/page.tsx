"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// Inline Instagram SVG (lucide-react version in this project does not export Instagram)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function LienHePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.contact.trim() || !formData.message.trim()) {
      return;
    }
    setIsSubmitting(true);
    // Giả lập gửi thông tin liên hệ câu hỏi chung
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        contact: "",
        subject: "",
        message: "",
      });
    }, 600);
  };

  return (
    <div className="w-full bg-[#FFF8EF] text-[#2b2b2b] overflow-x-hidden min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {/* TIÊU ĐỀ TRANG (BỎ BREADCRUMB) */}
        <div className="border-b border-border/80 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FCE9C6] px-3.5 py-1 text-xs font-semibold text-[#1B4B5A] mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[#1B4B5A]" />
            Kết nối với chúng mình
          </div>
          <h1 className="font-heading text-3xl font-black text-[#1B4B5A] sm:text-4xl">
            Liên hệ với Cari Bakehouse
          </h1>
          <p className="mt-2 text-sm text-[#2b2b2b]/80 max-w-2xl">
            Có thắc mắc chung về thực đơn, phản hồi trải nghiệm hoặc cần hỗ trợ? Tụi mình luôn sẵn sàng lắng nghe bạn!
          </p>
        </div>

        {/* THÔNG TIN LIÊN HỆ & BẢN ĐỒ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Cột trái: Thông tin liên hệ */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 rounded-2xl border border-border/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-[#1B4B5A] border-b border-border/60 pb-3">
                Thông tin tiệm bánh
              </h2>

              {/* Địa chỉ */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCE9C6] text-[#1B4B5A] border border-[#F6CE8B]/60">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Địa chỉ</span>
                  <p className="font-medium text-[#2b2b2b] leading-snug">
                    34 ngõ 40 Tô Vĩnh Diện, Khương Trung, Thanh Xuân, Hà Nội
                  </p>
                </div>
              </div>

              {/* Hotline */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCE9C6] text-[#1B4B5A] border border-[#F6CE8B]/60">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Hotline</span>
                  <p>
                    <a
                      href="tel:0338975925"
                      className="font-heading text-base font-bold text-[#1B4B5A] hover:underline"
                    >
                      0338.975.925
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              {/* TODO: chưa có email chính thức từ shop */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCE9C6] text-[#1B4B5A] border border-[#F6CE8B]/60">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Email</span>
                  <p className="text-muted italic text-xs">
                    {/* Để trống email theo yêu cầu */}
                    (Đang cập nhật)
                  </p>
                </div>
              </div>

              {/* Giờ mở cửa / nhận đơn */}
              {/* TODO: giờ đóng cửa trong tài liệu có vẻ nhầm, cần xác nhận lại với shop trước khi hiển thị đầy đủ */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCE9C6] text-[#1B4B5A] border border-[#F6CE8B]/60">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Giờ mở cửa / nhận đơn</span>
                  <p className="font-semibold text-[#1B4B5A]">
                    Từ 10:00
                  </p>
                </div>
              </div>

              {/* Mạng xã hội */}
              <div className="pt-2 border-t border-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-3">
                  Kết nối trực tuyến
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Zalo */}
                  <a
                    href="https://zalo.me/0338975925"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-[#FFF8EF] px-3.5 py-2 text-xs font-bold text-[#1B4B5A] hover:bg-[#FCE9C6] hover:border-[#F6CE8B] transition-all shadow-2xs"
                  >
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    Zalo: 0338.975.925
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/cari.bakehouse.hn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-[#FFF8EF] px-3.5 py-2 text-xs font-bold text-[#1B4B5A] hover:bg-[#FCE9C6] hover:border-[#F6CE8B] transition-all shadow-2xs"
                  >
                    <InstagramIcon className="h-4 w-4 text-pink-600" />
                    Cari.bakehouse.hn
                  </a>

                  {/* Facebook tạm ẩn */}
                  {/* TODO: chưa có link Facebook chính thức */}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#FFF8EF] p-4 text-xs text-[#2b2b2b]/70 border border-border/60">
              💡 <strong>Lưu ý:</strong> Để đặt bánh nhanh nhận trong ngày, bạn có thể nhắn trực tiếp Zalo hoặc gọi Hotline để được hỗ trợ tức thì.
            </div>
          </div>

          {/* Cột phải: Khối bản đồ */}
          {/* TODO: nhúng Google Maps thật khi có tọa độ chính xác. */}
          <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] rounded-2xl border-2 border-dashed border-[#1B4B5A]/25 bg-[#FCE9C6]/40 p-6 flex flex-col items-center justify-center text-center shadow-xs overflow-hidden">
            {/* Pattern trang trí bản đồ */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1B4B5A_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 max-w-md space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1B4B5A] text-white shadow-md">
                <MapPin className="h-8 w-8 text-[#F6CE8B] animate-bounce" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#1B4B5A]">
                Vị trí Cari Bakehouse trên bản đồ
              </h3>
              <p className="text-xs sm:text-sm text-[#2b2b2b]/80 leading-relaxed">
                34 ngõ 40 Tô Vĩnh Diện, P. Khương Trung, Q. Thanh Xuân, Hà Nội
              </p>
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=34+ngõ+40+Tô+Vĩnh+Diện+Khương+Trung+Thanh+Xuân+Hà+Nội"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1B4B5A] px-5 py-2 text-xs font-bold text-white hover:bg-[#1B4B5A]/90 transition-all shadow-xs"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#F6CE8B]" />
                  Mở chỉ đường trên Google Maps
                </a>
              </div>
              <p className="text-[11px] text-muted italic">
                {/* TODO: nhúng Google Maps thật khi có tọa độ chính xác. */}
                Bản đồ iframe nhúng trực tiếp sẽ được cập nhật khi có tọa độ chính xác từ shop.
              </p>
            </div>
          </div>
        </section>

        {/* FORM GỬI LIÊN HỆ */}
        <section className="rounded-2xl border border-border/80 bg-white p-6 sm:p-10 shadow-xs max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2">
              Có thắc mắc chung ngoài đặt bánh? Điền form bên dưới, chúng tôi sẽ phản hồi sớm nhất!
            </p>
          </div>

          {isSubmitted ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h3 className="font-heading text-xl font-bold text-emerald-900">
                Gửi liên hệ thành công!
              </h3>
              <p className="text-sm text-emerald-700 max-w-md mx-auto">
                Cảm ơn bạn đã gửi lời nhắn tới Cari Bakehouse. Tụi mình sẽ liên hệ lại với bạn trong thời gian sớm nhất.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="rounded-full bg-[#1B4B5A] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#1B4B5A]/90 transition-colors"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1B4B5A]">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Mai Phương"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                  />
                </div>

                {/* Số điện thoại / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1B4B5A]">
                    Số điện thoại / Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Số điện thoại hoặc email liên hệ"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                  />
                </div>
              </div>

              {/* Chủ đề */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Chủ đề
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hỏi về nguyên liệu, Hợp tác sự kiện, Góp ý dịch vụ..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                />
              </div>

              {/* Nội dung */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Nội dung <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Chia sẻ câu hỏi hoặc góp ý của bạn cùng Cari Bakehouse..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all resize-y"
                />
              </div>

              {/* Nút gửi */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B4B5A] px-10 py-3 font-heading text-sm font-bold text-white shadow-md hover:bg-[#1B4B5A]/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-[#F6CE8B]" />
                  {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
