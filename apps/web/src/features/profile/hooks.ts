"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserDto } from "@cat-gpt/shared";
import { queryKeys } from "@/lib/api/query-keys";
import { type ChangePasswordPayload, profileApi, type UpdateProfilePayload } from "./api";

/** Cập nhật cache "me" sau khi server trả về user mới. */
function useSetMe() {
  const queryClient = useQueryClient();
  return (user: UserDto) => queryClient.setQueryData(queryKeys.me, user);
}

export function useUpdateProfile() {
  const setMe = useSetMe();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: setMe,
  });
}

export function useUploadAvatar() {
  const setMe = useSetMe();
  return useMutation({ mutationFn: (file: File) => profileApi.uploadAvatar(file), onSuccess: setMe });
}

export function useRemoveAvatar() {
  const setMe = useSetMe();
  return useMutation({ mutationFn: profileApi.removeAvatar, onSuccess: setMe });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileApi.changePassword(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.mySessions }),
  });
}

export function useMySessions() {
  return useQuery({ queryKey: queryKeys.mySessions, queryFn: profileApi.sessions });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.revokeSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.mySessions }),
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.revokeOtherSessions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.mySessions }),
  });
}
