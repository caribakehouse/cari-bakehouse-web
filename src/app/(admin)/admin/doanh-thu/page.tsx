"use client";

import { useMemo, useState } from "react";
import { Ban, Cake, ReceiptText, Wallet } from "lucide-react";
import { Card, Chip, ChipRow, StatCard, TABLE, TABLE_WRAP, TD, TH, Toolbar } from "@/components/admin/ui";
import { useCustomRequests, useOrders } from "@/lib/db";
import { formatVND, todayISO } from "@/lib/utils";

// ─── Doanh thu ───────────────────────────────────────────────
// Doanh thu = đơn online "Đã giao" (tổng tiền sau giảm giá, tính theo ngày nhận bánh)
//           + bánh theo yêu cầu "Hoàn tất" có giá đã báo (tính theo ngày cần bánh).
// Màu: 2 loại đơn dùng 2 màu phân loại đã kiểm tra cho người mù màu; trạng thái đơn dùng màu trạng thái
// (xanh lá / vàng / đỏ) luôn kèm chữ — không bao giờ chỉ dựa vào màu.

const COLOR_ONLINE = "#2a78d6";
const COLOR_CUSTOM = "#eb6834";
const STATUS_COLORS = { delivered: "#0ca30c", pending: "#fab219", cancelled: "#d03b3b" } as const;

type Range = "day" | "month";

interface Bucket {
  key: string;
  label: string;
  /** Nhãn đầy đủ trong tooltip / bảng */
  fullLabel: string;
  online: number;
  custom: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** yyyy-mm-dd → Date (UTC, tránh lệch múi giờ khi cộng trừ ngày) */
const parseISO = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toISO = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function buildBuckets(range: Range): Bucket[] {
  const today = parseISO(todayISO());
  if (range === "day") {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - (29 - i));
      const label = `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
      return { key: toISO(d), label, fullLabel: `Ngày ${label}/${d.getUTCFullYear()}`, online: 0, custom: 0 };
    });
  }
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (11 - i), 1));
    const m = d.getUTCMonth() + 1;
    return {
      key: `${d.getUTCFullYear()}-${pad(m)}`,
      label: `T${m}`,
      fullLabel: `Tháng ${m}/${d.getUTCFullYear()}`,
      online: 0,
      custom: 0,
    };
  });
}

/** Số tiền gọn cho trục / nhãn: 72.500 → "72,5k", 1.250.000 → "1,25tr" */
function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}tr`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}k`;
  return n.toLocaleString("vi-VN");
}

/** Mốc trục tung tròn đẹp (1, 2, 2.5, 5 × 10^n) */
function niceMax(v: number): number {
  if (v <= 0) return 100_000;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return step * exp;
}

const percent = (part: number, total: number) =>
  total > 0 ? `${((part / total) * 100).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%` : "0%";

// ─── Biểu đồ cột chồng: doanh thu theo ngày / tháng ──────────
function RevenueBars({ buckets, range }: { buckets: Bucket[]; range: Range }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...buckets.map((b) => b.online + b.custom)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  // Theo ngày: 30 cột → chỉ ghi nhãn mỗi 5 ngày (và ngày cuối) cho đỡ chật
  const showLabel = (i: number) => range === "month" || i % 5 === 4 || i === buckets.length - 1;
  const h = hover !== null ? buckets[hover] : null;

  return (
    <div>
      <div className="relative flex h-60 pl-11">
        {/* Trục tung + lưới ngang (nhạt) */}
        {ticks.map((t) => (
          <div
            key={t}
            className="pointer-events-none absolute right-0 left-11 border-t border-[#ececec]"
            style={{ bottom: `${(t / max) * 100}%` }}
          >
            <span className="absolute -top-2 -left-11 w-10 pr-1.5 text-right text-[10px] text-[#9a9a9a]">
              {formatCompact(t)}
            </span>
          </div>
        ))}

        {/* Cột */}
        <div className="relative flex flex-1 items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
          {buckets.map((b, i) => {
            const total = b.online + b.custom;
            const onlineH = (b.online / max) * 100;
            const customH = (b.custom / max) * 100;
            const dim = hover !== null && hover !== i;
            return (
              <button
                key={b.key}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${b.fullLabel}: ${formatVND(total)}`}
                className="relative flex h-full flex-1 cursor-default flex-col items-center justify-end outline-none"
              >
                {/* Đoạn trên (bánh theo yêu cầu) bo góc trên; khe 2px nền trắng giữa 2 đoạn */}
                <div className={`flex w-full max-w-[28px] flex-col justify-end transition-opacity ${dim ? "opacity-40" : ""}`} style={{ height: "100%" }}>
                  {b.custom > 0 && (
                    <div
                      className="w-full rounded-t-[4px]"
                      style={{ height: `${customH}%`, background: COLOR_CUSTOM, minHeight: 2 }}
                    />
                  )}
                  {b.custom > 0 && b.online > 0 && <div className="h-[2px] w-full bg-white" />}
                  {b.online > 0 && (
                    <div
                      className={`w-full ${b.custom > 0 ? "" : "rounded-t-[4px]"}`}
                      style={{ height: `${onlineH}%`, background: COLOR_ONLINE, minHeight: 2 }}
                    />
                  )}
                </div>
              </button>
            );
          })}

          {/* Tooltip khi rê chuột / chọn cột */}
          {h && hover !== null && (
            <div
              // Đặt cạnh cột (bên phải nếu cột ở nửa trái, bên trái nếu ở nửa phải) để không che cột
              className={`pointer-events-none absolute top-0 z-10 w-44 rounded-md border border-[#d6d6d6] bg-white p-2.5 text-[11px] shadow-lg ${
                hover < buckets.length / 2 ? "ml-3" : "-ml-3 -translate-x-full"
              }`}
              style={{ left: `${((hover + (hover < buckets.length / 2 ? 1 : 0)) / buckets.length) * 100}%` }}
            >
              <div className="font-bold text-[#2b2b2b]">{h.fullLabel}</div>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[#5b5b5b]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLOR_ONLINE }} />
                  Đơn online
                </span>
                <span className="font-semibold text-[#2b2b2b]">{formatVND(h.online)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[#5b5b5b]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLOR_CUSTOM }} />
                  Theo yêu cầu
                </span>
                <span className="font-semibold text-[#2b2b2b]">{formatVND(h.custom)}</span>
              </div>
              <div className="mt-1.5 flex justify-between border-t border-[#ececec] pt-1.5 font-bold text-[#2b2b2b]">
                <span>Tổng</span>
                <span>{formatVND(h.online + h.custom)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nhãn trục hoành */}
      <div className="mt-1.5 flex gap-[2px] pl-11">
        {buckets.map((b, i) => (
          <div key={b.key} className="flex-1 text-center text-[10px] text-[#7a7a7a]">
            {showLabel(i) ? b.label : ""}
          </div>
        ))}
      </div>

      <Legend
        items={[
          { color: COLOR_ONLINE, label: "Đơn online (đã giao)" },
          { color: COLOR_CUSTOM, label: "Bánh theo yêu cầu (hoàn tất)" },
        ]}
      />
    </div>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[#5b5b5b]">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// ─── Biểu đồ tròn (donut) ────────────────────────────────────
interface Slice {
  label: string;
  value: number;
  color: string;
  /** Chữ phụ cạnh số (vd tổng tiền) */
  note?: string;
}

function Donut({ slices, centerLabel }: { slices: Slice[]; centerLabel: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  const visible = slices.filter((s) => s.value > 0).length;
  // Khe 2px nền trắng giữa các phần (chỉ khi có từ 2 phần trở lên)
  const gap = visible > 1 ? 2 : 0;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label={centerLabel}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f0f0f0" strokeWidth="18" />
          {total > 0 &&
            slices.map((s, i) => {
              if (s.value <= 0) return null;
              const len = (s.value / total) * c;
              const seg = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === i ? 22 : 18}
                  strokeDasharray={`${Math.max(len - gap, 0.5)} ${c}`}
                  strokeDashoffset={-offset}
                  className="cursor-default transition-[stroke-width,opacity]"
                  opacity={hover !== null && hover !== i ? 0.4 : 1}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <title>{`${s.label}: ${s.value.toLocaleString("vi-VN")} (${percent(s.value, total)})`}</title>
                </circle>
              );
              offset += len;
              return seg;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-[#2b2b2b]">
            {(hover !== null ? slices[hover].value : total).toLocaleString("vi-VN")}
          </span>
          <span className="max-w-[80px] text-center text-[10px] leading-tight text-[#7a7a7a]">
            {hover !== null ? slices[hover].label : centerLabel}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2 text-[12px]">
        {slices.map((s, i) => (
          <li
            key={s.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center justify-between gap-3 rounded-md px-2 py-1 ${hover === i ? "bg-[#f7f7f7]" : ""}`}
          >
            <span className="flex items-center gap-2 text-[#5b5b5b]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="text-right">
              <span className="font-bold text-[#2b2b2b]">{s.value.toLocaleString("vi-VN")}</span>
              <span className="ml-1.5 text-[#9a9a9a]">{percent(s.value, total)}</span>
              {s.note && <div className="text-[10px] text-[#9a9a9a]">{s.note}</div>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Trang ───────────────────────────────────────────────────
export default function AdminRevenuePage() {
  const orders = useOrders();
  const requests = useCustomRequests();
  const [range, setRange] = useState<Range>("day");
  const [showTable, setShowTable] = useState(false);

  const data = useMemo(() => {
    const buckets = buildBuckets(range);
    const keyOf = (iso: string) => (range === "day" ? iso : iso.slice(0, 7));
    const index = new Map(buckets.map((b, i) => [b.key, i]));
    const inRange = (iso: string) => index.has(keyOf(iso));

    // Doanh thu
    for (const o of orders) {
      if (o.status !== "Đã giao" || !inRange(o.receiveDate)) continue;
      buckets[index.get(keyOf(o.receiveDate))!].online += o.total;
    }
    for (const r of requests) {
      if (r.status !== "Hoàn tất" || !r.quotedPrice || !inRange(r.deliveryDate)) continue;
      buckets[index.get(keyOf(r.deliveryDate))!].custom += r.quotedPrice;
    }

    // Số đơn trong khoảng (theo ngày đặt / ngày gửi yêu cầu)
    const ordersIn = orders.filter((o) => inRange(o.createdAt));
    const requestsIn = requests.filter((r) => inRange(r.createdAt));
    const delivered = ordersIn.filter((o) => o.status === "Đã giao");
    const pending = ordersIn.filter((o) => o.status === "Chờ xử lý");
    const cancelled = ordersIn.filter((o) => o.status === "Đã hủy");
    const customDone = requestsIn.filter((r) => r.status === "Hoàn tất");

    const revenueOnline = buckets.reduce((s, b) => s + b.online, 0);
    const revenueCustom = buckets.reduce((s, b) => s + b.custom, 0);
    const soldCount =
      orders.filter((o) => o.status === "Đã giao" && inRange(o.receiveDate)).length +
      requests.filter((r) => r.status === "Hoàn tất" && r.quotedPrice && inRange(r.deliveryDate)).length;

    return {
      buckets,
      revenue: revenueOnline + revenueCustom,
      revenueOnline,
      revenueCustom,
      soldCount,
      delivered: delivered.length,
      deliveredAmount: delivered.reduce((s, o) => s + o.total, 0),
      pending: pending.length,
      cancelled: cancelled.length,
      cancelledAmount: cancelled.reduce((s, o) => s + o.total, 0),
      onlineCount: ordersIn.length,
      customCount: requestsIn.length,
      customDone: customDone.length,
    };
  }, [orders, requests, range]);

  const rangeText = range === "day" ? "30 ngày gần nhất" : "12 tháng gần nhất";

  return (
    <div className="space-y-5">
      <Toolbar>
        <ChipRow>
          <Chip active={range === "day"} onClick={() => setRange("day")}>
            Theo ngày (30 ngày)
          </Chip>
          <Chip active={range === "month"} onClick={() => setRange("month")}>
            Theo tháng (12 tháng)
          </Chip>
        </ChipRow>
        <p className="text-[11px] text-[#7a7a7a]">
          Doanh thu = đơn online đã giao + bánh theo yêu cầu hoàn tất (theo giá đã báo).
        </p>
      </Toolbar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Doanh thu" value={formatVND(data.revenue)} hint={rangeText} icon={<Wallet className="h-5 w-5" />} />
        <StatCard
          label="Đơn đã bán"
          value={data.soldCount.toLocaleString("vi-VN")}
          hint="Đơn online đã giao + yêu cầu hoàn tất"
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <StatCard
          label="Giá trị trung bình / đơn"
          value={formatVND(data.soldCount > 0 ? Math.round(data.revenue / data.soldCount) : 0)}
          hint={rangeText}
          icon={<Cake className="h-5 w-5" />}
        />
        <StatCard
          label="Đơn đã hủy"
          value={data.cancelled.toLocaleString("vi-VN")}
          hint={data.cancelled > 0 ? `Mất ${formatVND(data.cancelledAmount)}` : rangeText}
          icon={<Ban className="h-5 w-5" />}
        />
      </div>

      <Card
        title={`Doanh thu ${range === "day" ? "theo ngày" : "theo tháng"} · ${rangeText}`}
        action={
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="cursor-pointer text-[11px] font-bold text-[#2b2b2b] underline-offset-4 hover:underline"
          >
            {showTable ? "Xem biểu đồ" : "Xem dạng bảng"}
          </button>
        }
      >
        {showTable ? (
          <div className={TABLE_WRAP}>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>{range === "day" ? "Ngày" : "Tháng"}</th>
                  <th className={`${TH} text-right`}>Đơn online</th>
                  <th className={`${TH} text-right`}>Theo yêu cầu</th>
                  <th className={`${TH} text-right`}>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {[...data.buckets].reverse().map((b) => (
                  <tr key={b.key}>
                    <td className={TD}>{b.fullLabel}</td>
                    <td className={`${TD} text-right`}>{formatVND(b.online)}</td>
                    <td className={`${TD} text-right`}>{formatVND(b.custom)}</td>
                    <td className={`${TD} text-right font-bold text-[#2b2b2b]`}>{formatVND(b.online + b.custom)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <RevenueBars buckets={data.buckets} range={range} />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={`Trạng thái đơn online · ${rangeText}`}>
          <Donut
            centerLabel="đơn online"
            slices={[
              {
                label: "Đã giao",
                value: data.delivered,
                color: STATUS_COLORS.delivered,
                note: formatVND(data.deliveredAmount),
              },
              { label: "Chờ xử lý", value: data.pending, color: STATUS_COLORS.pending },
              {
                label: "Đã hủy",
                value: data.cancelled,
                color: STATUS_COLORS.cancelled,
                note: data.cancelled > 0 ? formatVND(data.cancelledAmount) : undefined,
              },
            ]}
          />
        </Card>

        <Card title={`Loại đơn · ${rangeText}`}>
          <Donut
            centerLabel="tổng đơn"
            slices={[
              {
                label: "Đơn online (mặc định)",
                value: data.onlineCount,
                color: COLOR_ONLINE,
                note: `Doanh thu ${formatVND(data.revenueOnline)}`,
              },
              {
                label: "Bánh theo yêu cầu",
                value: data.customCount,
                color: COLOR_CUSTOM,
                note: `${data.customDone} hoàn tất · ${formatVND(data.revenueCustom)}`,
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
