"use client";

import { UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, useRef } from "react";
import { toast } from "sonner";
import { ErrorCode } from "@cat-gpt/shared";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useUploadDocument } from "../hooks";

export function UploadDocumentButton() {
  const t = useTranslations("documents");
  const tErrors = useTranslations("errors");
  const errorMessage = useErrorMessage();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Kiểm tra sớm phía client cho phản hồi nhanh; server vẫn kiểm tra lại (chữ ký tệp).
    if (!file.name.toLowerCase().endsWith(".txt")) {
      toast.error(tErrors(ErrorCode.FILE_INVALID_TYPE));
      return;
    }

    upload.mutate(file, {
      onSuccess: (doc) => toast.success(t("uploaded", { name: doc.name })),
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  return (
    <>
      <Button type="button" disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
        {upload.isPending ? <Spinner /> : <UploadIcon />}
        {upload.isPending ? t("uploading") : t("upload")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={onFileChange}
      />
    </>
  );
}
