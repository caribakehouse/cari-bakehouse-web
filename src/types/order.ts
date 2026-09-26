/** Luồng đơn hàng: Chờ xử lý → Đã giao, hoặc → Đã hủy */
export type OrderStatus = "Chờ xử lý" | "Đã giao" | "Đã hủy";

export type FulfillmentMethod = "delivery" | "pickup";
export type PaymentMethod = "cod" | "bank";

/** Tùy chọn khách đã chọn cho một món trong đơn, vd { group: "Sốt đi kèm", choice: "Caramel muối", price: 6000 } */
export interface OrderItemOption {
  group: string;
  choice: string;
  /** Phụ thu (đồng) */
  price: number;
}

export interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  /** Đơn giá đã gồm phụ thu tùy chọn */
  price: number;
  options?: OrderItemOption[];
}

export interface Order {
  /** Dạng #CB1234 */
  id: string;
  /** Ngày đặt, định dạng yyyy-mm-dd (giờ địa phương) */
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  voucherCode?: string;
  discount: number;
  total: number;
  status: OrderStatus;
  fulfillment: FulfillmentMethod;
  address?: string;
  /** Ngày nhận yyyy-mm-dd */
  receiveDate: string;
  /** Giờ nhận HH:mm */
  receiveTime: string;
  note?: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  /** Khóa liên kết với khách hàng */
  customerEmail?: string;
  /** Chi tiết từng khoản giảm (đổi điểm, ưu đãi VIP, sinh nhật, voucher); discount = tổng các khoản */
  discountDetails?: OrderDiscount[];
  /** Số điểm khách đã đổi trong đơn này (hoàn lại nếu đơn bị hủy) */
  pointsRedeemed?: number;
}

export interface OrderDiscount {
  label: string;
  amount: number;
}

export interface Voucher {
  code: string;
  /** Số tiền giảm (đồng) */
  discount: number;
}
