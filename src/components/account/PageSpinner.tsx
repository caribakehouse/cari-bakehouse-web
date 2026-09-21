import Link from "next/link";
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/form-styles";

export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B4B5A] border-t-transparent" />
    </div>
  );
}

// Hiển thị khi khách vừa đăng xuất ngay trên trang yêu cầu đăng nhập
export function SignedOutNotice() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-black text-[#1B4B5A]">Bạn đã đăng xuất</h1>
      <p className="mt-2 text-sm text-text-muted">Đăng nhập lại để tiếp tục đặt hàng và xem tài khoản.</p>
      <Link href="/dang-nhap" className={`${PRIMARY_BUTTON_CLASS} mt-6`}>
        Đăng nhập
      </Link>
    </div>
  );
}
