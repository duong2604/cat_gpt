import { type NextRequest, NextResponse } from "next/server";
import { routes } from "@/lib/routes";

/** Cookie gợi ý phiên do API đặt (xem SESSION_HINT_COOKIE phía backend). */
const SESSION_HINT_COOKIE = "cat_session";
const PUBLIC_PATHS = [routes.login];

/**
 * Điều hướng sớm trước khi render:
 * - Chưa đăng nhập mà vào trang trong app → chuyển tới /login?next=...
 * - Đã đăng nhập mà vào /login → chuyển vào app.
 *
 * Proxy chỉ đọc cookie gợi ý, không xác thực token. Việc xác thực thật do API đảm nhận;
 * nếu phiên đã hết hạn, client gọi API nhận 401 và AuthFailureHandler đưa về /login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_HINT_COOKIE);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasSession && !isPublic) {
    const url = new URL(routes.login, request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Có ?reason=... nghĩa là vừa bị đăng xuất: luôn cho xem trang đăng nhập (tránh vòng lặp chuyển hướng).
  if (hasSession && isPublic && !searchParams.has("reason")) {
    return NextResponse.redirect(new URL(routes.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Bỏ qua API, file tĩnh của Next và file có đuôi (ảnh, favicon...).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
