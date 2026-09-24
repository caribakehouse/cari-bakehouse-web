// Dữ liệu công khai của cửa hàng (sản phẩm, nhóm, đánh giá, nội dung trang, cài đặt) đọc từ Supabase.
// Dùng được cả trên server (layout gốc tải sẵn khi mở trang) lẫn trình duyệt (tải lại sau khi admin lưu).

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SEED_ABOUT_CONTENT,
  SEED_HOME_CONTENT,
  SEED_PRODUCTS_PAGE_CONTENT,
  SEED_SITE_SETTINGS,
  type Product,
  type Review,
} from "@/lib/mock-data";
import type { AboutContent, HomeContent, ProductGroupContent, SiteSettings } from "@/types/content";

export interface PublicData {
  products: Product[];
  groups: ProductGroupContent[];
  reviews: Review[];
  home: HomeContent;
  about: AboutContent;
  settings: SiteSettings;
  categoryPickerLabel: string;
}

export interface ProductRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string;
  badge: string | null;
  rating: number | string;
  reviews: number;
  sizes: { label: string; price: number }[] | null;
  stock: number | null;
  status: "active" | "soldout" | "hidden";
}

export function productFromRow(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory ?? undefined,
    description: r.description ?? undefined,
    price: r.price,
    originalPrice: r.original_price ?? undefined,
    image: r.image,
    badge: r.badge ?? undefined,
    rating: Number(r.rating),
    reviews: r.reviews,
    sizes: r.sizes && r.sizes.length > 0 ? r.sizes : undefined,
    stock: r.stock ?? undefined,
    status: r.status,
  };
}

export function productToRow(p: Omit<Product, "id" | "slug" | "rating" | "reviews">) {
  return {
    name: p.name,
    category: p.category,
    subcategory: p.subcategory ?? null,
    description: p.description ?? null,
    price: p.price,
    original_price: p.originalPrice ?? null,
    image: p.image,
    badge: p.badge ?? null,
    sizes: p.sizes && p.sizes.length > 0 ? p.sizes : null,
    stock: p.stock ?? null,
    status: p.status ?? "active",
  };
}

export async function fetchProducts(sb: SupabaseClient): Promise<Product[]> {
  const { data, error } = await sb.from("products").select("*").order("id");
  if (error) throw error;
  return (data as ProductRow[]).map(productFromRow);
}

export async function fetchGroups(sb: SupabaseClient): Promise<ProductGroupContent[]> {
  const { data, error } = await sb
    .from("product_groups")
    .select("id, category, title, description")
    .order("sort_order")
    .order("id");
  if (error) throw error;
  return data as ProductGroupContent[];
}

export async function fetchReviews(sb: SupabaseClient): Promise<Review[]> {
  const { data, error } = await sb.from("reviews").select("*").order("id");
  if (error) throw error;
  return data as Review[];
}

/** Gộp với dữ liệu mẫu để không vỡ giao diện khi thiếu trường */
const mergeObject = <T extends object>(seed: T, value: unknown): T =>
  value && typeof value === "object" && !Array.isArray(value) ? { ...seed, ...(value as Partial<T>) } : seed;

export async function fetchSiteContent(sb: SupabaseClient) {
  const { data, error } = await sb.from("site_content").select("key, value");
  if (error) throw error;
  const byKey = new Map((data as { key: string; value: unknown }[]).map((r) => [r.key, r.value]));
  return {
    home: mergeObject(SEED_HOME_CONTENT, byKey.get("home")),
    about: mergeObject(SEED_ABOUT_CONTENT, byKey.get("about")),
    settings: mergeObject(SEED_SITE_SETTINGS, byKey.get("settings")),
    categoryPickerLabel: mergeObject(
      { categoryPickerLabel: SEED_PRODUCTS_PAGE_CONTENT.categoryPickerLabel },
      byKey.get("products_page"),
    ).categoryPickerLabel,
  };
}

export async function fetchPublicData(sb: SupabaseClient): Promise<PublicData> {
  const [products, groups, reviews, content] = await Promise.all([
    fetchProducts(sb),
    fetchGroups(sb),
    fetchReviews(sb),
    fetchSiteContent(sb),
  ]);
  return { products, groups, reviews, ...content };
}
