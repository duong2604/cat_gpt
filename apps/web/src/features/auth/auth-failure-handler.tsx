"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, setAuthFailureHandler } from "@/lib/api/client";
import { routes } from "@/lib/routes";

/**
 * Khi phiên không thể khôi phục (refresh thất bại hoặc tài khoản bị khóa):
 * gọi logout để xóa cookie, xóa cache rồi chuyển về trang đăng nhập kèm lý do.
 */
export function AuthFailureHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let handled = false;
    setAuthFailureHandler((reason) => {
      if (handled) return;
      handled = true;

      const next = window.location.pathname + window.location.search;
      const target = `${routes.login}?reason=${reason}&next=${encodeURIComponent(next)}`;

      void api
        .post("/auth/logout")
        .catch(() => undefined)
        .finally(() => {
          queryClient.clear();
          // Reload cứng có chủ đích: xóa sạch state phía client sau khi kết thúc phiên.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign(target);
        });
    });
  }, [queryClient]);

  return null;
}
