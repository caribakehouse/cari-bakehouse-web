// Tải ảnh admin chọn từ máy lên Supabase Storage (bucket "images", xem supabase/migrations/0003_storage.sql)
// và trả về link công khai để lưu vào sản phẩm / nội dung trang.

import { createClient } from "@/lib/supabase/client";
import { readImageFile } from "@/lib/utils";

const BUCKET = "images";

export async function uploadImage(file: File, maxSize = 1200): Promise<string> {
  const dataUrl = await readImageFile(file, maxSize);
  const blob = await (await fetch(dataUrl)).blob();
  const path = `uploads/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
  if (error) {
    console.error(error);
    throw new Error("Tải ảnh lên thất bại — kiểm tra đã đăng nhập bằng tài khoản quản trị");
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
