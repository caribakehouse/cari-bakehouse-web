import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import type { ProductSize } from "@/lib/mock-data";

type Props = { params: Promise<{ slug: string }> };

interface ProductSeoRow {
  slug: string;
  name: string;
  description: string | null;
  image: string;
  price: number;
  sizes: ProductSize[] | null;
  status: "active" | "soldout" | "hidden";
}

// Dùng chung cho generateMetadata và trang (cache → chỉ hỏi database 1 lần mỗi lượt mở trang)
const getProduct = cache(async (slug: string): Promise<ProductSeoRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug, name, description, image, price, sizes, status")
    .eq("slug", slug)
    .maybeSingle();
  return (data as ProductSeoRow | null) ?? null;
});

const productPath = (slug: string) => `/san-pham/${encodeURIComponent(slug)}`;

// Tiêu đề / mô tả / ảnh khi chia sẻ link sản phẩm (Zalo, Facebook...) và cho Google
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(decodeURIComponent(slug));
  if (!data) return { title: { absolute: `Không tìm thấy sản phẩm · ${SITE_NAME}` }, robots: { index: false } };
  // Ghi đủ đuôi tên tiệm: layout /san-pham đặt tiêu đề riêng nên mẫu " · Cari Bakehouse" không tự áp xuống đây
  return pageMetadata({
    title: `${data.name} · ${SITE_NAME}`,
    absoluteTitle: true,
    description: data.description || `${data.name}: bánh làm thủ công tại ${BUSINESS.name}, Hà Nội. Đặt online, giao tận nơi.`,
    path: productPath(data.slug),
    image: data.image || undefined,
    noindex: data.status === "hidden",
  });
}

/** Dữ liệu sản phẩm cho Google: tên, ảnh, giá (VND), còn hàng hay không. Nhiều cỡ → khoảng giá. */
function productJsonLd(p: ProductSeoRow) {
  const url = `${SITE_URL}${productPath(p.slug)}`;
  const prices = p.sizes && p.sizes.length > 0 ? p.sizes.map((s) => s.price) : [p.price];
  const availability = p.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const seller = { "@id": `${SITE_URL}/#bakery` };
  const offers =
    prices.length > 1
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "VND",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: prices.length,
          availability,
          url,
          seller,
        }
      : { "@type": "Offer", priceCurrency: "VND", price: prices[0], availability, url, seller };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    image: p.image ? [p.image] : undefined,
    url,
    brand: { "@type": "Brand", name: BUSINESS.name },
    offers,
  };
}

// Trang chi tiết sản phẩm: dữ liệu sản phẩm lấy từ dữ liệu công khai layout đã tải sẵn (ProductDetail)
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const product = await getProduct(decoded);
  // Sản phẩm không tồn tại → trả mã 404 thật (tránh "soft 404" với Google)
  if (!product) notFound();
  return (
    <>
      {product.status !== "hidden" && <JsonLd data={productJsonLd(product)} />}
      <ProductDetail slug={decoded} />
    </>
  );
}
