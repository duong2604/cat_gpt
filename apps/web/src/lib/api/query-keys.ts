import type { DocumentStatus, UserRole, UserStatus } from "@cat-gpt/shared";

export interface AdminUsersFilter {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface DocumentsFilter {
  page: number;
  pageSize: number;
  q?: string;
  status?: DocumentStatus;
}

/** Tập trung query key của TanStack Query để invalidate nhất quán. */
export const queryKeys = {
  me: ["me"] as const,
  myFeatures: ["me", "features"] as const,
  mySessions: ["me", "sessions"] as const,
  chat: {
    conversations: ["chat", "conversations"] as const,
    conversationList: (search: string) => ["chat", "conversations", "list", search] as const,
    conversation: (id: string) => ["chat", "conversation", id] as const,
    messages: (id: string) => ["chat", "messages", id] as const,
  },
  adminUsers: {
    all: ["admin", "users"] as const,
    list: (filter: AdminUsersFilter) => ["admin", "users", "list", filter] as const,
  },
  documents: {
    all: ["documents"] as const,
    list: (filter: DocumentsFilter) => ["documents", "list", filter] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
  },
};
