import React from "react";

interface RibbonIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function RibbonIcon({
  className = "",
  width = 135,
  height = 135,
  ...props
}: RibbonIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M108 88
           C 90 52, 48 40, 30 62
           C 14 82, 24 110, 52 114
           C 74 117, 96 104, 108 88 Z"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M112 86
           C 128 60, 160 52, 178 68
           C 193 82, 188 104, 166 108
           C 148 111, 128 100, 112 86 Z"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M98 94 C 90 106, 84 116, 90 130"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M122 92 C 134 112, 146 132, 138 160"
        fill="none"
        stroke="#F6CE8B"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="111" cy="88" r="10" fill="#F6CE8B" />
    </svg>
  );
}
