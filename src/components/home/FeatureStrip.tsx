import { Shield, Leaf, Gift } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Bảo hiểm vận chuyển",
    desc: "Bảo hiểm 100% đơn hàng — bánh hỏng khi giao, liên hệ trong 15–30 phút để được đổi/hoàn tiền.",
    color: "text-[#1B4B5A]",
    bg: "bg-[#1B4B5A]/10",
  },
  {
    icon: Leaf,
    title: "Nguyên liệu tươi",
    desc: "Kem & bơ nhập khẩu cao cấp, làm theo đơn, đạt chuẩn ATTP — không chất bảo quản, không tồn kho.",
    color: "text-[#C97B3D]",
    bg: "bg-[#C97B3D]/10",
  },
  {
    icon: Gift,
    title: "Ưu đãi đặc biệt",
    desc: "Giảm 10% đơn đầu (mã CARI10), freeship 5km cho đơn từ 300k, giảm 15% dịp sinh nhật.",
    color: "text-[#123640]",
    bg: "bg-[#123640]/10",
  },
];

export default function FeatureStrip() {
  return (
    <section className="border-b border-[#E5D9C3] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y divide-[#E5D9C3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-start gap-4 px-6 py-7 transition-colors hover:bg-[#FFF8EF]/60"
              >
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                  <Icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-[#2B2B2B]">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#7A7A7A]">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
