"use client";

import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { matchesQuery, useAdmin } from "@/components/admin/AdminContext";
import { orderTone } from "@/components/admin/helpers";
import {
  BTN_ICON,
  BTN_OUTLINE,
  BTN_SOLID,
  Chip,
  ChipRow,
  ConfirmDialog,
  EmptyRow,
  Modal,
  Pagination,
  StatusPill,
  TABLE,
  TABLE_WRAP,
  TD,
  TH,
  Toolbar,
} from "@/components/admin/ui";
import { pointsForOrder, setOrderStatus, useOrders } from "@/lib/db";
import { FULFILLMENT_LABELS, PAYMENT_LABELS } from "@/lib/orders";
import { formatDateVN, formatVND } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

type Filter = "all" | OrderStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "Chờ xử lý", label: "Chờ xử lý" },
  { key: "Đã giao", label: "Đã giao" },
  { key: "Đã hủy", label: "Đã hủy" },
];
const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const { query, toast } = useAdmin();
  const orders = useOrders();

  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ order: Order; next: "Đã giao" | "Đã hủy" } | null>(null);

  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const filtered = sorted.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      matchesQuery(query, o.id, o.customerName, o.customerPhone, o.customerEmail),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const detail = orders.find((o) => o.id === detailId) ?? null;

  const applyStatus = async (order: Order, next: "Đã giao" | "Đã hủy") => {
    const res = await setOrderStatus(order.id, next);
    if (!res.ok) {
      toast(res.error, "error");
      return;
    }
    if (next === "Đã giao") {
      toast(
        res.pointsAwarded > 0
          ? `Đơn ${order.id} đã giao — đã cộng ${res.pointsAwarded.toLocaleString("vi-VN")} điểm cho ${order.customerName ?? "khách"}`
          : `Đơn ${order.id} đã giao`,
      );
    } else {
      toast(`Đã hủy đơn ${order.id} (không cộng điểm)`);
    }
  };

  const actionButtons = (o: Order) =>
    o.status === "Chờ xử lý" ? (
      <div className="flex gap-1.5">
        <button type="button" className={`${BTN_SOLID} !px-2.5 !py-1 !text-[10px]`} onClick={() => setConfirm({ order: o, next: "Đã giao" })}>
          <Check className="h-3 w-3" />
          Đã giao
        </button>
        <button type="button" className={`${BTN_OUTLINE} !px-2.5 !py-1 !text-[10px]`} onClick={() => setConfirm({ order: o, next: "Đã hủy" })}>
          <X className="h-3 w-3" />
          Hủy
        </button>
      </div>
    ) : (
      <span className="text-[11px] text-[#9a9a9a]">Đã kết thúc</span>
    );

  return (
    <div>
      <Toolbar>
        <ChipRow>
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              active={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              count={f.key === "all" ? orders.length : orders.filter((o) => o.status === f.key).length}
            >
              {f.label}
            </Chip>
          ))}
        </ChipRow>
        <p className="text-[11px] text-[#7a7a7a]">
          Luồng: Chờ xử lý → Đã giao (cộng điểm cho khách) hoặc → Đã hủy.
        </p>
      </Toolbar>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>Mã đơn</th>
              <th className={TH}>Khách hàng</th>
              <th className={TH}>Tổng tiền</th>
              <th className={TH}>Ngày đặt</th>
              <th className={TH}>Trạng thái</th>
              <th className={TH}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <EmptyRow colSpan={6}>Không có đơn hàng nào phù hợp.</EmptyRow>}
            {visible.map((o) => (
              <tr key={o.id}>
                <td className={`${TD} font-bold text-[#2b2b2b]`}>{o.id}</td>
                <td className={TD}>
                  <div className="font-semibold text-[#2b2b2b]">{o.customerName ?? "—"}</div>
                  <div className="text-[10px] text-[#9a9a9a]">{o.customerPhone ?? o.customerEmail}</div>
                </td>
                <td className={`${TD} whitespace-nowrap font-semibold text-[#2b2b2b]`}>{formatVND(o.total)}</td>
                <td className={`${TD} whitespace-nowrap`}>{formatDateVN(o.createdAt)}</td>
                <td className={TD}>
                  <StatusPill tone={orderTone(o.status)}>{o.status}</StatusPill>
                </td>
                <td className={TD}>
                  <div className="flex items-center gap-2">
                    <button type="button" className={BTN_ICON} aria-label={`Xem chi tiết đơn ${o.id}`} onClick={() => setDetailId(o.id)}>
                      <Eye className="h-3 w-3" />
                    </button>
                    {actionButtons(o)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pages={pages} onChange={setPage} />

      {/* Chi tiết đơn */}
      <Modal
        open={detail !== null}
        onClose={() => setDetailId(null)}
        title={detail ? `Đơn hàng ${detail.id}` : ""}
        footer={
          detail?.status === "Chờ xử lý" ? (
            <>
              <button type="button" className={BTN_OUTLINE} onClick={() => setConfirm({ order: detail, next: "Đã hủy" })}>
                Hủy đơn
              </button>
              <button type="button" className={BTN_SOLID} onClick={() => setConfirm({ order: detail, next: "Đã giao" })}>
                Đánh dấu đã giao
              </button>
            </>
          ) : (
            <button type="button" className={BTN_OUTLINE} onClick={() => setDetailId(null)}>
              Đóng
            </button>
          )
        }
      >
        {detail && (
          <div className="space-y-4 text-[12px] text-[#5b5b5b]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-[#2b2b2b]">{detail.customerName ?? "Khách"}</div>
                <div>
                  {detail.customerPhone} {detail.customerEmail && `• ${detail.customerEmail}`}
                </div>
              </div>
              <StatusPill tone={orderTone(detail.status)}>{detail.status}</StatusPill>
            </div>

            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>Sản phẩm</th>
                  <th className={`${TH} text-right`}>SL</th>
                  <th className={`${TH} text-right`}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((item, i) => (
                  <tr key={i}>
                    <td className={TD}>
                      {item.name}
                      {item.size ? ` (${item.size})` : ""}
                    </td>
                    <td className={`${TD} text-right`}>{item.quantity}</td>
                    <td className={`${TD} text-right`}>{formatVND(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 border-t border-[#e3e3e3] pt-3">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatVND(detail.subtotal)}</span>
              </div>
              {detail.voucherCode && detail.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Voucher {detail.voucherCode}</span>
                  <span>-{formatVND(detail.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#2b2b2b]">
                <span>Tổng tiền</span>
                <span>{formatVND(detail.total)}</span>
              </div>
              {detail.status === "Chờ xử lý" && (
                <div className="text-[11px] text-[#7a7a7a]">
                  Khi đánh dấu “Đã giao”, khách được cộng {pointsForOrder(detail.total).toLocaleString("vi-VN")} điểm.
                </div>
              )}
            </div>

            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 border-t border-[#e3e3e3] pt-3">
              <dt>Ngày đặt</dt>
              <dd className="font-semibold text-[#2b2b2b]">{formatDateVN(detail.createdAt)}</dd>
              <dt>Hình thức nhận</dt>
              <dd className="font-semibold text-[#2b2b2b]">{FULFILLMENT_LABELS[detail.fulfillment]}</dd>
              {detail.address && (
                <>
                  <dt>Địa chỉ</dt>
                  <dd className="font-semibold text-[#2b2b2b]">{detail.address}</dd>
                </>
              )}
              <dt>Ngày giờ nhận</dt>
              <dd className="font-semibold text-[#2b2b2b]">
                {detail.receiveTime} - {formatDateVN(detail.receiveDate)}
              </dd>
              <dt>Thanh toán</dt>
              <dd className="font-semibold text-[#2b2b2b]">{PAYMENT_LABELS[detail.paymentMethod]}</dd>
              {detail.note && (
                <>
                  <dt>Ghi chú</dt>
                  <dd className="text-[#2b2b2b]">{detail.note}</dd>
                </>
              )}
            </dl>
          </div>
        )}
      </Modal>

      {/* Xác nhận đổi trạng thái */}
      <ConfirmDialog
        open={confirm !== null}
        danger={confirm?.next === "Đã hủy"}
        title={confirm?.next === "Đã giao" ? "Đánh dấu đơn đã giao" : "Hủy đơn hàng"}
        confirmLabel={confirm?.next === "Đã giao" ? "Xác nhận đã giao" : "Hủy đơn"}
        message={
          confirm && (
            <>
              {confirm.next === "Đã giao" ? (
                <>
                  Đơn <strong>{confirm.order.id}</strong> ({formatVND(confirm.order.total)}) đã giao thành công? Khách{" "}
                  <strong>{confirm.order.customerName ?? "—"}</strong> sẽ được cộng{" "}
                  <strong>{pointsForOrder(confirm.order.total).toLocaleString("vi-VN")} điểm</strong> (1.000đ = 1 điểm).
                </>
              ) : (
                <>
                  Hủy đơn <strong>{confirm.order.id}</strong>? Đơn bị hủy sẽ <strong>không</strong> được cộng điểm và
                  không thể chuyển lại trạng thái khác.
                </>
              )}
            </>
          )
        }
        onConfirm={() => confirm && applyStatus(confirm.order, confirm.next)}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
