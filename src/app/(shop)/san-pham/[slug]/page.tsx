import type { Metadata } from "next";
import ProductDetail from "@/components/product/ProductDetail";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

// Tiêu đề / mô tả / ảnh khi chia sẻ link sản phẩm (Zalo, Facebook...) và cho Google
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description, image")
    .eq("slug", decodeURIComponent(slug))
    .maybeSingle();
  if (!data) return { title: "Không tìm thấy sản phẩm · Cari Bakehouse" };
  return {
    title: `${data.name} · Cari Bakehouse`,
    description: data.description ?? undefined,
    openGraph: { title: data.name, description: data.description ?? undefined, images: data.image ? [data.image] : undefined },
  };
}

// Trang chi tiết sản phẩm: dữ liệu sản phẩm lấy từ dữ liệu công khai layout đã tải sẵn (ProductDetail)
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetail slug={decodeURIComponent(slug)} />;
}
