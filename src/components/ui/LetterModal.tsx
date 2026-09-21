"use client";

import React, { useEffect, useState } from "react";
import { X, Copy, Check, RefreshCw, Sparkles, Heart } from "lucide-react";
import { getRandomLetter, Letter } from "@/lib/letters";

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AnimationStep = "closed" | "opening-flap" | "sliding-up" | "revealed";

export default function LetterModal({ isOpen, onClose }: LetterModalProps) {
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);
  const [animStep, setAnimStep] = useState<AnimationStep>("closed");
  const [copied, setCopied] = useState(false);

  // Khởi tạo lá thư mới và chạy chuỗi animation khi modal mở
  useEffect(() => {
    if (isOpen) {
      const letter = getRandomLetter();
      setCurrentLetter(letter);
      setAnimStep("closed");
      setCopied(false);

      // Bước 1: 350ms sau khi mở modal -> Bắt đầu lật nắp phong bì
      const timer1 = setTimeout(() => {
        setAnimStep("opening-flap");
      }, 400);

      // Bước 2: 1100ms -> Thư bắt đầu trượt từ trong phong bì ra
      const timer2 = setTimeout(() => {
        setAnimStep("sliding-up");
      }, 1050);

      // Bước 3: 1750ms -> Phóng to hiện rõ toàn bộ nội dung lá thư
      const timer3 = setTimeout(() => {
        setAnimStep("revealed");
      }, 1800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAnimStep("closed");
    }
  }, [isOpen]);

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa scroll trang web khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Hàm bốc lá thư ngẫu nhiên khác
  const handlePickAnother = () => {
    setAnimStep("closed");
    setCopied(false);
    setTimeout(() => {
      if (currentLetter) {
        setCurrentLetter(getRandomLetter(currentLetter.id));
      }
      setAnimStep("opening-flap");
    }, 300);

    setTimeout(() => {
      setAnimStep("sliding-up");
    }, 900);

    setTimeout(() => {
      setAnimStep("revealed");
    }, 1600);
  };

  // Copy mã giảm giá
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!isOpen || !currentLetter) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lá thư từ Cari Bakehouse"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/65 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Nút đóng modal góc phải */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Đóng thư"
        className="fixed top-4 right-4 z-50 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-xl backdrop-blur transition-all duration-200 hover:bg-white hover:text-black hover:scale-110 active:scale-95"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Vùng chứa thư & hiệu ứng phong bì */}
      <div
        className="relative flex flex-col items-center justify-center w-full max-w-lg my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================
            HIỆU ỨNG PHONG BÌ ĐANG MỞ (Giai đoạn closed / opening-flap / sliding-up)
            ============================================================ */}
        {animStep !== "revealed" && (
          <div className="flex flex-col items-center justify-center py-6">
            {/* Chú thích trạng thái dễ thương */}
            <div className="mb-4 flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-xs font-semibold text-[#D45973] shadow-md backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-500" />
              <span>
                {animStep === "closed" && "Gửi bạn một phong thư ấm áp..."}
                {animStep === "opening-flap" && "Đang mở nắp thư..."}
                {animStep === "sliding-up" && "Lá thư đang mở ra..."}
              </span>
            </div>

            {/* Container 3D của phong bì */}
            <div
              className="relative w-[300px] h-[190px] sm:w-[350px] sm:h-[220px] transition-transform duration-500"
              style={{ perspective: "1000px" }}
            >
              {/* Lưng phong bì (Back of envelope) */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FCA5B9] to-[#F78CA4] shadow-2xl border border-pink-200/50" />

              {/* Lớp lót bên trong phong bì (Inside lining) */}
              <div className="absolute inset-2 rounded-xl bg-[#FFF0F4] border border-pink-100/80" />

              {/* TỜ THƯ TRƯỢT TỪ BÊN TRONG RA (Letter sheet sliding up) */}
              <div
                className={`absolute left-3 right-3 sm:left-4 sm:right-4 h-[170px] sm:h-[195px] rounded-xl bg-[#FFFBF5] border border-amber-200/70 p-4 shadow-md transition-all duration-700 ease-out z-10 ${
                  animStep === "sliding-up"
                    ? "-translate-y-24 sm:-translate-y-28 scale-[1.03]"
                    : "translate-y-2 scale-95"
                }`}
              >
                <div className="flex items-center gap-1.5 border-b border-amber-200/50 pb-2">
                  <div className="h-2 w-2 rounded-full bg-[#E57373]" />
                  <div className="h-1.5 w-16 rounded-full bg-amber-200" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-3/4 rounded bg-amber-100" />
                  <div className="h-2 w-full rounded bg-amber-100/70" />
                  <div className="h-2 w-5/6 rounded bg-amber-100/60" />
                </div>
                <div className="absolute bottom-3 right-4 flex items-center gap-1 text-[11px] font-bold text-[#1B4B5A]">
                  <Heart className="h-3 w-3 fill-pink-400 text-pink-400" /> Cari. Bakehouse
                </div>
              </div>

              {/* Nắp phong bì tam giác (Flap with 3D Flip) */}
              <div
                className="absolute top-0 left-0 right-0 h-[100px] sm:h-[115px] transition-transform duration-700 ease-in-out"
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  transform:
                    animStep === "opening-flap" || animStep === "sliding-up"
                      ? "rotateX(180deg)"
                      : "rotateX(0deg)",
                  zIndex:
                    animStep === "opening-flap" || animStep === "sliding-up" ? 0 : 25,
                }}
              >
                {/* Mặt ngoài của nắp (Màu hồng pastel + Trái tim ở giữa nắp) */}
                <div
                  className="relative w-full h-full"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backgroundColor: "#FB7185", // Rose-400
                    boxShadow: "0 4px 12px rgba(244, 63, 94, 0.2)",
                  }}
                >
                  {/* Trái tim ở giữa chóp nắp thư */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-md border border-rose-200">
                    <Heart className="h-4.5 w-4.5 fill-[#E11D48] text-[#E11D48] animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Thân túi phong bì phía trước (Front pocket flaps) */}
              <div
                className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden"
              >
                {/* Cánh gập trái & phải tạo cảm giác phong bì thật */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 50% 55%, 0 100%)",
                    backgroundColor: "#FDA4AF", // Rose-300
                    opacity: 0.95,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(100% 0, 50% 55%, 100% 100%)",
                    backgroundColor: "#FDA4AF",
                    opacity: 0.95,
                  }}
                />
                {/* Cánh gập dưới đáy lên */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 100%, 50% 45%, 100% 100%)",
                    backgroundColor: "#F43F5E", // Rose-500
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TỜ THƯ ĐÃ MỞ RA HOÀN TOÀN (Giai đoạn revealed)
            ============================================================ */}
        {animStep === "revealed" && (
          <div className="w-full transition-all duration-500 animate-in zoom-in-95 ease-out">
            <article className="relative w-full rounded-3xl bg-[#FFFBF2] p-6 sm:p-8 shadow-2xl border-2 border-[#EEDBBE] overflow-hidden text-neutral-800">
              {/* Hoạ tiết tem thư & con dấu cổ điển ở góc */}
              <div className="absolute top-4 right-5 flex items-center gap-1.5 opacity-80 pointer-events-none">
                <div className="flex flex-col items-center justify-center h-12 w-10 rounded border-2 border-dashed border-[#C97B3D]/60 bg-[#FDF5E6] px-1 text-[9px] font-black uppercase tracking-widest text-[#C97B3D]">
                  <span>Cari</span>
                  <Heart className="h-2.5 w-2.5 fill-[#C97B3D] text-[#C97B3D]" />
                  <span>2024</span>
                </div>
              </div>

              {/* Tag nhãn nhỏ trên cùng */}
              {currentLetter.tag && (
                <div className="inline-flex items-center gap-1 rounded-full bg-[#FCE9C6] px-3 py-1 text-xs font-bold text-[#1B4B5A] mb-4">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  {currentLetter.tag}
                </div>
              )}

              {/* Tiêu đề thư */}
              <h3 className="font-heading text-xl sm:text-2xl font-black text-[#1B4B5A] pr-12 leading-snug">
                {currentLetter.title}
              </h3>

              {/* Đường chỉ may trang trí */}
              <div className="my-4 h-0.5 w-full bg-gradient-to-r from-amber-300/80 via-rose-200 to-transparent" />

              {/* Lời chào đầu thư */}
              <p className="text-base sm:text-lg font-semibold text-[#1B4B5A] mb-3">
                {currentLetter.salutation}
              </p>

              {/* Các đoạn văn thân mật, ấm cúng */}
              <div className="space-y-3 text-neutral-700 text-sm sm:text-base leading-relaxed sm:leading-loose">
                {currentLetter.paragraphs.map((p, idx) => (
                  <p key={idx} className="font-normal">
                    {p}
                  </p>
                ))}
              </div>

              {/* Mã giảm giá hoặc quà tặng (nếu có trong mẫu thư) */}
              {currentLetter.discount && (
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#FFF1F3] to-[#FFF9EE] p-3.5 sm:p-4 border border-rose-200/80 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#E11D48]">
                        <Heart className="h-3.5 w-3.5 fill-[#E11D48]" />
                        <span>Món quà nhỏ: {currentLetter.discount.discountText}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-600">
                        {currentLetter.discount.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyCode(currentLetter.discount!.code)}
                      className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#1B4B5A] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#123640] active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Mã: {currentLetter.discount.code}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Lời kết & Chữ ký */}
              <div className="mt-6 flex flex-col items-end text-right">
                <span className="text-xs text-neutral-500 italic">
                  {currentLetter.closing}
                </span>
                <span className="font-heading text-base sm:text-lg font-bold text-[#1B4B5A]">
                  {currentLetter.signature}
                </span>
              </div>

              {/* Cụm nút hành động phía dưới */}
              <div className="mt-7 pt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handlePickAnother}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:text-rose-800 active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-rose-500" />
                  <span>Bốc lá thư khác 💌</span>
                </button>

                <button
                  onClick={onClose}
                  className="rounded-full bg-[#1B4B5A] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-[#123640] active:scale-95"
                >
                  Cảm ơn Cari ❤️
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
