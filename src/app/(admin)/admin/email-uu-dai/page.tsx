"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { matchesQuery, useAdmin } from "@/components/admin/AdminContext";
import {
  BTN_ICON,
  BTN_OUTLINE,
  ConfirmDialog,
  EmptyRow,
  Pagination,
  TABLE,
  TABLE_WRAP,
  TD,
  TH,
  Toolbar,
} from "@/components/admin/ui";
import { deleteNewsletterSubscriber, useNewsletterSubscribers } from "@/lib/db";

const PAGE_SIZE = 20;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });

export default function AdminNewsletterPage() {
  const { query, toast } = useAdmin();
  const subscribers = useNewsletterSubscribers();

  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<string | null>(null);

  const filtered = subscribers.filter((s) => matchesQuery(query, s.email));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(filtered.map((s) => s.email).join("\n"));
      toast(`Đã sao chép ${filtered.length} email`);
    } catch {
      toast("Trình duyệt không cho sao chép — hãy thử lại", "error");
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    const error = await deleteNewsletterSubscriber(removing);
    if (error) toast(error, "error");
    else toast(`Đã xóa ${removing}`);
    setRemoving(null);
  };

  return (
    <div>
      <Toolbar>
        <p className="text-[11px] text-[#7a7a7a]">
          Email khách để lại ở ô “Nhận ưu đãi ngọt ngào” cuối trang web · {subscribers.length} email
        </p>
        <button type="button" className={BTN_OUTLINE} onClick={copyAll} disabled={filtered.length === 0}>
          <Copy className="h-3.5 w-3.5" />
          Sao chép tất cả email
        </button>
      </Toolbar>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>Email</th>
              <th className={TH}>Ngày đăng ký</th>
              <th className={TH}>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <EmptyRow colSpan={3}>Chưa có email nào.</EmptyRow>}
            {visible.map((s) => (
              <tr key={s.email}>
                <td className={`${TD} font-semibold text-[#2b2b2b]`}>{s.email}</td>
                <td className={`${TD} whitespace-nowrap`}>{formatDateTime(s.createdAt)}</td>
                <td className={TD}>
                  <button
                    type="button"
                    className={BTN_ICON}
                    aria-label={`Xóa ${s.email}`}
                    onClick={() => setRemoving(s.email)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pages={pages} onChange={setPage} />

      <ConfirmDialog
        open={removing !== null}
        title="Xóa email"
        message={<>Xóa <strong>{removing}</strong> khỏi danh sách nhận ưu đãi?</>}
        confirmLabel="Xóa"
        danger
        onConfirm={confirmRemove}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
