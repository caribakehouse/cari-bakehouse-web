"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Coins, Users } from "lucide-react";
import { matchesQuery, useAdmin } from "@/components/admin/AdminContext";
import {
  BTN_OUTLINE,
  BTN_SOLID,
  Card,
  Chip,
  ChipRow,
  EmptyRow,
  Field,
  INPUT,
  INPUT_INVALID,
  Pagination,
  StatCard,
  StatusPill,
  TABLE,
  TABLE_WRAP,
  TD,
  TH,
  type Tone,
} from "@/components/admin/ui";
import {
  lifetimePoints,
  pointBalance,
  saveLoyaltyConfig,
  tierFor,
  useCustomers,
  useLoyaltyConfig,
  usePointLogs,
  useProductGroupOptions,
} from "@/lib/db";
import type { LoyaltyConfig } from "@/types/content";
import { formatDateVN } from "@/lib/utils";
import type { PointTransactionKind } from "@/types/user";

const KIND_LABELS: Record<PointTransactionKind, { label: string; tone: Tone }> = {
  order: { label: "Đơn hàng", tone: "green" },
  manual: { label: "Admin chỉnh", tone: "blue" },
  redeem: { label: "Đổi ưu đãi", tone: "amber" },
  initial: { label: "Điểm cũ", tone: "gray" },
};

type Filter = "all" | PointTransactionKind;

type NumberKey = Exclude<keyof LoyaltyConfig, "redeemGroupId">;

const NUMBER_FIELDS: { key: NumberKey; label: string; hint: string; suffix: string }[] = [
  { key: "pointRateVnd", label: "Tích điểm", hint: "Bao nhiêu đồng được 1 điểm (tính trên tổng tiền đơn sau giảm)", suffix: "đ = 1 điểm" },
  { key: "redeemPoints", label: "Đổi quà", hint: "Số điểm đổi 1 món miễn phí trong nhóm bên cạnh", suffix: "điểm" },
  { key: "loyalMinPoints", label: "Hạng Thân thiết từ", hint: "Tổng điểm đã tích (đổi quà không làm tụt hạng)", suffix: "điểm" },
  { key: "vipMinPoints", label: "Hạng VIP từ", hint: "Tổng điểm đã tích", suffix: "điểm" },
  { key: "vipCakeDiscountPercent", label: "VIP giảm tiền bánh", hint: "Tự áp dụng mỗi đơn (không tính đồ uống)", suffix: "%" },
  { key: "birthdayCakeDiscountPercent", label: "VIP tháng sinh nhật", hint: "1 đơn trong tháng sinh nhật, thay cho mức VIP", suffix: "%" },
];

/** Cấu hình chương trình thành viên — database dùng đúng các số này khi đặt hàng / cộng điểm */
function LoyaltyForm({ initial }: { initial: LoyaltyConfig }) {
  const { toast } = useAdmin();
  const groups = useProductGroupOptions();
  const [draft, setDraft] = useState<Record<NumberKey, string> & { redeemGroupId: string }>(() => ({
    ...(Object.fromEntries(NUMBER_FIELDS.map((f) => [f.key, String(initial[f.key])])) as Record<NumberKey, string>),
    redeemGroupId: initial.redeemGroupId,
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const num = (key: NumberKey) => (draft[key].trim() === "" ? NaN : Number(draft[key]));
  const dirty = NUMBER_FIELDS.some((f) => num(f.key) !== initial[f.key]) || draft.redeemGroupId !== initial.redeemGroupId;

  const save = async () => {
    const bad = NUMBER_FIELDS.find((f) => !Number.isInteger(num(f.key)) || num(f.key) < 0);
    if (bad) return setError(`"${bad.label}" phải là số nguyên từ 0`);
    if (num("pointRateVnd") < 1) return setError("Tích điểm phải từ 1đ trở lên");
    if (num("vipCakeDiscountPercent") > 100 || num("birthdayCakeDiscountPercent") > 100) {
      return setError("Phần trăm giảm tối đa 100%");
    }
    if (num("loyalMinPoints") >= num("vipMinPoints")) return setError("Mốc VIP phải lớn hơn mốc Thân thiết");
    if (!draft.redeemGroupId) return setError("Vui lòng chọn nhóm sản phẩm được đổi điểm");
    setError("");
    setSaving(true);
    const config = {
      ...(Object.fromEntries(NUMBER_FIELDS.map((f) => [f.key, num(f.key)])) as Record<NumberKey, number>),
      redeemGroupId: draft.redeemGroupId,
    };
    const saveError = await saveLoyaltyConfig(config);
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return toast(saveError, "error");
    }
    toast("Đã lưu quy tắc chương trình thành viên");
  };

  return (
    <Card title="Quy tắc chương trình thành viên">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NUMBER_FIELDS.map((f) => (
          <Field key={f.key} label={`${f.label} (${f.suffix})`} hint={f.hint}>
            <input
              value={draft[f.key]}
              inputMode="numeric"
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value.replace(/[^\d]/g, "") }))}
              className={`${INPUT} ${error.includes(f.label) ? INPUT_INVALID : ""}`}
            />
          </Field>
        ))}
        <Field label="Nhóm được đổi điểm" hint="Khách dùng điểm đổi 1 món bất kỳ (cỡ nào cũng được) trong nhóm này">
          <select
            value={draft.redeemGroupId}
            onChange={(e) => setDraft((d) => ({ ...d, redeemGroupId: e.target.value }))}
            className={INPUT}
          >
            <option value="">— Chọn nhóm —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.category} · {g.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e3e3] pt-3">
        <p className={`text-[11px] ${error ? "font-bold text-rose-600" : dirty ? "font-bold text-amber-700" : "text-[#7a7a7a]"}`}>
          {error || (dirty ? "Bạn có thay đổi chưa lưu." : "Áp dụng ngay cho các đơn đặt sau khi lưu.")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() =>
              setDraft({
                ...(Object.fromEntries(NUMBER_FIELDS.map((f) => [f.key, String(initial[f.key])])) as Record<NumberKey, string>),
                redeemGroupId: initial.redeemGroupId,
              })
            }
          >
            Hoàn tác
          </button>
          <button type="button" className={`${BTN_SOLID} disabled:opacity-60`} onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu quy tắc"}
          </button>
        </div>
      </div>
    </Card>
  );
}
const PAGE_SIZE = 10;

// Tổng quan chương trình tích điểm — đọc từ cùng dữ liệu điểm với /admin/khach-hang
export default function AdminPointsPage() {
  const { query } = useAdmin();
  const logs = usePointLogs();
  const customers = useCustomers();
  const loyalty = useLoyaltyConfig();

  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const ranking = useMemo(
    () =>
      customers
        .map((c) => ({
          customer: c,
          points: pointBalance(logs, c.email),
          tier: tierFor(lifetimePoints(logs, c.email), loyalty).name,
        }))
        .sort((a, b) => b.points - a.points),
    [customers, logs, loyalty],
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
          value={`${loyalty.pointRateVnd.toLocaleString("vi-VN")}đ = 1`}
          hint="Chỉ cộng khi đơn chuyển sang “Đã giao”"
          icon={<Award className="h-5 w-5" />}
        />
      </div>

      <LoyaltyForm key={JSON.stringify(loyalty)} initial={loyalty} />

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
                  <div className="truncate text-[10px] text-[#9a9a9a]">
                    {r.tier} · {r.customer.email}
                  </div>
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
