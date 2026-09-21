import Image, { type ImageProps } from "next/image";

// Các host đã khai báo trong next.config.ts (images.remotePatterns) — chỉ những host này đi qua bộ tối ưu ảnh của Next.
const OPTIMIZED_HOSTS = new Set(["images.unsplash.com", "placehold.co"]);

function needsUnoptimized(src: string): boolean {
  if (src.startsWith("/")) return false;
  try {
    const url = new URL(src);
    return !(url.protocol === "https:" && OPTIMIZED_HOSTS.has(url.hostname));
  } catch {
    return true;
  }
}

/**
 * Giống next/image nhưng an toàn với ảnh do admin nhập: ảnh tải lên (data URL) hoặc link từ host lạ
 * được hiển thị trực tiếp (unoptimized) thay vì làm trang lỗi "hostname not configured".
 */
export default function SafeImage(props: ImageProps) {
  const unoptimized = props.unoptimized ?? (typeof props.src === "string" ? needsUnoptimized(props.src) : false);
  // eslint-disable-next-line jsx-a11y/alt-text -- alt được truyền qua props
  return <Image {...props} unoptimized={unoptimized} />;
}
