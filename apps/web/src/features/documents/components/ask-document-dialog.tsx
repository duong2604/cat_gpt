"use client";

import { CheckIcon, FileTextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { CHAT_MAX_DOCUMENTS, type DocumentDto, DocumentStatus, MAX_PAGE_SIZE } from "@cat-gpt/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useErrorMessage } from "@/hooks/use-error-message";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useDocuments } from "../hooks";

/**
 * Chọn tài liệu để hỏi (Q-M4-1): tài liệu vừa bấm được chọn sẵn; chỉ liệt kê `READY` của
 * người dùng hiện tại (API lọc theo userId), tối đa CHAT_MAX_DOCUMENTS. Xác nhận → mở Chat
 * với `?documents=` — hội thoại chỉ được tạo khi gửi tin đầu tiên.
 */
export function AskDocumentDialog({
  document,
  onOpenChange,
}: {
  /** Tài liệu vừa bấm "Hỏi tài liệu" — chọn sẵn. */
  document: DocumentDto;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("documents.ask");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const ready = useDocuments({ page: 1, pageSize: MAX_PAGE_SIZE, status: DocumentStatus.READY });
  const [selected, setSelected] = useState<string[]>([document.id]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else if (selected.length >= CHAT_MAX_DOCUMENTS) {
      toast.error(t("maxReached", { max: CHAT_MAX_DOCUMENTS }));
    } else {
      setSelected([...selected, id]);
    }
  };

  const start = () => {
    onOpenChange(false);
    router.push(`${routes.chat}?documents=${selected.join(",")}`);
  };

  const items = ready.data?.items ?? [];

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description", { max: CHAT_MAX_DOCUMENTS })}</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {t("selected", { count: selected.length, max: CHAT_MAX_DOCUMENTS })}
        </p>

        <div className="-mx-1 min-h-0 flex-1 space-y-2 overflow-y-auto px-1">
          {ready.isPending ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : ready.isError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="text-sm text-destructive">{errorMessage(ready.error)}</span>
              <Button variant="outline" size="sm" onClick={() => ready.refetch()}>
                {tCommon("retry")}
              </Button>
            </div>
          ) : items.length === 0 ? (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileTextIcon />
                </EmptyMedia>
                <EmptyDescription>{t("empty")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            items.map((doc) => {
              const on = selected.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(doc.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                    on && "border-primary bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border",
                      on && "border-primary bg-primary text-primary-foreground",
                    )}
                    aria-hidden
                  >
                    {on ? <CheckIcon className="size-3.5" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{doc.name}</span>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button disabled={selected.length === 0} onClick={start}>
            {t("start")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
