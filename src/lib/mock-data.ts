// ============================================================
//  Cari Bakehouse — Mock Data (src/lib/mock-data.ts)
//  NGUỒN DỮ LIỆU MẪU DUY NHẤT của toàn dự án (cửa hàng + khu admin).
//  Khu admin đọc/ghi qua src/lib/db.ts: đây là dữ liệu gốc (seed), mọi chỉnh sửa
//  được lưu chồng lên trên trong localStorage của trình duyệt (chưa có database thật).
//  TODO: thay bằng database thật (Supabase) ở Giai đoạn 4.
// ============================================================

import type { AuthUser, Customer, PointTransaction } from "@/types/user";
import type { Order, Voucher } from "@/types/order";
import type { CustomOrderRequest } from "@/types/custom-order";
import type { AboutContent, HomeContent, ProductsPageContent, SiteSettings } from "@/types/content";

/** Chuỗi yyyy-mm-dd của "hôm nay + offset ngày" theo giờ địa phương (dùng cho đơn mẫu luôn mới). */
function dayOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export type ProductStatus = "active" | "soldout" | "hidden";

export interface ProductSize {
  label: string;
  price: number;
}

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
  /**
   * Id của nhóm sản phẩm (ProductGroupContent.id) — KHÔNG phải tên nhóm, để đổi tên/xóa nhóm khác
   * không làm sản phẩm lạc nhóm. Trong các literal seed bên dưới trường này bị SEED_PRODUCTS ghi đè
   * lại bằng id nhóm thật; giá trị viết tay ở đây chỉ mang tính minh họa, không được dùng trực tiếp.
   */
  subcategory?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
  /** Các cỡ bánh kèm giá riêng. Nếu có, `price` = giá thấp nhất trong các cỡ. */
  sizes?: ProductSize[];
  /** Tồn kho (mặc định 20 trong dữ liệu mẫu) */
  stock?: number;
  /** Bỏ trống = "active" */
  status?: ProductStatus;
}

export interface ProductCategoryGroup {
  id: string;
  category: "Bánh" | "Đồ uống";
  title: string;
  description?: string;
  products: Product[];
}

/** Thông tin nhóm sản phẩm (không kèm danh sách sản phẩm) */
export type ProductGroupMeta = Omit<ProductCategoryGroup, "products">;

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

// ─── Danh mục chi tiết phân nhóm cho trang /san-pham ──────────────
const cakeProductGroups: ProductCategoryGroup[] = [
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
        image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&auto=format&fit=crop&q=80",
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

const drinkProductGroups: ProductCategoryGroup[] = [
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
        image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&auto=format&fit=crop&q=80",
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

// ─── Sản phẩm: danh sách phẳng + thông tin nhóm ───────────────
// Cửa hàng (/san-pham, trang chủ) và admin cùng đọc danh sách này qua src/lib/db.ts.
const seedGroups: ProductCategoryGroup[] = [...cakeProductGroups, ...drinkProductGroups];

export const PRODUCT_GROUP_META: ProductGroupMeta[] = seedGroups.map(
  ({ id, category, title, description }) => ({ id, category, title, description }),
);

// ─── Nội dung trang /san-pham ─────────────────────────────────
// Danh sách nhóm sản phẩm hiển thị ở trang /san-pham — admin toàn quyền thêm/xóa/đổi tên/sắp xếp lại
// ở /admin/noi-dung-trang-san-pham. Đây là NGUỒN GỐC duy nhất cho việc nhóm nào tồn tại; sản phẩm
// (Product.subcategory) tham chiếu tới nhóm qua `id` bên dưới — id không đổi nên đổi tên nhóm
// (hoặc xóa nhóm khác) không làm sản phẩm "lạc" khỏi nhóm của nó.
export const SEED_PRODUCTS_PAGE_CONTENT: ProductsPageContent = {
  categoryPickerLabel: "Chọn danh mục",
  groups: PRODUCT_GROUP_META.map(({ id, category, title, description }) => ({
    id,
    category,
    title,
    description: description ?? "",
  })),
};

// subcategory của mỗi sản phẩm = id nhóm gốc (không phải tên), khớp với SEED_PRODUCTS_PAGE_CONTENT ở trên.
export const SEED_PRODUCTS: Product[] = seedGroups.flatMap((group) =>
  group.products.map((p) => ({
    ...p,
    subcategory: group.id,
    stock: p.stock ?? 20,
    status: p.status ?? ("active" as const),
  })),
);

// ─── Tài khoản demo ──────────────────────────────────────────
// TODO: thay bằng kiểm tra vai trò thật qua Supabase Auth ở Giai đoạn 4.
export const ADMIN_EMAIL = "admin@cari.bakehouse";

/** Khách hàng demo có sẵn đơn hàng + điểm (đăng nhập bằng email này để xem dữ liệu mẫu) */
export const MOCK_USER: AuthUser = {
  fullName: "Nguyễn Minh Anh",
  email: "minhanh@example.com",
  phone: "0901 234 567",
};

// ─── Khách hàng mẫu ──────────────────────────────────────────
// TODO: thay bằng bảng khách hàng thật khi nối database
export const SEED_CUSTOMERS: Customer[] = [
  { id: "KH001", fullName: MOCK_USER.fullName, email: MOCK_USER.email, phone: MOCK_USER.phone, createdAt: "2023-11-05" },
  { id: "KH002", fullName: "Trần Hoàng Nam", email: "nam.tran@example.com", phone: "0912 345 678", createdAt: "2024-02-14" },
  { id: "KH003", fullName: "Lê Bảo Châu", email: "chau.le@example.com", phone: "0987 654 321", createdAt: "2024-05-20" },
  { id: "KH004", fullName: "Phạm Thu Hà", email: "thuha.pham@example.com", phone: "0935 111 222", createdAt: "2025-01-09" },
  { id: "KH005", fullName: "Vũ Đức Anh", email: "ducanh.vu@example.com", phone: "0868 222 333", createdAt: "2026-08-30" },
];

// ─── Lịch sử điểm mẫu ────────────────────────────────────────
// Điểm hiện có của khách = tổng các dòng. Khớp với trang /tich-diem: 2745 + 85 − 500 + 120 = 2450.
export const SEED_POINT_LOGS: PointTransaction[] = [
  { id: "P001", email: MOCK_USER.email, date: "2026-08-31", title: "Điểm tích lũy từ các đơn trước", points: 2745, kind: "initial" },
  { id: "P002", email: MOCK_USER.email, date: "2026-09-02", title: "Đơn hàng #CB0998 hoàn tất", points: 85, kind: "order", orderId: "#CB0998" },
  { id: "P003", email: MOCK_USER.email, date: "2026-09-10", title: "Đổi voucher giảm 20.000đ", points: -500, kind: "redeem" },
  { id: "P004", email: MOCK_USER.email, date: "2026-09-18", title: "Đơn hàng #CB1024 hoàn tất", points: 120, kind: "order", orderId: "#CB1024" },
  { id: "P005", email: "nam.tran@example.com", date: "2026-09-10", title: "Đơn hàng #CB1012 hoàn tất", points: 185, kind: "order", orderId: "#CB1012" },
  { id: "P006", email: "chau.le@example.com", date: "2026-09-05", title: "Đơn hàng #CB1005 hoàn tất", points: 150, kind: "order", orderId: "#CB1005" },
];

// ─── Voucher mẫu (chỉ dùng để demo giao diện) ────────────────
// TODO: nối với hệ thống voucher/điểm thật khi có quyết định cụ thể (số điểm ứng mỗi mức giảm chưa chốt).
// Không thêm mã ngoài danh sách demo này.
export const MOCK_VOUCHERS: Voucher[] = [
  { code: "CARI20", discount: 20000 },
  { code: "CARI50", discount: 50000 },
];

// ─── Đơn hàng mẫu ────────────────────────────────────────────
// TODO: thay bằng đơn hàng thật từ database
// Các đơn "Chờ xử lý" gần đây dùng ngày tương đối (hôm nay / hôm qua) để dashboard luôn có dữ liệu.
export const SEED_ORDERS: Order[] = [
  {
    id: "#CB1031",
    createdAt: dayOffset(0),
    items: [
      { name: "Croissant Bơ Pháp Cổ Điển", quantity: 3, price: 45000 },
      { name: "Tart Trứng Hồng Kông", quantity: 2, price: 35000 },
    ],
    subtotal: 205000,
    discount: 0,
    total: 205000,
    status: "Chờ xử lý",
    fulfillment: "pickup",
    receiveDate: dayOffset(0),
    receiveTime: "17:00",
    paymentMethod: "cod",
    customerName: "Trần Hoàng Nam",
    customerPhone: "0912 345 678",
    customerEmail: "nam.tran@example.com",
  },
  {
    id: "#CB1030",
    createdAt: dayOffset(0),
    items: [{ name: "Matcha Roll Cake", quantity: 1, price: 220000 }],
    subtotal: 220000,
    voucherCode: "CARI20",
    discount: 20000,
    total: 200000,
    status: "Chờ xử lý",
    fulfillment: "delivery",
    address: "Số 8 ngõ 12 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    receiveDate: dayOffset(1),
    receiveTime: "10:00",
    note: "Viết chữ Chúc mừng sinh nhật",
    paymentMethod: "bank",
    customerName: "Lê Bảo Châu",
    customerPhone: "0987 654 321",
    customerEmail: "chau.le@example.com",
  },
  {
    id: "#CB1029",
    createdAt: dayOffset(-1),
    items: [
      { name: "Trà Đào Cam Sả Tươi", quantity: 2, price: 45000 },
      { name: "Cà Phê Muối Kem Béo", quantity: 1, price: 48000 },
    ],
    subtotal: 138000,
    discount: 0,
    total: 138000,
    status: "Chờ xử lý",
    fulfillment: "delivery",
    address: "25 Lê Văn Lương, Thanh Xuân, Hà Nội",
    receiveDate: dayOffset(0),
    receiveTime: "14:30",
    paymentMethod: "cod",
    customerName: "Phạm Thu Hà",
    customerPhone: "0935 111 222",
    customerEmail: "thuha.pham@example.com",
  },
  {
    id: "#CB1027",
    createdAt: dayOffset(-2),
    items: [{ name: "Bánh Sữa Chua Chanh Leo", quantity: 1, price: 175000 }],
    subtotal: 175000,
    voucherCode: "CARI50",
    discount: 50000,
    total: 125000,
    status: "Đã hủy",
    fulfillment: "pickup",
    receiveDate: dayOffset(-1),
    receiveTime: "11:00",
    paymentMethod: "cod",
    customerName: "Vũ Đức Anh",
    customerPhone: "0868 222 333",
    customerEmail: "ducanh.vu@example.com",
  },
  {
    id: "#CB1024",
    createdAt: "2026-09-18",
    items: [
      { name: "Tiramisu Cá Ly Truyền Thống", quantity: 1, price: 75000 },
      { name: "Croissant Bơ Pháp Cổ Điển", quantity: 1, price: 45000 },
    ],
    subtotal: 120000,
    discount: 0,
    total: 120000,
    status: "Đã giao",
    fulfillment: "delivery",
    address: "Số 12 ngõ 45 Trần Duy Hưng, Cầu Giấy, Hà Nội",
    receiveDate: "2026-09-18",
    receiveTime: "15:00",
    paymentMethod: "bank",
    customerName: MOCK_USER.fullName,
    customerPhone: MOCK_USER.phone,
    customerEmail: MOCK_USER.email,
  },
  {
    id: "#CB1012",
    createdAt: "2026-09-10",
    items: [{ name: "Bánh Bông Lan Mật Ong", quantity: 1, price: 185000 }],
    subtotal: 185000,
    discount: 0,
    total: 185000,
    status: "Đã giao",
    fulfillment: "delivery",
    address: "Số 3 ngõ 88 Vũ Trọng Phụng, Thanh Xuân, Hà Nội",
    receiveDate: "2026-09-10",
    receiveTime: "09:30",
    paymentMethod: "bank",
    customerName: "Trần Hoàng Nam",
    customerPhone: "0912 345 678",
    customerEmail: "nam.tran@example.com",
  },
  {
    id: "#CB1005",
    createdAt: "2026-09-05",
    items: [{ name: "Tiramisu Cá Ly Truyền Thống", quantity: 2, price: 75000 }],
    subtotal: 150000,
    discount: 0,
    total: 150000,
    status: "Đã giao",
    fulfillment: "pickup",
    receiveDate: "2026-09-05",
    receiveTime: "16:00",
    paymentMethod: "cod",
    customerName: "Lê Bảo Châu",
    customerPhone: "0987 654 321",
    customerEmail: "chau.le@example.com",
  },
  {
    id: "#CB0998",
    createdAt: "2026-09-02",
    items: [{ name: "Red Velvet Cream Cheese", quantity: 1, price: 85000 }],
    subtotal: 85000,
    discount: 0,
    total: 85000,
    status: "Đã giao",
    fulfillment: "pickup",
    receiveDate: "2026-09-02",
    receiveTime: "10:30",
    paymentMethod: "cod",
    customerName: MOCK_USER.fullName,
    customerPhone: MOCK_USER.phone,
    customerEmail: MOCK_USER.email,
  },
  {
    id: "#CB0951",
    createdAt: "2026-08-20",
    items: [
      { name: "Bánh Bông Lan Mật Ong", quantity: 1, price: 185000 },
      { name: "Éclair Cà Phê & Sô Cô La", quantity: 1, price: 65000 },
    ],
    subtotal: 250000,
    discount: 0,
    total: 250000,
    status: "Đã hủy",
    fulfillment: "delivery",
    address: "Số 12 ngõ 45 Trần Duy Hưng, Cầu Giấy, Hà Nội",
    receiveDate: "2026-08-21",
    receiveTime: "09:00",
    paymentMethod: "cod",
    customerName: MOCK_USER.fullName,
    customerPhone: MOCK_USER.phone,
    customerEmail: MOCK_USER.email,
  },
];

// ─── Yêu cầu bánh theo yêu cầu mẫu ───────────────────────────
// TODO: thay bằng bảng yêu cầu thật khi nối database. Form /dat-theo-yeu-cau ghi thêm vào danh sách này.
export const SEED_CUSTOM_REQUESTS: CustomOrderRequest[] = [
  {
    id: "YC0004",
    createdAt: dayOffset(0),
    customerName: "Phạm Thu Hà",
    phone: "0935 111 222",
    customerEmail: "thuha.pham@example.com",
    occasion: "Sinh nhật",
    deliveryDate: dayOffset(6),
    sizeGuestCount: "Size 18cm, khoảng 8 người",
    flavor: "Vani kem tươi, dâu tây",
    budget: "Khoảng 400.000đ - 500.000đ",
    notes: "Viết chữ Happy Birthday Bống, tone màu hồng pastel, không dùng hạnh nhân.",
    status: "Mới",
  },
  {
    id: "YC0003",
    createdAt: dayOffset(-1),
    customerName: "Vũ Đức Anh",
    phone: "0868 222 333",
    customerEmail: "ducanh.vu@example.com",
    occasion: "Thôi nôi",
    deliveryDate: dayOffset(10),
    sizeGuestCount: "Khoảng 20 khách",
    flavor: "Socola, trà xanh",
    budget: "Khoảng 800.000đ",
    notes: "Bánh 2 tầng, trang trí động vật ngộ nghĩnh, tone vàng kem.",
    status: "Đang tư vấn",
  },
  {
    id: "YC0002",
    createdAt: dayOffset(-4),
    customerName: "Lê Bảo Châu",
    phone: "0987 654 321",
    customerEmail: "chau.le@example.com",
    occasion: "Cưới hỏi",
    deliveryDate: dayOffset(14),
    sizeGuestCount: "Bánh 3 tầng, khoảng 40 khách",
    flavor: "Vani, phô mai chanh",
    budget: "Khoảng 1.500.000đ",
    notes: "Tone trắng kem, hoa tươi trang trí.",
    status: "Đã báo giá",
    quotedPrice: 1300000,
  },
  {
    id: "YC0001",
    createdAt: "2026-08-15",
    customerName: "Trần Hoàng Nam",
    phone: "0912 345 678",
    customerEmail: "nam.tran@example.com",
    occasion: "Công ty / Sự kiện",
    deliveryDate: "2026-08-22",
    sizeGuestCount: "Set teabreak cho 30 người",
    flavor: "Mix bánh ngọt nhỏ",
    budget: "Khoảng 2.000.000đ",
    notes: "Giao tận công ty lúc 9h sáng.",
    status: "Hoàn tất",
    quotedPrice: 1900000,
  },
];

// ─── Nội dung trang chủ ──────────────────────────────────────
// Trang chủ đọc nội dung này qua src/lib/db.ts; admin chỉnh ở /admin/noi-dung-trang-chu.
export const SEED_HOME_CONTENT: HomeContent = {
  heroSlides: heroSlides.map((s) => ({
    id: s.id,
    image: s.image ?? "",
    title: s.title.replace(/\n/g, " "),
    ctaLabel: s.ctaLabel,
    ctaHref: s.ctaHref,
    showText: false,
  })),
  features: [
    { id: "points", title: "Chương trình tích điểm" },
    { id: "delivery", title: "Giao hàng tận nơi" },
    { id: "preorder", title: "Đặt trước" },
  ],
  banners: [
    {
      label: "Bánh",
      href: "/san-pham?danh-muc=banh",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Đồ uống",
      href: "/san-pham?danh-muc=do-uong",
      image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
    },
  ],
  topOrderSlugs: ["banh-bong-lan-mat-ong", "eclair-ca-phe-so-co-la", "matcha-roll-cake"],
  menuSlugs: [
    "banh-sua-chua-chanh-leo",
    "croissant-bo-phap",
    "tart-trung-hong-kong",
    "banh-su-kem-vanilla",
    "tra-sua-tran-chau-cari",
    "ca-phe-sua-da-cari",
    "banh-red-velvet",
    "tiramisu-ca-ly",
  ],
  gallery: galleryItems,
  about: {
    image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=900&auto=format&fit=crop&q=80",
    badge: "Tiệm bánh thủ công từ 2024",
    quote:
      "Cari. bắt đầu từ một tình yêu rất đơn giản: thích làm bánh và thích nhìn mọi người ăn bánh mình làm. Tụi mình làm bánh với mong muốn mang đến những món ngọt thật dễ thương, thật ngon và đủ gần gũi để bạn có thể ghé Cari. bất cứ khi nào muốn tự thưởng cho mình một chút.",
  },
  featuredReviewIds: reviews.map((r) => r.id),
};

// ─── Nội dung trang Giới thiệu & chính sách ──────────────────
export const SEED_ABOUT_CONTENT: AboutContent = {
  storyBadge: "Câu chuyện của Cari",
  storyTitle: "Vun vén ngọt ngào từ những điều giản dị",
  storyBody:
    "Cari. bắt đầu từ một tình yêu rất đơn giản: thích làm bánh và thích nhìn mọi người ăn bánh mình làm. Tụi mình làm bánh với mong muốn mang đến những món ngọt thật dễ thương, thật ngon và đủ gần gũi để bạn có thể ghé Cari. bất cứ khi nào muốn tự thưởng cho mình một chút.",
  values: [
    { icon: "shield", title: "Nguyên liệu chất lượng", desc: "Ưu tiên nguyên liệu sạch và an toàn cho từng chiếc bánh" },
    { icon: "heart", title: "Chăm chút từng bước nhỏ", desc: "Từ khâu chọn nguyên liệu đến hoàn thiện, đều được làm cẩn thận" },
    { icon: "clock", title: "Làm mới mỗi ngày", desc: "Bánh được sản xuất tươi theo đơn hàng ngày" },
    {
      icon: "calendar",
      title: "Đồng hành mọi khoảnh khắc",
      desc: "Từ một miếng bánh sau bữa ăn đến một chiếc bánh sinh nhật, Cari. luôn ở đó",
    },
  ],
  faq: [
    {
      question: "Cari Bakehouse giao hàng khu vực nào?",
      answer:
        "Giao hàng tận nơi trong toàn khu vực Hà Nội, thời gian giao cụ thể sẽ được thông báo khi xác nhận đơn.",
    },
    {
      question: "Phí giao hàng tính như thế nào?",
      answer:
        "Với đơn đặt qua các nền tảng như Shopeefood, Grabfood, phí ship tính theo chính sách nền tảng đó. Với đơn đặt trực tiếp ngoài nền tảng, phí ship tính theo ứng dụng Aha.",
    },
    {
      question: "Bánh lớn/đặt theo yêu cầu cần đặt trước bao lâu?",
      answer:
        "Đặt trước tối thiểu 12 tiếng đối với bánh kích thước lớn, và cần thanh toán trước khi tiệm bắt đầu làm bánh. Đơn xác nhận sau khi hai bên thống nhất thiết kế, số lượng và đặt cọc (nếu có).",
    },
    {
      question: "Có cần đặt cọc khi mua bánh không?",
      answer:
        "Bánh thường (sản xuất hàng ngày) không yêu cầu đặt cọc. Với bánh đặc biệt/đặt riêng, tiệm yêu cầu cọc trước 100% giá trị đơn.",
    },
    {
      question: "Cari Bakehouse có nhận đổi/trả bánh không?",
      answer:
        "Tiệm không nhận đổi/trả nếu khách đổi ý sau khi đã xác nhận đơn. Chỉ hỗ trợ đổi/trả/hoàn tiền khi giao sai bánh, bánh bị hư hỏng do vận chuyển, hoặc lỗi chất lượng từ khâu sản xuất. Khách cần gửi khiếu nại kèm ảnh chụp trong vòng 2-4 tiếng sau khi nhận hàng, tiệm phản hồi trong vòng 24 giờ.",
    },
    {
      question: "Thanh toán bằng cách nào?",
      answer:
        "Chuyển khoản, tiền mặt khi nhận hàng (COD tại khu vực hỗ trợ), hoặc thanh toán trực tiếp tại cửa hàng.",
    },
  ],
};

// ─── Cài đặt chung (hotline, email, Zalo, mạng xã hội) ───────
// Topbar, Footer, Header, nút liên hệ nổi, trang Liên hệ và nút Zalo ở bước đặt hàng đều đọc từ đây.
export const SEED_SITE_SETTINGS: SiteSettings = {
  hotline: "0338975925",
  email: "cari.bakehouse07@gmail.com",
  zalo: "https://zalo.me/0338975925",
  instagram: "https://www.instagram.com/cari.bakehouse.hn/",
  facebook: "",
  tiktok: "",
  threads: "https://www.threads.com/@cari.bakehouse.hn",
};
