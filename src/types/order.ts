/** Luồng đơn hàng: Chờ xử lý → Đã giao, hoặc → Đã hủy */
export type OrderStatus = "Chờ xử lý" | "Đã giao" | "Đã hủy";

export type FulfillmentMethod = "delivery" | "pickup";
export type PaymentMethod = "cod" | "bank";

export interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
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
}

export interface Voucher {
  code: string;
  /** Số tiền giảm (đồng) */
  discount: number;
}
