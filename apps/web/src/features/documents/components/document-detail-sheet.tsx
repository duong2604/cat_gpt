"use client";

import { CheckCircle2Icon, CircleDashedIcon, CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { type FakeDocument, PROCESSING_STEPS, type ProcessingStep } from "../fake-data";
import { DocumentIcon, DocumentStatusBadge, useFormatBytes } from "./document-status";

type StepState = "done" | "running" | "failed" | "pending";

function stepState(doc: FakeDocument, step: ProcessingStep): StepState {
  if (doc.status === "READY") return "done";
  if (doc.status === "UPLOADING" || !doc.step) return "pending";
  const current = PROCESSING_STEPS.indexOf(doc.step);
  const index = PROCESSING_STEPS.indexOf(step);
  if (index < current) return "done";
  if (index > current) return "pending";
  return doc.status === "FAILED" ? "failed" : "running";
}

const STEP_ICON: Record<StepState, ReactNode> = {
  done: <CheckCircle2Icon className="size-5 text-emerald-600 dark:text-emerald-400" />,
  running: <LoaderCircleIcon className="size-5 animate-spin text-primary" />,
  failed: <CircleXIcon className="size-5 text-destructive" />,
  pending: <CircleDashedIcon className="size-5 text-muted-foreground" />,
};

/** Xem thông tin (metadata) và trạng thái từng bước của pipeline xử lý tài liệu. */
export function DocumentDetailSheet({
  document,
  onOpenChange,
}: {
  document: FakeDocument | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("documents");
  const format = useFormatter();
  const formatBytes = useFormatBytes();
  const dateTime = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short" });

  return (
    <Sheet open={document !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {document ? (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-start gap-3 pr-6">
                <DocumentIcon type={document.type} />
                <div className="min-w-0 space-y-1">
                  <SheetTitle className="break-all">{document.name}</SheetTitle>
                  <SheetDescription asChild>
                    <div>
                      <DocumentStatusBadge document={document} />
                    </div>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 overflow-y-auto p-4">
              <section className="space-y-3">
                <h3 className="text-sm font-medium">{t("detail.metadata")}</h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <Meta label={t("detail.type")} value={document.type.toUpperCase()} />
                  <Meta label={t("detail.size")} value={formatBytes(document.sizeBytes)} />
                  <Meta label={t("detail.pages")} value={document.pages ?? "—"} />
                  <Meta label={t("detail.chunks")} value={document.chunks ?? "—"} />
                  <Meta label={t("detail.uploadedBy")} value={document.uploadedBy} />
                  <Meta label={t("detail.uploadedAt")} value={dateTime(document.uploadedAt)} />
                  <Meta label={t("detail.processedAt")} value={document.processedAt ? dateTime(document.processedAt) : "—"} />
                </dl>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-medium">{t("detail.pipeline")}</h3>
                <ol className="space-y-0">
                  {PROCESSING_STEPS.map((step, i) => {
                    const state = stepState(document, step);
                    return (
                      <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
                        {i < PROCESSING_STEPS.length - 1 ? (
                          <span
                            className={cn(
                              "absolute top-6 left-2.5 h-[calc(100%-1.5rem)] w-px -translate-x-1/2",
                              state === "done" ? "bg-emerald-500/50" : "bg-border",
                            )}
                          />
                        ) : null}
                        {STEP_ICON[state]}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className={cn("text-sm", state === "pending" && "text-muted-foreground")}>
                            {t(`steps.${step}`)}
                          </div>
                          <div className="text-xs text-muted-foreground">{t(`stepHints.${step}`)}</div>
                          {state === "failed" && document.errorKey ? (
                            <div className="text-xs text-destructive">{t(`errors.${document.errorKey}`)}</div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{value}</dd>
    </>
  );
}
