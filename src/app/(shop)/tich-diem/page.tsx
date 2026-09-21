"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  Coins,
  ChevronDown,
  Gift,
  History,
  ShieldCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import PointCard from "@/components/account/PointCard";
import { useAuth } from "@/lib/auth";
import { pointBalance, pointHistory, usePointLogs } from "@/lib/db";
import { MOCK_USER } from "@/lib/mock-data";
import { formatDateVN } from "@/lib/utils";

// =============================================================================
// FAQ DỮ LIỆU THẬT
// =============================================================================
const FAQ_ITEMS = [
  {
    question: "Làm sao để tích điểm?",
    answer:
      "Cứ mỗi 1.000đ chi tiêu, bạn nhận được 1 điểm. Điểm được cộng tự động khi đơn hàng chuyển sang trạng thái \"đã giao\".",
  },
  {
    question: "Điểm dùng để làm gì?",
    answer:
      "Điểm có thể dùng để quy đổi voucher giảm giá. Chi tiết mức quy đổi sẽ được cập nhật sớm.",
  },
  {
    question: "Vì sao đặt hàng xong chưa thấy cộng điểm ngay?",
    answer:
      "Điểm chỉ được cộng khi tiệm xác nhận đơn đã giao thành công, để tránh trường hợp đơn bị hủy hoặc chưa thanh toán.",
  },
];

// Điểm và lịch sử điểm lấy từ dữ liệu chung (src/lib/db.ts); admin cộng/trừ điểm ở /admin/khach-hang.

export default function TichDiemPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Chưa đăng nhập: hiện dữ liệu demo của khách mẫu (trang vẫn ghi "Dữ liệu mẫu demo")
  const { user } = useAuth();
  const email = user?.email ?? MOCK_USER.email;
  const logs = usePointLogs();
  const currentPoints = useMemo(() => pointBalance(logs, email), [logs, email]);
  const history = useMemo(
    () =>
      pointHistory(logs, email).map((l) => ({
        id: l.id,
        date: formatDateVN(l.date),
        title: l.reason ? `${l.title}: ${l.reason}` : l.title,
        points: `${l.points > 0 ? "+" : ""}${l.points.toLocaleString("vi-VN")}`,
        isPositive: l.points > 0,
        balance: l.balance.toLocaleString("vi-VN"),
      })),
    [logs, email],
  );

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full bg-[#FFF8EF] text-[#2b2b2b] overflow-x-hidden min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FCE9C6] py-14 md:py-20 border-b border-[#E5D9C3]/80">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#F6CE8B]/30 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#1B4B5A]/5 blur-2xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1B4B5A]/15 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B4B5A] shadow-xs backdrop-blur-xs mb-5">
            <Coins className="h-3.5 w-3.5 text-[#1B4B5A]" />
            Cari Rewards Club
          </div>
          <h1 className="font-heading text-3xl font-black text-[#1B4B5A] sm:text-4xl md:text-5xl leading-tight">
            Chương trình tích điểm Cari Bakehouse
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-[#1B4B5A]/80 leading-relaxed">
            Mỗi món bánh ngọt lành gửi trao là một lời cảm ơn. Cùng Cari tích lũy điểm thưởng ngọt ngào trên từng đơn hàng!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {/* 2. CÁCH TÍCH ĐIỂM (QUY TẮC) */}
        <section>
          <div className="rounded-2xl border-2 border-[#1B4B5A]/15 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FCE9C6] border border-[#F6CE8B] text-[#1B4B5A] shadow-inner">
                  <Coins className="h-8 w-8 sm:h-10 sm:w-10 text-[#1B4B5A]" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Quy tắc tích điểm</span>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                    <span className="font-heading text-2xl sm:text-3xl font-black text-[#1B4B5A]">1.000đ</span>
                    <span className="text-xl sm:text-2xl font-bold text-muted">=</span>
                    <span className="font-heading text-2xl sm:text-3xl font-black text-[#1B4B5A] bg-[#FCE9C6]/60 px-3 py-0.5 rounded-lg border border-[#F6CE8B]/50">
                      1 điểm
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto md:max-w-md border-t md:border-t-0 md:border-l border-border/80 pt-4 md:pt-0 md:pl-8">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2b2b2b]/80 leading-relaxed">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Điểm được cộng tự động</strong> khi đơn hàng của bạn được xác nhận hoàn tất.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. THẺ ĐIỂM CỦA TÔI (KHI ĐÃ ĐĂNG NHẬP) */}
        {/* TODO: thay bằng dữ liệu điểm thật của user khi nối database */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1B4B5A] flex items-center gap-2">
              <Award className="h-6 w-6 text-[#1B4B5A]" />
              Thẻ điểm của tôi
            </h2>
            <span className="text-xs text-muted italic">(Dữ liệu mẫu demo)</span>
          </div>

          <PointCard data={{ currentPoints, tier: "Thành viên mới" }} />
        </section>

        {/* 4. BẢNG QUY ĐỔI ĐIỂM VÀ HẠNG THÀNH VIÊN */}
        {/* TODO: chưa chốt cách quy đổi điểm và hạng thành viên cụ thể — điền khi có quyết định, không tự đặt số. */}
        <section className="space-y-8">
          {/* 4.1 Bảng quy đổi điểm */}
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1B4B5A]">
                Đổi điểm lấy ưu đãi
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Các mức quy đổi điểm thưởng sang voucher giảm giá hoặc quà tặng hấp dẫn.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-[#FCE9C6]/50 text-[#1B4B5A] font-bold">
                    <th className="py-3.5 px-4 sm:px-6">Số điểm</th>
                    <th className="py-3.5 px-4 sm:px-6">Ưu đãi nhận được</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-[#2b2b2b]">
                  {/* Hàng 1 */}
                  <tr className="hover:bg-[#FFF8EF]/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#1B4B5A]">
                      {/* TODO: số điểm quy đổi cụ thể */}
                      <span className="inline-block rounded-md bg-amber-50 px-2.5 py-1 text-amber-900 border border-amber-200">
                        Chờ công bố
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-muted italic">
                      {/* TODO: ưu đãi quy đổi cụ thể */}
                      Đang cập nhật chi tiết voucher...
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        disabled
                        className="cursor-not-allowed rounded-lg border border-border bg-slate-100 px-3 py-1.5 text-xs text-muted"
                      >
                        Sắp mở
                      </button>
                    </td>
                  </tr>
                  {/* Hàng 2 */}
                  <tr className="hover:bg-[#FFF8EF]/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#1B4B5A]">
                      <span className="inline-block rounded-md bg-amber-50 px-2.5 py-1 text-amber-900 border border-amber-200">
                        Chờ công bố
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-muted italic">
                      Đang cập nhật chi tiết voucher...
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        disabled
                        className="cursor-not-allowed rounded-lg border border-border bg-slate-100 px-3 py-1.5 text-xs text-muted"
                      >
                        Sắp mở
                      </button>
                    </td>
                  </tr>
                  {/* Hàng 3 */}
                  <tr className="hover:bg-[#FFF8EF]/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#1B4B5A]">
                      <span className="inline-block rounded-md bg-amber-50 px-2.5 py-1 text-amber-900 border border-amber-200">
                        Chờ công bố
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-muted italic">
                      Đang cập nhật quà tặng / bánh mini...
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        disabled
                        className="cursor-not-allowed rounded-lg border border-border bg-slate-100 px-3 py-1.5 text-xs text-muted"
                      >
                        Sắp mở
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="bg-[#FFF8EF]/80 px-4 py-3 text-center text-xs text-muted border-t border-border/60">
                {/* TODO: chưa chốt cách quy đổi điểm và hạng thành viên cụ thể — điền khi có quyết định, không tự đặt số. */}
                Chính sách đổi điểm chi tiết sẽ được công bố chính thức tới quý khách trong thời gian sớm nhất.
              </div>
            </div>
          </div>

          {/* 4.2 Hạng thành viên */}
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1B4B5A]">
                Hạng thành viên
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Tích lũy chi tiêu để nâng hạng và nhận đặc quyền riêng từ Cari Bakehouse.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Thành viên mới */}
              <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading text-lg font-bold text-[#1B4B5A]">Thành viên mới</span>
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                  </div>
                  <div className="h-px bg-border/60 my-3" />
                  <div className="space-y-2 text-xs text-muted">
                    <p className="italic">
                      {/* TODO: điều kiện & quyền lợi thành viên mới */}
                      Điều kiện & quyền lợi chi tiết đang cập nhật...
                    </p>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-cream/70 p-3 text-center text-xs font-semibold text-[#1B4B5A]">
                  Hạng mặc định
                </div>
              </div>

              {/* Card 2: Thân thiết */}
              <div className="rounded-2xl border-2 border-[#1B4B5A] bg-white p-6 shadow-xs flex flex-col justify-between relative">
                <span className="absolute -top-3 right-6 rounded-full bg-[#1B4B5A] px-3 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                  Phổ biến
                </span>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading text-lg font-bold text-[#1B4B5A]">Thân thiết</span>
                    <span className="h-3 w-3 rounded-full bg-[#F6CE8B]" />
                  </div>
                  <div className="h-px bg-border/60 my-3" />
                  <div className="space-y-2 text-xs text-muted">
                    <p className="italic">
                      {/* TODO: điều kiện & quyền lợi thành viên thân thiết */}
                      Điều kiện & quyền lợi chi tiết đang cập nhật...
                    </p>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-[#FCE9C6] p-3 text-center text-xs font-semibold text-[#1B4B5A]">
                  Đang cập nhật
                </div>
              </div>

              {/* Card 3: VIP */}
              <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading text-lg font-bold text-[#1B4B5A]">VIP</span>
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                  </div>
                  <div className="h-px bg-border/60 my-3" />
                  <div className="space-y-2 text-xs text-muted">
                    <p className="italic">
                      {/* TODO: điều kiện & quyền lợi VIP */}
                      Điều kiện & quyền lợi chi tiết đang cập nhật...
                    </p>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-cream/70 p-3 text-center text-xs font-semibold text-[#1B4B5A]">
                  Đang cập nhật
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LỊCH SỬ GIAO DỊCH ĐIỂM */}
        {/* TODO: thay bằng dữ liệu thật từ database */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1B4B5A] flex items-center gap-2">
              <History className="h-5 w-5 text-[#1B4B5A]" />
              Lịch sử điểm của bạn
            </h2>
            <span className="text-xs text-muted italic">(Dữ liệu mẫu demo)</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-[#FCE9C6]/50 text-[#1B4B5A] font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Ngày</th>
                  <th className="py-3.5 px-4 sm:px-6">Nội dung / Đơn hàng</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Điểm</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Số dư</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-[#2b2b2b]">
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 px-6 text-center text-sm text-muted">
                      Chưa có lịch sử điểm.
                    </td>
                  </tr>
                )}
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFF8EF]/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-muted">{item.date}</td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-[#1B4B5A]">{item.title}</td>
                    <td
                      className={`py-3.5 px-4 sm:px-6 text-center font-bold ${
                        item.isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {item.points}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-semibold text-[#2b2b2b]">
                      {item.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. FAQ TÍCH ĐIỂM */}
        <section className="space-y-6 pt-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4B5A]">
              <HelpCircle className="h-4 w-4" />
              Giải đáp thắc mắc
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A] mt-1">
              Câu hỏi thường gặp về tích điểm
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border/80 bg-white shadow-xs transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-5 text-left font-heading text-base font-bold text-[#1B4B5A] hover:bg-[#FFF8EF]/50 transition-colors"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#1B4B5A]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#2b2b2b]/85 leading-relaxed border-t border-border/40 bg-[#FFF8EF]/30">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. CTA CUỐI TRANG */}
        <section className="rounded-3xl bg-[#1B4B5A] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-[#F6CE8B]/10 blur-xl" />
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="font-heading text-2xl sm:text-3xl font-black text-[#F6CE8B]">
              Bắt đầu tích điểm cùng Cari ngay hôm nay!
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Khám phá menu bánh thơm nướng mới mỗi ngày và nhận điểm thưởng cho mỗi đơn hàng.
            </p>
            <div className="pt-2">
              <Link
                href="/san-pham"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F6CE8B] px-8 py-3 font-heading text-sm font-bold text-[#1B4B5A] shadow-md transition-all hover:bg-white hover:scale-105"
              >
                Đặt bánh ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
