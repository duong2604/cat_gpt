"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConversationDto, MessageDto } from "@cat-gpt/shared";
import { queryKeys } from "@/lib/api/query-keys";
import { chatApi } from "./api";

export function useConversations(search: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.chat.conversationList(search),
    queryFn: ({ pageParam }) =>
      chatApi.listConversations({ q: search || undefined, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.chat.conversation(id),
    queryFn: () => chatApi.getConversation(id),
  });
}

export function useMessages(id: string) {
  return useQuery({
    queryKey: queryKeys.chat.messages(id),
    queryFn: () => chatApi.messages(id),
  });
}

export function useRenameConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => chatApi.rename(id, title),
    onSuccess: (conversation: ConversationDto) => {
      queryClient.setQueryData(queryKeys.chat.conversation(conversation.id), conversation);
      return queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.chat.conversation(id) });
      queryClient.removeQueries({ queryKey: queryKeys.chat.messages(id) });
      return queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations });
    },
  });
}

/** Ghi thêm tin nhắn vào cache lịch sử mà không cần tải lại. */
export function appendMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  message: MessageDto,
): void {
  queryClient.setQueryData<MessageDto[]>(queryKeys.chat.messages(message.conversationId), (old) =>
    old?.some((m) => m.id === message.id) ? old : [...(old ?? []), message],
  );
}
