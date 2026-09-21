import { Award, Truck, Cake } from "lucide-react";

const badges = [
  {
    icon: Award,
    title: "Chương trình tích điểm",
  },
  {
    icon: Truck,
    title: "Giao hàng tận nơi",
  },
  {
    icon: Cake,
    title: "Nhận đặt bánh theo yêu cầu",
  },
];

export default function FeatureStrip() {
  return (
    <section className="relative z-20 -mt-5 sm:-mt-6 lg:-mt-7 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Badges container: horizontal scroll on mobile, centered on desktop */}
        <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-4 lg:gap-6 overflow-x-auto no-scrollbar py-1 px-2">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex shrink-0 items-center gap-2 sm:gap-2.5 rounded-full bg-[#1B4B5A] px-4 py-2 sm:px-5 sm:py-2.5 text-white shadow-xl border border-white/10 transition-all duration-300 hover:bg-[#123640] hover:scale-105"
              >
                <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#F6CE8B] shrink-0" />
                <span className="font-heading text-xs sm:text-sm font-semibold tracking-wide text-white whitespace-nowrap">
                  {b.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
