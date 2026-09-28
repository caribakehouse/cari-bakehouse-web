"use client";

// Trang Đặt bánh theo yêu cầu. Toàn bộ chữ, quy trình, ảnh mẫu, bảng giá, dịp đặt bánh và câu hỏi thường gặp
// do admin chỉnh ở /admin/noi-dung-dat-theo-yeu-cau (site_content key 'custom_order').

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
import Image from "@/components/ui/SafeImage";
import { useAuth } from "@/lib/auth";
import { addCustomRequest, useCustomOrderContent } from "@/lib/db";
import { formatVND, readImageFile } from "@/lib/utils";

const ALL = "Tất cả";

const FIELD_CLASS =
  "w-full rounded-xl border border-border/80 bg-[#FFF8EF]/50 px-3.5 py-2.5 text-sm text-[#2b2b2b] placeholder:text-muted/60 focus:border-[#1B4B5A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B5A]/10 transition-all";

export default function BanhDatTheoYeuCauPage() {
  const { user } = useAuth();
  const content = useCustomOrderContent();
  const [activeCategory, setActiveCategory] = useState(ALL);
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

  // Nhóm lọc ảnh mẫu lấy từ các ảnh admin đã gắn nhóm
  const sampleTags = [ALL, ...new Set(content.samples.map((s) => s.tag.trim()).filter(Boolean))];
  const filteredSamples =
    activeCategory === ALL ? content.samples : content.samples.filter((s) => s.tag.trim() === activeCategory);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formState.phoneZalo.trim() || !formState.deliveryDate) {
      alert("Vui lòng điền ngày nhận bánh và số điện thoại / Zalo để tiệm liên hệ.");
      return;
    }

    setIsSubmitting(true);
    // Đây là form gửi yêu cầu tư vấn (không thanh toán trên web)
    // Sau khi gửi, tiệm chủ động liên hệ báo giá qua Zalo trong vòng 24 giờ
    // Yêu cầu lưu lên database → hiện ở /admin/dat-theo-yeu-cau với trạng thái "Mới"
    const saveError = await addCustomRequest({
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
    setIsSubmitting(false);
    if (saveError) {
      alert(`Gửi yêu cầu thất bại: ${saveError}. Bạn có thể nhắn Zalo cho tiệm để được hỗ trợ.`);
      return;
    }
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
  };

  const scrollToForm = () => {
    document.getElementById("form-dat-banh")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full bg-[#FFF8EF] text-[#2b2b2b] overflow-x-hidden min-h-screen">
      {/* 1. BANNER: tagline + tiêu đề lớn */}
      <section className="relative overflow-hidden bg-[#FCE9C6] py-16 md:py-24 border-b border-[#E5D9C3]/80">
        <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#F6CE8B]/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#1B4B5A]/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-6">
          {content.tagline && (
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#1B4B5A]/15 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#1B4B5A] shadow-xs backdrop-blur-xs">
              <Cake className="h-3.5 w-3.5 shrink-0 text-[#1B4B5A]" />
              <span>{content.tagline}</span>
            </div>
          )}

          <h1 className="font-heading text-3xl font-black text-[#1B4B5A] sm:text-4xl md:text-5xl leading-tight">
            {content.title}
          </h1>

          <div className="pt-2">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 rounded-full bg-[#1B4B5A] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1B4B5A]/90 hover:scale-105 active:scale-95 transition-all"
            >
              Gửi yêu cầu ngay
              <ArrowDown className="h-4 w-4 text-[#F6CE8B]" />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* 2. QUY TRÌNH ĐẶT BÁNH */}
        {content.steps.length > 0 && (
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">Quy trình đặt bánh theo yêu cầu</h2>
              <p className="mt-2 text-xs sm:text-sm text-muted">
                {content.steps.length} bước đơn giản từ lúc gửi ý tưởng đến khi nhận chiếc bánh hoàn hảo
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {content.steps.map((item, i) => (
                <div
                  key={i}
                  className="relative flex w-full flex-col items-center rounded-2xl border border-border/80 bg-white p-5 text-center shadow-xs transition-all hover:border-[#F6CE8B] hover:shadow-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-4rem)/5)]"
                >
                  <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F6CE8B] bg-[#FCE9C6] text-sm font-black text-[#1B4B5A]">
                    {i + 1}
                  </div>
                  <h3 className="mb-2 font-heading text-sm font-bold text-[#1B4B5A]">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-[#2b2b2b]/75">{item.desc}</p>
                </div>
              ))}
            </div>

            {content.note.trim() && (
              <div className="rounded-2xl border border-amber-300 bg-[#FBF7EA] p-5 sm:p-6 shadow-xs flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6CE8B] text-[#1B4B5A] mt-0.5">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="text-xs sm:text-sm text-[#2b2b2b]/85 leading-relaxed space-y-1">
                  <strong className="font-bold text-[#1B4B5A] block">Lưu ý quan trọng:</strong>
                  <p className="whitespace-pre-line">{content.note}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. MỘT SỐ MẪU BÁNH ĐÃ THỰC HIỆN */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">Một số mẫu bánh đã thực hiện</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">
              Tham khảo phong cách trang trí và ý tưởng từ các sản phẩm độc bản tại Cari
            </p>
          </div>

          {content.samples.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#F6CE8B] bg-white p-8 text-center">
              <Cake className="mx-auto h-10 w-10 text-[#1B4B5A]/40" />
              <p className="mt-3 text-sm text-[#2b2b2b]/75">
                Ảnh mẫu bánh đang được cập nhật — nhắn Zalo cho tiệm để xem thêm các mẫu đã làm nhé!
              </p>
            </div>
          ) : (
            <>
              {sampleTags.length > 2 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {sampleTags.map((cat) => (
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
              )}

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {filteredSamples.map((item) => (
                  <div
                    key={item.id}
                    className="group flex w-[calc((100%-1rem)/2)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs transition-all hover:border-[#F6CE8B] hover:shadow-md sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#FCE9C6]/40">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || "Mẫu bánh Cari"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Cake className="h-10 w-10 text-[#1B4B5A]/40" />
                        </div>
                      )}
                    </div>
                    {(item.tag || item.title) && (
                      <div className="p-3.5 space-y-1">
                        {item.tag && (
                          <span className="inline-block rounded-md bg-[#FCE9C6]/60 px-2 py-0.5 text-[10px] font-bold text-[#1B4B5A]">
                            {item.tag}
                          </span>
                        )}
                        {item.title && (
                          <p className="font-heading text-xs sm:text-sm font-bold text-[#1B4B5A] line-clamp-2">{item.title}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* 4. GIÁ THAM KHẢO THEO KÍCH THƯỚC */}
        {content.priceTiers.length > 0 && (
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A]">Giá tham khảo theo kích thước</h2>
              {content.priceNote && <p className="mt-2 text-xs sm:text-sm text-muted">{content.priceNote}</p>}
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {content.priceTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`relative flex w-full flex-col overflow-hidden rounded-2xl bg-white text-center shadow-xs sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] ${
                    tier.highlight ? "border-2 border-[#1B4B5A]" : "border border-border/80"
                  }`}
                >
                  {tier.highlight && (
                    <span className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#1B4B5A] px-3.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      {tier.highlight}
                    </span>
                  )}
                  <div className="relative aspect-4/3 w-full bg-[#FCE9C6]/40">
                    {tier.image ? (
                      <Image src={tier.image} alt={`${tier.name} ${tier.size}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Cake className="h-12 w-12 text-[#1B4B5A]/35" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div className="space-y-3">
                      <span className="inline-block rounded-full bg-[#FCE9C6] px-3 py-1 text-xs font-bold text-[#1B4B5A]">{tier.name}</span>
                      {tier.size && <h3 className="font-heading text-lg font-bold text-[#1B4B5A]">{tier.size}</h3>}
                      <ul className="space-y-2 border-y border-border/60 py-4">
                        {tier.prices.map((p) => (
                          <li key={p.label} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-left text-[#2b2b2b]/80">{p.label}</span>
                            <span className="shrink-0 font-black text-[#1B4B5A]">{formatVND(p.price)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {tier.note && <p className="mt-4 text-[11px] italic text-muted">{tier.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. FORM GỬI YÊU CẦU ĐẶT BÁNH */}
        <section id="form-dat-banh" className="scroll-mt-24 rounded-3xl border border-border/80 bg-white p-6 sm:p-10 lg:p-12 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE9C6] px-3.5 py-1 text-xs font-semibold text-[#1B4B5A] mb-3">
              <FileCheck className="h-3.5 w-3.5 text-[#1B4B5A]" />
              Nhận tư vấn thiết kế độc bản
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-[#1B4B5A]">Gửi yêu cầu đặt bánh</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">
              Điền thông tin bên dưới, tiệm sẽ liên hệ tư vấn và báo giá trong vòng 24 giờ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Dịp đặt bánh */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">Dịp đặt bánh</label>
                <select
                  value={formState.occasion}
                  onChange={(e) => setFormState({ ...formState, occasion: e.target.value })}
                  className={FIELD_CLASS}
                >
                  <option value="">-- Chọn dịp phù hợp --</option>
                  {content.occasions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
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
                  className={FIELD_CLASS}
                />
              </div>

              {/* Kích thước / số khách dự kiến */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">Kích thước / số khách dự kiến</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Size 16cm hoặc tiệc khoảng 6-8 người"
                  value={formState.sizeGuestCount}
                  onChange={(e) => setFormState({ ...formState, sizeGuestCount: e.target.value })}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Vị bánh mong muốn */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">Vị bánh mong muốn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Original, Matcha, Brownies..."
                  value={formState.flavor}
                  onChange={(e) => setFormState({ ...formState, flavor: e.target.value })}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Ngân sách dự kiến */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B4B5A]">Ngân sách dự kiến</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khoảng 200.000đ - 300.000đ"
                  value={formState.budget}
                  onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                  className={FIELD_CLASS}
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
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            {/* Ảnh mẫu tham khảo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B4B5A]">Ảnh mẫu tham khảo (nếu có)</label>
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
                    <div className="text-xs sm:text-sm font-semibold text-emerald-700">Đã chọn file: {selectedFileName}</div>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-[#1B4B5A]">Kéo thả hoặc bấm để tải ảnh lên</p>
                      <p className="text-[11px] text-muted">Định dạng hỗ trợ: PNG, JPG, WEBP (Tối đa 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ghi chú thêm — tiệm không viết chữ lên bánh, chỉ viết thiệp/note đi kèm */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B4B5A]">
                Ghi chú thêm (lời chúc viết thiệp/note, màu sắc, chi tiết trang trí...)
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Thiệp ghi 'Happy Birthday Linh 20', tone màu hồng pastel, không dùng hạnh nhân..."
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                className={`${FIELD_CLASS} resize-y`}
              />
              <p className="text-[11px] text-muted">
                Tiệm không viết chữ trực tiếp lên bánh — lời chúc sẽ được viết trên thiệp/note đi kèm bánh.
              </p>
            </div>

            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B4B5A] px-12 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1B4B5A]/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4 text-[#F6CE8B]" />
                {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </section>

        {/* 6. CÂU HỎI THƯỜNG GẶP */}
        {content.faq.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4B5A]">
                <HelpCircle className="h-4 w-4" />
                Giải đáp thắc mắc
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B4B5A] mt-1">Câu hỏi thường gặp</h2>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {content.faq.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="rounded-2xl border border-border/80 bg-white shadow-xs transition-all overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-[#1B4B5A] hover:bg-[#FFF8EF]/50 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-180 text-[#1B4B5A]" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-[#2b2b2b]/85 leading-relaxed border-t border-border/40 bg-[#FFF8EF]/30 whitespace-pre-line">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* MODAL THÀNH CÔNG */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              aria-label="Đóng"
              className="absolute top-4 right-4 text-muted hover:text-black p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-black text-[#1B4B5A]">Gửi yêu cầu thành công!</h3>

            <p className="text-xs sm:text-sm text-[#2b2b2b]/80 leading-relaxed">
              Cari Bakehouse đã nhận được thông tin yêu cầu của bạn. Tiệm sẽ liên hệ tư vấn và báo giá qua Zalo trong vòng{" "}
              <strong>24 giờ</strong>.
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
