"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { type ChatStreamEvent, type MessageDto, MessageRole } from "@cat-gpt/shared";
import { useErrorMessage } from "@/hooks/use-error-message";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { routes } from "@/lib/routes";
import { chatApi } from "./api";
import { appendMessage } from "./hooks";
import { streamChat } from "./stream";

/** Câu trả lời đang được stream (mỗi lúc chỉ có tối đa một). */
export interface ActiveStream {
  /** null cho tới khi server tạo xong hội thoại mới (sự kiện `meta`). */
  conversationId: string | null;
  /** Tin nhắn vừa gửi, hiển thị tạm trước khi server xác nhận. */
  pendingContent: string | null;
  /** Tin nhắn mở đầu khi gửi từ màn hình /chat: màn hình đó giữ hiển thị stream cho tới khi chuyển trang xong. */
  newChatContent: string | null;
  text: string;
}

interface ChatStreamContextValue {
  active: ActiveStream | null;
  send: (content: string, conversationId: string | null) => void;
  regenerate: (conversationId: string) => void;
  stop: () => void;
}

const ChatStreamContext = createContext<ChatStreamContextValue | null>(null);

/**
 * Giữ trạng thái streaming ở layout của /chat để stream không bị ngắt khi URL đổi
 * từ /chat sang /chat/<id>, hoặc khi người dùng chuyển sang xem hội thoại khác.
 */
export function ChatStreamProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const [active, setActive] = useState<ActiveStream | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const run = useCallback(
    async (path: string, body: unknown, initial: ActiveStream) => {
      if (controllerRef.current) return;
      const controller = new AbortController();
      controllerRef.current = controller;
      activeIdRef.current = initial.conversationId;
      setActive(initial);

      let finished = false;
      const onEvent = (event: ChatStreamEvent) => {
        switch (event.type) {
          case "meta": {
            const { conversation, userMessage } = event;
            activeIdRef.current = conversation.id;
            queryClient.setQueryData(queryKeys.chat.conversation(conversation.id), conversation);
            if (userMessage) appendMessage(queryClient, userMessage);
            setActive((s) => s && { ...s, conversationId: conversation.id, pendingContent: null });
            if (!initial.conversationId) router.replace(`${routes.chat}/${conversation.id}`);
            void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations });
            break;
          }
          case "delta":
            setActive((s) => s && { ...s, text: s.text + event.text });
            break;
          case "done":
            finished = true;
            appendMessage(queryClient, event.message);
            // Ẩn bong bóng streaming cùng lúc để không hiện trùng câu trả lời trong một khung hình.
            setActive(null);
            void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations });
            break;
          case "error":
            toast.error(errorMessage(new ApiError(event.code)));
            break;
        }
      };

      try {
        await streamChat(path, body, onEvent, controller.signal);
      } catch (error) {
        toast.error(errorMessage(error));
      } finally {
        const id = activeIdRef.current;
        // Stream kết thúc bất thường (bị hủy, lỗi, hội thoại bị xóa) → đồng bộ lại với server.
        if (!finished && id) void queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(id) });
        controllerRef.current = null;
        activeIdRef.current = null;
        setActive(null);
      }
    },
    [queryClient, router, errorMessage],
  );

  const send = useCallback(
    (content: string, conversationId: string | null) =>
      void run(
        "/chat/stream",
        { content, conversationId: conversationId ?? undefined },
        { conversationId, pendingContent: content, newChatContent: conversationId ? null : content, text: "" },
      ),
    [run],
  );

  const regenerate = useCallback(
    (conversationId: string) => {
      if (controllerRef.current) return;
      // Ẩn ngay câu trả lời cũ; server sẽ xóa nó và sinh câu mới.
      queryClient.setQueryData<MessageDto[]>(queryKeys.chat.messages(conversationId), (old) =>
        old?.at(-1)?.role === MessageRole.ASSISTANT ? old.slice(0, -1) : old,
      );
      void run(`/conversations/${conversationId}/regenerate`, undefined, {
        conversationId,
        pendingContent: null,
        newChatContent: null,
        text: "",
      });
    },
    [run, queryClient],
  );

  /** Ưu tiên báo server dừng (server gửi `done` với trạng thái STOPPED); thất bại thì cắt kết nối. */
  const stop = useCallback(() => {
    const id = activeIdRef.current;
    const abort = () => controllerRef.current?.abort();
    if (!id) return abort();
    chatApi.stop(id).catch(abort);
  }, []);

  const value = useMemo(() => ({ active, send, regenerate, stop }), [active, send, regenerate, stop]);
  return <ChatStreamContext.Provider value={value}>{children}</ChatStreamContext.Provider>;
}

export function useChatStream(): ChatStreamContextValue {
  const context = useContext(ChatStreamContext);
  if (!context) throw new Error("useChatStream() phải được dùng bên trong ChatStreamProvider");
  return context;
}
