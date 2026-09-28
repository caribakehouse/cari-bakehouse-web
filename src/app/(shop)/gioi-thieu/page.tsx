"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Heart,
  Clock,
  CalendarHeart,
  Store,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import Image from "@/components/ui/SafeImage";
import { useAboutContent } from "@/lib/db";

// Nội dung (câu chuyện thương hiệu, giá trị cốt lõi, FAQ chính sách) lấy từ dữ liệu chung — admin chỉnh ở /admin/gioi-thieu-chinh-sach.
const VALUE_ICONS = {
  shield: ShieldCheck,
  heart: Heart,
  clock: Clock,
  calendar: CalendarHeart,
} as const;

export default function GioiThieuPage() {
  const {
    heroTitle,
    heroSubtitle,
    heroImage,
    storyBadge,
    storyTitle,
    storyBody,
    storyImage,
    values: CORE_VALUES,
    stats,
    spacePhotos,
    faq: FAQ_ITEMS,
  } = useAboutContent();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF]/50 pb-20 overflow-x-hidden">


      {/* ============================================================
          2. BANNER ĐẦU TRANG (ảnh nền tùy chọn — admin chỉnh ở /admin/gioi-thieu-chinh-sach)
          ============================================================ */}
      <section className="relative overflow-hidden bg-[#FCE9C6] py-14 sm:py-20 lg:py-24 border-b border-[#E5D9C3]/70">
        {heroImage && (
          <>
            <Image src={heroImage} alt={heroTitle} fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8EF]/70 via-[#FCE9C6]/60 to-[#FFF8EF]/75" />
          </>
        )}
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-heading italic text-2xl sm:text-4xl lg:text-5xl font-black text-[#1B4B5A] tracking-tight leading-tight sm:leading-snug break-words">
            {heroTitle}
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#1B4B5A]/20" />
          {heroSubtitle && (
            <p className="mt-3 text-sm sm:text-base font-bold text-[#1B4B5A]/80 tracking-wide uppercase">
              {heroSubtitle}
            </p>
          )}
        </div>

        {/* Chấm tròn trang trí phong cách thủ công */}
        <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/30 blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#F6CE8B]/40 blur-2xl pointer-events-none" />
      </section>

      {/* ============================================================
          3. CÂU CHUYỆN THƯƠNG HIỆU (ẢNH TRÁI - CHỮ PHẢI)
          ============================================================ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 items-center">
            {/* Ảnh bên trái (admin tải lên; chưa có ảnh thì hiện khung chờ) */}
            {storyImage ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm">
                <Image src={storyImage} alt={storyTitle} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            ) : (
            <div className="relative aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-[#C97B3D]/40 bg-[#F5EFE6] shadow-sm flex flex-col items-center justify-center p-6 text-center group overflow-hidden">
              <div className="h-16 w-16 rounded-full bg-[#FCE9C6] flex items-center justify-center text-[#1B4B5A] mb-3 shadow-inner">
                <Store className="h-8 w-8 text-[#1B4B5A]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-[#1B4B5A]">
                Ảnh cửa hàng / Người sáng lập
              </span>
              <span className="mt-1 text-xs text-[#7A7A7A]">
                Cari Bakehouse — Since 2023
              </span>

              {/* Tag góc */}
              <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#1B4B5A] shadow-xs">
                Cari Bakehouse
              </div>
            </div>
            )}

            {/* Khối chữ bên phải */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FCE9C6] px-3.5 py-1 text-xs font-bold text-[#1B4B5A] uppercase tracking-wider w-fit mb-3">
                <Sparkles className="h-3.5 w-3.5 text-[#C97B3D]" />
                {storyBadge}
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4B5A] tracking-tight mb-4">
                {storyTitle}
              </h2>
              <div className="h-1 w-12 rounded-full bg-[#F6CE8B] mb-5" />
              <p className="text-base sm:text-lg text-[#2B2B2B]/90 leading-relaxed font-normal whitespace-pre-line">
                {storyBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. GIÁ TRỊ CỐT LÕI (4 Card - We care about the little things)
          ============================================================ */}
      <section className="py-14 sm:py-20 bg-white/60 border-y border-[#E5D9C3]/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C97B3D] mb-2">
              We care about the little things
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4B5A] tracking-tight">
              Điều làm nên Cari Bakehouse
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#F6CE8B]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {CORE_VALUES.map((val, idx) => {
              const IconComp = VALUE_ICONS[val.icon] ?? Heart;
              return (
                <div
                  key={idx}
                  className="group flex flex-col items-center text-center rounded-2xl border border-[#E5D9C3] bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#1B4B5A]/40"
                >
                  {/* Icon tròn màu accent (#FCE9C6) */}
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FCE9C6] text-[#1B4B5A] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#F6CE8B]">
                    <IconComp className="h-7 w-7 text-[#1B4B5A]" />
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-[#1B4B5A] mb-2.5">
                    {val.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A7A7A] leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. SỐ LIỆU NỔI BẬT (admin chỉnh — chỉ ghi số liệu thật)
          ============================================================ */}
      {stats.length > 0 && (
        <section className="py-12 sm:py-16 bg-[#FAF7F2]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-10 text-center">
              {stats.map((st, i) => (
                <div key={i} className="flex w-[calc(50%-1rem)] flex-col items-center lg:w-[calc(25%-1.5rem)]">
                  <span className="text-4xl sm:text-6xl font-black text-[#1B4B5A] tracking-tight">{st.value}</span>
                  <span className="mt-2 text-sm sm:text-base font-bold uppercase tracking-wider text-[#C97B3D]">{st.label}</span>
                  {st.desc && <span className="mt-1 text-xs text-[#7A7A7A]">{st.desc}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          6. ĐỘI NGŨ CỦA CHÚNG TÔI
          // TODO: chưa có ảnh/tên nhân sự thật, hiển thị lại khi có
          ============================================================ */}
      {/*
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">
              Đội ngũ của chúng tôi
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            // Các thẻ thành viên đội ngũ sẽ được kích hoạt tại đây khi có hình ảnh và thông tin thật từ tiệm
          </div>
        </div>
      </section>
      */}

      {/* ============================================================
          7. KHÔNG GIAN CỬA HÀNG (ảnh + chú thích — admin chỉnh; chưa có ảnh thì hiện khung chờ)
          ============================================================ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C97B3D] mb-2">
              Không gian tiệm
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4B5A] tracking-tight">
              Ghé thăm cửa hàng của chúng tôi
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#F6CE8B]" />
            <p className="mt-2 text-xs sm:text-sm text-[#7A7A7A]">
              Một góc nhỏ ấm áp và thơm lừng hương bơ sữa tươi mới mỗi ngày
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {spacePhotos.map((photo, i) => (
              <figure key={i} className="w-full sm:w-[calc((100%-2rem)/2)] md:w-[calc((100%-4rem)/3)]">
                {photo.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xs">
                    <Image
                      src={photo.image}
                      alt={photo.caption || "Không gian Cari Bakehouse"}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="relative flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C97B3D]/30 bg-[#F5EFE6] p-6 text-center shadow-xs">
                    <Store className="mb-2 h-10 w-10 text-[#C97B3D] opacity-80" />
                  </div>
                )}
                {photo.caption && (
                  <figcaption className="mt-3 text-center font-heading text-sm font-bold text-[#1B4B5A]">{photo.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          8. CHÍNH SÁCH & CÂU HỎI THƯỜNG GẶP (ACCORDION)
          ============================================================ */}
      <section className="py-14 sm:py-20 bg-white/70 border-t border-[#E5D9C3]/70">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE9C6] px-3.5 py-1 text-xs font-bold text-[#1B4B5A] uppercase tracking-wider mb-2">
              <HelpCircle className="h-3.5 w-3.5 text-[#C97B3D]" />
              Hỗ trợ khách hàng
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4B5A] tracking-tight">
              Chính sách & câu hỏi thường gặp
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#F6CE8B]" />
            <p className="mt-2 text-xs sm:text-sm text-[#7A7A7A]">
              Những điều khách hàng cần biết khi mua và đặt bánh tại Cari Bakehouse
            </p>
          </div>

          {/* Danh sách Accordion */}
          <div className="space-y-3 sm:space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-[#1B4B5A] bg-[#FFF8EF] shadow-md ring-1 ring-[#1B4B5A]/10"
                      : "border-[#E5D9C3] bg-white hover:border-[#1B4B5A]/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#1B4B5A] leading-snug">
                      {item.question}
                    </span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                        isOpen
                          ? "bg-[#1B4B5A] text-white rotate-180"
                          : "bg-[#F5EFE6] text-[#1B4B5A]"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Nội dung câu trả lời */}
                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-sm text-[#5B5B5B] leading-relaxed border-t border-[#E5D9C3]/50 whitespace-pre-line">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          9. CTA LIÊN HỆ CUỐI TRANG
          ============================================================ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FCE9C6] via-[#F6CE8B]/50 to-[#FCE9C6] border border-[#F6CE8B] p-8 sm:p-12 text-center shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C97B3D] mb-2">
              Ngọt ngào & Tươi mới
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B4B5A] tracking-tight">
              Sẵn sàng thưởng thức bánh của Cari Bakehouse?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#7A7A7A] max-w-md mx-auto leading-relaxed">
              Khám phá thực đơn bánh nướng thơm lừng trong ngày hoặc nhắn tin để tiệm tư vấn chiếc bánh riêng cho bạn.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/san-pham"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1B4B5A] px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-[#123640] hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <span>Xem sản phẩm</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lien-he"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1B4B5A] bg-transparent px-8 py-3 text-sm font-bold text-[#1B4B5A] transition-all duration-300 hover:bg-[#1B4B5A] hover:text-white hover:scale-105 active:scale-95"
              >
                <span>Liên hệ ngay</span>
              </Link>
            </div>

            {/* Chi tiết trang trí nền */}
            <div className="absolute -top-12 -left-12 h-36 w-36 rounded-full bg-white/40 blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-[#F6CE8B]/60 blur-xl pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
