"use client";

import { useState } from "react";
import { Check, Eye } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { matchesQuery, useAdmin } from "@/components/admin/AdminContext";
import { requestTone } from "@/components/admin/helpers";
import {
  BTN_ICON,
  BTN_OUTLINE,
  BTN_SOLID,
  Chip,
  ChipRow,
  ConfirmDialog,
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
  Toolbar,
} from "@/components/admin/ui";
import { updateCustomRequest, useCustomRequests } from "@/lib/db";
import { formatDateVN, formatVND } from "@/lib/utils";
import { CUSTOM_ORDER_STEPS, type CustomOrderRequest, type CustomOrderStatus } from "@/types/custom-order";

type Filter = "all" | CustomOrderStatus;
const FILTERS: Filter[] = ["all", ...CUSTOM_ORDER_STEPS, "Đã hủy"];
const PAGE_SIZE = 10;

const nextStepOf = (status: CustomOrderStatus): CustomOrderStatus | null => {
  const i = (CUSTOM_ORDER_STEPS as readonly string[]).indexOf(status);
  return i >= 0 && i < CUSTOM_ORDER_STEPS.length - 1 ? CUSTOM_ORDER_STEPS[i + 1] : null;
};

function RequestDetail({ request }: { request: CustomOrderRequest }) {
  const { toast } = useAdmin();
  const [quote, setQuote] = useState(request.quotedPrice ? String(request.quotedPrice) : "");
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const next = nextStepOf(request.status);
  const isFinal = request.status === "Hoàn tất" || request.status === "Đã hủy";
  const stepIndex = (CUSTOM_ORDER_STEPS as readonly string[]).indexOf(request.status);
  const quoteNumber = quote.trim() === "" ? undefined : Number(quote);

  const saveQuote = async (silent = false): Promise<boolean> => {
    if (quoteNumber === undefined || !Number.isFinite(quoteNumber) || quoteNumber <= 0) {
      setError("Vui lòng nhập giá đã báo lớn hơn 0");
      return false;
    }
    setError("");
    const saveError = await updateCustomRequest(request.id, { quotedPrice: quoteNumber });
    if (saveError) {
      toast(saveError, "error");
      return false;
    }
    if (!silent) toast(`Đã lưu giá báo ${formatVND(quoteNumber)}`);
    return true;
  };

  const advance = async () => {
    if (!next) return;
    // Bước "Đã báo giá" bắt buộc có giá đã báo
    if (next === "Đã báo giá" && !(await saveQuote(true))) return;
    const saveError = await updateCustomRequest(request.id, { status: next });
    if (saveError) return toast(saveError, "error");
    toast(`Yêu cầu ${request.id} → ${next}`);
  };

  const rows: [string, string][] = [
    ["Khách hàng", request.customerName],
    ["SĐT / Zalo", request.phone],
    ["Dịp đặt bánh", request.occasion || "—"],
    ["Ngày cần nhận", formatDateVN(request.deliveryDate)],
    ["Kích thước / số khách", request.sizeGuestCount || "—"],
    ["Vị bánh mong muốn", request.flavor || "—"],
    ["Ngân sách dự kiến", request.budget || "—"],
    ["Ngày gửi yêu cầu", formatDateVN(request.createdAt)],
  ];

  return (
    <div className="space-y-4 text-[12px] text-[#5b5b5b]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-base font-bold text-[#2b2b2b]">{request.id}</div>
        <StatusPill tone={requestTone(request.status)}>{request.status}</StatusPill>
      </div>

      {/* Thanh tiến trình các bước */}
      <ol className="flex flex-wrap gap-1.5" aria-label="Các bước xử lý">
        {CUSTOM_ORDER_STEPS.map((s, i) => {
          const done = request.status !== "Đã hủy" && i <= stepIndex;
          return (
            <li
              key={s}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                done ? "border-[#2b2b2b] bg-[#2b2b2b] text-white" : "border-[#c9c9c9] bg-white text-[#9a9a9a]"
              }`}
            >
              {done && <Check className="h-3 w-3" />}
              {s}
            </li>
          );
        })}
      </ol>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] font-bold uppercase text-[#9a9a9a]">{k}</dt>
            <dd className="font-semibold text-[#2b2b2b]">{v}</dd>
          </div>
        ))}
      </dl>

      <div>
        <div className="text-[10px] font-bold uppercase text-[#9a9a9a]">Ghi chú của khách</div>
        <p className="mt-1 whitespace-pre-wrap rounded-md border border-[#e3e3e3] bg-[#fafafa] p-3 text-[#2b2b2b]">
          {request.notes || "Không có ghi chú."}
        </p>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase text-[#9a9a9a]">Ảnh tham khảo</div>
        {request.referenceImage ? (
          <div className="relative mt-1 h-48 w-full max-w-xs overflow-hidden rounded-md border border-[#d6d6d6] bg-[#e8e8e8]">
            <SafeImage src={request.referenceImage} alt="Ảnh tham khảo của khách" fill sizes="320px" className="object-contain" />
          </div>
        ) : (
          <p className="mt-1 text-[#9a9a9a]">Khách không đính kèm ảnh.</p>
        )}
      </div>

      {/* Giá đã báo */}
      <div className="space-y-2 rounded-lg border border-[#d6d6d6] bg-[#fafafa] p-3">
        <Field label="Giá đã báo cho khách (đ)" error={error} hint={request.quotedPrice ? `Đang lưu: ${formatVND(request.quotedPrice)}` : "Cần nhập trước khi chuyển sang “Đã báo giá”"}>
          <div className="flex gap-2">
            <input
              value={quote}
              inputMode="numeric"
              disabled={request.status === "Đã hủy"}
              onChange={(e) => setQuote(e.target.value.replace(/[^\d]/g, ""))}
              className={INPUT}
              placeholder="1300000"
            />
            <button type="button" className={BTN_OUTLINE} disabled={request.status === "Đã hủy"} onClick={() => saveQuote()}>
              Lưu giá
            </button>
          </div>
        </Field>
      </div>

      {/* Đổi trạng thái */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e3e3e3] pt-3">
        {isFinal ? (
          <span className="text-[11px] text-[#7a7a7a]">Yêu cầu đã kết thúc ({request.status}).</span>
        ) : (
          <>
            <button type="button" className={BTN_OUTLINE} onClick={() => setCancelOpen(true)}>
              Hủy yêu cầu
            </button>
            {next && (
              <button type="button" className={BTN_SOLID} onClick={advance}>
                Chuyển sang: {next}
              </button>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        danger
        title="Hủy yêu cầu"
        confirmLabel="Hủy yêu cầu"
        message={
          <>
            Hủy yêu cầu <strong>{request.id}</strong> của {request.customerName}? Không thể chuyển lại trạng thái khác.
          </>
        }
        onConfirm={async () => {
          const saveError = await updateCustomRequest(request.id, { status: "Đã hủy" });
          if (saveError) return toast(saveError, "error");
          toast(`Đã hủy yêu cầu ${request.id}`);
        }}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  );
}

export default function AdminCustomRequestsPage() {
  const { query } = useAdmin();
  const requests = useCustomRequests();

  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const sorted = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  const filtered = sorted.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      matchesQuery(query, r.id, r.customerName, r.phone, r.occasion, r.flavor, r.notes),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const detail = requests.find((r) => r.id === detailId) ?? null;

  return (
    <div>
      <Toolbar>
        <ChipRow>
          {FILTERS.map((f) => (
            <Chip
              key={f}
              active={filter === f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              count={f === "all" ? requests.length : requests.filter((r) => r.status === f).length}
            >
              {f === "all" ? "Tất cả" : f}
            </Chip>
          ))}
        </ChipRow>
        <p className="text-[11px] text-[#7a7a7a]">Yêu cầu gửi từ form trên trang /dat-theo-yeu-cau xuất hiện ở đây với trạng thái “Mới”.</p>
      </Toolbar>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>Mã</th>
              <th className={TH}>Khách hàng</th>
              <th className={TH}>Dịp</th>
              <th className={TH}>Ngày cần</th>
              <th className={TH}>Giá đã báo</th>
              <th className={TH}>Trạng thái</th>
              <th className={TH}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <EmptyRow colSpan={7}>Không có yêu cầu nào phù hợp.</EmptyRow>}
            {visible.map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-[#fbf6e6]" onClick={() => setDetailId(r.id)}>
                <td className={`${TD} font-bold text-[#2b2b2b]`}>{r.id}</td>
                <td className={TD}>
                  <div className="font-semibold text-[#2b2b2b]">{r.customerName}</div>
                  <div className="text-[10px] text-[#9a9a9a]">{r.phone}</div>
                </td>
                <td className={TD}>{r.occasion || "—"}</td>
                <td className={`${TD} whitespace-nowrap`}>{formatDateVN(r.deliveryDate)}</td>
                <td className={`${TD} whitespace-nowrap`}>{r.quotedPrice ? formatVND(r.quotedPrice) : "—"}</td>
                <td className={TD}>
                  <StatusPill tone={requestTone(r.status)}>{r.status}</StatusPill>
                </td>
                <td className={TD}>
                  <button
                    type="button"
                    className={BTN_ICON}
                    aria-label={`Xem chi tiết yêu cầu ${r.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailId(r.id);
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

      <Modal open={detail !== null} onClose={() => setDetailId(null)} title="Chi tiết yêu cầu bánh theo yêu cầu" size="lg">
        {detail && <RequestDetail key={detail.id} request={detail} />}
      </Modal>
    </div>
  );
}
