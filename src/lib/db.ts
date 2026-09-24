// ============================================================
//  Lớp truy cập dữ liệu dùng chung — cửa hàng và khu admin cùng đọc/ghi ở đây.
//
//  ĐÃ LÊN SUPABASE: sản phẩm, nhóm sản phẩm, đánh giá, nội dung trang, cài đặt.
//    - Layout gốc tải sẵn trên server (src/app/layout.tsx → PublicDataProvider) nên trang hiện dữ liệu thật ngay.
//    - Admin lưu → ghi Supabase (RLS chỉ cho admin) → cập nhật bản sao trong trình duyệt để giao diện đổi ngay.
//  CHƯA LÊN SUPABASE (phần 3): đơn hàng, khách hàng, điểm, yêu cầu đặt bánh — vẫn lưu tạm localStorage
//    (khóa `cari-db:<bảng>`), dữ liệu gốc lấy từ src/lib/mock-data.ts.
// ============================================================

import { useMemo, useSyncExternalStore } from "react";
import { usePublicData } from "@/components/PublicDataProvider";
import { createPersistentStore, type PersistentStore } from "@/lib/persistent-store";
import {
  SEED_CUSTOM_REQUESTS,
  SEED_CUSTOMERS,
  SEED_ORDERS,
  SEED_POINT_LOGS,
  type Product,
  type ProductCategoryGroup,
  type ProductStatus,
  type Review,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { fetchProducts, productToRow, type PublicData } from "@/lib/supabase/public-data";
import { todayISO } from "@/lib/utils";
import type { AboutContent, HomeContent, ProductGroupContent, ProductsPageContent, SiteSettings } from "@/types/content";
import type { CustomOrderRequest, CustomOrderStatus } from "@/types/custom-order";
import type { Order, OrderStatus } from "@/types/order";
import type { Customer, PointTransaction } from "@/types/user";

// ─── Dữ liệu trên Supabase ───────────────────────────────────
// Bản sao trong trình duyệt: undefined = chưa sửa gì trong phiên này → dùng dữ liệu layout đã tải sẵn.

interface RemoteStore<T> {
  get: () => T | undefined;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
}

function createRemoteStore<T>(): RemoteStore<T> {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const productsRemote = createRemoteStore<Product[]>();
const groupsRemote = createRemoteStore<ProductGroupContent[]>();
const homeRemote = createRemoteStore<HomeContent>();
const aboutRemote = createRemoteStore<AboutContent>();
const settingsRemote = createRemoteStore<SiteSettings>();
const pickerLabelRemote = createRemoteStore<string>();

const noValue = () => undefined;

function useRemote<T>(store: RemoteStore<T>, pick: (data: PublicData) => T): T {
  const initial = pick(usePublicData());
  const local = useSyncExternalStore(store.subscribe, store.get, noValue);
  return local ?? initial;
}

let supabase: ReturnType<typeof createClient> | null = null;
const sb = () => (supabase ??= createClient());

/** Kết quả ghi dữ liệu: null = thành công, chuỗi = thông báo lỗi để hiện cho admin */
export type SaveResult = string | null;

function saveError(error: { code?: string; message?: string } | null): SaveResult {
  if (!error) return null;
  console.error(error);
  if (error.code === "42501") return "Bạn không có quyền sửa dữ liệu này — hãy đăng nhập bằng tài khoản quản trị";
  if (error.code === "23503") return "Không thể xóa: vẫn còn sản phẩm thuộc nhóm này";
  if (error.code === "23505") return "Dữ liệu bị trùng (ví dụ tên sản phẩm đã tồn tại)";
  return "Lưu thất bại, vui lòng thử lại";
}

async function saveContent(key: string, value: unknown): Promise<SaveResult> {
  const { error } = await sb()
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  return saveError(error);
}

// ─── Dữ liệu còn lưu tạm localStorage (phần 3 sẽ chuyển lên Supabase) ───
const asArray =
  <T,>(seed: T[]) =>
  (value: unknown): T[] =>
    Array.isArray(value) ? (value as T[]) : seed;

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

const localStores: PersistentStore<unknown>[] = [
  ordersStore,
  customersStore,
  pointLogsStore,
  requestsStore,
] as PersistentStore<unknown>[];

function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/**
 * Xóa dữ liệu thử (đơn hàng, khách hàng, điểm, yêu cầu đặt bánh) trên trình duyệt này, quay về dữ liệu mẫu.
 * Không đụng tới sản phẩm, nội dung và cài đặt — những phần đó đã lưu thật trên Supabase.
 */
export function resetAllData() {
  localStores.forEach((s) => s.reset());
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
  return useRemote(productsRemote, (d) => d.products);
}

/** Tải lại danh sách sản phẩm từ Supabase sau khi admin thêm/sửa/xóa */
async function reloadProducts() {
  productsRemote.set(await fetchProducts(sb()));
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

function useGroups(): ProductGroupContent[] {
  return useRemote(groupsRemote, (d) => d.groups);
}

/**
 * Các nhóm sản phẩm hiển thị ở cửa hàng: bỏ sản phẩm ẩn và nhóm rỗng.
 * Danh sách nhóm (thêm/xóa/đổi tên/sắp xếp) do admin toàn quyền quản lý ở
 * /admin/noi-dung-trang-san-pham — bảng product_groups là nguồn duy nhất cho việc nhóm nào tồn tại.
 * Sản phẩm được xếp vào nhóm qua product.subcategory === group.id (id cố định, không đổi khi
 * admin đổi tên nhóm), nên đổi tên nhóm không làm sản phẩm "lạc" khỏi nhóm của nó.
 */
export function useProductGroups(category: "Bánh" | "Đồ uống"): ProductCategoryGroup[] {
  const products = useProducts();
  const groups = useGroups();
  return useMemo(
    () =>
      groups
        .filter((g) => g.category === category)
        .map((g) => ({
          id: g.id,
          category: g.category,
          title: g.title,
          description: g.description,
          products: products.filter((p) => p.subcategory === g.id && getProductStatus(p) !== "hidden"),
        }))
        .filter((g) => g.products.length > 0),
    [products, groups, category],
  );
}

/** Nhãn nhỏ phía trên 2 badge chọn danh mục ở trang /san-pham */
export function useCategoryPickerLabel(): string {
  return useRemote(pickerLabelRemote, (d) => d.categoryPickerLabel);
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
  const groups = useGroups();
  return useMemo(() => groups.map((g) => ({ id: g.id, category: g.category, value: g.id, label: g.title })), [groups]);
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

/** Thêm mới (không có id) hoặc cập nhật sản phẩm trên Supabase. */
export async function saveProduct(input: ProductInput): Promise<SaveResult> {
  const sizes = input.sizes?.filter((s) => s.label.trim());
  const price = sizes && sizes.length > 0 ? Math.min(...sizes.map((s) => s.price)) : input.price;
  const row = productToRow({ ...input, sizes, price });

  if (input.id !== undefined) {
    const { error } = await sb().from("products").update(row).eq("id", input.id);
    if (error) return saveError(error);
  } else {
    const { data: existing, error: slugError } = await sb().from("products").select("slug");
    if (slugError) return saveError(slugError);
    const used = new Set((existing as { slug: string }[]).map((r) => r.slug));
    const baseSlug = slugify(input.name) || `san-pham-${Date.now().toString(36)}`;
    let slug = baseSlug;
    for (let i = 2; used.has(slug); i++) slug = `${baseSlug}-${i}`;
    const { error } = await sb()
      .from("products")
      .insert({ ...row, slug, rating: input.rating ?? 5, reviews: input.reviews ?? 0 });
    if (error) return saveError(error);
  }
  await reloadProducts();
  return null;
}

export async function deleteProducts(ids: number[]): Promise<SaveResult> {
  const { error } = await sb().from("products").delete().in("id", ids);
  if (error) return saveError(error);
  await reloadProducts();
  return null;
}

export async function setProductsStatus(ids: number[], status: ProductStatus): Promise<SaveResult> {
  const { error } = await sb().from("products").update({ status }).in("id", ids);
  if (error) return saveError(error);
  await reloadProducts();
  return null;
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
  return useRemote(homeRemote, (d) => d.home);
}
export async function saveHomeContent(content: HomeContent): Promise<SaveResult> {
  const error = await saveContent("home", content);
  if (!error) homeRemote.set(content);
  return error;
}

export function useAboutContent(): AboutContent {
  return useRemote(aboutRemote, (d) => d.about);
}
export async function saveAboutContent(content: AboutContent): Promise<SaveResult> {
  const error = await saveContent("about", content);
  if (!error) aboutRemote.set(content);
  return error;
}

/** Nội dung trang /san-pham: nhãn chọn danh mục (site_content) + danh sách nhóm (bảng product_groups) */
export function useProductsPageContent(): ProductsPageContent {
  const categoryPickerLabel = useCategoryPickerLabel();
  const groups = useGroups();
  return useMemo(() => ({ categoryPickerLabel, groups }), [categoryPickerLabel, groups]);
}

/**
 * Lưu nhãn + đồng bộ danh sách nhóm: thêm/sửa/sắp xếp theo thứ tự admin đặt, xóa nhóm không còn trong danh sách.
 * Database chặn xóa nhóm vẫn còn sản phẩm (khóa ngoại) → trả về lỗi thay vì làm lạc sản phẩm.
 */
export async function saveProductsPageContent(content: ProductsPageContent): Promise<SaveResult> {
  const labelError = await saveContent("products_page", { categoryPickerLabel: content.categoryPickerLabel });
  if (labelError) return labelError;
  pickerLabelRemote.set(content.categoryPickerLabel);

  const rows = content.groups.map((g, i) => ({ ...g, sort_order: i }));
  if (rows.length > 0) {
    const { error } = await sb().from("product_groups").upsert(rows);
    if (error) return saveError(error);
  }
  const keep = content.groups.map((g) => g.id);
  let removal = sb().from("product_groups").delete();
  removal = keep.length > 0 ? removal.not("id", "in", `(${keep.map((id) => `"${id}"`).join(",")})`) : removal.neq("id", "");
  const { error: deleteError } = await removal;
  if (deleteError) return saveError(deleteError);

  groupsRemote.set(content.groups);
  return null;
}

export function useSiteSettings(): SiteSettings {
  return useRemote(settingsRemote, (d) => d.settings);
}
export async function saveSiteSettings(settings: SiteSettings): Promise<SaveResult> {
  const error = await saveContent("settings", settings);
  if (!error) settingsRemote.set(settings);
  return error;
}

/** Danh sách đánh giá (để trang chủ hiện và admin chọn đánh giá nổi bật) */
export function useReviews(): Review[] {
  return usePublicData().reviews;
}
