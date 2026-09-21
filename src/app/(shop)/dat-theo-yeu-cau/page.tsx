"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ChevronDown,
  ArrowDown,
  Cake,
  HelpCircle,
  FileCheck,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { addCustomRequest } from "@/lib/db";
import { readImageFile } from "@/lib/utils";

// =============================================================================
// FAQ DỮ LIỆU THẬT
// =============================================================================
const FAQ_ITEMS = [
  {
    question: "Cần đặt bánh trước bao lâu?",
    answer:
      "Tối thiểu 12 tiếng đối với bánh kích thước lớn, và cần thanh toán trước khi tiệm bắt đầu làm bánh.",
  },
  {
    question: "Có cần đặt cọc không?",
    answer:
      "Bánh đặc biệt/đặt theo yêu cầu riêng cần đặt cọc 100% giá trị đơn.",
  },
  {
    question: "Thanh toán bằng cách nào?",
    answer:
      "Chuyển khoản hoặc tiền mặt, xác nhận qua Zalo sau khi thống nhất thiết kế và giá.",
  },
  {
    question: "Sau khi gửi form bao lâu thì được phản hồi?",
    answer:
      "Tiệm sẽ liên hệ tư vấn và báo giá trong vòng 24 giờ.",
  },
];

// =============================================================================
// QUY TRÌNH 5 BƯỚC ĐÃ CHỐT
// =============================================================================
const ORDER_STEPS = [
  {
    step: 1,
    title: "Điền form yêu cầu",
    desc: "Điền form yêu cầu đặt bánh trên website (dịp, ngày nhận, kích thước, vị bánh, ngân sách, ảnh tham khảo).",
  },
  {
    step: 2,
    title: "Tiệm liên hệ tư vấn",
    desc: "Tiệm liên hệ tư vấn và báo giá qua Zalo trong vòng 24 giờ.",
  },
  {
    step: 3,
    title: "Thống nhất & Đặt cọc",
    desc: "Hai bên thống nhất thiết kế, số lượng và giá — bánh đặc biệt cần đặt cọc 100%, bánh kích thước lớn cần đặt trước tối thiểu 12 tiếng và thanh toán trước.",
  },
  {
    step: 4,
    title: "Tiệm làm bánh",
    desc: "Tiệm làm bánh theo đúng yêu cầu đã thống nhất, đảm bảo nguyên liệu tươi mới.",
  },
  {
    step: 5,
    title: "Nhận bánh",
    desc: "Giao bánh tận nơi (khu vực toàn Hà Nội) hoặc khách nhận tại tiệm.",
  },
];

// =============================================================================
// THƯ VIỆN MẪU THAM KHẢO
// =============================================================================
const GALLERY_CATEGORIES = [
  "Tất cả",
  "Sinh nhật",
  "Cưới hỏi",
  "Thôi nôi",
  "Công ty / sự kiện",
];

// TODO: thay bằng ảnh mẫu bánh thật khi shop cung cấp.
const MOCK_GALLERY = [
  { id: 1, tag: "Sinh nhật", title: "Mẫu bánh sinh nhật Pastel bento" },
  { id: 2, tag: "Sinh nhật", title: "Mẫu bánh sinh nhật hoa kem tươi" },
  { id: 3, tag: "Cưới hỏi", title: "Mẫu bánh cưới 2 tầng tối giản sang trọng" },
  { id: 4, tag: "Thôi nôi", title: "Mẫu bánh thôi nôi động vật ngộ nghĩnh" },
  { id: 5, tag: "Công ty / sự kiện", title: "Mẫu bánh logo kỷ niệm công ty" },
  { id: 6, tag: "Sinh nhật", title: "Mẫu bánh Vintage viền ren quý phái" },
  { id: 7, tag: "Cưới hỏi", title: "Mẫu bánh cưới tone trắng kem hoa tươi" },
  { id: 8, tag: "Công ty / sự kiện", title: "Set bánh teabreak sự kiện cao cấp" },
];

export default function BanhDatTheoYeuCauPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form State
  const [formState, setFormState] = useState({
    occasion: "",
    deliveryDate: "",
    sizeGuestCount: "",
    flavor: "",
    budget: "",
    phoneZalo: "",
    notes: "",
  });
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  // Ảnh tham khảo đã thu nhỏ (data URL) để admin xem ở /admin/dat-theo-yeu-cau
  const [referenceImage, setReferenceImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const filteredGallery =
    activeCategory === "Tất cả"
      ? MOCK_GALLERY
      : MOCK_GALLERY.filter((item) => item.tag === activeCategory);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    try {
      setReferenceImage(await readImageFile(file, 640));
    } catch {
      setReferenceImage(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.phoneZalo.trim() || !formState.deliveryDate) {
      alert("Vui lòng điền ngày nhận bánh và số điện thoại / Zalo để tiệm liên hệ.");
      return;
    }

    setIsSubmitting(true);
    // Đây là form gửi yêu cầu tư vấn (không thanh toán trên web)
    // Sau khi gửi, tiệm chủ động liên hệ báo giá qua Zalo trong vòng 24 giờ
    // Yêu cầu được lưu vào dữ liệu chung → hiện ở /admin/dat-theo-yeu-cau với trạng thái "Mới"
    addCustomRequest({
      customerName: user?.fullName ?? "Khách chưa đăng nhập",
      customerEmail: user?.email,
      phone: formState.phoneZalo.trim(),
      occasion: formState.occasion,
      deliveryDate: formState.deliveryDate,
      sizeGuestCount: formState.sizeGuestCount.trim(),
      flavor: formState.flavor.trim(),
      budget: formState.budget.trim(),
      notes: formState.notes.trim(),
      referenceImage,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
      // Reset form
      setFormState({
        occasion: "",
        deliveryDate: "",
        sizeGuestCount: "",
        flavor: "",
        budget: "",
        phoneZalo: "",
        notes: "",
      });
      setSelectedFileName(null);
      setReferenceImage(undefined);
    }, 700);
  };

  const scrollToForm = () => {
    const el = document.getElementById("form-dat-banh");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-[#FFF8EF] text-[#2b2b2b] overflow-x-hidden min-h-screen">
      {/* 1. HERO SECTION (BỎ BREADCRUMB) */}
      <section className="relative overflow-hidden bg-[#FCE9C6] py-16 md:py-24 border-b border-[#E5D9C3]/80">
        <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#F6CE8B]/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#1B4B5A]/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1B4B5A]/15 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B4B5A] shadow-xs backdrop-blur-xs">
            <Cake className="h-3.5 w-3.5 text-[#1B4B5A]" />
            Bánh thiết kế thủ công
          </div>

          <h1 className="font-heading text-3xl font-black text-[#1B4B5A] sm:text-4xl md:text-5xl leading-tight">
            Cari.Bakehouse nhận đặt bánh theo yêu cầu
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#1B4B5A]/80 leading-relaxed">
            Từ chiếc bánh sinh nhật ấm cúng, bánh thôi nôi đáng yêu đến tiệc cưới trang trọng. Hãy chia sẻ ý tưởng của bạn, Cari sẽ biến những khoảnh khắc ngọt ngào thành hiện thực!
          </p>

          <div className="pt-2">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 rounded-full bg-[#1B4B5A] px-8 py-3.5 font-heading text-sm font-bold text-white shadow-md hover:bg-[#1B4B5A]/90 hover:scale-105 active:scale-95 transition-all"
            >
              Gửi yêu cầu ngay
              <ArrowDown className="h-4 w-4 text-[#F6CE8B]" />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* 2. QUY TRÌNH ĐẶT BÁNH (5 BƯỚC) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">
              Quy trình đặt bánh theo yêu cầu
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">
              5 bước đơn giản từ lúc gửi ý tưởng đến khi nhận chiếc bánh hoàn hảo
            </p>
          </div>

          {/* Grid 5 bước */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ORDER_STEPS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border/80 bg-white p-5 shadow-xs flex flex-col items-center text-center hover:border-[#F6CE8B] hover:shadow-sm transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FCE9C6] text-[#1B4B5A] font-heading font-black text-sm border border-[#F6CE8B] mb-3">
                  {item.step}
                </div>
                <h3 className="font-heading text-sm font-bold text-[#1B4B5A] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#2b2b2b]/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* NOTE BOX LƯU Ý */}
          <div className="rounded-2xl border border-amber-300 bg-[#FBF7EA] p-5 sm:p-6 shadow-xs flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6CE8B] text-[#1B4B5A] mt-0.5">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="text-xs sm:text-sm text-[#2b2b2b]/85 leading-relaxed space-y-1">
              <strong className="font-bold text-[#1B4B5A] block">Lưu ý quan trọng:</strong>
              <p>
                Đơn đặt trước sẽ được tiệm ghi nhận và giữ phần bánh cho khách. Với các mẫu bánh kích thước lớn, tiệm nhận đặt trước tối thiểu 12 tiếng và cần khách thanh toán trước. Bánh đặc biệt đặt theo yêu cầu riêng cần đặt cọc 100%.
              </p>
            </div>
          </div>
        </section>

        {/* 3. THƯ VIỆN MẪU THAM KHẢO */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">
              Một số mẫu bánh đã thực hiện
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">
              Tham khảo phong cách trang trí và ý tưởng từ các sản phẩm độc bản tại Cari
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#1B4B5A] text-white shadow-xs"
                    : "border border-border/80 bg-white text-[#2b2b2b]/80 hover:bg-[#FCE9C6]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid (8 ảnh placeholder) */}
          {/* TODO: thay bằng ảnh mẫu bánh thật khi shop cung cấp. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs hover:border-[#F6CE8B] hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-4/3 w-full bg-[#FCE9C6]/30 flex flex-col items-center justify-center p-4 text-center border-b border-border/60">
                  <Cake className="h-10 w-10 text-[#1B4B5A]/40 mb-2 group-hover:scale-110 group-hover:text-[#1B4B5A] transition-all" />
                  <span className="text-[11px] font-semibold text-muted">
                    {/* TODO: thay bằng ảnh mẫu bánh thật khi shop cung cấp. */}
                    Ảnh mẫu tham khảo #{item.id}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <span className="inline-block rounded-md bg-[#FCE9C6]/60 px-2 py-0.5 text-[10px] font-bold text-[#1B4B5A]">
                    {item.tag}
                  </span>
                  <p className="font-heading text-xs sm:text-sm font-bold text-[#1B4B5A] line-clamp-1">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. BẢNG GIÁ THAM KHẢO (ĐỂ TRỐNG SỐ TIỀN) */}
        {/* TODO: chưa có bảng giá thật, chờ file Excel sản phẩm từ shop — không tự đặt giá. */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">
              Giá tham khảo theo kích thước
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">
              Giá thực tế sẽ được báo cụ thể sau khi tiệm tư vấn thiết kế
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Size Nhỏ */}
            <div className="rounded-2xl border border-border/80 bg-white p-6 sm:p-8 text-center shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-cream px-3 py-1 text-xs font-bold text-[#1B4B5A]">
                  Kích thước nhỏ
                </span>
                <h3 className="font-heading text-lg font-bold text-[#1B4B5A]">
                  Bánh mini / 1 - 2 người
                </h3>
                <p className="text-xs text-muted">Phù hợp tặng sinh nhật thân mật, bánh kem bento dễ thương.</p>
                <div className="py-4 border-y border-border/60">
                  {/* TODO: chưa có bảng giá thật, chờ file Excel sản phẩm từ shop — không tự đặt giá. */}
                  <span className="font-heading text-xl font-bold text-[#1B4B5A] bg-[#FCE9C6]/40 px-4 py-1.5 rounded-xl border border-[#F6CE8B]/40">
                    Báo giá theo mẫu
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted italic mt-4">
                Giá thay đổi tùy độ phức tạp của hoa & hình vẽ
              </p>
            </div>

            {/* Card 2: Size Vừa */}
            <div className="rounded-2xl border-2 border-[#1B4B5A] bg-white p-6 sm:p-8 text-center shadow-xs flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1B4B5A] px-3.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                Được đặt nhiều nhất
              </span>
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-[#FCE9C6] px-3 py-1 text-xs font-bold text-[#1B4B5A]">
                  Kích thước vừa
                </span>
                <h3 className="font-heading text-lg font-bold text-[#1B4B5A]">
                  Bánh 4 - 8 người
                </h3>
                <p className="text-xs text-muted">Đường kính phổ biến 16cm - 18cm, hoàn hảo cho tiệc gia đình, bạn bè.</p>
                <div className="py-4 border-y border-border/60">
                  {/* TODO: chưa có bảng giá thật, chờ file Excel sản phẩm từ shop — không tự đặt giá. */}
                  <span className="font-heading text-xl font-bold text-[#1B4B5A] bg-[#FCE9C6]/60 px-4 py-1.5 rounded-xl border border-[#F6CE8B]/60">
                    Báo giá theo mẫu
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted italic mt-4">
                Miễn phí nến sinh nhật và dao cắt bánh
              </p>
            </div>

            {/* Card 3: Size Lớn / Nhiều tầng */}
            <div className="rounded-2xl border border-border/80 bg-white p-6 sm:p-8 text-center shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-cream px-3 py-1 text-xs font-bold text-[#1B4B5A]">
                  Kích thước lớn / Tầng
                </span>
                <h3 className="font-heading text-lg font-bold text-[#1B4B5A]">
                  Bánh tiệc 10+ người
                </h3>
                <p className="text-xs text-muted">Bánh sự kiện công ty, thôi nôi hoành tráng hoặc bánh cưới 2-3 tầng.</p>
                <div className="py-4 border-y border-border/60">
                  {/* TODO: chưa có bảng giá thật, chờ file Excel sản phẩm từ shop — không tự đặt giá. */}
                  <span className="font-heading text-xl font-bold text-[#1B4B5A] bg-[#FCE9C6]/40 px-4 py-1.5 rounded-xl border border-[#F6CE8B]/40">
                    Báo giá theo mẫu
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted italic mt-4">
                Cần đặt trước tối thiểu 12 tiếng & đặt cọc 100%
              </p>
            </div>
          </div>
        </section>

        {/* 5. FORM GỬI YÊU CẦU ĐẶT BÁNH */}
        <section id="form-dat-banh" className="scroll-mt-24 rounded-3xl border border-border/80 bg-white p-6 sm:p-10 lg:p-12 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE9C6] px-3.5 py-1 text-xs font-semibold text-[#1B4B5A] mb-3">
              <FileCheck className="h-3.5 w-3.5 text-[#1B4B5A]" />
              Nhận tư vấn thiết kế độc bản
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-[#1B4B5A]">
              Gửi yêu cầu đặt bánh
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">
              Điền thông tin bên dưới, tiệm sẽ liên hệ tư vấn và báo giá trong vòng 24 giờ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Dịp đặt bánh */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Dịp đặt bánh
                </label>
                <select
                  value={formState.occasion}
                  onChange={(e) => setFormState({ ...formState, occasion: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                >
                  <option value="">-- Chọn dịp phù hợp --</option>
                  <option value="Sinh nhật">Sinh nhật</option>
                  <option value="Kỷ niệm">Kỷ niệm</option>
                  <option value="Cưới hỏi">Cưới hỏi</option>
                  <option value="Thôi nôi">Thôi nôi</option>
                  <option value="Công ty / Sự kiện">Công ty / Sự kiện</option>
                  <option value="Khác">Dịp khác...</option>
                </select>
              </div>

              {/* Ngày cần nhận bánh */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Ngày cần nhận bánh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formState.deliveryDate}
                  onChange={(e) => setFormState({ ...formState, deliveryDate: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                />
              </div>

              {/* Kích thước / số khách dự kiến */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Kích thước / số khách dự kiến
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Size 16cm hoặc tiệc khoảng 6-8 người"
                  value={formState.sizeGuestCount}
                  onChange={(e) => setFormState({ ...formState, sizeGuestCount: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                />
              </div>

              {/* Vị bánh mong muốn */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Vị bánh mong muốn
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Vani kem tươi, Socola đậm vị, Trà xanh..."
                  value={formState.flavor}
                  onChange={(e) => setFormState({ ...formState, flavor: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                />
              </div>

              {/* Ngân sách dự kiến */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Ngân sách dự kiến
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khoảng 350.000đ - 500.000đ"
                  value={formState.budget}
                  onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                />
              </div>

              {/* Số điện thoại / Zalo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">
                  Số điện thoại / Zalo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Tiệm sẽ liên hệ tư vấn qua số này"
                  value={formState.phoneZalo}
                  onChange={(e) => setFormState({ ...formState, phoneZalo: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all"
                />
              </div>
            </div>

            {/* Ảnh mẫu tham khảo (upload / drag-drop) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B4B5A]">
                Ảnh mẫu tham khảo (nếu có)
              </label>
              <div className="relative rounded-2xl border-2 border-dashed border-border hover:border-[#1B4B5A] bg-[#FFF8EF]/50 p-6 text-center transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FCE9C6] text-[#1B4B5A]">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  {selectedFileName ? (
                    <div className="text-xs sm:text-sm font-semibold text-emerald-700">
                      Đã chọn file: {selectedFileName}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-[#1B4B5A]">
                        Kéo thả hoặc bấm để tải ảnh lên
                      </p>
                      <p className="text-[11px] text-muted">
                        Định dạng hỗ trợ: PNG, JPG, WEBP (Tối đa 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B4B5A]">
                Ghi chú thêm (chữ viết trên bánh, màu sắc, chi tiết trang trí...)
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Viết chữ 'Happy Birthday Linh 20', tone màu hồng pastel, không dùng hạnh nhân..."
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                className="w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all resize-y"
              />
            </div>

            {/* Nút Submit */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B4B5A] px-12 py-3.5 font-heading text-sm font-bold text-white shadow-md hover:bg-[#1B4B5A]/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4 text-[#F6CE8B]" />
                {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </section>

        {/* 6. FAQ (DÙNG ĐÚNG NỘI DUNG THẬT) */}
        <section className="space-y-6 pt-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4B5A]">
              <HelpCircle className="h-4 w-4" />
              Giải đáp thắc mắc
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A] mt-1">
              Câu hỏi thường gặp
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border/80 bg-white shadow-xs transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-5 text-left font-heading text-base font-bold text-[#1B4B5A] hover:bg-[#FFF8EF]/50 transition-colors"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#1B4B5A]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#2b2b2b]/85 leading-relaxed border-t border-border/40 bg-[#FFF8EF]/30">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* MODAL THÀNH CÔNG */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-black p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-black text-[#1B4B5A]">
              Gửi yêu cầu thành công!
            </h3>

            <p className="text-xs sm:text-sm text-[#2b2b2b]/80 leading-relaxed">
              Cari Bakehouse đã nhận được thông tin yêu cầu của bạn. Tiệm sẽ liên hệ tư vấn và báo giá qua Zalo trong vòng <strong>24 giờ</strong>.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full rounded-full bg-[#1B4B5A] py-3 text-xs font-bold text-white hover:bg-[#1B4B5A]/90 transition-all"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
