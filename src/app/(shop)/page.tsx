import HeroSlider from "@/components/home/HeroSlider";
import FeatureStrip from "@/components/home/FeatureStrip";
import DualBanner from "@/components/home/DualBanner";
import TopOrder from "@/components/home/TopOrder";
import ProductMenu from "@/components/home/ProductMenu";
import CustomOrderBanner from "@/components/home/CustomOrderBanner";
import Gallery from "@/components/home/Gallery";
import AboutSnippet from "@/components/home/AboutSnippet";
import Reviews from "@/components/home/Reviews";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Cari Bakehouse · Tiệm bánh thủ công tại Hà Nội",
  description:
    "Tiệm bánh thủ công ở Tô Vĩnh Diện, Hà Nội: cheesecake, brownies, bánh sinh nhật theo yêu cầu và đồ uống. Bánh làm theo đơn từ nguyên liệu nhập khẩu, không chất bảo quản.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      {/* Tiêu đề chính cho Google / trình đọc màn hình — banner là ảnh nên ẩn chữ */}
      <h1 className="sr-only">Cari Bakehouse – tiệm bánh thủ công tại Hà Nội</h1>

      {/* 2. Hero Slider */}
      <HeroSlider />

      {/* 3. Feature Strip */}
      <FeatureStrip />

      {/* 4. Dual Category Banner */}
      <DualBanner />

      {/* 5. Top Order (Best-sellers) */}
      <TopOrder />

      {/* 6. Product Menu Grid */}
      <ProductMenu />

      {/* 7. Custom Order Banner */}
      <CustomOrderBanner />

      {/* 8. Gallery */}
      <Gallery />

      {/* 9. About Snippet */}
      <AboutSnippet />

      {/* 10. Customer Reviews */}
      <Reviews />
    </>
  );
}
