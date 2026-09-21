"use client";

import { useMemo, useState } from "react";
import { Eye, MinusCircle, PlusCircle } from "lucide-react";
import { matchesQuery, useAdmin } from "@/components/admin/AdminContext";
import { orderTone } from "@/components/admin/helpers";
import {
  BTN_ICON,
  BTN_SOLID,
  EmptyRow,
  Field,
  INPUT,
  Modal,
  Pagination,
  StatusPill,
  TABLE,
  TABLE_WRAP,
  TD,
  TH,
} from "@/components/admin/ui";
import { adjustPoints, pointBalance, pointHistory, useCustomers, useOrders, usePointLogs } from "@/lib/db";
import { formatDateVN, formatVND } from "@/lib/utils";
import type { Customer } from "@/types/user";

const PAGE_SIZE = 10;
const sameEmail = (a: string | undefined, b: string) => (a ?? "").trim().toLowerCase() === b.trim().toLowerCase();

function CustomerDetail({ customer }: { customer: Customer }) {
  const { toast } = useAdmin();
  const allOrders = useOrders();
  const logs = usePointLogs();

  const [tab, setTab] = useState<"orders" | "points">("orders");
  const [sign, setSign] = useState<1 | -1>(1);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const orders = useMemo(
    () =>
      allOrders
        .filter((o) => sameEmail(o.customerEmail, customer.email))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allOrders, customer.email],
  );

  const balance = pointBalance(logs, customer.email);

  // Lịch sử điểm kèm số dư sau mỗi lần thay đổi (mới nhất trước)
  const history = useMemo(() => pointHistory(logs, customer.email), [logs, customer.email]);

  const submit = () => {
    const n = Number(amount);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Số điểm phải là số nguyên lớn hơn 0");
      return;
    }
    const res = adjustPoints(customer.email, sign * n, reason);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError("");
    toast(`Đã ${sign > 0 ? "cộng" : "trừ"} ${n.toLocaleString("vi-VN")} điểm ${sign > 0 ? "cho" : "của"} ${customer.fullName}`);
    setAmount("");
    setReason("");
    setTab("points");
  };

  const tabBtn = (key: "orders" | "points", label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      aria-pressed={tab === key}
      className={`cursor-pointer border-b-2 px-3 py-2 text-xs font-bold ${
        tab === key ? "border-[#2b2b2b] text-[#2b2b2b]" : "border-transparent text-[#7a7a7a] hover:text-[#2b2b2b]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4 text-[12px] text-[#5b5b5b]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-bold text-[#2b2b2b]">{customer.fullName}</div>
          <div>{customer.email}</div>
          <div>{customer.phone || "Chưa có số điện thoại"}</div>
          <div className="text-[11px] text-[#9a9a9a]">Tạo tài khoản: {formatDateVN(customer.createdAt)}</div>
        </div>
        <div className="rounded-lg bg-[#f0e6c8] px-4 py-2 text-center">
          <div className="text-[10px] font-bold uppercase text-[#7a7a7a]">Điểm hiện có</div>
          <div className="font-heading text-2xl font-black text-[#2b2b2b]">{balance.toLocaleString("vi-VN")}</div>
        </div>
      </div>

      {/* Cộng / trừ điểm thủ công */}
      <div className="space-y-3 rounded-lg border border-[#d6d6d6] bg-[#fafafa] p-3">
        <div className="text-[11px] font-bold text-[#2b2b2b]">Cộng / trừ điểm thủ công</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSign(1)}
            aria-pressed={sign === 1}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold ${
              sign === 1 ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#9a9a9a] bg-white text-[#5b5b5b]"
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Cộng điểm
          </button>
          <button
            type="button"
            onClick={() => setSign(-1)}
            aria-pressed={sign === -1}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold ${
              sign === -1 ? "border-rose-600 bg-rose-600 text-white" : "border-[#9a9a9a] bg-white text-[#5b5b5b]"
            }`}
          >
            <MinusCircle className="h-3.5 w-3.5" />
            Trừ điểm
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
          <Field label="Số điểm">
            <input
              value={amount}
              inputMode="numeric"
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              className={INPUT}
              placeholder="100"
            />
          </Field>
          <Field label="Lý do" required>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={INPUT}
              placeholder="Ví dụ: Tặng điểm sinh nhật"
            />
          </Field>
          <button type="button" className={`${BTN_SOLID} sm:mb-[1px]`} onClick={submit}>
            Áp dụng
          </button>
        </div>
        {error && <p className="text-[11px] text-rose-600">{error}</p>}
      </div>

      <div>
        <div className="flex border-b border-[#e3e3e3]">
          {tabBtn("orders", `Lịch sử đơn (${orders.length})`)}
          {tabBtn("points", `Lịch sử điểm (${history.length})`)}
        </div>

        {tab === "orders" ? (
          <div className={`${TABLE_WRAP} mt-3`}>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>Mã đơn</th>
                  <th className={TH}>Ngày đặt</th>
                  <th className={`${TH} text-right`}>Tổng tiền</th>
                  <th className={TH}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && <EmptyRow colSpan={4}>Khách chưa có đơn hàng.</EmptyRow>}
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className={`${TD} font-bold text-[#2b2b2b]`}>{o.id}</td>
                    <td className={TD}>{formatDateVN(o.createdAt)}</td>
                    <td className={`${TD} text-right font-semibold text-[#2b2b2b]`}>{formatVND(o.total)}</td>
                    <td className={TD}>
                      <StatusPill tone={orderTone(o.status)}>{o.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`${TABLE_WRAP} mt-3`}>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>Ngày</th>
                  <th className={TH}>Nội dung</th>
                  <th className={`${TH} text-right`}>Điểm</th>
                  <th className={`${TH} text-right`}>Số dư</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && <EmptyRow colSpan={4}>Chưa có lịch sử điểm.</EmptyRow>}
                {history.map((l) => (
                  <tr key={l.id}>
                    <td className={`${TD} whitespace-nowrap`}>{formatDateVN(l.date)}</td>
                    <td className={TD}>
                      <div className="font-semibold text-[#2b2b2b]">{l.title}</div>
                      {l.reason && <div className="text-[11px]">Lý do: {l.reason}</div>}
                    </td>
                    <td className={`${TD} text-right font-bold ${l.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {l.points > 0 ? "+" : ""}
                      {l.points.toLocaleString("vi-VN")}
                    </td>
                    <td className={`${TD} text-right`}>{l.balance.toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const { query } = useAdmin();
  const customers = useCustomers();
  const logs = usePointLogs();

  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = customers.filter((c) => matchesQuery(query, c.fullName, c.email, c.phone, c.id));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const detail = customers.find((c) => c.id === detailId) ?? null;

  return (
    <div>
      <div className="mb-4 text-[11px] text-[#7a7a7a]">
        {customers.length} khách hàng. Bấm vào một dòng để xem lịch sử đơn, lịch sử điểm và cộng/trừ điểm.
      </div>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>Họ và tên</th>
              <th className={TH}>Email</th>
              <th className={TH}>Số điện thoại</th>
              <th className={`${TH} text-right`}>Điểm hiện có</th>
              <th className={TH}>Ngày tạo tài khoản</th>
              <th className={TH}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <EmptyRow colSpan={6}>Không có khách hàng nào phù hợp.</EmptyRow>}
            {visible.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-[#fbf6e6]" onClick={() => setDetailId(c.id)}>
                <td className={`${TD} font-semibold text-[#2b2b2b]`}>{c.fullName}</td>
                <td className={TD}>{c.email}</td>
                <td className={`${TD} whitespace-nowrap`}>{c.phone || "—"}</td>
                <td className={`${TD} text-right font-bold text-[#2b2b2b]`}>{pointBalance(logs, c.email).toLocaleString("vi-VN")}</td>
                <td className={`${TD} whitespace-nowrap`}>{formatDateVN(c.createdAt)}</td>
                <td className={TD}>
                  <button
                    type="button"
                    className={BTN_ICON}
                    aria-label={`Xem chi tiết ${c.fullName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailId(c.id);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pages={pages} onChange={setPage} />

      <Modal open={detail !== null} onClose={() => setDetailId(null)} title="Chi tiết khách hàng" size="lg">
        {detail && <CustomerDetail key={detail.id} customer={detail} />}
      </Modal>
    </div>
  );
}
