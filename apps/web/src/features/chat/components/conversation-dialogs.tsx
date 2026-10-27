"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CONVERSATION_TITLE_MAX_LENGTH, type ConversationDto } from "@cat-gpt/shared";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { routes } from "@/lib/routes";
import { useDeleteConversation, useRenameConversation } from "../hooks";

export function RenameConversationDialog({
  conversation,
  onOpenChange,
}: {
  conversation: ConversationDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={conversation !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Gắn key để form khởi tạo lại tiêu đề mỗi lần mở cho hội thoại khác. */}
        {conversation ? (
          <RenameForm key={conversation.id} conversation={conversation} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RenameForm({ conversation, onDone }: { conversation: ConversationDto; onDone: () => void }) {
  const t = useTranslations("chat.rename");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const rename = useRenameConversation();
  const [title, setTitle] = useState(conversation.title);
  const trimmed = title.trim();

  const submit = () => {
    if (!trimmed || trimmed === conversation.title) return onDone();
    rename.mutate(
      { id: conversation.id, title: trimmed },
      {
        onSuccess: () => {
          toast.success(t("done"));
          onDone();
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-4"
    >
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
      </DialogHeader>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={CONVERSATION_TITLE_MAX_LENGTH}
        aria-label={t("title")}
        autoFocus
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={rename.isPending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={!trimmed || rename.isPending}>
          {rename.isPending ? <Spinner /> : null}
          {tCommon("save")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteConversationDialog({
  conversation,
  onOpenChange,
}: {
  conversation: ConversationDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("chat.delete");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const remove = useDeleteConversation();
  const router = useRouter();
  const pathname = usePathname();

  const confirm = () => {
    if (!conversation) return;
    const isOpen = pathname === `${routes.chat}/${conversation.id}`;
    remove.mutate(conversation.id, {
      onSuccess: () => {
        toast.success(t("done"));
        onOpenChange(false);
        if (isOpen) router.replace(routes.chat);
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  return (
    <AlertDialog open={conversation !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { title: conversation?.title ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>{tCommon("cancel")}</AlertDialogCancel>
          {/* Dùng Button thường thay vì AlertDialogAction để dialog chỉ đóng khi API thành công. */}
          <Button variant="destructive" disabled={remove.isPending} onClick={confirm}>
            {remove.isPending ? <Spinner /> : null}
            {t("confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
