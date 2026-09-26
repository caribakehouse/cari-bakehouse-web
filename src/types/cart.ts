export interface CartItem {
  /** Định danh sản phẩm (slug thống nhất giữa trang chủ và trang /san-pham) */
  slug: string;
  name: string;
  image: string;
  /** Đơn giá đã gồm phụ thu tùy chọn (giá thật do database tính lại khi đặt hàng) */
  price: number;
  /** Cỡ bánh đã chọn. Bỏ trống nếu sản phẩm chỉ có một kích cỡ. */
  size?: string;
  /** Tùy chọn đã chọn: tên nhóm → lựa chọn, vd { "Sốt đi kèm": "Caramel muối" } */
  options?: Record<string, string>;
  quantity: number;
}
