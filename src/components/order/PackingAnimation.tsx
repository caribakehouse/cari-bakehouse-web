"use client";

// Màn hình "đóng gói" sau khi khách đặt đơn thành công (phong cách vẽ tay dễ thương):
// hộp bánh mái nhà bật mở hai cánh nắp → bánh / đồ uống bay vào từ nhiều phía → cánh nắp gập lại,
// quai xách bật lên, tim + lấp lánh → gọi onDone để hiện màn hình "Đặt hàng thành công".
// Khách bấm "Bỏ qua" (hoặc máy bật giảm chuyển động) thì chuyển tiếp ngay.

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./PackingAnimation.module.css";

const TOTAL_MS = 3800;
const REDUCED_MOTION_MS = 900;
/** Lúc nắp đã gập xong → đổi dòng chữ bên dưới */
const PACKED_AT_MS = 2700;

export type PackingItemKind = "cake" | "drink";

const TEAL = "#1B4B5A";
const CREAM = "#FFF8EF";
const SAND = "#FCE9C6";
const GOLD = "#F6CE8B";
const CARAMEL = "#C97B3D";
const PINK = "#F7B6C2";
const BERRY = "#E85D75";

const stroke = {
  stroke: TEAL,
  strokeWidth: 3,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;

// ─── Các món (vẽ quanh gốc toạ độ 0,0 để xoay / bay cho đẹp) ─────────────
function CakeSlice() {
  return (
    <g {...stroke}>
      <path d="M-24 18 Q0 20 24 17 L23 -2 Q0 4 -24 8 Z" fill={SAND} />
      <path
        d="M-23 13 Q0 15 23 11"
        stroke={CARAMEL}
        strokeWidth={2.2}
        fill="none"
      />
      <path d="M-25 8 Q0 3 24 -2 L23 -8 Q0 -6 -25 3 Z" fill={PINK} />
      <circle cx={15} cy={-11} r={5} fill={BERRY} />
    </g>
  );
}

function Croissant() {
  return (
    <g {...stroke}>
      <path
        d="M-24 8 Q-20 -14 0 -15 Q20 -14 24 8 Q15 4 11 12 Q6 2 0 3 Q-6 2 -11 12 Q-15 4 -24 8 Z"
        fill="#E9B872"
      />
      <path
        d="M-8 -12 Q-6 -2 -9 6 M8 -12 Q6 -2 9 6"
        fill="none"
        strokeWidth={2.2}
      />
    </g>
  );
}

function Cupcake() {
  return (
    <g {...stroke}>
      <path d="M-15 2 L15 2 L11 22 L-11 22 Z" fill={GOLD} />
      <path d="M-6 3 L-5 21 M4 3 L3 21" fill="none" strokeWidth={2} />
      <path
        d="M-18 3 Q-20 -9 -8 -10 Q-6 -21 6 -17 Q18 -16 16 -6 Q22 -2 18 3 Z"
        fill={PINK}
      />
      <circle cx={2} cy={-22} r={4.5} fill={BERRY} />
    </g>
  );
}

function DrinkCup({ liquid }: { liquid: string }) {
  return (
    <g {...stroke}>
      <path d="M5 -14 L9 -24 L14 -24" fill="none" />
      <rect x={-19} y={-16} width={38} height={7} rx={3.5} fill={CREAM} />
      <path d="M-16 -9 Q0 -8 16 -9 L12 24 Q0 26 -12 24 Z" fill="#FFFFFF" />
      <path
        d="M-14.5 2 Q0 4 14.5 2 L12 24 Q0 26 -12 24 Z"
        fill={liquid}
        opacity={0.8}
      />
      <circle cx={0} cy={13} r={4} fill={GOLD} strokeWidth={2} />
    </g>
  );
}

interface FlyingItem {
  node: ReactNode;
  /** Vị trí nằm trong hộp (tâm món) */
  x: number;
  y: number;
  /** Điểm xuất phát so với vị trí cuối + góc xoay ban đầu */
  fx: number;
  fy: number;
  fr: number;
  delay: number;
}

function itemsFor(kinds: PackingItemKind[]): FlyingItem[] {
  const hasCake = kinds.includes("cake") || kinds.length === 0;
  const hasDrink = kinds.includes("drink");
  const nodes: ReactNode[] =
    hasCake && hasDrink
      ? [
          <CakeSlice key="a" />,
          <DrinkCup key="b" liquid={CARAMEL} />,
          <Croissant key="c" />,
        ]
      : hasDrink
        ? [
            <DrinkCup key="a" liquid={CARAMEL} />,
            <DrinkCup key="b" liquid="#7A4A2A" />,
          ]
        : [<CakeSlice key="a" />, <Croissant key="b" />, <Cupcake key="c" />];

  // Mỗi món bay từ một hướng khác nhau: trái-dưới, phải-trên, trái-trên
  const slots = [
    { x: 122, y: 128, fx: -190, fy: 70, fr: -160, delay: 0.9 },
    { x: 178, y: 130, fx: 180, fy: -150, fr: 140, delay: 1.2 },
    { x: 150, y: 132, fx: -120, fy: -200, fr: -90, delay: 1.5 },
  ];
  return nodes.map((node, i) => ({ node, ...slots[i] }));
}

export default function PackingAnimation({
  kinds,
  onDone,
}: {
  kinds: PackingItemKind[];
  onDone: () => void;
}) {
  const [packed, setPacked] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const packedTimer = window.setTimeout(
      () => setPacked(true),
      reduce ? 0 : PACKED_AT_MS,
    );
    const doneTimer = window.setTimeout(
      () => onDoneRef.current(),
      reduce ? REDUCED_MOTION_MS : TOTAL_MS,
    );
    return () => {
      window.clearTimeout(packedTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  const items = itemsFor(kinds);

  return (
    <div
      className={`${styles.overlay} fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFF8EF]/95 px-6 backdrop-blur-sm`}
      role="status"
      aria-live="polite"
    >
      <svg
        viewBox="0 0 300 270"
        className="h-72 w-72 overflow-visible sm:h-80 sm:w-80"
        aria-hidden="true"
      >
        {/* bóng đổ */}
        <ellipse cx={150} cy={246} rx={86} ry={9} fill={TEAL} opacity={0.1} />

        <g className={styles.boxWrap}>
          {/* thành sau của miệng hộp (thấy khi nắp mở) */}
          <path
            d="M86 146 Q150 132 214 146"
            fill="none"
            stroke={TEAL}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.5}
          />

          {/* các món bay vào — vẽ trước thân hộp để phần đáy chìm vào trong hộp */}
          {items.map((it, i) => (
            <g key={i} transform={`translate(${it.x} ${it.y})`}>
              {/* lún xuống đáy hộp ngay trước khi nắp gập, để không món nào thò ra khỏi mái */}
              <g className={styles.sink}>
                <g
                  className={styles.item}
                  style={
                    {
                      "--fx": `${it.fx}px`,
                      "--fy": `${it.fy}px`,
                      "--fr": `${it.fr}deg`,
                      animationDelay: `${it.delay}s`,
                    } as CSSProperties
                  }
                >
                  {it.node}
                </g>
              </g>
            </g>
          ))}

          {/* thân hộp — nét vẽ tay, bo tròn */}
          <path
            d="M84 146 Q150 140 216 146 Q223 192 215 234 Q150 241 86 234 Q77 192 84 146 Z"
            fill={CREAM}
            stroke={TEAL}
            strokeWidth={4.5}
            strokeLinejoin="round"
          />
          {/* vệt sáng vẽ tay */}
          <path
            d="M95 160 Q93 170 94 180 M100 222 Q110 226 120 226"
            fill="none"
            stroke={GOLD}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* nhãn thương hiệu */}
          <path
            d="M104 170 Q150 165 196 170 Q199 190 196 210 Q150 215 104 210 Q101 190 104 170 Z"
            fill={SAND}
            stroke={TEAL}
            strokeWidth={2.5}
          />
          <text
            x={156}
            y={193}
            textAnchor="middle"
            fontSize={21}
            fontWeight={900}
            fill={TEAL}
            fontFamily="var(--font-heading), Lato, sans-serif"
          >
            Cari
          </text>
          <text
            x={150}
            y={206}
            textAnchor="middle"
            fontSize={8}
            fontWeight={700}
            letterSpacing={1.8}
            fill={CARAMEL}
            fontFamily="var(--font-body), sans-serif"
          >
            BAKEHOUSE
          </text>
          {/* miếng bánh nhỏ trên nhãn (như bản phác) */}
          <g transform="translate(122 186) scale(0.38)">
            <CakeSlice />
          </g>
          {/* má hồng */}
          <ellipse cx={95} cy={200} rx={6} ry={4} fill={PINK} opacity={0.8} />
          <ellipse cx={205} cy={200} rx={6} ry={4} fill={PINK} opacity={0.8} />

          {/* cánh nắp trái — gắn bản lề ở góc trên bên trái thân hộp */}
          <g
            className={styles.flapLeft}
            style={{ transformOrigin: "84px 146px" }}
          >
            <path
              d="M82 147 Q114 122 150 96 Q153 122 151 147 Q116 149 82 147 Z"
              fill={GOLD}
              stroke={TEAL}
              strokeWidth={4.5}
              strokeLinejoin="round"
            />
            <path
              d="M104 136 Q118 126 132 116"
              fill="none"
              stroke={CREAM}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
          {/* cánh nắp phải — bản lề ở góc trên bên phải */}
          <g
            className={styles.flapRight}
            style={{ transformOrigin: "216px 146px" }}
          >
            <path
              d="M218 147 Q186 122 150 96 Q147 122 149 147 Q184 149 218 147 Z"
              fill={CARAMEL}
              stroke={TEAL}
              strokeWidth={4.5}
              strokeLinejoin="round"
            />
            <path
              d="M196 136 Q182 126 168 116"
              fill="none"
              stroke={GOLD}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.8}
            />
          </g>

          {/* quai xách bật lên khi nắp đã gập */}
          <g className={styles.handle}>
            <path
              d="M138 100 Q136 70 150 68 Q164 70 162 100"
              fill="none"
              stroke={TEAL}
              strokeWidth={6}
              strokeLinecap="round"
            />
          </g>

          {/* tim dán nhãn */}
          <g className={styles.heart}>
            <path
              d="M186 166 C186 159 195 158 196 165 C197 158 206 159 206 166 C206 173 196 178 196 178 C196 178 186 173 186 166 Z"
              fill={BERRY}
              stroke={TEAL}
              strokeWidth={2.2}
            />
          </g>
        </g>

        {/* lấp lánh */}
        {[
          { cls: styles.sparkle1, x: 58, y: 110 },
          { cls: styles.sparkle2, x: 246, y: 92 },
          { cls: styles.sparkle3, x: 252, y: 190 },
          { cls: styles.sparkle4, x: 50, y: 196 },
        ].map((s) => (
          <path
            key={s.x}
            className={`${styles.sparkle} ${s.cls}`}
            d={`M${s.x} ${s.y - 10} Q${s.x + 2} ${s.y - 2} ${s.x + 10} ${s.y} Q${s.x + 2} ${s.y + 2} ${s.x} ${s.y + 10} Q${s.x - 2} ${s.y + 2} ${s.x - 10} ${s.y} Q${s.x - 2} ${s.y - 2} ${s.x} ${s.y - 10} Z`}
            fill={GOLD}
            stroke={CARAMEL}
            strokeWidth={1.5}
          />
        ))}
      </svg>

      <p
        key={packed ? "packed" : "packing"}
        className={`${styles.caption} mt-1 font-heading text-lg font-black text-[#1B4B5A] sm:text-xl`}
      >
        {packed ? "Đóng gói xong rồi! 🎀" : "Cari đang đóng gói đơn của bạn..."}
      </p>

      <button
        type="button"
        onClick={() => onDoneRef.current()}
        className="mt-6 cursor-pointer text-xs font-semibold text-text-muted underline-offset-4 hover:text-[#1B4B5A] hover:underline"
      >
        Bỏ qua
      </button>
    </div>
  );
}
