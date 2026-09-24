export type UserRole = "admin" | "customer";

// Thông tin người dùng đang đăng nhập (Supabase Auth + bảng profiles)
export interface AuthUser {
  fullName: string;
  email: string;
  phone: string;
  /** Bỏ trống = khách thường; "admin" lấy từ profiles.role */
  role?: UserRole;
}

/** Hồ sơ khách hàng trong dữ liệu mẫu (khóa theo email) */
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  /** Ngày tạo tài khoản, yyyy-mm-dd */
  createdAt: string;
}

export type PointTransactionKind = "order" | "manual" | "redeem" | "initial";

/** Một dòng lịch sử điểm. Điểm hiện có của khách = tổng `points` của các dòng thuộc email đó. */
export interface PointTransaction {
  id: string;
  email: string;
  /** yyyy-mm-dd */
  date: string;
  title: string;
  /** Có dấu: cộng (+) hoặc trừ (-) */
  points: number;
  kind: PointTransactionKind;
  orderId?: string;
  /** Lý do khi admin cộng/trừ thủ công */
  reason?: string;
}

export interface PointCardData {
  currentPoints: number;
  tier: string;
  // TODO: chưa chốt cách xét hạng thành viên — khi có quy tắc thì điền các trường dưới đây để hiện thanh tiến độ
  nextTier?: string;
  pointsNeeded?: number;
  progressPercentage?: number;
}
