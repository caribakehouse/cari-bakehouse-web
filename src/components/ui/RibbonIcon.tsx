import React from "react";

interface RibbonIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function RibbonIcon({
  className = "",
  width = 80,
  height = 72,
  ...props
}: RibbonIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 180"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M100 70 C 60 55, 30 75, 40 100 C 48 118, 70 112, 80 95 C 86 84, 92 76, 100 70 Z"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M100 70 C 140 55, 170 75, 160 100 C 152 118, 130 112, 120 95 C 114 84, 108 76, 100 70 Z"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M92 78 C 84 92, 78 104, 84 116"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M108 78 C 116 92, 122 104, 116 116"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="100" cy="72" r="9" fill="#F6CE8B" />
    </svg>
  );
}
