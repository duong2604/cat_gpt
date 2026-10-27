"use client";

import { UploadCloudIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type DragEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ACCEPTED_EXTENSIONS, type DocumentType, extensionOf, MAX_DOCUMENT_SIZE_BYTES } from "../fake-data";
import { DocumentIcon, useFormatBytes } from "./document-status";

export function UploadDialog({
  open,
  onOpenChange,
  onUpload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
}) {
  const t = useTranslations("documents.upload");
  const tCommon = useTranslations("common");
  const formatBytes = useFormatBytes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file.name) as DocumentType)) {
        toast.error(t("invalidType", { name: file.name }));
      } else if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        toast.error(t("tooLarge", { name: file.name }));
      } else {
        accepted.push(file);
      }
    }
    setFiles((prev) => [...prev, ...accepted.filter((f) => !prev.some((p) => p.name === f.name))]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const close = (next: boolean) => {
    if (!next) setFiles([]);
    onOpenChange(next);
  };

  const submit = () => {
    onUpload(files);
    toast.success(t("started", { count: files.length }));
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:bg-accent/50",
            dragging && "border-primary bg-primary/5",
          )}
        >
          <UploadCloudIcon className="size-8 text-muted-foreground" />
          <span className="text-sm font-medium">{t("dropzone")}</span>
          <span className="text-xs text-muted-foreground">{t("hint")}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {files.length > 0 ? (
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {files.map((file) => (
              <li key={file.name} className="flex items-center gap-3 rounded-lg border p-2">
                <DocumentIcon type={extensionOf(file.name) as DocumentType} className="size-8" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("remove")}
                  onClick={() => setFiles((prev) => prev.filter((f) => f !== file))}
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            {tCommon("cancel")}
          </Button>
          <Button disabled={files.length === 0} onClick={submit}>
            {t("submit", { count: files.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
