// ============================================================
//  Lớp truy cập dữ liệu dùng chung — cửa hàng và khu admin cùng đọc/ghi Supabase qua đây.
//
//  - Dữ liệu công khai (sản phẩm, nhóm, đánh giá, nội dung trang, cài đặt): layout gốc tải sẵn trên server
//    (src/app/layout.tsx → PublicDataProvider); admin lưu → ghi Supabase → cập nhật bản sao trong trình duyệt.
//  - Dữ liệu riêng (đơn hàng, khách hàng, điểm, yêu cầu đặt bánh): tải trong trình duyệt theo tài khoản
//    đang đăng nhập; RLS tự lọc — khách chỉ thấy dữ liệu của mình, admin thấy tất cả.
//  - Đặt hàng đi qua hàm place_order() trong database: giá lấy từ bảng products, khách không sửa được.
// ============================================================

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePublicData } from "@/components/PublicDataProvider";
import { useAuth } from "@/lib/auth";
import type { Product, ProductCategoryGroup, ProductStatus, Review } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { fetchProducts, fetchPublicData, productToRow, type PublicData } from "@/lib/supabase/public-data";
import type {
  AboutContent,
  CustomOrderContent,
  HomeContent,
  LoyaltyConfig,
  ProductGroupContent,
  ProductsPageContent,
  SiteSettings,
} from "@/types/content";
import type { CustomOrderRequest, CustomOrderStatus } from "@/types/custom-order";
import type { FulfillmentMethod, Order, OrderDiscount, OrderStatus, PaymentMethod } from "@/types/order";
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
const loyaltyRemote = createRemoteStore<LoyaltyConfig>();
const customOrderRemote = createRemoteStore<CustomOrderContent>();
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
  // Lỗi nghiệp vụ do database báo (raise exception) đã viết sẵn bằng tiếng Việt
  if (error.code === "P0001" && error.message) return error.message;
  if (error.code === "42501") return "Bạn không có quyền sửa dữ liệu này — hãy đăng nhập bằng tài khoản quản trị";
  if (error.code === "23503") return "Không thể xóa: vẫn còn sản phẩm thuộc nhóm này";
  if (error.code === "23505") return "Dữ liệu bị trùng (ví dụ tên sản phẩm đã tồn tại)";
  // Thiếu cột / bảng: web đã cập nhật nhưng database chưa chạy file SQL mới trong supabase/migrations
  if (error.code === "PGRST204" || error.code === "42703" || error.code === "PGRST202" || error.code === "42P01") {
    return "Database chưa được cập nhật — cần chạy file SQL mới nhất trong supabase/migrations trên Supabase";
  }
  return "Lưu thất bại, vui lòng thử lại";
}

async function saveContent(key: string, value: unknown): Promise<SaveResult> {
  const { error } = await sb()
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  return saveError(error);
}

// ─── Dữ liệu riêng theo tài khoản đang đăng nhập ─────────────
// Tải khi có component cần, tải lại khi đổi tài khoản, khi quay lại tab, và sau mỗi lần ghi.

interface QueryStore<T> {
  use: () => T;
  reload: () => Promise<void>;
}

function createQuery<T>(fetcher: () => Promise<T>, empty: T): QueryStore<T> {
  let key: string | null = null;
  let data = empty;
  let loadId = 0;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  async function load() {
    if (!key) return;
    const id = ++loadId;
    try {
      const next = await fetcher();
      if (id === loadId) {
        data = next;
        emit();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function ensure(nextKey: string) {
    if (nextKey === key) return;
    key = nextKey;
    data = empty;
    emit();
    void load();
  }

  const onFocus = () => void load();

  function subscribe(listener: () => void) {
    if (listeners.size === 0) window.addEventListener("focus", onFocus);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("focus", onFocus);
    };
  }

  return {
    use() {
      const { user } = useAuth();
      const userKey = user?.email ?? "";
      useEffect(() => ensure(userKey), [userKey]);
      return useSyncExternalStore(
        subscribe,
        () => (key === userKey ? data : empty),
        () => empty,
      );
    },
    reload: load,
  };
}

const EMPTY_ORDERS: Order[] = [];
const EMPTY_CUSTOMERS: Customer[] = [];
const EMPTY_POINT_LOGS: PointTransaction[] = [];
const EMPTY_REQUESTS: CustomOrderRequest[] = [];

interface OrderRow {
  id: string;
  created_at: string;
  items: Order["items"];
  subtotal: number;
  voucher_code: string | null;
  discount: number;
  total: number;
  status: OrderStatus;
  fulfillment: FulfillmentMethod;
  address: string | null;
  receive_date: string;
  receive_time: string;
  note: string | null;
  payment_method: PaymentMethod;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  discount_details: OrderDiscount[] | null;
  points_redeemed: number | null;
}

function orderFromRow(r: OrderRow): Order {
  return {
    id: r.id,
    createdAt: r.created_at,
    items: r.items,
    subtotal: r.subtotal,
    voucherCode: r.voucher_code ?? undefined,
    discount: r.discount,
    total: r.total,
    status: r.status,
    fulfillment: r.fulfillment,
    address: r.address ?? undefined,
    receiveDate: r.receive_date,
    receiveTime: r.receive_time,
    note: r.note ?? undefined,
    paymentMethod: r.payment_method,
    customerName: r.customer_name ?? undefined,
    customerPhone: r.customer_phone ?? undefined,
    customerEmail: r.customer_email ?? undefined,
    discountDetails: r.discount_details && r.discount_details.length > 0 ? r.discount_details : undefined,
    pointsRedeemed: r.points_redeemed ?? undefined,
  };
}

const ordersQuery = createQuery(async () => {
  const { data, error } = await sb().from("orders").select("*").order("placed_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(orderFromRow);
}, EMPTY_ORDERS);

const customersQuery = createQuery(async () => {
  const { data, error } = await sb().from("customers").select("id, full_name, email, phone, created_at").order("id");
  if (error) throw error;
  return (data as { id: string; full_name: string; email: string; phone: string; created_at: string }[]).map(
    (r): Customer => ({ id: r.id, fullName: r.full_name, email: r.email, phone: r.phone, createdAt: r.created_at }),
  );
}, EMPTY_CUSTOMERS);

const pointLogsQuery = createQuery(async () => {
  const { data, error } = await sb().from("point_logs").select("*").order("date").order("id");
  if (error) throw error;
  return (
    data as {
      id: string;
      email: string;
      date: string;
      title: string;
      points: number;
      kind: PointTransaction["kind"];
      order_id: string | null;
      reason: string | null;
    }[]
  ).map(
    (r): PointTransaction => ({
      id: r.id,
      email: r.email,
      date: r.date,
      title: r.title,
      points: r.points,
      kind: r.kind,
      orderId: r.order_id ?? undefined,
      reason: r.reason ?? undefined,
    }),
  );
}, EMPTY_POINT_LOGS);

const requestsQuery = createQuery(async () => {
  const { data, error } = await sb().from("custom_requests").select("*").order("placed_at", { ascending: false });
  if (error) throw error;
  return (
    data as {
      id: string;
      created_at: string;
      customer_name: string;
      phone: string;
      customer_email: string | null;
      occasion: string;
      delivery_date: string;
      size_guest_count: string;
      flavor: string;
      budget: string;
      notes: string;
      reference_image: string | null;
      status: CustomOrderStatus;
      quoted_price: number | null;
    }[]
  ).map(
    (r): CustomOrderRequest => ({
      id: r.id,
      createdAt: r.created_at,
      customerName: r.customer_name,
      phone: r.phone,
      customerEmail: r.customer_email ?? undefined,
      occasion: r.occasion,
      deliveryDate: r.delivery_date,
      sizeGuestCount: r.size_guest_count,
      flavor: r.flavor,
      budget: r.budget,
      notes: r.notes,
      referenceImage: r.reference_image ?? undefined,
      status: r.status,
      quotedPrice: r.quoted_price ?? undefined,
    }),
  );
}, EMPTY_REQUESTS);

const emailKey = (email: string | undefined) => (email ?? "").trim().toLowerCase();

// ═════════════════════════ SẢN PHẨM ═════════════════════════

export function useProducts(): Product[] {
  return useRemote(productsRemote, (d) => d.products);
}

/** Tải lại danh sách sản phẩm từ Supabase sau khi admin thêm/sửa/xóa */
async function reloadProducts() {
  productsRemote.set(await fetchProducts(sb()));
}

/**
 * Tải lại toàn bộ sản phẩm, nhóm, nội dung trang, cài đặt từ Supabase — để khu admin luôn khớp với database
 * (sửa ở tab khác, lần lưu trước bị lỗi giữa chừng...). Khu admin gọi khi chuyển trang và khi quay lại tab.
 */
export async function refreshCatalog() {
  try {
    const data = await fetchPublicData(sb());
    productsRemote.set(data.products);
    groupsRemote.set(data.groups);
    homeRemote.set(data.home);
    aboutRemote.set(data.about);
    settingsRemote.set(data.settings);
    loyaltyRemote.set(data.loyalty);
    customOrderRemote.set(data.customOrder);
    pickerLabelRemote.set(data.categoryPickerLabel);
  } catch (error) {
    console.error("Không tải lại được dữ liệu từ Supabase", error);
  }
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

/** Tùy chọn mặc định (lựa chọn đầu tiên của mỗi nhóm) — dùng khi thêm nhanh vào giỏ */
export function defaultOptions(p: Pick<Product, "options">): Record<string, string> | undefined {
  const groups = (p.options ?? []).filter((g) => g.choices.length > 0);
  if (groups.length === 0) return undefined;
  return Object.fromEntries(groups.map((g) => [g.name, g.choices[0].label]));
}

/** Tổng phụ thu của các tùy chọn đã chọn (nhóm nào chưa chọn thì tính lựa chọn đầu tiên) */
export function optionsExtra(p: Pick<Product, "options">, chosen?: Record<string, string>): number {
  return (p.options ?? []).reduce((sum, g) => {
    const label = chosen?.[g.name] ?? g.choices[0]?.label;
    return sum + (g.choices.find((c) => c.label === label)?.price ?? 0);
  }, 0);
}

/** Đơn giá theo cỡ + tùy chọn đã chọn */
export function unitPriceFor(
  p: Pick<Product, "price" | "sizes" | "options">,
  size?: string,
  chosen?: Record<string, string>,
): number {
  return priceForSize(p, size) + optionsExtra(p, chosen);
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

/**
 * Tra sản phẩm theo danh sách slug (giữ thứ tự, bỏ sản phẩm ẩn / không còn tồn tại).
 * fallbackCount: nếu không còn món nào hợp lệ (vd admin xóa hết sản phẩm cũ mà chưa chọn lại) thì lấy
 * tạm các món đang bán đầu tiên, để khối trên trang chủ không bị trống.
 */
export function useProductsBySlugs(slugs: string[], fallbackCount?: number): Product[] {
  const products = useProducts();
  return useMemo(() => {
    const picked = slugs
      .map((slug) => products.find((p) => p.slug === slug))
      .filter((p): p is Product => !!p && getProductStatus(p) !== "hidden");
    if (picked.length > 0 || !fallbackCount) return picked;
    return products.filter((p) => getProductStatus(p) !== "hidden").slice(0, fallbackCount);
  }, [products, slugs, fallbackCount]);
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
// Hồ sơ khách (bảng customers) do database tự tạo khi khách đăng ký hoặc đặt đơn đầu tiên.

export function useCustomers(): Customer[] {
  return customersQuery.use();
}

export function usePointLogs(): PointTransaction[] {
  return pointLogsQuery.use();
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
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id, undefined, { numeric: true }));
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

/** Quy tắc tích điểm: 1.000đ = 1 điểm (chỉ cộng khi đơn "Đã giao") — database dùng đúng quy tắc này */
// ─── Chương trình thành viên (cấu hình: site_content 'loyalty', admin sửa ở /admin/tich-diem) ───

export function useLoyaltyConfig(): LoyaltyConfig {
  return useRemote(loyaltyRemote, (d) => d.loyalty);
}

export async function saveLoyaltyConfig(config: LoyaltyConfig): Promise<SaveResult> {
  const error = await saveContent("loyalty", config);
  if (!error) loyaltyRemote.set(config);
  return error;
}

/** Số điểm nhận được cho một đơn (database cộng đúng theo công thức này khi đơn "Đã giao") */
export const pointsForOrder = (total: number, config: Pick<LoyaltyConfig, "pointRateVnd">) =>
  Math.floor(total / Math.max(1, config.pointRateVnd));

/** Tổng điểm đã tích (xét hạng) — không trừ điểm đã đổi quà, không tính điểm hoàn lại */
export function lifetimePoints(logs: PointTransaction[], email: string | undefined): number {
  const key = emailKey(email);
  return logs
    .filter((l) => emailKey(l.email) === key && l.points > 0 && l.kind !== "redeem")
    .reduce((sum, l) => sum + l.points, 0);
}

export type TierKey = "new" | "loyal" | "vip";
export const TIER_NAMES: Record<TierKey, string> = { new: "Thành viên mới", loyal: "Thân thiết", vip: "VIP" };

export function tierFor(lifetime: number, config: LoyaltyConfig) {
  const key: TierKey =
    lifetime >= config.vipMinPoints ? "vip" : lifetime >= config.loyalMinPoints ? "loyal" : "new";
  const nextMin = key === "new" ? config.loyalMinPoints : key === "loyal" ? config.vipMinPoints : undefined;
  const prevMin = key === "loyal" ? config.loyalMinPoints : 0;
  return {
    key,
    name: TIER_NAMES[key],
    nextTier: key === "new" ? TIER_NAMES.loyal : key === "loyal" ? TIER_NAMES.vip : undefined,
    pointsNeeded: nextMin !== undefined ? Math.max(0, nextMin - lifetime) : undefined,
    progressPercentage:
      nextMin !== undefined ? Math.min(100, Math.round(((lifetime - prevMin) / Math.max(1, nextMin - prevMin)) * 100)) : undefined,
  };
}

/** Điểm, hạng và quyền lợi của tài khoản đang đăng nhập */
export function useMembership(email: string | undefined) {
  const logs = usePointLogs();
  const config = useLoyaltyConfig();
  return useMemo(() => {
    const balance = pointBalance(logs, email);
    const lifetime = lifetimePoints(logs, email);
    return { balance, lifetime, tier: tierFor(lifetime, config), config };
  }, [logs, email, config]);
}

/** Admin cộng (points > 0) hoặc trừ (points < 0) điểm thủ công, kèm lý do. Database chặn trừ quá số dư. */
export async function adjustPoints(
  email: string,
  points: number,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isInteger(points) || points === 0) return { ok: false, error: "Số điểm phải là số nguyên khác 0" };
  if (!reason.trim()) return { ok: false, error: "Vui lòng nhập lý do" };
  const { error } = await sb()
    .from("point_logs")
    .insert({
      email,
      points,
      kind: "manual",
      title: points > 0 ? "Admin cộng điểm" : "Admin trừ điểm",
      reason: reason.trim(),
    });
  if (error) return { ok: false, error: saveError(error) ?? "Lưu thất bại" };
  await pointLogsQuery.reload();
  return { ok: true };
}

// ═════════════════════════ ĐƠN HÀNG ═════════════════════════

export function useOrders(): Order[] {
  return ordersQuery.use();
}

export interface PlaceOrderInput {
  items: { slug: string; size?: string; quantity: number; options?: Record<string, string> }[];
  voucherCode?: string;
  fulfillment: FulfillmentMethod;
  address?: string;
  receiveDate: string;
  receiveTime: string;
  note?: string;
  paymentMethod: PaymentMethod;
  /** Vị trí món trong items muốn đổi điểm lấy 1 cái miễn phí */
  redeemIndex?: number;
  /** Dùng ưu đãi sinh nhật VIP cho đơn này */
  useBirthday?: boolean;
}

/** Đặt đơn: database tự tính giá, đổi điểm, ưu đãi thành viên, voucher, tổng tiền và gán đơn cho tài khoản đang đăng nhập. */
export async function placeOrder(input: PlaceOrderInput): Promise<{ order: Order } | { error: string }> {
  const { data, error } = await sb().rpc("place_order", {
    p_items: input.items,
    p_voucher: input.voucherCode ?? null,
    p_fulfillment: input.fulfillment,
    p_address: input.address ?? null,
    p_receive_date: input.receiveDate,
    p_receive_time: input.receiveTime,
    p_note: input.note ?? null,
    p_payment: input.paymentMethod,
    p_redeem_index: input.redeemIndex ?? null,
    p_use_birthday: input.useBirthday ?? false,
  });
  if (error) return { error: saveError(error) ?? "Đặt hàng thất bại, vui lòng thử lại" };
  void ordersQuery.reload();
  if (input.redeemIndex !== undefined) void pointLogsQuery.reload();
  return { order: orderFromRow(data as OrderRow) };
}

/** Số tiền giảm của một mã voucher đang hoạt động, hoặc null nếu mã không hợp lệ */
export async function checkVoucher(code: string): Promise<number | null> {
  const { data, error } = await sb().rpc("check_voucher", { p_code: code.trim() });
  if (error) {
    console.error(error);
    return null;
  }
  return typeof data === "number" ? data : null;
}

/**
 * Đổi trạng thái đơn: chỉ từ "Chờ xử lý" → "Đã giao" hoặc "Đã hủy" (database chặn đổi đơn đã kết thúc).
 * Khi sang "Đã giao", database tự cộng điểm cho khách (theo cấu hình tích điểm, mỗi đơn một lần);
 * khi "Đã hủy", database hoàn lại điểm khách đã đổi trong đơn.
 */
export async function setOrderStatus(
  orderId: string,
  next: Exclude<OrderStatus, "Chờ xử lý">,
): Promise<{ ok: true; pointsAwarded: number } | { ok: false; error: string }> {
  const { data, error } = await sb()
    .from("orders")
    .update({ status: next })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: saveError(error) ?? "Lưu thất bại" };
  if (!data) return { ok: false, error: "Không tìm thấy đơn hàng" };
  await Promise.all([ordersQuery.reload(), pointLogsQuery.reload(), customersQuery.reload()]);
  let pointsAwarded = 0;
  if (next === "Đã giao") {
    const { data: log } = await sb()
      .from("point_logs")
      .select("points")
      .eq("order_id", orderId)
      .eq("kind", "order")
      .maybeSingle();
    pointsAwarded = log?.points ?? 0;
  }
  return { ok: true, pointsAwarded };
}

// ═════════════════════════ BÁNH ĐẶT THEO YÊU CẦU ═════════════════════════

export function useCustomRequests(): CustomOrderRequest[] {
  return requestsQuery.use();
}

export type CustomRequestInput = Omit<CustomOrderRequest, "id" | "createdAt" | "status" | "quotedPrice">;

/** Form /dat-theo-yeu-cau gọi hàm này: yêu cầu mới có trạng thái "Mới" (khách chưa đăng nhập cũng gửi được). */
export async function addCustomRequest(input: CustomRequestInput): Promise<SaveResult> {
  const { error } = await sb()
    .from("custom_requests")
    .insert({
      customer_name: input.customerName,
      phone: input.phone,
      occasion: input.occasion,
      delivery_date: input.deliveryDate,
      size_guest_count: input.sizeGuestCount,
      flavor: input.flavor,
      budget: input.budget,
      notes: input.notes,
      reference_image: input.referenceImage ?? null,
    });
  if (error) return saveError(error);
  void requestsQuery.reload();
  return null;
}

export async function updateCustomRequest(
  id: string,
  patch: Partial<Pick<CustomOrderRequest, "status" | "quotedPrice">>,
): Promise<SaveResult> {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.quotedPrice !== undefined) row.quoted_price = patch.quotedPrice;
  const { error } = await sb().from("custom_requests").update(row).eq("id", id);
  if (error) return saveError(error);
  await requestsQuery.reload();
  return null;
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
  const result = await writeProductsPageContent(content);
  // Lưu xong (kể cả lỗi giữa chừng) luôn đọc lại từ database để giao diện admin khớp với dữ liệu thật
  await refreshCatalog();
  if (result) return result;

  // Đối chiếu: tên / thứ tự nhóm trên database phải đúng như admin vừa lưu
  const { data, error } = await sb().from("product_groups").select("id, title").order("sort_order").order("id");
  if (error) return saveError(error);
  const saved = (data as { id: string; title: string }[]).map((g) => `${g.id}|${g.title}`).join(",");
  const wanted = content.groups.map((g) => `${g.id}|${g.title}`).join(",");
  if (saved !== wanted) return "Chưa lưu được hết thay đổi của nhóm — vui lòng tải lại trang và thử lại";
  return null;
}

async function writeProductsPageContent(content: ProductsPageContent): Promise<SaveResult> {
  const labelError = await saveContent("products_page", { categoryPickerLabel: content.categoryPickerLabel });
  if (labelError) return labelError;

  const rows = content.groups.map((g, i) => ({ ...g, sort_order: i }));
  if (rows.length > 0) {
    const { error } = await sb().from("product_groups").upsert(rows);
    if (error) return saveError(error);
  }
  const keep = content.groups.map((g) => g.id);
  let removal = sb().from("product_groups").delete();
  removal = keep.length > 0 ? removal.not("id", "in", `(${keep.map((id) => `"${id}"`).join(",")})`) : removal.neq("id", "");
  const { error: deleteError } = await removal;
  return saveError(deleteError);
}

/** Nội dung trang /dat-theo-yeu-cau */
export function useCustomOrderContent(): CustomOrderContent {
  return useRemote(customOrderRemote, (d) => d.customOrder);
}
export async function saveCustomOrderContent(content: CustomOrderContent): Promise<SaveResult> {
  const error = await saveContent("custom_order", content);
  if (!error) customOrderRemote.set(content);
  return error;
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
