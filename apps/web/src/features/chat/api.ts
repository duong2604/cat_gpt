import type { ConversationDto, CursorPage, MessageDto } from "@cat-gpt/shared";
import { api } from "@/lib/api/client";

export const chatApi = {
  listConversations: (params: { q?: string; cursor?: string }) =>
    api
      .get<CursorPage<ConversationDto>>("/conversations", { params })
      .then((r) => r.data),

  getConversation: (id: string) =>
    api.get<ConversationDto>(`/conversations/${id}`).then((r) => r.data),

  rename: (id: string, title: string) =>
    api.patch<ConversationDto>(`/conversations/${id}`, { title }).then((r) => r.data),

  delete: (id: string) => api.delete<void>(`/conversations/${id}`).then(() => undefined),

  messages: (id: string) =>
    api.get<MessageDto[]>(`/conversations/${id}/messages`).then((r) => r.data),

  stop: (id: string) => api.post<void>(`/conversations/${id}/stop`).then(() => undefined),
};
