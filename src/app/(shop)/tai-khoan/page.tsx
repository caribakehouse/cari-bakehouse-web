"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Cake, LogOut, Mail, Phone, Receipt, User } from "lucide-react";
import PointCard from "@/components/account/PointCard";
import { PageSpinner, SignedOutNotice } from "@/components/account/PageSpinner";
import { logout, saveBirthday, useRequireAuth } from "@/lib/auth";
import { useMembership } from "@/lib/db";
import { useMyOrders } from "@/lib/orders";
import { formatDateVN, formatVND } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

/** Ô ngày sinh: đã lưu thì chỉ hiển thị; chưa có thì cho nhập 1 lần */
function BirthdayField({ birthday }: { birthday?: string }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (birthday) return <>{formatDateVN(birthday)}</>;

  const save = async () => {
    if (!value) return setError("Vui lòng chọn ngày sinh");
    if (value > new Date().toISOString().slice(0, 10)) return setError("Ngày sinh chưa hợp lệ");
    if (!window.confirm(`Lưu ngày sinh ${formatDateVN(value)}? Sau khi lưu, muốn sửa bạn cần nhắn tiệm.`)) return;
    setSaving(true);
    const saveError = await saveBirthday(value);
    setSaving(false);
    if (saveError) setError(saveError);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          aria-label="Ngày sinh"
          className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm font-normal"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="cursor-pointer rounded-full bg-[#1B4B5A] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#123640] disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
      <p className="text-[11px] font-normal text-text-muted">
        {error ? <span className="text-rose-600">{error}</span> : "Chỉ lưu được 1 lần — VIP nhận ưu đãi trong tháng sinh nhật."}
      </p>
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  "Chờ xử lý": "bg-amber-50 text-amber-800 border-amber-200",
  "Đã giao": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Đã hủy": "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AccountPage() {
  const router = useRouter();
  // Chỉ vào được khi đã đăng nhập
  const { status, user } = useRequireAuth("/tai-khoan");
  const orders = useMyOrders(user?.email);
  const membership = useMembership(user?.email);

  if (status === "signed-out") return <SignedOutNotice />;
  if (!user) return <PageSpinner />;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const infoRows = [
    { icon: User, label: "Họ và tên", value: user.fullName },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Số điện thoại", value: user.phone || "Chưa cập nhật" },
    { icon: Cake, label: "Ngày sinh", value: <BirthdayField birthday={user.birthday} /> },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FFF8EF]">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Tiêu đề + Đăng xuất */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-black text-[#1B4B5A] sm:text-3xl">
              Tài khoản của tôi
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Xin chào, <strong className="text-[#1B4B5A]">{user.fullName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#1B4B5A] px-5 py-2 text-sm font-semibold text-[#1B4B5A] transition-all hover:bg-[#1B4B5A] hover:text-white active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>

        {/* Thông tin cá nhân */}
        {/* Thông tin tài khoản (Supabase Auth + bảng profiles) */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-[#1B4B5A] sm:text-2xl">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/80 bg-white p-5 shadow-xs sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE9C6] text-[#1B4B5A]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {label}
                  </div>
                  <div className="mt-0.5 break-words text-sm font-semibold text-[#2b2b2b]">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Thẻ điểm */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-[#1B4B5A] sm:text-2xl">
              <Award className="h-6 w-6" />
              Thẻ điểm của tôi
            </h2>
            <Link
              href="/tich-diem"
              className="text-xs font-semibold text-[#1B4B5A] underline-offset-4 hover:underline"
            >
              Xem chương trình tích điểm
            </Link>
          </div>
          {/* Điểm khả dụng + hạng (theo tổng điểm đã tích) — quy tắc admin chỉnh ở /admin/tich-diem */}
          <PointCard
            data={{
              currentPoints: membership.balance,
              tier: membership.tier.name,
              nextTier: membership.tier.nextTier,
              pointsNeeded: membership.tier.pointsNeeded,
              progressPercentage: membership.tier.progressPercentage,
            }}
          />
        </section>

        {/* Lịch sử đơn hàng */}
        {/* Đơn hàng của khách (database chỉ trả về đơn của chính tài khoản này) */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-[#1B4B5A] sm:text-2xl">
            <Receipt className="h-5 w-5" />
            Lịch sử đơn hàng
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-[#FCE9C6]/50 font-bold text-[#1B4B5A]">
                    <th className="px-4 py-3.5 sm:px-6">Mã đơn</th>
                    <th className="px-4 py-3.5 sm:px-6">Ngày đặt</th>
                    <th className="px-4 py-3.5 text-right sm:px-6">Tổng tiền</th>
                    <th className="px-4 py-3.5 text-center sm:px-6">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-[#2b2b2b]">
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-sm text-text-muted">
                        Bạn chưa có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-[#FFF8EF]/50">
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-[#1B4B5A] sm:px-6">
                        {order.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-text-muted sm:px-6">
                        {formatDateVN(order.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold sm:px-6">
                        {formatVND(order.total)}
                      </td>
                      <td className="px-4 py-3.5 text-center sm:px-6">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
