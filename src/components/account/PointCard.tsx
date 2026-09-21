import { Sparkles } from "lucide-react";
import type { PointCardData } from "@/types/user";

// Thẻ điểm thành viên — dùng chung cho trang /tich-diem và /tai-khoan
export default function PointCard({ data }: { data: PointCardData }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1B4B5A] text-white p-6 sm:p-8 shadow-md">
      {/* Pattern trang trí nền */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-44 w-44 rounded-full bg-[#F6CE8B]/10 blur-xl" />
      <div className="absolute bottom-0 right-20 -mb-10 h-32 w-32 rounded-full bg-white/5 blur-lg" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#F6CE8B] border border-white/10">
            <Sparkles className="h-3 w-3" />
            Cari Member Card
          </div>
          <div>
            <div className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-[#F6CE8B]">
              {data.currentPoints.toLocaleString("vi-VN")}{" "}
              <span className="text-xl sm:text-2xl font-normal text-white/90">điểm</span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 mt-1">Số điểm khả dụng hiện có</p>
          </div>

          {/* Thanh tiến độ hạng: chỉ hiện khi đã có quy tắc xét hạng (TODO: chưa chốt) */}
          {data.pointsNeeded !== undefined && data.progressPercentage !== undefined && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-white/80">
                <span>
                  Hạng hiện tại: <strong className="text-white">{data.tier}</strong>
                </span>
                <span>
                  Cần thêm <strong className="text-[#F6CE8B]">{data.pointsNeeded} điểm</strong>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full bg-[#F6CE8B] transition-all duration-500"
                  style={{ width: `${data.progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-white/60">
                Còn {data.pointsNeeded} điểm nữa để nâng hạng lên {data.nextTier}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 border-white/15 pt-4 md:pt-0">
          <div className="rounded-xl bg-white/10 px-4 py-2 text-center border border-white/10 backdrop-blur-xs">
            <div className="text-[11px] text-white/70">Hạng tài khoản</div>
            <div className="font-heading text-sm font-bold text-[#F6CE8B]">{data.tier}</div>
          </div>
          <div className="mt-4 text-xs text-white/60">Cari Bakehouse • Since 2023</div>
        </div>
      </div>
    </div>
  );
}
