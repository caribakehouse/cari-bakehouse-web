// ============================================================
//  Cari Bakehouse — Mock Data (src/lib/mock-data.ts)
//  Dùng cho các section trang chủ trước khi kết nối API thật
// ============================================================

export interface HeroSlide {
  id: number;
  tagline: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  bgColor: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
}

export interface GalleryItem {
  id: number;
  image: string;
  alt: string;
}

export interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
}

// ─── Hero Slides ────────────────────────────────────────────
export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    tagline: "Làm thủ công mỗi ngày",
    title: "Bánh tươi\nthơm từ lò",
    subtitle: "Mỗi chiếc bánh được nướng tươi theo đơn,\nkhông chất bảo quản, không để tồn kho.",
    ctaLabel: "Khám phá ngay",
    ctaHref: "/san-pham",
    bgColor: "#1B4B5A",
  },
  {
    id: 2,
    tagline: "Đặc biệt dành cho bạn",
    title: "Bánh đặt\ntheo yêu cầu",
    subtitle: "Thiết kế riêng cho sinh nhật, sự kiện hay\ncơ hội đặc biệt của bạn.",
    ctaLabel: "Đặt bánh ngay",
    ctaHref: "/dat-theo-yeu-cau",
    bgColor: "#C97B3D",
  },
  {
    id: 3,
    tagline: "Ưu đãi hôm nay",
    title: "Giảm 10%\nđơn đầu tiên",
    subtitle: "Dùng mã CARI10 khi thanh toán.\nFreeship trong 5km cho đơn từ 300.000đ.",
    ctaLabel: "Mua ngay",
    ctaHref: "/san-pham",
    bgColor: "#123640",
  },
];

// ─── Top 3 Best-seller (admin picks) ────────────────────────
export const topProducts: Product[] = [
  {
    id: 1,
    slug: "banh-bong-lan-mat-ong",
    name: "Bánh Bông Lan Mật Ong",
    category: "Bánh",
    price: 185000,
    image: "https://placehold.co/480x480/FFF8EF/1B4B5A?text=Banh+1",
    badge: "#1 Best-seller",
    rating: 5,
    reviews: 142,
  },
  {
    id: 2,
    slug: "eclair-ca-phe-so-co-la",
    name: "Éclair Cà Phê & Sô Cô La",
    category: "Bánh",
    price: 65000,
    originalPrice: 75000,
    image: "https://placehold.co/480x480/FCE9C6/1B4B5A?text=Banh+2",
    badge: "#2 Yêu thích",
    rating: 5,
    reviews: 98,
  },
  {
    id: 3,
    slug: "matcha-roll-cake",
    name: "Matcha Roll Cake",
    category: "Bánh",
    price: 220000,
    image: "https://placehold.co/480x480/E8F5E9/1B4B5A?text=Banh+3",
    badge: "#3 Trending",
    rating: 4,
    reviews: 77,
  },
];

// ─── Product Menu Grid ───────────────────────────────────────
export const menuProducts: Product[] = [
  {
    id: 10,
    slug: "banh-sua-chua-chanh-leo",
    name: "Bánh Sữa Chua Chanh Leo",
    category: "Bánh",
    price: 175000,
    image: "https://placehold.co/400x400/FFF8EF/1B4B5A?text=Sua+Chua",
    rating: 5,
    reviews: 54,
  },
  {
    id: 11,
    slug: "croissant-bo-phap",
    name: "Croissant Bơ Pháp",
    category: "Bánh",
    price: 45000,
    image: "https://placehold.co/400x400/FCE9C6/1B4B5A?text=Croissant",
    badge: "Mới",
    rating: 5,
    reviews: 33,
  },
  {
    id: 12,
    slug: "tart-trung-hong-kong",
    name: "Tart Trứng Hồng Kông",
    category: "Bánh",
    price: 35000,
    image: "https://placehold.co/400x400/FFF3E0/1B4B5A?text=Tart+Trung",
    rating: 4,
    reviews: 61,
  },
  {
    id: 13,
    slug: "banh-su-kem-vanilla",
    name: "Bánh Su Kem Vanilla",
    category: "Bánh",
    price: 28000,
    image: "https://placehold.co/400x400/F3E5F5/1B4B5A?text=Su+Kem",
    rating: 5,
    reviews: 89,
  },
  {
    id: 14,
    slug: "tra-sua-tran-chau",
    name: "Trà Sữa Trân Châu",
    category: "Đồ uống",
    price: 55000,
    image: "https://placehold.co/400x400/E8EAF6/1B4B5A?text=Tra+Sua",
    badge: "Hot",
    rating: 5,
    reviews: 112,
  },
  {
    id: 15,
    slug: "ca-phe-sua-da-cari",
    name: "Cà Phê Sữa Đá Cari",
    category: "Đồ uống",
    price: 45000,
    image: "https://placehold.co/400x400/EFEBE9/1B4B5A?text=Ca+Phe",
    rating: 4,
    reviews: 47,
  },
  {
    id: 16,
    slug: "banh-red-velvet",
    name: "Red Velvet Slice",
    category: "Bánh",
    price: 85000,
    originalPrice: 95000,
    image: "https://placehold.co/400x400/FFEBEE/1B4B5A?text=Red+Velvet",
    badge: "Sale",
    rating: 5,
    reviews: 68,
  },
  {
    id: 17,
    slug: "tiramisu-ca-ly",
    name: "Tiramisu Cá Ly",
    category: "Bánh",
    price: 75000,
    image: "https://placehold.co/400x400/FAFAFA/1B4B5A?text=Tiramisu",
    rating: 5,
    reviews: 95,
  },
];

// ─── Gallery ─────────────────────────────────────────────────
export const galleryItems: GalleryItem[] = [
  { id: 1, image: "https://placehold.co/600x600/F6CE8B/1B4B5A?text=Gallery+1", alt: "Không gian cửa hàng Cari Bakehouse" },
  { id: 2, image: "https://placehold.co/600x600/1B4B5A/FFF8EF?text=Gallery+2", alt: "Bánh tươi mỗi ngày" },
  { id: 3, image: "https://placehold.co/600x600/C97B3D/FFF8EF?text=Gallery+3", alt: "Eclair sô cô la thơm lừng" },
  { id: 4, image: "https://placehold.co/600x600/123640/FCE9C6?text=Gallery+4", alt: "Quầy bánh Cari" },
  { id: 5, image: "https://placehold.co/600x600/FCE9C6/1B4B5A?text=Gallery+5", alt: "Bếp làm bánh thủ công" },
  { id: 6, image: "https://placehold.co/600x600/E5D9C3/1B4B5A?text=Gallery+6", alt: "Đóng gói bánh tặng quà" },
];

// ─── Customer Reviews ─────────────────────────────────────────
export const reviews: Review[] = [
  {
    id: 1,
    name: "Nguyễn Minh Thư",
    avatar: "https://placehold.co/80x80/F6CE8B/1B4B5A?text=MT",
    rating: 5,
    date: "15/09/2026",
    content:
      "Bánh ngon thật sự! Mình đặt bánh sinh nhật cho mẹ, team Cari tư vấn rất tận tình và bánh ra lò đúng như ý. Kem không quá ngọt, bánh bông xốp. Chắc chắn sẽ quay lại!",
  },
  {
    id: 2,
    name: "Trần Hoàng Nam",
    avatar: "https://placehold.co/80x80/1B4B5A/FCE9C6?text=HN",
    rating: 5,
    date: "02/09/2026",
    content:
      "Croissant bơ Pháp ở đây đỉnh lắm, lớp vỏ giòn rụm mà bên trong mềm thơm. Giao hàng nhanh, đóng gói cẩn thận. Mua lần đầu dùng mã CARI10 được giảm ngay, rất thích!",
  },
  {
    id: 3,
    name: "Lê Bảo Châu",
    avatar: "https://placehold.co/80x80/C97B3D/FFF8EF?text=BC",
    rating: 5,
    date: "28/08/2026",
    content:
      "Không gian ảo nhưng chất lượng thật. Tiramisu cá ly của Cari là ngon nhất mình từng ăn ở Hà Nội. Hương cà phê đậm đà, kem mascarpone mịn. Đặt hàng online siêu tiện.",
  },
];
