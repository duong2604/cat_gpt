export const routes = {
  home: "/chat",
  login: "/login",
  chat: "/chat",
  documents: "/documents",
  profile: "/profile",
  adminUsers: "/admin/users",
} as const;

/** Chỉ chấp nhận đường dẫn nội bộ để tránh open redirect qua ?next=. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return routes.home;
  return next;
}
