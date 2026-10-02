import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Header bảo mật cơ bản cho mọi trang (HTTPS/HSTS đã do Vercel lo)
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    // 75 = mặc định; 90 dùng cho ảnh banner lớn (hero) để giữ độ nét
    qualities: [75, 90],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Ảnh admin tải lên Supabase Storage (bucket "images")
        protocol: "https",
        hostname: "wuweacflzhlsbwhpsdfv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
