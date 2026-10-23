import type { UserDto } from "@cat-gpt/shared";
import { api } from "@/lib/api/client";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<UserDto>("/auth/login", payload).then((r) => r.data),
  logout: () => api.post<void>("/auth/logout").then(() => undefined),
  me: () => api.get<UserDto>("/me").then((r) => r.data),
};
