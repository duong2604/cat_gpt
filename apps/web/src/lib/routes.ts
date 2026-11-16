export const routes = {
  login: "/login",
  chat: "/chat",
  documents: "/documents",
  profile: "/profile",
  adminUsers: "/admin/users",
} as const;

/**
 * Chỉ chấp nhận đường dẫn nội bộ để tránh open redirect qua ?next=.
 * `fallback` bắt buộc: "trang chủ" là `/chat` hay `/profile` tùy Chat còn bật hay không (API `/me/features`).
 */
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
