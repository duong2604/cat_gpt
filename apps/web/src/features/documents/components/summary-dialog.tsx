"use client";

import { BookOpenCheckIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEARCHABLE_DOCUMENTS, summaryOf } from "@/features/ask/fake-knowledge";
import { useTypewriter } from "@/features/ask/use-typewriter";
import { Markdown } from "@/features/chat/components/markdown";
import { routes } from "@/lib/routes";
import type { FakeDocument } from "../fake-data";

type Mode = "short" | "detailed";

/** Thời gian giả lập bước "đọc các đoạn của tài liệu" trước khi sinh tóm tắt. */
const READING_MS = 900;

/** Tóm tắt tài liệu bằng AI (bản demo: nội dung soạn sẵn, hiện dần như LLM streaming). */
export function SummaryDialog({
  document,
  onOpenChange,
}: {
  document: FakeDocument | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={document !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col sm:max-w-2xl">
        {document ? <SummaryContent key={document.id} document={document} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function SummaryContent({ document }: { document: FakeDocument }) {
  const t = useTranslations("documents.summary");
  const [mode, setMode] = useState<Mode>("short");
  const [reading, setReading] = useState(true);
  const { output, done } = useTypewriter(summaryOf(document)[mode], !reading);
  const canAsk = SEARCHABLE_DOCUMENTS.some((d) => d.id === document.id);

  useEffect(() => {
    const timer = setTimeout(() => setReading(false), READING_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          {t("title")}
        </DialogTitle>
        <DialogDescription className="break-all">{document.name}</DialogDescription>
      </DialogHeader>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList>
          <TabsTrigger value="short" disabled={!done}>
            {t("short")}
          </TabsTrigger>
          <TabsTrigger value="detailed" disabled={!done}>
            {t("detailed")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="min-h-32 overflow-y-auto rounded-lg border bg-muted/20 p-4">
        {reading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            {t("reading", { chunks: document.chunks ?? 0 })}
          </div>
        ) : (
          <Markdown content={output} />
        )}
      </div>

      <DialogFooter className="items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{t("note")}</p>
        {canAsk ? (
          <Button asChild variant="outline" disabled={!done}>
            <Link href={`${routes.ask}?docs=${document.id}`}>
              <BookOpenCheckIcon />
              {t("askThis")}
            </Link>
          </Button>
        ) : null}
      </DialogFooter>
    </>
  );
}
