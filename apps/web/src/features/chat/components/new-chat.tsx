"use client";

import { FileTextIcon, LightbulbIcon, MailIcon, TableIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppLogo } from "@/components/app-logo";
import { useCurrentUser } from "@/features/auth/hooks";
import { useChatStream } from "../chat-stream-provider";
import { ChatInput } from "./chat-input";
import { ChatTopBar } from "./chat-layout";
import { MessageList } from "./message-list";

const SUGGESTIONS = [
  { key: "email", icon: MailIcon },
  { key: "summary", icon: FileTextIcon },
  { key: "compare", icon: TableIcon },
  { key: "ideas", icon: LightbulbIcon },
] as const;

/** Màn hình /chat: lời chào + gợi ý; gửi tin nhắn đầu tiên sẽ tạo hội thoại mới. */
export function NewChat() {
  const t = useTranslations("chat");
  const user = useCurrentUser();
  const { active, send, stop } = useChatStream();
  // Stream bắt đầu từ màn hình này: hiển thị ngay tại đây cho tới khi chuyển sang /chat/<id>.
  const pending = active?.newChatContent ? { ...active, pendingContent: active.newChatContent } : null;

  return (
    <>
      <ChatTopBar title={t("newChat")} />
      {pending ? (
        <MessageList messages={[]} stream={pending} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-4 py-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <AppLogo className="size-12" />
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("greeting", { name: user.fullName.split(" ").at(-1) ?? user.fullName })}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">{t("greetingHint")}</p>
          </div>
          <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                disabled={active !== null}
                onClick={() => send(t(`suggestions.${key}`), null)}
                className="flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{t(`suggestions.${key}`)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <ChatInput
        onSend={(content) => send(content, null)}
        onStop={stop}
        streaming={pending !== null}
        disabled={active !== null}
        autoFocus
      />
    </>
  );
}
