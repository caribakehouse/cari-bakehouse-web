import HeroSlider from "@/components/home/HeroSlider";
import FeatureStrip from "@/components/home/FeatureStrip";
import DualBanner from "@/components/home/DualBanner";
import TopOrder from "@/components/home/TopOrder";
import ProductMenu from "@/components/home/ProductMenu";
import CustomOrderBanner from "@/components/home/CustomOrderBanner";
import Gallery from "@/components/home/Gallery";
import AboutSnippet from "@/components/home/AboutSnippet";
import Reviews from "@/components/home/Reviews";

export const metadata = {
  title: "Trang chủ · Cari Bakehouse",
  description:
    "Cari Bakehouse — Tiệm bánh thủ công Hà Nội. Bánh tươi làm theo đơn, nguyên liệu nhập khẩu, không chất bảo quản. Đặt bánh sinh nhật, bánh theo yêu cầu.",
};

export default function HomePage() {
  return (
    <>
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
