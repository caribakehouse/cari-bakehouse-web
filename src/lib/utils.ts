// Helper dùng chung: định dạng tiền, ngày, kiểm tra đường dẫn chuyển hướng

export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

/** Ngày hôm nay theo giờ địa phương, dạng yyyy-mm-dd */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** yyyy-mm-dd -> dd/mm/yyyy (không đi qua Date để tránh lệch múi giờ) */
export function formatDateVN(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Chỉ cho phép chuyển hướng tới đường dẫn nội bộ (chống open-redirect). */
export function safeInternalPath(path: string | null, fallback: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  return path;
}

/** 0338975925 → "0338 975 925" (sep=" ") hoặc "0338.975.925" (sep=".") */
export function formatHotline(raw: string, sep: " " | "." = " "): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return raw;
  return `${digits.slice(0, 4)}${sep}${digits.slice(4, 7)}${sep}${digits.slice(7)}`;
}

/** https://www.instagram.com/cari.bakehouse.hn/ → "cari.bakehouse.hn" */
export function handleFromUrl(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return (parts[parts.length - 1] ?? "").replace(/^@/, "");
  } catch {
    return "";
  }
}

/** Link hợp lệ để mở ra tab mới (http/https) */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Đọc file ảnh, thu nhỏ (cạnh dài nhất ≤ maxSize) và trả về data URL JPEG.
 * Admin: src/lib/storage.ts đẩy ảnh này lên Supabase Storage. Form đặt bánh theo yêu cầu vẫn lưu data URL (phần 3).
 */
export function readImageFile(file: File, maxSize = 720, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Vui lòng chọn file ảnh"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("File ảnh không hợp lệ"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Trình duyệt không hỗ trợ xử lý ảnh"));
          return;
        }
        // Nền trắng cho ảnh PNG trong suốt (JPEG không có kênh alpha → vùng trong suốt sẽ thành đen)
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
