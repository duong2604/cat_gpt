"use client";

import {
  MessageSquareIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { ConversationDto } from "@cat-gpt/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useChatStream } from "../chat-stream-provider";
import { useConversations } from "../hooks";
import { DeleteConversationDialog, RenameConversationDialog } from "./conversation-dialogs";

type Group = "today" | "yesterday" | "last7Days" | "last30Days" | "older";

const DAY_MS = 24 * 60 * 60 * 1000;

function groupOf(date: Date, startOfToday: number): Group {
  const t = date.getTime();
  if (t >= startOfToday) return "today";
  if (t >= startOfToday - DAY_MS) return "yesterday";
  if (t >= startOfToday - 7 * DAY_MS) return "last7Days";
  if (t >= startOfToday - 30 * DAY_MS) return "last30Days";
  return "older";
}

/** Danh sách hội thoại (cột trái của trang chat, hoặc nằm trong Sheet trên mobile). */
export function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const conversations = useConversations(debouncedSearch);

  const [renameTarget, setRenameTarget] = useState<ConversationDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversationDto | null>(null);

  const groups = useMemo(() => {
    const items = conversations.data?.pages.flatMap((p) => p.items) ?? [];
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const result = new Map<Group, ConversationDto[]>();
    for (const item of items) {
      const group = groupOf(new Date(item.lastMessageAt), startOfToday);
      result.set(group, [...(result.get(group) ?? []), item]);
    }
    return [...result];
  }, [conversations.data]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 p-3">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href={routes.chat} onClick={onNavigate}>
            <SquarePenIcon />
            {t("newChat")}
          </Link>
        </Button>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {conversations.isPending ? (
          <div className="space-y-2 px-2 pt-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : conversations.isError ? (
          <div className="flex flex-col items-center gap-3 px-2 py-8 text-center text-sm">
            <span className="text-destructive">{errorMessage(conversations.error)}</span>
            <Button variant="outline" size="sm" onClick={() => conversations.refetch()}>
              {tCommon("retry")}
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-2 py-10 text-center text-sm text-muted-foreground">
            <MessageSquareIcon className="size-5" />
            {debouncedSearch ? t("emptySearch") : t("emptyList")}
          </div>
        ) : (
          <>
            {groups.map(([group, items]) => (
              <section key={group} className="mt-3 first:mt-1">
                <h3 className="px-2 pb-1 text-xs font-medium text-muted-foreground">{t(`groups.${group}`)}</h3>
                <ul className="space-y-0.5">
                  {items.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      onNavigate={onNavigate}
                      onRename={() => setRenameTarget(conversation)}
                      onDelete={() => setDeleteTarget(conversation)}
                    />
                  ))}
                </ul>
              </section>
            ))}
            {conversations.hasNextPage ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-muted-foreground"
                disabled={conversations.isFetchingNextPage}
                onClick={() => conversations.fetchNextPage()}
              >
                {conversations.isFetchingNextPage ? <Spinner /> : null}
                {t("loadMore")}
              </Button>
            ) : null}
          </>
        )}
      </nav>

      <RenameConversationDialog conversation={renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)} />
      <DeleteConversationDialog conversation={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </div>
  );
}

function ConversationItem({
  conversation,
  onNavigate,
  onRename,
  onDelete,
}: {
  conversation: ConversationDto;
  onNavigate?: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("chat");
  const pathname = usePathname();
  const { active } = useChatStream();
  const href = `${routes.chat}/${conversation.id}`;
  const isActive = pathname === href;
  const isStreaming = active?.conversationId === conversation.id;

  return (
    <li
      className={cn(
        "group/item relative flex items-center rounded-md text-sm hover:bg-accent",
        isActive && "bg-accent font-medium",
      )}
    >
      <Link href={href} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-8 pl-2">
        <span className="truncate">{conversation.title}</span>
        {isStreaming ? <Spinner className="size-3 shrink-0 text-muted-foreground" /> : null}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("actions")}
            className="absolute right-1 opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 max-md:opacity-100"
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={onRename}>
            <PencilIcon />
            {t("rename.action")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2Icon />
            {t("delete.action")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
