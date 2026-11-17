"use client";

import { useTranslations } from "next-intl";
import { DocumentStatus } from "@cat-gpt/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DOT_COLOR: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: "bg-muted-foreground",
  [DocumentStatus.PROCESSING]: "bg-amber-500",
  [DocumentStatus.READY]: "bg-emerald-500",
  [DocumentStatus.FAILED]: "bg-destructive",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const t = useTranslations("documents.status");
  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={cn("size-1.5 rounded-full", DOT_COLOR[status])} aria-hidden />
      {t(status)}
    </Badge>
  );
}
