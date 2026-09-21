/** Các bước: Mới → Đang tư vấn → Đã báo giá → Đã cọc → Hoàn tất (hoặc Đã hủy ở bất kỳ bước nào chưa kết thúc) */
export const CUSTOM_ORDER_STEPS = ["Mới", "Đang tư vấn", "Đã báo giá", "Đã cọc", "Hoàn tất"] as const;

export type CustomOrderStatus = (typeof CUSTOM_ORDER_STEPS)[number] | "Đã hủy";

/** Yêu cầu đặt bánh theo yêu cầu gửi từ form /dat-theo-yeu-cau */
export interface CustomOrderRequest {
  /** Dạng YC0001 */
  id: string;
  /** Ngày gửi, yyyy-mm-dd */
  createdAt: string;
  customerName: string;
  /** Số điện thoại / Zalo */
  phone: string;
  customerEmail?: string;
  occasion: string;
  /** Ngày cần nhận bánh, yyyy-mm-dd */
  deliveryDate: string;
  sizeGuestCount: string;
  flavor: string;
  budget: string;
  notes: string;
  /** Ảnh tham khảo: URL hoặc data URL (đã thu nhỏ) */
  referenceImage?: string;
  status: CustomOrderStatus;
  /** Giá tiệm đã báo (đồng) */
  quotedPrice?: number;
}
