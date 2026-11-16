/** Bản `demo` (mặc định, có Chat mẫu) hoặc `staff` (thử nội bộ, ẩn tính năng chưa sẵn sàng). */
export const isStaffMode = process.env.NEXT_PUBLIC_RELEASE_MODE === "staff";
