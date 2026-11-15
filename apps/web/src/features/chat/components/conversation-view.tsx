"use client";

import { MessageSquareOffIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type ConversationDto, ErrorCode } from "@cat-gpt/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { getErrorCode } from "@/lib/api/errors";
import { routes } from "@/lib/routes";
import { useChatStream } from "../chat-stream-provider";
import { useConversation, useMessages } from "../hooks";
import { ChatInput } from "./chat-input";
import { ChatTopBar } from "./chat-layout";
import { DeleteConversationDialog, RenameConversationDialog } from "./conversation-dialogs";
import { MessageList } from "./message-list";

export function ConversationView({ conversationId }: { conversationId: string }) {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const { active, send, regenerate, stop } = useChatStream();
  const stream = active?.conversationId === conversationId ? active : null;

  const [renameTarget, setRenameTarget] = useState<ConversationDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversationDto | null>(null);

  const error = conversation.error ?? messages.error;
  if (error) {
    const notFound = getErrorCode(error) === ErrorCode.CONVERSATION_NOT_FOUND;
    return (
      <>
        <ChatTopBar />
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareOffIcon />
            </EmptyMedia>
            <EmptyTitle>{notFound ? t("notFound") : errorMessage(error)}</EmptyTitle>
            {notFound ? <EmptyDescription>{t("notFoundHint")}</EmptyDescription> : null}
          </EmptyHeader>
          <EmptyContent>
            {notFound ? (
              <Button asChild>
                <Link href={routes.chat}>{t("newChat")}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={() => void Promise.all([conversation.refetch(), messages.refetch()])}>
                {tCommon("retry")}
              </Button>
            )}
          </EmptyContent>
        </Empty>
      </>
    );
  }

  const data = conversation.data;

  return (
    <>
      <ChatTopBar
        title={data?.title}
        actions={
          data ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t("actions")}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setRenameTarget(data)}>
                  <PencilIcon />
                  {t("rename.action")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(data)}>
                  <Trash2Icon />
                  {t("delete.action")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
      />

      {messages.data ? (
        <MessageList messages={messages.data} stream={stream} onRegenerate={() => regenerate(conversationId)} />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}

      <ChatInput
        key={conversationId}
        onSend={(content) => send(content, conversationId)}
        onStop={stop}
        streaming={stream !== null}
        disabled={active !== null}
        autoFocus
      />

      <RenameConversationDialog conversation={renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)} />
      <DeleteConversationDialog conversation={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </>
  );
}
