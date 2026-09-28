import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
