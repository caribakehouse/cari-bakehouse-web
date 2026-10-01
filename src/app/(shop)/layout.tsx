import Topbar from "@/components/layout/Topbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FloatingContact from "@/components/layout/FloatingContact";

// Khung khu cửa hàng (công khai)
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Topbar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
      <FloatingContact />
    </>
  );
}
