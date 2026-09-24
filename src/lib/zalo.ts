// Mở khung chat Zalo với tiệm.
// - Điện thoại: link https://zalo.me/<sđt> tự mở app Zalo.
// - Máy tính: link zalo.me mở Zalo Web (bắt đăng nhập lại), nên thử mở thẳng app Zalo PC qua
//   zalo://conversation?phone=<sđt>. Nếu sau một lúc trang vẫn đang được xem (máy không cài Zalo PC,
//   hoặc khách bấm "Hủy" ở hộp thoại của trình duyệt) thì mở link web như cũ.

const FALLBACK_DELAY_MS = 2000;

function isMobileDevice(): boolean {
  const ua = navigator.userAgent;
  // iPad đời mới báo là "Macintosh" nhưng có màn hình cảm ứng
  return /android|iphone|ipad|ipod|mobile/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Gọi trực tiếp trong sự kiện click.
 * @param phone số hotline dạng chữ số liền, vd 0338975925
 * @param webUrl link Zalo trong Cài đặt, vd https://zalo.me/0338975925
 */
export function openZaloChat(phone: string, webUrl: string) {
  const openWeb = () => window.open(webUrl, "_blank", "noopener,noreferrer");
  const digits = phone.replace(/\D/g, "");
  if (isMobileDevice() || !digits) {
    openWeb();
    return;
  }

  // App Zalo PC mở lên thì trình duyệt mất focus / bị ẩn → không cần mở bản web nữa
  let appOpened = false;
  const markOpened = () => {
    appOpened = true;
  };
  window.addEventListener("blur", markOpened, { once: true });
  document.addEventListener("visibilitychange", markOpened, { once: true });

  window.location.href = `zalo://conversation?phone=${digits}`;

  window.setTimeout(() => {
    window.removeEventListener("blur", markOpened);
    document.removeEventListener("visibilitychange", markOpened);
    if (!appOpened && document.hasFocus()) openWeb();
  }, FALLBACK_DELAY_MS);
}
