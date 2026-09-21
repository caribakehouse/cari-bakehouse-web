import type { Tone } from "@/components/admin/ui";
import type { CustomOrderStatus } from "@/types/custom-order";
import type { OrderStatus } from "@/types/order";
import type { ProductStatus } from "@/lib/mock-data";

export const orderTone = (status: OrderStatus): Tone =>
  status === "Đã giao" ? "green" : status === "Đã hủy" ? "red" : "amber";

export const requestTone = (status: CustomOrderStatus): Tone => {
  switch (status) {
    case "Mới":
      return "amber";
    case "Đang tư vấn":
      return "blue";
    case "Đã báo giá":
      return "blue";
    case "Đã cọc":
      return "green";
    case "Hoàn tất":
      return "green";
    case "Đã hủy":
      return "red";
  }
};

export const productTone = (status: ProductStatus): Tone =>
  status === "active" ? "green" : status === "soldout" ? "red" : "gray";
