import RibbonIcon from "@/components/ui/RibbonIcon";

const giftBoxes = [
  {
    id: "points",
    title: "Chương trình tích điểm",
  },
  {
    id: "delivery",
    title: "Giao hàng tận nơi",
  },
  {
    id: "preorder",
    title: "Đặt trước",
  },
];

export default function FeatureStrip() {
  return (
    <section className="relative z-20 -mt-12 sm:-mt-16 lg:-mt-18 px-4">
      <div className="mx-auto max-w-5xl">
        {/* 3 hộp quà: kích thước bằng nhau, khoảng cách đều, cuộn ngang mượt mà trên mobile, căn giữa trên desktop */}
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar pt-14 pb-7 px-2">
          {giftBoxes.map((box) => (
            <div
              key={box.id}
              className="group relative flex shrink-0 w-[210px] sm:w-[240px] md:w-[260px] h-[96px] sm:h-[108px] flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#225564] to-[#153D4A] shadow-xl border border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default"
            >
              {/* Dải ruy băng dọc nhẹ trên thân hộp quà */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 sm:w-5 bg-gradient-to-b from-[#F6CE8B]/25 to-[#F6CE8B]/10 pointer-events-none" />

              {/* Nơ SVG bất đối xứng tự nhiên đè lên cạnh trên của hộp quà (kích thước 130-140px) */}
              <div className="absolute -top-[48px] sm:-top-[54px] left-1/2 -translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-105 pointer-events-none drop-shadow-md">
                <RibbonIcon
                  width={135}
                  height={135}
                  className="w-[130px] h-[130px] sm:w-[140px] sm:h-[140px]"
                />
              </div>

              {/* Pill nhỏ nền kem-vàng nhạt (#FCE9C6) đè lên cạnh dưới của khối tối */}
              <div className="absolute -bottom-3.5 sm:-bottom-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap shadow-md rounded-full bg-[#FCE9C6] px-4 py-1.5 sm:px-5 sm:py-2 border border-[#F6CE8B]/70 transition-transform duration-300 group-hover:scale-102">
                <span className="font-heading text-xs sm:text-sm font-bold text-[#1B4B5A] tracking-wide block text-center">
                  {box.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
