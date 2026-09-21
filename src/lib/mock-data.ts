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
  image?: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
}

export interface ProductCategoryGroup {
  id: string;
  category: "Bánh" | "Đồ uống";
  title: string;
  description?: string;
  products: Product[];
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
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    tagline: "Đặc biệt dành cho bạn",
    title: "Bánh đặt\ntheo yêu cầu",
    subtitle: "Thiết kế riêng cho sinh nhật, sự kiện hay\ncơ hội đặc biệt của bạn.",
    ctaLabel: "Đặt bánh ngay",
    ctaHref: "/dat-theo-yeu-cau",
    bgColor: "#C97B3D",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    tagline: "Ưu đãi hôm nay",
    title: "Giảm 10%\nđơn đầu tiên",
    subtitle: "Dùng mã CARI10 khi thanh toán.\nFreeship trong 5km cho đơn từ 300.000đ.",
    ctaLabel: "Mua ngay",
    ctaHref: "/san-pham",
    bgColor: "#123640",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920&auto=format&fit=crop&q=80",
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

// ─── Danh mục chi tiết phân nhóm cho trang /san-pham ──────────────
export const cakeProductGroups: ProductCategoryGroup[] = [
  {
    id: "banh-kem-sinh-nhat",
    category: "Bánh",
    title: "Bánh Kem & Bánh Ổ",
    description: "Cốt bánh mềm ẩm, kem tươi thanh nhẹ ít ngọt chuẩn vị châu Âu",
    products: [
      {
        id: 101,
        slug: "banh-bong-lan-mat-ong",
        name: "Bánh Bông Lan Mật Ong",
        category: "Bánh",
        subcategory: "Bánh Kem & Bánh Ổ",
        description: "Bông lan mềm xốp quyện cùng mật ong hoa nhãn thơm lừng",
        price: 185000,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
        badge: "#1 Best-seller",
        rating: 5,
        reviews: 142,
      },
      {
        id: 102,
        slug: "matcha-roll-cake",
        name: "Matcha Roll Cake",
        category: "Bánh",
        subcategory: "Bánh Kem & Bánh Ổ",
        description: "Trà xanh Uji Nhật Bản đậm vị kết hợp cùng lớp kem tươi mịn màng",
        price: 220000,
        image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
        badge: "Trending",
        rating: 5,
        reviews: 77,
      },
      {
        id: 103,
        slug: "banh-red-velvet",
        name: "Red Velvet Cream Cheese",
        category: "Bánh",
        subcategory: "Bánh Kem & Bánh Ổ",
        description: "Sắc đỏ nhung quyến rũ xen kẽ lớp phô mai kem chua ngọt hài hoà",
        price: 85000,
        originalPrice: 95000,
        image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=80",
        badge: "Sale",
        rating: 5,
        reviews: 68,
      },
    ],
  },
  {
    id: "banh-ngot-trang-mieng",
    category: "Bánh",
    title: "Bánh Ngọt & Tráng Miệng",
    description: "Những món ngọt nhỏ xinh hoàn hảo để thưởng thức cùng tách trà ấm",
    products: [
      {
        id: 104,
        slug: "eclair-ca-phe-so-co-la",
        name: "Éclair Cà Phê & Sô Cô La",
        category: "Bánh",
        subcategory: "Bánh Ngọt & Tráng Miệng",
        description: "Vỏ bánh su dài truyền thống Pháp ngập tràn nhân kem cà phê đậm đà",
        price: 65000,
        originalPrice: 75000,
        image: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&auto=format&fit=crop&q=80",
        badge: "Yêu thích",
        rating: 5,
        reviews: 98,
      },
      {
        id: 105,
        slug: "banh-su-kem-vanilla",
        name: "Bánh Su Kem Vanilla Bourbon",
        category: "Bánh",
        subcategory: "Bánh Ngọt & Tráng Miệng",
        description: "Nhân kem custard từ hạt vani Bourbon thơm nồng nàn",
        price: 28000,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
        rating: 5,
        reviews: 89,
      },
      {
        id: 106,
        slug: "tiramisu-ca-ly",
        name: "Tiramisu Cá Ly Truyền Thống",
        category: "Bánh",
        subcategory: "Bánh Ngọt & Tráng Miệng",
        description: "Hương vị Ý nguyên bản với bánh sampa đẫm cà phê và phô mai mascarpone",
        price: 75000,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
        badge: "Top Pick",
        rating: 5,
        reviews: 95,
      },
    ],
  },
  {
    id: "banh-nuong-croissant",
    category: "Bánh",
    title: "Bánh Nướng & Croissant",
    description: "Nướng tươi mỗi sớm, thơm giòn ngập tràn hương bơ Pháp hảo hạng",
    products: [
      {
        id: 107,
        slug: "croissant-bo-phap",
        name: "Croissant Bơ Pháp Cổ Điển",
        category: "Bánh",
        subcategory: "Bánh Nướng & Croissant",
        description: "Hàng trăm lớp bột giòn xốp thơm lừng bơ Pháp AOP cao cấp",
        price: 45000,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
        badge: "Mới",
        rating: 5,
        reviews: 33,
      },
      {
        id: 108,
        slug: "tart-trung-hong-kong",
        name: "Tart Trứng Hồng Kông",
        category: "Bánh",
        subcategory: "Bánh Nướng & Croissant",
        description: "Lớp vỏ ngàn lớp giòn tan bao bọc nhân trứng béo ngậy mềm mịn",
        price: 35000,
        image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600&auto=format&fit=crop&q=80",
        rating: 4,
        reviews: 61,
      },
      {
        id: 109,
        slug: "banh-sua-chua-chanh-leo",
        name: "Bánh Sữa Chua Chanh Leo",
        category: "Bánh",
        subcategory: "Bánh Nướng & Croissant",
        description: "Chua ngọt thanh mát, vị chanh leo tự nhiên giúp giải ngấy tuyệt vời",
        price: 175000,
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80",
        rating: 5,
        reviews: 54,
      },
    ],
  },
];

export const drinkProductGroups: ProductCategoryGroup[] = [
  {
    id: "tra-trai-cay-tra-sua",
    category: "Đồ uống",
    title: "Trà Trái Cây & Trà Sữa",
    description: "Đậm vị trà mộc tự nhiên, hoa quả tươi theo mùa thanh mát sảng khoái",
    products: [
      {
        id: 201,
        slug: "tra-sua-tran-chau-cari",
        name: "Trà Sữa Trân Châu Cari",
        category: "Đồ uống",
        subcategory: "Trà Trái Cây & Trà Sữa",
        description: "Trà đen nguyên bản pha sữa béo ngậy cùng trân châu hoàng kim dẻo bùi",
        price: 55000,
        image: "https://images.unsplash.com/photo-1558857563-b37cf5c8466b?w=600&auto=format&fit=crop&q=80",
        badge: "Hot",
        rating: 5,
        reviews: 112,
      },
      {
        id: 202,
        slug: "tra-dao-cam-sa",
        name: "Trà Đào Cam Sả Tươi",
        category: "Đồ uống",
        subcategory: "Trà Trái Cây & Trà Sữa",
        description: "Hương thơm nồng nàn của sả cây, cam vàng mọng nước và miếng đào giòn ngọt",
        price: 45000,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
        badge: "Mới",
        rating: 5,
        reviews: 45,
      },
      {
        id: 203,
        slug: "tra-dau-tay-hoa-hong",
        name: "Trà Dâu Tây Hoa Hồng",
        category: "Đồ uống",
        subcategory: "Trà Trái Cây & Trà Sữa",
        description: "Vị ngọt dịu thơm hương hoa hồng kết hợp mứt dâu tây Đà Lạt tự nấu",
        price: 50000,
        originalPrice: 58000,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
        badge: "Best-seller",
        rating: 5,
        reviews: 82,
      },
    ],
  },
  {
    id: "ca-phe-thu-cong-latte",
    category: "Đồ uống",
    title: "Cà Phê Thủ Công & Latte",
    description: "Hạt cà phê Arabica Cầu Đất phối trộn Robusta rang mộc đậm đà",
    products: [
      {
        id: 204,
        slug: "ca-phe-sua-da-cari",
        name: "Cà Phê Sữa Đá Cari",
        category: "Đồ uống",
        subcategory: "Cà Phê Thủ Công & Latte",
        description: "Hương vị cà phê truyền thống Việt Nam đậm đặc, sánh mịn béo ngọt",
        price: 45000,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
        rating: 5,
        reviews: 64,
      },
      {
        id: 205,
        slug: "latte-hat-de",
        name: "Latte Hạt Dẻ Béo Ngậy",
        category: "Đồ uống",
        subcategory: "Cà Phê Thủ Công & Latte",
        description: "Espresso thơm nhẹ hòa quyện sữa tươi đánh bọt mịn và siro hạt dẻ nướng",
        price: 55000,
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80",
        badge: "Yêu thích",
        rating: 5,
        reviews: 48,
      },
      {
        id: 206,
        slug: "ca-phe-muoi-kem-beo",
        name: "Cà Phê Muối Kem Béo",
        category: "Đồ uống",
        subcategory: "Cà Phê Thủ Công & Latte",
        description: "Lớp kem mặn béo ngậy độc đáo nâng tầm hương vị cà phê phin đậm chất",
        price: 48000,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
        badge: "Trending",
        rating: 5,
        reviews: 91,
      },
    ],
  },
  {
    id: "nuoc-ep-da-xay",
    category: "Đồ uống",
    title: "Nước Ép & Đá Xay",
    description: "Thức uống tươi mát giàu vitamin cho ngày thêm hứng khởi và năng lượng",
    products: [
      {
        id: 207,
        slug: "nuoc-ep-cam-tao-tuoi",
        name: "Nước Ép Cam Táo Tươi",
        category: "Đồ uống",
        subcategory: "Nước Ép & Đá Xay",
        description: "100% trái cây tươi ép chậm nguyên chất, không thêm đường hoá học",
        price: 50000,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
        rating: 5,
        reviews: 39,
      },
      {
        id: 208,
        slug: "matcha-da-xay-kem",
        name: "Matcha Đá Xay Kem Tươi",
        category: "Đồ uống",
        subcategory: "Nước Ép & Đá Xay",
        description: "Bột trà xanh Nhật xay nhuyễn mịn với sữa tươi và chỏm kem bông xốp",
        price: 60000,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
        badge: "Đặc biệt",
        rating: 5,
        reviews: 73,
      },
      {
        id: 209,
        slug: "chocolate-freeze-hanh-nhan",
        name: "Chocolate Freeze Hạnh Nhân",
        category: "Đồ uống",
        subcategory: "Nước Ép & Đá Xay",
        description: "Sô cô la Bỉ nguyên chất đậm đà rắc hạnh nhân lát nướng giòn rụm",
        price: 60000,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
        rating: 5,
        reviews: 56,
      },
    ],
  },
];

export function getProductGroups(category: "Bánh" | "Đồ uống"): ProductCategoryGroup[] {
  return category === "Bánh" ? cakeProductGroups : drinkProductGroups;
}

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
