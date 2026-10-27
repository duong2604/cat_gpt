/** Escape ký tự đặc biệt trước khi đưa chuỗi người dùng nhập vào RegExp (tránh ReDoS/injection). */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
