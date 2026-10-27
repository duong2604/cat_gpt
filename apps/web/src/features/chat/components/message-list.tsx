"use client";

import { useEffect, useRef } from "react";
import { type MessageDto, MessageRole } from "@cat-gpt/shared";
import type { ActiveStream } from "../chat-stream-provider";
import { AssistantMessage, UserMessage } from "./message-item";

/** Khoảng cách (px) tới đáy vẫn được coi là "đang ở cuối" → tiếp tục tự cuộn theo chữ mới. */
const STICK_THRESHOLD = 80;

export function MessageList({
  messages,
  stream,
  onRegenerate,
}: {
  messages: MessageDto[];
  /** Stream đang chạy của chính hội thoại này (nếu có). */
  stream: ActiveStream | null;
  onRegenerate?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  const onScroll = () => {
    const el = containerRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
  };

  // Tự cuộn xuống khi có tin nhắn/chữ mới, trừ khi người dùng đang cuộn lên đọc phía trên.
  useEffect(() => {
    const el = containerRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, stream?.text, stream?.pendingContent]);

  const last = messages.at(-1);

  return (
    <div ref={containerRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        {messages.map((message) =>
          message.role === MessageRole.USER ? (
            <UserMessage key={message.id} content={message.content} />
          ) : (
            <AssistantMessage
              key={message.id}
              content={message.content}
              status={message.status}
              onRegenerate={!stream && message === last ? onRegenerate : undefined}
            />
          ),
        )}
        {stream?.pendingContent ? <UserMessage content={stream.pendingContent} /> : null}
        {stream ? <AssistantMessage content={stream.text} streaming /> : null}
      </div>
    </div>
  );
}
