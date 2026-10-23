"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserDto } from "@cat-gpt/shared";
import { queryKeys } from "@/lib/api/query-keys";
import { routes } from "@/lib/routes";
import { authApi, type LoginPayload } from "./api";

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: authApi.me, staleTime: 60_000 });
}

/**
 * Người dùng hiện tại — chỉ dùng bên trong AppShell (đã đảm bảo dữ liệu có sẵn).
 */
export function useCurrentUser(): UserDto {
  const { data } = useMe();
  if (!data) throw new Error("useCurrentUser() phải được dùng bên trong AppShell");
  return data;
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user),
  });
}

/** Đăng xuất rồi tải lại trang đăng nhập để xóa sạch state phía client. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      // Reload cứng có chủ đích: xóa sạch state phía client sau khi kết thúc phiên.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${routes.login}?reason=loggedOut`);
    },
  });
}
