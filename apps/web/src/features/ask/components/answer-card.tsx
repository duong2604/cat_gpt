"use client";

import { CheckIcon, FileSearchIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, useEffect, useMemo, useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { DocumentIcon } from "@/features/documents/components/document-status";
import { Markdown } from "@/features/chat/components/markdown";
import { UserMessage } from "@/features/chat/components/message-item";
import { cn } from "@/lib/utils";
import { findAnswer, type ResolvedSource } from "../fake-knowledge";
import { useTypewriter } from "../use-typewriter";

export interface AskTurn {
  id: string;
  question: string;
  /** Id các tài liệu nằm trong phạm vi tra cứu lúc đặt câu hỏi. */
  scope: string[];
}

type Phase = "searching" | "retrieved" | "generating";

/** Thời gian giả lập cho từng bước của pipeline RAG. */
const SEARCH_MS = 900;
const RETRIEVED_MS = 700;

/** Số trích dẫn [n] trong câu trả lời → liên kết tới thẻ nguồn tương ứng (cuộn tới và tô viền bằng :target). */
function CitationLink({ href, children }: ComponentProps<"a">) {
  if (!href?.startsWith("#src-")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      className="mx-0.5 inline-flex h-4.5 min-w-4.5 -translate-y-0.5 items-center justify-center rounded-full bg-primary/10 px-1 text-[11px] font-semibold text-primary no-underline hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </a>
  );
}

const MARKDOWN_OVERRIDES = { a: CitationLink };

export function AnswerCard({ turn, onDone }: { turn: AskTurn; onDone: () => void }) {
  const t = useTranslations("ask");
  const { answer, sources } = useMemo(() => findAnswer(turn.question, turn.scope), [turn]);
  const [phase, setPhase] = useState<Phase>("searching");

  const { output: typed, done } = useTypewriter(answer, phase === "generating");
  // Biến "[n]" thành liên kết markdown tới thẻ nguồn của chính câu trả lời này.
  const output = typed.replace(/\[(\d+)\]/g, (_, n: string) => `[${n}](#src-${turn.id}-${n})`);
  const documentCount = new Set(sources.map((s) => s.documentId)).size;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("retrieved"), SEARCH_MS),
      setTimeout(() => setPhase("generating"), SEARCH_MS + RETRIEVED_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const finished = phase === "generating" && done;
  useEffect(() => {
    if (finished) onDone();
  }, [finished, onDone]);

  return (
    <div className="space-y-4">
      <UserMessage content={turn.question} />

      <div className="flex gap-3">
        <AppLogo className="mt-0.5 size-7 shrink-0" />
        <div className="min-w-0 flex-1 space-y-4">
          {/* Các bước của pipeline RAG */}
          <ol className="space-y-1.5 text-xs text-muted-foreground">
            <Step
              icon={SearchIcon}
              active={phase === "searching"}
              label={t("steps.searching", { count: turn.scope.length })}
            />
            {phase !== "searching" ? (
              <Step
                icon={FileSearchIcon}
                active={false}
                label={
                  sources.length
                    ? t("steps.retrieved", { chunks: sources.length, documents: documentCount })
                    : t("steps.noMatch")
                }
              />
            ) : null}
            {phase === "generating" ? (
              <Step icon={SparklesIcon} active={!finished} label={t("steps.generating")} />
            ) : null}
          </ol>

          {output ? <Markdown content={output} overrides={MARKDOWN_OVERRIDES} /> : null}

          {finished && sources.length > 0 ? (
            <section className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">{t("sources")}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {sources.map((source) => (
                  <SourceCard key={source.id} turnId={turn.id} source={source} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Step({ icon: Icon, active, label }: { icon: typeof SearchIcon; active: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {active ? <Spinner className="size-3.5" /> : <CheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />}
      <Icon className="size-3.5" />
      <span className={cn(active && "text-foreground")}>{label}</span>
    </li>
  );
}

function SourceCard({ turnId, source }: { turnId: string; source: ResolvedSource }) {
  const t = useTranslations("ask");
  return (
    <div
      id={`src-${turnId}-${source.number}`}
      className="scroll-mt-24 space-y-2 rounded-lg border p-3 text-sm transition-shadow target:ring-2 target:ring-primary"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
          {source.number}
        </span>
        <DocumentIcon type={source.document.type} className="size-6 rounded-md" />
        <span className="min-w-0 flex-1 truncate font-medium">{source.document.name}</span>
      </div>
      <p className="line-clamp-4 text-xs leading-5 text-muted-foreground">“{source.text}”</p>
      <div className="flex gap-1.5">
        <Badge variant="secondary">{t("page", { page: source.page })}</Badge>
        <Badge variant="outline">{t("relevance", { score: Math.round(source.score * 100) })}</Badge>
      </div>
    </div>
  );
}
