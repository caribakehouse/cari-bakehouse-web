export interface CartItem {
  /** Định danh sản phẩm (slug thống nhất giữa trang chủ và trang /san-pham) */
  slug: string;
  name: string;
  image: string;
  price: number;
  /** Cỡ bánh đã chọn. Bỏ trống nếu sản phẩm chỉ có một kích cỡ. */
  size?: string;
  quantity: number;
}
