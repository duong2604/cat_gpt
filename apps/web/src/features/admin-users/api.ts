import type { Paginated, UserDto, UserRole, UserStatus } from "@cat-gpt/shared";
import { api } from "@/lib/api/client";
import type { AdminUsersFilter } from "@/lib/api/query-keys";

export interface CreateUserPayload {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  phone: string | null;
  department: string | null;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">>;

export const adminUsersApi = {
  list: (filter: AdminUsersFilter) =>
    api.get<Paginated<UserDto>>("/admin/users", { params: filter }).then((r) => r.data),

  create: (payload: CreateUserPayload) =>
    api.post<UserDto>("/admin/users", payload).then((r) => r.data),

  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<UserDto>(`/admin/users/${id}`, payload).then((r) => r.data),

  setStatus: (id: string, status: UserStatus) =>
    api.patch<UserDto>(`/admin/users/${id}/status`, { status }).then((r) => r.data),

  resetPassword: (id: string, newPassword: string) =>
    api.post<void>(`/admin/users/${id}/reset-password`, { newPassword }).then(() => undefined),
};
