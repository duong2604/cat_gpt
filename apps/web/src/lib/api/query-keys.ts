import type { UserRole, UserStatus } from "@cat-gpt/shared";

export interface AdminUsersFilter {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

/** Tập trung query key của TanStack Query để invalidate nhất quán. */
export const queryKeys = {
  me: ["me"] as const,
  mySessions: ["me", "sessions"] as const,
  adminUsers: {
    all: ["admin", "users"] as const,
    list: (filter: AdminUsersFilter) => ["admin", "users", "list", filter] as const,
  },
};
