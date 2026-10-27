"use client";

import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useState } from "react";
import { CHAT_MAX_MESSAGE_LENGTH } from "@cat-gpt/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Chỉ hiện bộ đếm ký tự khi gần chạm giới hạn. */
const COUNTER_FROM = CHAT_MAX_MESSAGE_LENGTH - 500;

export function ChatInput({
  onSend,
  onStop,
  streaming,
  disabled = false,
  autoFocus,
  placeholder,
}: {
  placeholder?: string;
  onSend: (content: string) => void;
  onStop: () => void;
  /** Hội thoại này đang nhận câu trả lời → hiện nút Dừng. */
  streaming: boolean;
  /** Một hội thoại khác đang stream → tạm khóa nút Gửi (mỗi lúc chỉ một câu trả lời). */
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const t = useTranslations("chat.input");
  const [value, setValue] = useState("");
  const content = value.trim();
  const tooLong = value.length > CHAT_MAX_MESSAGE_LENGTH;
  const canSend = !streaming && !disabled && content.length > 0 && !tooLong;

  const submit = () => {
    if (!canSend) return;
    onSend(content);
    setValue("");
  };

  // Enter để gửi, Shift+Enter để xuống dòng; bỏ qua khi đang gõ dấu tiếng Việt (IME composing).
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/30"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? t("placeholder")}
          aria-label={placeholder ?? t("placeholder")}
          autoFocus={autoFocus}
          rows={1}
          className="field-sizing-content max-h-52 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6 outline-none placeholder:text-muted-foreground"
        />
        {streaming ? (
          <Button type="button" size="icon" variant="secondary" className="rounded-full" aria-label={t("stop")} onClick={onStop}>
            <SquareIcon className="fill-current" />
          </Button>
        ) : (
          <Button type="submit" size="icon" className="rounded-full" aria-label={t("send")} disabled={!canSend}>
            <ArrowUpIcon />
          </Button>
        )}
      </form>
      <div className="mt-2 flex justify-between gap-4 px-2 text-xs text-muted-foreground">
        <span>{t("hint")}</span>
        {value.length >= COUNTER_FROM ? (
          <span className={cn("tabular-nums", tooLong && "font-medium text-destructive")}>
            {value.length.toLocaleString()}/{CHAT_MAX_MESSAGE_LENGTH.toLocaleString()}
          </span>
        ) : null}
      </div>
    </div>
  );
}
