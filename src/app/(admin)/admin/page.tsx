"use client";

import Link from "next/link";
import { Cake, ClipboardList, ShoppingBag, Users } from "lucide-react";
import { orderTone } from "@/components/admin/helpers";
import { Card, EmptyRow, StatCard, StatusPill, TABLE, TABLE_WRAP, TD, TH } from "@/components/admin/ui";
import { useCustomRequests, useCustomers, useOrders } from "@/lib/db";
import { formatDateVN, formatVND, todayISO } from "@/lib/utils";

// Dashboard: số liệu tính trực tiếp từ dữ liệu mẫu dùng chung (src/lib/mock-data.ts qua src/lib/db.ts)
export default function AdminDashboardPage() {
  const orders = useOrders();
  const requests = useCustomRequests();
  const customers = useCustomers();

  const today = todayISO();
  const ordersToday = orders.filter((o) => o.createdAt === today).length;
  const pendingOrders = orders.filter((o) => o.status === "Chờ xử lý").length;
  const newRequests = requests.filter((r) => r.status === "Mới").length;

  // 5 đơn gần nhất (đơn mới đặt cùng ngày nằm trước)
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đơn hôm nay" value={ordersToday} hint={formatDateVN(today)} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard
          label="Đơn chờ xử lý"
          value={pendingOrders}
          hint="Cần xác nhận hoặc giao"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Yêu cầu bánh theo yêu cầu mới"
          value={newRequests}
          hint="Chưa được tư vấn"
          icon={<Cake className="h-5 w-5" />}
        />
        <StatCard label="Tổng khách hàng" value={customers.length} icon={<Users className="h-5 w-5" />} />
      </div>

      <Card
        title="5 đơn gần nhất"
        action={
          <Link href="/admin/don-hang" className="text-[11px] font-bold text-[#2b2b2b] underline-offset-4 hover:underline">
            Xem tất cả đơn →
          </Link>
        }
        className="[&>div:last-child]:p-0"
      >
        <div className={TABLE_WRAP + " rounded-none border-0"}>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Mã đơn</th>
                <th className={TH}>Khách hàng</th>
                <th className={TH}>Tổng tiền</th>
                <th className={TH}>Ngày đặt</th>
                <th className={TH}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && <EmptyRow colSpan={5}>Chưa có đơn hàng nào.</EmptyRow>}
              {recent.map((o) => (
                <tr key={o.id}>
                  <td className={TD}>
                    <Link href="/admin/don-hang" className="font-bold text-[#2b2b2b] hover:underline">
                      {o.id}
                    </Link>
                  </td>
                  <td className={TD}>{o.customerName ?? o.customerEmail ?? "—"}</td>
                  <td className={TD + " font-semibold text-[#2b2b2b]"}>{formatVND(o.total)}</td>
                  <td className={TD}>{formatDateVN(o.createdAt)}</td>
                  <td className={TD}>
                    <StatusPill tone={orderTone(o.status)}>{o.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
