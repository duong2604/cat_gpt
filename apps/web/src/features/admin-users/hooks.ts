"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserStatus } from "@cat-gpt/shared";
import { type AdminUsersFilter, queryKeys } from "@/lib/api/query-keys";
import { adminUsersApi, type CreateUserPayload, type UpdateUserPayload } from "./api";

export function useAdminUsers(filter: AdminUsersFilter) {
  return useQuery({
    queryKey: queryKeys.adminUsers.list(filter),
    queryFn: () => adminUsersApi.list(filter),
    // Giữ dữ liệu trang cũ khi chuyển trang/lọc → bảng không bị nháy.
    placeholderData: keepPreviousData,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => adminUsersApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      adminUsersApi.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useSetUserStatus() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      adminUsersApi.setStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminUsersApi.resetPassword(id, newPassword),
  });
}
