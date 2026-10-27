"use client";

import { MessagesSquareIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatStreamProvider } from "../chat-stream-provider";
import { ConversationList } from "./conversation-list";

/** Bố cục trang chat: danh sách hội thoại bên trái (Sheet trên mobile) + khung chat. */
export function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatStreamProvider>
      {/* Header của app cao 3.5rem; phần còn lại dành cho chat để chỉ danh sách tin nhắn cuộn. */}
      <div className="flex h-[calc(100svh-3.5rem)] min-h-0">
        <aside className="hidden w-72 shrink-0 border-r bg-muted/20 md:block">
          <ConversationList />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </ChatStreamProvider>
  );
}

/** Thanh tiêu đề của khung chat; trên mobile có nút mở danh sách hội thoại. */
export function ChatTopBar({ title, actions }: { title?: string; actions?: ReactNode }) {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:px-4">
      <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label={t("history")} onClick={() => setOpen(true)}>
        <MessagesSquareIcon />
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{title}</h1>
      {actions}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 gap-0 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>{t("history")}</SheetTitle>
            <SheetDescription className="sr-only">{t("history")}</SheetDescription>
          </SheetHeader>
          <ConversationList onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
