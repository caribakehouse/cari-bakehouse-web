// ============================================================
//  Lớp truy cập dữ liệu mẫu dùng chung — cửa hàng và khu admin cùng đọc/ghi ở đây.
//
//  Dữ liệu gốc (seed) nằm DUY NHẤT trong src/lib/mock-data.ts. Vì trình duyệt không thể ghi ngược vào
//  file .ts, mọi chỉnh sửa (từ admin hoặc từ khách đặt hàng) được lưu chồng lên trên bằng localStorage,
//  theo từng "bảng" (khóa `cari-db:<bảng>`). Bảng chưa từng bị sửa thì đọc thẳng từ seed.
//  Muốn quay lại dữ liệu gốc: /admin/cai-dat → "Khôi phục dữ liệu mẫu".
//  TODO: thay toàn bộ file này bằng truy vấn database thật (Supabase) ở Giai đoạn 4.
// ============================================================

import { useMemo, useSyncExternalStore } from "react";
import { createPersistentStore, type PersistentStore } from "@/lib/persistent-store";
import {
  PRODUCT_GROUP_META,
  SEED_ABOUT_CONTENT,
  SEED_CUSTOM_REQUESTS,
  SEED_CUSTOMERS,
  SEED_HOME_CONTENT,
  SEED_ORDERS,
  SEED_POINT_LOGS,
  SEED_PRODUCTS,
  SEED_PRODUCTS_PAGE_CONTENT,
  SEED_SITE_SETTINGS,
  reviews as SEED_REVIEWS,
  type Product,
  type ProductCategoryGroup,
  type ProductStatus,
  type Review,
} from "@/lib/mock-data";
import { todayISO } from "@/lib/utils";
import type { AboutContent, HomeContent, ProductsPageContent, SiteSettings } from "@/types/content";
import type { CustomOrderRequest, CustomOrderStatus } from "@/types/custom-order";
import type { Order, OrderStatus } from "@/types/order";
import type { Customer, PointTransaction } from "@/types/user";

// ─── Tạo store cho từng bảng ─────────────────────────────────
const asArray =
  <T,>(seed: T[]) =>
  (value: unknown): T[] =>
    Array.isArray(value) ? (value as T[]) : seed;

/** Nội dung dạng object: gộp với seed để không vỡ khi thiếu trường */
const asObject =
  <T extends object>(seed: T) =>
  (value: unknown): T =>
    value && typeof value === "object" && !Array.isArray(value) ? { ...seed, ...(value as Partial<T>) } : seed;

const productsStore = createPersistentStore<Product[]>("cari-db:products", SEED_PRODUCTS, asArray(SEED_PRODUCTS));
const ordersStore = createPersistentStore<Order[]>("cari-db:orders", SEED_ORDERS, asArray(SEED_ORDERS));
const customersStore = createPersistentStore<Customer[]>("cari-db:customers", SEED_CUSTOMERS, asArray(SEED_CUSTOMERS));
const pointLogsStore = createPersistentStore<PointTransaction[]>(
  "cari-db:point-logs",
  SEED_POINT_LOGS,
  asArray(SEED_POINT_LOGS),
);
const requestsStore = createPersistentStore<CustomOrderRequest[]>(
  "cari-db:custom-requests",
  SEED_CUSTOM_REQUESTS,
  asArray(SEED_CUSTOM_REQUESTS),
);
const homeStore = createPersistentStore<HomeContent>("cari-db:home", SEED_HOME_CONTENT, asObject(SEED_HOME_CONTENT));
const aboutStore = createPersistentStore<AboutContent>("cari-db:about", SEED_ABOUT_CONTENT, asObject(SEED_ABOUT_CONTENT));
const settingsStore = createPersistentStore<SiteSettings>(
  "cari-db:settings",
  SEED_SITE_SETTINGS,
  asObject(SEED_SITE_SETTINGS),
);
const productsPageStore = createPersistentStore<ProductsPageContent>(
  "cari-db:products-page",
  SEED_PRODUCTS_PAGE_CONTENT,
  asObject(SEED_PRODUCTS_PAGE_CONTENT),
);

const allStores: PersistentStore<unknown>[] = [
  productsStore,
  ordersStore,
  customersStore,
  pointLogsStore,
  requestsStore,
  homeStore,
  aboutStore,
  settingsStore,
  productsPageStore,
] as PersistentStore<unknown>[];

function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/** Xóa mọi chỉnh sửa, quay về dữ liệu gốc trong mock-data.ts */
export function resetAllData() {
  allStores.forEach((s) => s.reset());
}

const emailKey = (email: string | undefined) => (email ?? "").trim().toLowerCase();

/** Sinh mã tăng dần dạng <prefix><số>, ví dụ KH006, YC0005 */
function nextCode(prefix: string, existing: string[], width: number): string {
  const max = existing.reduce((m, id) => {
    const n = parseInt(id.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(width, "0")}`;
}

// ═════════════════════════ SẢN PHẨM ═════════════════════════

export function useProducts(): Product[] {
  return useStore(productsStore);
}

export function getProducts(): Product[] {
  return productsStore.getSnapshot();
}

/** Trạng thái hiệu lực: hết tồn kho thì coi như hết hàng */
export function getProductStatus(p: Product): ProductStatus {
  if (p.status === "hidden") return "hidden";
  if (p.status === "soldout" || (p.stock !== undefined && p.stock <= 0)) return "soldout";
  return "active";
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Đang bán",
  soldout: "Hết hàng",
  hidden: "Ẩn",
};

/** Giá theo cỡ đã chọn (không chọn/không có cỡ → giá gốc của sản phẩm) */
export function priceForSize(p: Pick<Product, "price" | "sizes">, size?: string): number {
  return p.sizes?.find((s) => s.label === size)?.price ?? p.price;
}

/** Cỡ mặc định khi thêm nhanh vào giỏ: cỡ đầu tiên (nếu có) */
export function defaultSize(p: Pick<Product, "sizes">): string | undefined {
  return p.sizes?.[0]?.label;
}

/**
 * Các nhóm sản phẩm hiển thị ở cửa hàng: bỏ sản phẩm ẩn và nhóm rỗng.
 * Danh sách nhóm (thêm/xóa/đổi tên/sắp xếp) do admin toàn quyền quản lý ở
 * /admin/noi-dung-trang-san-pham — đây là nguồn duy nhất cho việc nhóm nào tồn tại.
 * Sản phẩm được xếp vào nhóm qua product.subcategory === group.id (id cố định, không đổi khi
 * admin đổi tên nhóm), nên đổi tên nhóm không làm sản phẩm "lạc" khỏi nhóm của nó.
 */
export function useProductGroups(category: "Bánh" | "Đồ uống"): ProductCategoryGroup[] {
  const products = useProducts();
  const content = useStore(productsPageStore);
  return useMemo(
    () =>
      content.groups
        .filter((g) => g.category === category)
        .map((g) => ({
          id: g.id,
          category: g.category,
          title: g.title,
          description: g.description,
          products: products.filter((p) => p.subcategory === g.id && getProductStatus(p) !== "hidden"),
        }))
        .filter((g) => g.products.length > 0),
    [products, content, category],
  );
}

/** Nhãn nhỏ phía trên 2 badge chọn danh mục ở trang /san-pham */
export function useCategoryPickerLabel(): string {
  return useStore(productsPageStore).categoryPickerLabel;
}

export interface ProductGroupOption {
  id: string;
  category: "Bánh" | "Đồ uống";
  /** Giá trị lưu vào Product.subcategory — chính là id nhóm */
  value: string;
  /** Tên hiển thị hiện tại của nhóm */
  label: string;
}

/** Danh sách nhóm để chọn khi thêm/sửa sản phẩm ở admin (theo đúng danh sách nhóm hiện có) */
export function useProductGroupOptions(): ProductGroupOption[] {
  const content = useStore(productsPageStore);
  return useMemo(
    () => content.groups.map((g) => ({ id: g.id, category: g.category, value: g.id, label: g.title })),
    [content],
  );
}

/** Số sản phẩm hiện đang thuộc một nhóm (id) — dùng để chặn xóa nhóm còn sản phẩm */
export function productCountInGroup(products: Product[], groupId: string): number {
  return products.filter((p) => p.subcategory === groupId).length;
}

/** Id nhóm mới, sinh một lần và không đổi kể cả khi admin đổi tên nhóm sau đó. */
export function generateGroupId(): string {
  return `nhom-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

/** Tra sản phẩm theo danh sách slug (giữ thứ tự, bỏ sản phẩm ẩn / không còn tồn tại) */
export function useProductsBySlugs(slugs: string[]): Product[] {
  const products = useProducts();
  return useMemo(
    () =>
      slugs
        .map((slug) => products.find((p) => p.slug === slug))
        .filter((p): p is Product => !!p && getProductStatus(p) !== "hidden"),
    [products, slugs],
  );
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ProductInput = Omit<Product, "id" | "slug" | "rating" | "reviews"> & {
  id?: number;
  slug?: string;
  rating?: number;
  reviews?: number;
};

/** Thêm mới (không có id) hoặc cập nhật sản phẩm. Trả về sản phẩm đã lưu. */
export function saveProduct(input: ProductInput): Product {
  const products = productsStore.getSnapshot();
  const sizes = input.sizes?.filter((s) => s.label.trim());
  const price = sizes && sizes.length > 0 ? Math.min(...sizes.map((s) => s.price)) : input.price;
  const base = { ...input, sizes: sizes && sizes.length > 0 ? sizes : undefined, price };

  if (input.id !== undefined) {
    const existing = products.find((p) => p.id === input.id);
    if (existing) {
      const updated: Product = { ...existing, ...base, id: existing.id, slug: existing.slug };
      productsStore.set(products.map((p) => (p.id === existing.id ? updated : p)));
      return updated;
    }
  }

  const id = products.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const baseSlug = slugify(input.name) || `san-pham-${id}`;
  let slug = baseSlug;
  for (let i = 2; products.some((p) => p.slug === slug); i++) slug = `${baseSlug}-${i}`;
  const created: Product = { ...base, id, slug, rating: input.rating ?? 5, reviews: input.reviews ?? 0 };
  productsStore.set([...products, created]);
  return created;
}

export function deleteProducts(ids: number[]) {
  productsStore.set(productsStore.getSnapshot().filter((p) => !ids.includes(p.id)));
}

export function setProductsStatus(ids: number[], status: ProductStatus) {
  productsStore.set(productsStore.getSnapshot().map((p) => (ids.includes(p.id) ? { ...p, status } : p)));
}

// ═════════════════════════ KHÁCH HÀNG & ĐIỂM ═════════════════════════

export function useCustomers(): Customer[] {
  return useStore(customersStore);
}

export function getCustomerByEmail(email: string): Customer | undefined {
  const key = emailKey(email);
  return customersStore.getSnapshot().find((c) => emailKey(c.email) === key);
}

/** Tạo hồ sơ khách nếu email chưa có (khi khách đăng ký / đặt đơn đầu tiên). */
export function ensureCustomer(info: { fullName: string; email: string; phone?: string }): Customer {
  const existing = getCustomerByEmail(info.email);
  if (existing) return existing;
  const customers = customersStore.getSnapshot();
  const created: Customer = {
    id: nextCode("KH", customers.map((c) => c.id), 3),
    fullName: info.fullName.trim() || info.email,
    email: info.email.trim(),
    phone: info.phone?.trim() ?? "",
    createdAt: todayISO(),
  };
  customersStore.set([...customers, created]);
  return created;
}

export function usePointLogs(): PointTransaction[] {
  return useStore(pointLogsStore);
}

export function pointBalance(logs: PointTransaction[], email: string | undefined): number {
  const key = emailKey(email);
  return logs.filter((l) => emailKey(l.email) === key).reduce((sum, l) => sum + l.points, 0);
}

export type PointHistoryEntry = PointTransaction & { balance: number };

/** Lịch sử điểm của một khách kèm số dư sau mỗi lần thay đổi (mới nhất trước) */
export function pointHistory(logs: PointTransaction[], email: string | undefined): PointHistoryEntry[] {
  const key = emailKey(email);
  const mine = logs
    .filter((l) => emailKey(l.email) === key)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const result: PointHistoryEntry[] = [];
  let running = 0;
  for (const l of mine) {
    running += l.points;
    result.push({ ...l, balance: running });
  }
  return result.reverse();
}

/** Điểm hiện có của một khách */
export function usePoints(email: string | undefined): number {
  const logs = usePointLogs();
  return useMemo(() => pointBalance(logs, email), [logs, email]);
}

/** Quy tắc tích điểm: 1.000đ = 1 điểm (chỉ cộng khi đơn "Đã giao") */
export const POINT_RATE_VND = 1000;
export const pointsForOrder = (total: number) => Math.floor(total / POINT_RATE_VND);

function addPointLog(entry: Omit<PointTransaction, "id" | "date"> & { date?: string }): PointTransaction {
  const logs = pointLogsStore.getSnapshot();
  const created: PointTransaction = {
    ...entry,
    id: nextCode("P", logs.map((l) => l.id), 3),
    date: entry.date ?? todayISO(),
  };
  pointLogsStore.set([...logs, created]);
  return created;
}

/** Admin cộng (points > 0) hoặc trừ (points < 0) điểm thủ công, kèm lý do. */
export function adjustPoints(
  email: string,
  points: number,
  reason: string,
): { ok: true } | { ok: false; error: string } {
  if (!Number.isInteger(points) || points === 0) return { ok: false, error: "Số điểm phải là số nguyên khác 0" };
  if (!reason.trim()) return { ok: false, error: "Vui lòng nhập lý do" };
  const balance = pointBalance(pointLogsStore.getSnapshot(), email);
  if (balance + points < 0) return { ok: false, error: `Không thể trừ quá số điểm hiện có (${balance} điểm)` };
  addPointLog({
    email,
    points,
    kind: "manual",
    title: points > 0 ? "Admin cộng điểm" : "Admin trừ điểm",
    reason: reason.trim(),
  });
  return { ok: true };
}

// ═════════════════════════ ĐƠN HÀNG ═════════════════════════

export function useOrders(): Order[] {
  return useStore(ordersStore);
}

/** Mã đơn dạng #CB + số ngẫu nhiên, không trùng đơn đã có */
export function generateOrderId(): string {
  const used = new Set(ordersStore.getSnapshot().map((o) => o.id));
  let id: string;
  do {
    id = `#CB${Math.floor(1000 + Math.random() * 9000)}`;
  } while (used.has(id));
  return id;
}

/** Lưu đơn mới đặt từ web (đơn mới nhất lên đầu) và đảm bảo khách có hồ sơ. */
export function addOrder(order: Order) {
  if (order.customerEmail) {
    ensureCustomer({
      fullName: order.customerName ?? order.customerEmail,
      email: order.customerEmail,
      phone: order.customerPhone,
    });
  }
  ordersStore.set([order, ...ordersStore.getSnapshot()]);
}

/**
 * Đổi trạng thái đơn theo đúng luồng: chỉ từ "Chờ xử lý" → "Đã giao" hoặc "Đã hủy".
 * Khi sang "Đã giao" thì cộng điểm cho khách (1.000đ = 1 điểm) — không cộng khi hủy.
 */
export function setOrderStatus(
  orderId: string,
  next: Exclude<OrderStatus, "Chờ xử lý">,
): { ok: true; pointsAwarded: number } | { ok: false; error: string } {
  const orders = ordersStore.getSnapshot();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
  if (order.status !== "Chờ xử lý") return { ok: false, error: "Đơn đã kết thúc, không thể đổi trạng thái" };

  ordersStore.set(orders.map((o) => (o.id === orderId ? { ...o, status: next } : o)));

  let pointsAwarded = 0;
  if (next === "Đã giao" && order.customerEmail) {
    const alreadyAwarded = pointLogsStore.getSnapshot().some((l) => l.kind === "order" && l.orderId === orderId);
    pointsAwarded = pointsForOrder(order.total);
    if (!alreadyAwarded && pointsAwarded > 0) {
      ensureCustomer({
        fullName: order.customerName ?? order.customerEmail,
        email: order.customerEmail,
        phone: order.customerPhone,
      });
      addPointLog({
        email: order.customerEmail,
        points: pointsAwarded,
        kind: "order",
        orderId,
        title: `Đơn hàng ${orderId} hoàn tất`,
      });
    } else {
      pointsAwarded = 0;
    }
  }
  return { ok: true, pointsAwarded };
}

// ═════════════════════════ BÁNH ĐẶT THEO YÊU CẦU ═════════════════════════

export function useCustomRequests(): CustomOrderRequest[] {
  return useStore(requestsStore);
}

export type CustomRequestInput = Omit<CustomOrderRequest, "id" | "createdAt" | "status" | "quotedPrice">;

/** Form /dat-theo-yeu-cau gọi hàm này: yêu cầu mới có trạng thái "Mới". */
export function addCustomRequest(input: CustomRequestInput): CustomOrderRequest {
  const requests = requestsStore.getSnapshot();
  const created: CustomOrderRequest = {
    ...input,
    id: nextCode("YC", requests.map((r) => r.id), 4),
    createdAt: todayISO(),
    status: "Mới",
  };
  requestsStore.set([created, ...requests]);
  return created;
}

export function updateCustomRequest(
  id: string,
  patch: Partial<Pick<CustomOrderRequest, "status" | "quotedPrice">>,
) {
  requestsStore.set(requestsStore.getSnapshot().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export type { CustomOrderStatus };

// ═════════════════════════ NỘI DUNG & CÀI ĐẶT ═════════════════════════

export function useHomeContent(): HomeContent {
  return useStore(homeStore);
}
export function saveHomeContent(content: HomeContent) {
  homeStore.set(content);
}

export function useAboutContent(): AboutContent {
  return useStore(aboutStore);
}
export function saveAboutContent(content: AboutContent) {
  aboutStore.set(content);
}

export function useProductsPageContent(): ProductsPageContent {
  return useStore(productsPageStore);
}
export function saveProductsPageContent(content: ProductsPageContent) {
  productsPageStore.set(content);
}

export function useSiteSettings(): SiteSettings {
  return useStore(settingsStore);
}
export function getSiteSettings(): SiteSettings {
  return settingsStore.getSnapshot();
}
export function saveSiteSettings(settings: SiteSettings) {
  settingsStore.set(settings);
}

/** Danh sách đánh giá gốc (để admin chọn đánh giá nổi bật) */
export const allReviews: Review[] = SEED_REVIEWS;
