export const routes = {
  /** Mặc định chung (proxy, not-found…); nơi quyết định theo Chat còn bật hay không dùng `fallback` của `safeNextPath`. */
  home: "/chat",
  login: "/login",
  chat: "/chat",
  documents: "/documents",
  profile: "/profile",
  adminUsers: "/admin/users",
} as const;

/** Chỉ chấp nhận đường dẫn nội bộ để tránh open redirect qua ?next=. */
export function safeNextPath(next: string | null | undefined, fallback: string = routes.home): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
