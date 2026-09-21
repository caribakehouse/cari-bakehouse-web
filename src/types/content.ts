// Nội dung có thể chỉnh trong khu admin (dữ liệu mẫu)

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
  label: string;
  href: string;
  image: string;
}

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
export interface AboutContent {
  storyBadge: string;
  storyTitle: string;
  storyBody: string;
  values: AboutValue[];
  faq: FaqItem[];
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
