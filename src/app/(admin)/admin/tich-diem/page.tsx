"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Coins, Users } from "lucide-react";
import { matchesQuery, useAdmin } from "@/components/admin/AdminContext";
import {
  Card,
  Chip,
  ChipRow,
  EmptyRow,
  Pagination,
  StatCard,
  StatusPill,
  TABLE,
  TABLE_WRAP,
  TD,
  TH,
  type Tone,
} from "@/components/admin/ui";
import { POINT_RATE_VND, pointBalance, useCustomers, usePointLogs } from "@/lib/db";
import { formatDateVN } from "@/lib/utils";
import type { PointTransactionKind } from "@/types/user";

const KIND_LABELS: Record<PointTransactionKind, { label: string; tone: Tone }> = {
  order: { label: "Đơn hàng", tone: "green" },
  manual: { label: "Admin chỉnh", tone: "blue" },
  redeem: { label: "Đổi ưu đãi", tone: "amber" },
  initial: { label: "Điểm cũ", tone: "gray" },
};

type Filter = "all" | PointTransactionKind;
const PAGE_SIZE = 10;

// Tổng quan chương trình tích điểm — đọc từ cùng dữ liệu điểm với /admin/khach-hang
export default function AdminPointsPage() {
  const { query } = useAdmin();
  const logs = usePointLogs();
  const customers = useCustomers();

  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const ranking = useMemo(
    () =>
      customers
        .map((c) => ({ customer: c, points: pointBalance(logs, c.email) }))
        .sort((a, b) => b.points - a.points),
    [customers, logs],
  );
  const totalPoints = ranking.reduce((s, r) => s + r.points, 0);
  const withPoints = ranking.filter((r) => r.points > 0).length;

  const nameOf = (email: string) => customers.find((c) => c.email.toLowerCase() === email.toLowerCase())?.fullName ?? email;

  const entries = [...logs]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .filter(
      (l) =>
        (filter === "all" || l.kind === filter) &&
        matchesQuery(query, l.title, l.reason, l.email, nameOf(l.email), l.orderId),
    );
  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng điểm đang lưu hành" value={totalPoints.toLocaleString("vi-VN")} icon={<Coins className="h-5 w-5" />} />
        <StatCard label="Khách đang có điểm" value={`${withPoints}/${customers.length}`} icon={<Users className="h-5 w-5" />} />
        <StatCard
          label="Quy tắc tích điểm"
          value={`${POINT_RATE_VND.toLocaleString("vi-VN")}đ = 1`}
          hint="Chỉ cộng khi đơn chuyển sang “Đã giao”"
          icon={<Award className="h-5 w-5" />}
        />
      </div>

      {/* TODO: quy đổi điểm → voucher và xét hạng thành viên chưa chốt (xem trang /tich-diem) — chưa có màn hình cấu hình. */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
        <Card title="Khách nhiều điểm nhất" className="self-start [&>div:last-child]:p-0">
          <ol className="divide-y divide-[#e3e3e3]">
            {ranking.slice(0, 5).map((r, i) => (
              <li key={r.customer.id} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0e6c8] text-[11px] font-bold text-[#2b2b2b]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[#2b2b2b]">{r.customer.fullName}</div>
                  <div className="truncate text-[10px] text-[#9a9a9a]">{r.customer.email}</div>
                </div>
                <strong className="text-[#2b2b2b]">{r.points.toLocaleString("vi-VN")}</strong>
              </li>
            ))}
          </ol>
          <div className="border-t border-[#e3e3e3] px-4 py-2.5 text-[11px]">
            <Link href="/admin/khach-hang" className="font-bold text-[#2b2b2b] hover:underline">
              Cộng/trừ điểm ở màn hình Khách hàng →
            </Link>
          </div>
        </Card>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#2b2b2b]">Nhật ký điểm</h2>
            <ChipRow>
              <Chip
                active={filter === "all"}
                onClick={() => {
                  setFilter("all");
                  setPage(1);
                }}
              >
                Tất cả
              </Chip>
              {(Object.keys(KIND_LABELS) as PointTransactionKind[]).map((k) => (
                <Chip
                  key={k}
                  active={filter === k}
                  onClick={() => {
                    setFilter(k);
                    setPage(1);
                  }}
                >
                  {KIND_LABELS[k].label}
                </Chip>
              ))}
            </ChipRow>
          </div>
          <div className={TABLE_WRAP}>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>Ngày</th>
                  <th className={TH}>Khách hàng</th>
                  <th className={TH}>Nội dung</th>
                  <th className={TH}>Loại</th>
                  <th className={`${TH} text-right`}>Điểm</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && <EmptyRow colSpan={5}>Chưa có giao dịch điểm nào.</EmptyRow>}
                {visible.map((l) => (
                  <tr key={l.id}>
                    <td className={`${TD} whitespace-nowrap`}>{formatDateVN(l.date)}</td>
                    <td className={`${TD} font-semibold text-[#2b2b2b]`}>{nameOf(l.email)}</td>
                    <td className={TD}>
                      {l.title}
                      {l.reason && <div className="text-[11px] text-[#9a9a9a]">Lý do: {l.reason}</div>}
                    </td>
                    <td className={TD}>
                      <StatusPill tone={KIND_LABELS[l.kind].tone}>{KIND_LABELS[l.kind].label}</StatusPill>
                    </td>
                    <td className={`${TD} text-right font-bold ${l.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {l.points > 0 ? "+" : ""}
                      {l.points.toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={currentPage} pages={pages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
