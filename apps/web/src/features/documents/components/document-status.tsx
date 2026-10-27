"use client";

import { FileIcon, FileTextIcon, FileTypeIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { type DocumentType, type FakeDocument, PROCESSING_STEPS } from "../fake-data";

const TYPE_STYLE: Record<DocumentType, { icon: typeof FileIcon; className: string }> = {
  pdf: { icon: FileTypeIcon, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
  docx: { icon: FileTextIcon, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  txt: { icon: FileIcon, className: "bg-muted text-muted-foreground" },
};

export function DocumentIcon({ type, className }: { type: DocumentType; className?: string }) {
  const { icon: Icon, className: style } = TYPE_STYLE[type] ?? TYPE_STYLE.txt;
  return (
    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", style, className)}>
      <Icon className="size-4" />
    </div>
  );
}

export function DocumentStatusBadge({ document }: { document: FakeDocument }) {
  const t = useTranslations("documents");

  switch (document.status) {
    case "READY":
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">{t("status.READY")}</Badge>;
    case "FAILED":
      return <Badge variant="destructive">{t("status.FAILED")}</Badge>;
    default:
      return (
        <Badge variant="secondary" className="gap-1.5">
          <Spinner className="size-3" />
          {document.status === "UPLOADING" || !document.step ? t("status.UPLOADING") : t(`steps.${document.step}`)}
        </Badge>
      );
  }
}

/** Thanh tiến độ tổng thể của pipeline (tải lên chiếm 1 phần, mỗi bước xử lý 1 phần). */
export function DocumentProgress({ document }: { document: FakeDocument }) {
  if (document.status !== "UPLOADING" && document.status !== "PROCESSING") return null;
  const stepIndex =
    document.status === "UPLOADING" || !document.step ? 0 : PROCESSING_STEPS.indexOf(document.step) + 1;
  const percent = Math.round(((stepIndex + document.progress / 100) / (PROCESSING_STEPS.length + 1)) * 100);

  return (
    <div className="mt-1.5 h-1 w-full max-w-40 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function useFormatBytes() {
  const format = useFormatter();
  return (bytes: number) => {
    const units = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit++;
    }
    return format.number(value, { style: "unit", unit: units[unit], unitDisplay: "short", maximumFractionDigits: 1 });
  };
}
