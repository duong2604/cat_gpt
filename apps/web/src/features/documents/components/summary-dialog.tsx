"use client";

import { RefreshCwIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";
import { type DocumentDto, SummaryStatus } from "@cat-gpt/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Markdown } from "@/features/chat/components/markdown";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useDocumentDetail, useSummarizeDocument } from "../hooks";

/**
 * Tóm tắt một tài liệu READY (SE-016). Mở hộp thoại: nếu chưa có trạng thái tóm tắt thì xếp
 * job; đã có bản lưu thì chỉ hiển thị (server không gọi LLM lần hai). Đang PENDING thì tự
 * làm mới đến khi có kết quả; FAILED thì cho thử lại.
 */
export function SummaryDocumentDialog({
  document,
  onOpenChange,
}: {
  document: DocumentDto;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("documents.summary");
  const tErrors = useTranslations("errors");
  const errorMessage = useErrorMessage();
  const format = useFormatter();
  const detail = useDocumentDetail(document.id);
  const { mutate, isPending } = useSummarizeDocument();
  const current = detail.data ?? document;

  useEffect(() => {
    if (document.summaryStatus !== undefined) return;
    mutate(document.id, { onError: (error) => toast.error(errorMessage(error)) });
  }, [document.id, document.summaryStatus, mutate, errorMessage]);

  const status = current.summaryStatus;
  const retry = () => mutate(document.id, { onError: (error) => toast.error(errorMessage(error)) });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-4 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="truncate">{document.name}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {status === SummaryStatus.READY && current.summary ? (
            <div className="space-y-3">
              <Markdown content={current.summary} />
              {current.summaryModel || current.summarizedAt ? (
                <p className="text-xs text-muted-foreground">
                  {current.summaryModel ? t("model", { model: current.summaryModel }) : null}
                  {current.summaryModel && current.summarizedAt ? " · " : null}
                  {current.summarizedAt
                    ? format.dateTime(new Date(current.summarizedAt), { dateStyle: "medium", timeStyle: "short" })
                    : null}
                </p>
              ) : null}
            </div>
          ) : status === SummaryStatus.FAILED && !isPending ? (
            <p className="text-sm text-destructive">
              {current.summaryErrorCode
                ? tErrors(current.summaryErrorCode as Parameters<typeof tErrors>[0])
                : t("failed")}
            </p>
          ) : (
            <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground" role="status">
              <Spinner className="size-5" />
              {t("pending")}
            </div>
          )}
        </div>

        <DialogFooter>
          {status === SummaryStatus.FAILED && !isPending ? (
            <Button variant="outline" onClick={retry}>
              <RefreshCwIcon />
              {t("retry")}
            </Button>
          ) : null}
          <Button onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
