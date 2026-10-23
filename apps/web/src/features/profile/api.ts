import type { SessionDto, UserDto } from "@cat-gpt/shared";
import { api } from "@/lib/api/client";

export interface UpdateProfilePayload {
  fullName: string;
  phone: string | null;
  department: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  update: (payload: UpdateProfilePayload) =>
    api.patch<UserDto>("/me", payload).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<UserDto>("/me/avatar", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  removeAvatar: () => api.delete<UserDto>("/me/avatar").then((r) => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<void>("/me/password", payload).then(() => undefined),

  sessions: () => api.get<SessionDto[]>("/me/sessions").then((r) => r.data),

  revokeSession: (id: string) => api.delete<void>(`/me/sessions/${id}`).then(() => undefined),

  revokeOtherSessions: () => api.delete<void>("/me/sessions").then(() => undefined),
};
