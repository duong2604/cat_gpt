"use client";

import { BookOpenCheckIcon, LibraryIcon, RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/features/chat/components/chat-input";
import { SEARCHABLE_DOCUMENTS } from "../fake-knowledge";
import { AnswerCard, type AskTurn } from "./answer-card";
import { ScopeDialog } from "./scope-dialog";

const SUGGESTIONS = ["remote", "leave", "purchase", "outOfScope"] as const;
/** Khoảng cách (px) tới đáy vẫn được coi là "đang ở cuối" → tiếp tục tự cuộn. */
const STICK_THRESHOLD = 80;

/** Hỏi–đáp dựa trên nội dung tài liệu (RAG), bản demo với dữ liệu giả lập. */
export function AskWorkspace({ initialScope }: { initialScope?: string[] }) {
  const t = useTranslations("ask");
  const [scope, setScope] = useState<string[]>(() => {
    const valid = initialScope?.filter((id) => SEARCHABLE_DOCUMENTS.some((d) => d.id === id));
    return valid?.length ? valid : SEARCHABLE_DOCUMENTS.map((d) => d.id);
  });
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const hasTurns = turns.length > 0;

  const ask = (question: string) => {
    if (busy) return;
    setBusy(true);
    stickRef.current = true;
    setTurns((prev) => [...prev, { id: crypto.randomUUID().slice(0, 8), question, scope }]);
  };
  const onDone = useCallback(() => setBusy(false), []);

  // Nội dung cao thêm (chữ đang chạy, thẻ nguồn) → cuộn theo, trừ khi người dùng đã cuộn lên đọc.
  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;
    const observer = new ResizeObserver(() => {
      if (stickRef.current) scroller.scrollTop = scroller.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [hasTurns]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
  };

  const scopeLabel =
    scope.length === SEARCHABLE_DOCUMENTS.length
      ? t("scope.all", { count: scope.length })
      : scope.length === 1
        ? SEARCHABLE_DOCUMENTS.find((d) => d.id === scope[0])?.name
        : t("scope.some", { count: scope.length });

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:px-4">
        <BookOpenCheckIcon className="size-4 text-primary" />
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{t("title")}</h1>
        <Badge variant="outline" className="hidden text-muted-foreground sm:inline-flex">
          {t("demoBadge")}
        </Badge>
        {turns.length > 0 ? (
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => setTurns([])}>
            <RotateCcwIcon />
            <span className="max-sm:sr-only">{t("reset")}</span>
          </Button>
        ) : null}
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
        {turns.length === 0 ? (
          <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpenCheckIcon className="size-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">{t("heading")}</h2>
              <p className="text-sm text-muted-foreground">{t("intro")}</p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => ask(t(`suggestions.${key}`))}
                  className="rounded-xl border p-3 text-left text-sm transition-colors hover:bg-accent"
                >
                  {t(`suggestions.${key}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div ref={contentRef} className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
            {turns.map((turn) => (
              <AnswerCard key={turn.id} turn={turn} onDone={onDone} />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl px-4">
        <button
          type="button"
          onClick={() => setScopeOpen(true)}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LibraryIcon className="size-3.5 shrink-0" />
          <span className="truncate">
            {t("scope.label")}: <span className="font-medium text-foreground">{scopeLabel}</span>
          </span>
        </button>
      </div>
      <div className="pt-2">
        <ChatInput
          onSend={ask}
          onStop={() => {}}
          streaming={false}
          disabled={busy}
          placeholder={t("placeholder")}
          autoFocus
        />
      </div>

      <ScopeDialog open={scopeOpen} onOpenChange={setScopeOpen} value={scope} onChange={setScope} />
    </div>
  );
}
