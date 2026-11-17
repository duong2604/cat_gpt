"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ErrorCode, type DocumentDto } from "@cat-gpt/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getErrorCode } from "@/lib/api/errors";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useDeleteDocument } from "../hooks";

export function DeleteDocumentDialog({
  document,
  onOpenChange,
}: {
  document: DocumentDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("documents.deleteDialog");
  const tCommon = useTranslations("common");
  const tDocuments = useTranslations("documents");
  const errorMessage = useErrorMessage();
  const deleteDoc = useDeleteDocument();

  const onConfirm = () => {
    if (!document) return;
    const { id, name } = document;
    deleteDoc.mutate(id, {
      onSuccess: () => toast.success(tDocuments("deleted", { name })),
      onError: (error) => {
        // Đã bị xóa ở tab khác (404) — coi như đã xóa, không báo lỗi gây hoang mang.
        if (getErrorCode(error) === ErrorCode.DOCUMENT_NOT_FOUND) {
          toast.success(tDocuments("deleted", { name }));
          return;
        }
        toast.error(errorMessage(error));
      },
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={document !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {document ? t("description", { name: document.name }) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
