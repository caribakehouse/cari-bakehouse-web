// Nội dung có thể chỉnh trong khu admin (lưu trong bảng site_content trên Supabase)

export interface HeroSlideContent {
  id: number;
  image: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  /** Hiện tiêu đề + nút CTA đè lên ảnh. Mặc định tắt: slider hiện chỉ có ảnh. */
  showText?: boolean;
}

export interface FeatureItem {
  id: string;
  title: string;
}

export interface BannerItem {
  /** Tên banner — luôn dùng làm mô tả ảnh (alt); chỉ hiện chữ trên ảnh khi bật showText */
  label: string;
  href: string;
  image: string;
  /** Hiện chữ (tiêu đề) đè lên ảnh. Mặc định tắt: chỉ hiện ảnh admin tự thiết kế. */
  showText?: boolean;
  /** Lớp phủ trắng mờ trên ảnh. Bỏ trống = "none". */
  overlay?: BannerOverlay;
}

export type BannerOverlay = "none" | "light" | "medium" | "strong";

export interface GalleryImage {
  id: number;
  image: string;
  alt: string;
}

export interface AboutSnippetContent {
  image: string;
  badge: string;
  quote: string;
}

export interface HomeContent {
  heroSlides: HeroSlideContent[];
  /** Dải 3 ô tính năng */
  features: FeatureItem[];
  /** Banner đôi Bánh / Đồ uống */
  banners: BannerItem[];
  /** Slug các sản phẩm Top order, theo thứ hạng */
  topOrderSlugs: string[];
  /** Slug các sản phẩm ở mục "Thực đơn của Cari" */
  menuSlugs: string[];
  gallery: GalleryImage[];
  about: AboutSnippetContent;
  /** Id các đánh giá được chọn hiển thị */
  featuredReviewIds: number[];
}

export type AboutIconKey = "shield" | "heart" | "clock" | "calendar";

export interface AboutValue {
  icon: AboutIconKey;
  title: string;
  desc: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Nội dung trang /gioi-thieu */
/** Một số liệu nổi bật, vd { value: "3+", label: "Năm hoạt động" } */
export interface AboutStat {
  value: string;
  label: string;
  desc: string;
}

/** Một ảnh không gian cửa hàng */
export interface AboutSpacePhoto {
  image: string;
  caption: string;
}

export interface AboutContent {
  /** Banner đầu trang */
  heroTitle: string;
  heroSubtitle: string;
  /** Ảnh nền banner (bỏ trống = nền màu kem) */
  heroImage: string;
  storyBadge: string;
  storyTitle: string;
  storyBody: string;
  /** Ảnh bên trái khối câu chuyện (bỏ trống = khung chờ ảnh) */
  storyImage: string;
  values: AboutValue[];
  stats: AboutStat[];
  spacePhotos: AboutSpacePhoto[];
  faq: FaqItem[];
}

/**
 * Một nhóm sản phẩm trên trang /san-pham — admin có thể thêm, xóa, đổi tên, sắp xếp lại tùy ý.
 * `id` sinh một lần khi tạo nhóm và không đổi sau đó: đây là khóa để gán sản phẩm vào nhóm
 * (Product.subcategory lưu đúng id này), nên đổi tên nhóm không làm "lạc" sản phẩm đang có trong nhóm.
 */
export interface ProductGroupContent {
  id: string;
  category: "Bánh" | "Đồ uống";
  title: string;
  description: string;
}

/** Nội dung trang /san-pham (danh mục sản phẩm) */
export interface ProductsPageContent {
  /** Nhãn nhỏ phía trên 2 badge chọn danh mục, vd "Chọn danh mục" */
  categoryPickerLabel: string;
  groups: ProductGroupContent[];
}

export interface SiteSettings {
  /** Số hotline dạng chữ số liền, vd 0338975925 */
  hotline: string;
  email: string;
  /** Link Zalo, vd https://zalo.me/0338975925 */
  zalo: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  threads: string;
}

/** Chương trình thành viên — admin chỉnh ở /admin/tich-diem (lưu site_content key 'loyalty'; database dùng đúng các số này) */
export interface LoyaltyConfig {
  /** Bao nhiêu đồng thì được 1 điểm */
  pointRateVnd: number;
  /** Số điểm đổi 1 món miễn phí */
  redeemPoints: number;
  /** Nhóm sản phẩm được đổi điểm (id nhóm), vd nhóm Cheesecake */
  redeemGroupId: string;
  /** Tổng điểm đã tích tối thiểu để lên hạng Thân thiết */
  loyalMinPoints: number;
  /** Tổng điểm đã tích tối thiểu để lên hạng VIP */
  vipMinPoints: number;
  /** VIP được giảm bao nhiêu % tiền bánh */
  vipCakeDiscountPercent: number;
  /** VIP tháng sinh nhật: 1 đơn giảm bao nhiêu % tiền bánh */
  birthdayCakeDiscountPercent: number;
}

/** Một bước trong quy trình đặt bánh theo yêu cầu */
export interface CustomOrderStep {
  title: string;
  desc: string;
}

/** Ảnh mẫu bánh đã làm (thư viện ở trang /dat-theo-yeu-cau) */
export interface CustomOrderSample {
  id: number;
  image: string;
  title: string;
  /** Nhóm để lọc, vd "Sinh nhật" (bỏ trống = không thuộc nhóm nào) */
  tag: string;
}

/** Một mức giá tham khảo theo kích thước, vd "Bánh vừa · 12cm" */
export interface CustomOrderPriceTier {
  name: string;
  size: string;
  image: string;
  prices: { label: string; price: number }[];
  note: string;
  /** Làm nổi bật thẻ này (viền đậm + nhãn) */
  highlight: string;
}

/** Nội dung trang /dat-theo-yeu-cau — admin chỉnh ở /admin/noi-dung-dat-theo-yeu-cau */
export interface CustomOrderContent {
  tagline: string;
  title: string;
  steps: CustomOrderStep[];
  /** Hộp "Lưu ý quan trọng" dưới quy trình (bỏ trống = ẩn) */
  note: string;
  samples: CustomOrderSample[];
  priceTiers: CustomOrderPriceTier[];
  /** Ghi chú dưới tiêu đề bảng giá */
  priceNote: string;
  /** Các dịp trong ô chọn "Dịp đặt bánh" */
  occasions: string[];
  faq: FaqItem[];
}
