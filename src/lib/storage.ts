// Tải ảnh admin chọn từ máy lên Supabase Storage (bucket "images", xem supabase/migrations/0003_storage.sql)
// và trả về link công khai để lưu vào sản phẩm / nội dung trang.

import { createClient } from "@/lib/supabase/client";
import { readImageFile } from "@/lib/utils";

const BUCKET = "images";

// Ảnh gốc đã vừa kích thước và không quá nặng thì đẩy nguyên file lên, không nén lại (giữ độ nét như ảnh gốc).
// Next/Image vẫn tự tạo bản WebP/AVIF nhỏ hơn khi hiển thị.
const KEEP_ORIGINAL_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const KEEP_ORIGINAL_MAX_BYTES = 5 * 1024 * 1024;

function imageLongestSide(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(Math.max(img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("File ảnh không hợp lệ"));
    };
    img.src = url;
  });
}

export async function uploadImage(file: File, maxSize = 1200): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn file ảnh");

  const ext = KEEP_ORIGINAL_TYPES[file.type];
  const keepOriginal = !!ext && file.size <= KEEP_ORIGINAL_MAX_BYTES && (await imageLongestSide(file)) <= maxSize;

  let blob: Blob = file;
  let contentType = file.type;
  let fileExt = ext;
  if (!keepOriginal) {
    // Ảnh quá lớn: thu nhỏ về maxSize, nén JPEG chất lượng cao
    const dataUrl = await readImageFile(file, maxSize, 0.92);
    blob = await (await fetch(dataUrl)).blob();
    contentType = "image/jpeg";
    fileExt = "jpg";
  }

  const path = `uploads/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType });
  if (error) {
    console.error(error);
    throw new Error("Tải ảnh lên thất bại — kiểm tra đã đăng nhập bằng tài khoản quản trị");
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
