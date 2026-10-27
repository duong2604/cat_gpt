"use client";

import { CheckIcon, CopyIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MessageStatus } from "@cat-gpt/shared";
import { AppLogo } from "@/components/app-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Markdown } from "./markdown";

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap text-primary-foreground break-words">
        {content}
      </div>
    </div>
  );
}

export function AssistantMessage({
  content,
  status,
  streaming = false,
  onRegenerate,
}: {
  content: string;
  status?: MessageStatus;
  streaming?: boolean;
  /** Chỉ truyền cho câu trả lời cuối cùng. */
  onRegenerate?: () => void;
}) {
  const t = useTranslations("chat.message");

  return (
    <div className="group flex gap-3">
      <AppLogo className="mt-0.5 size-7 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        {content ? (
          <Markdown content={content} />
        ) : streaming ? (
          <TypingIndicator />
        ) : (
          <p className="text-sm text-muted-foreground italic">{t("empty")}</p>
        )}
        {streaming && content ? <span className="inline-block h-4 w-1.5 animate-pulse bg-foreground/70 align-middle" /> : null}

        {!streaming ? (
          <div className="flex items-center gap-1">
            {status === MessageStatus.STOPPED ? <Badge variant="secondary">{t("stopped")}</Badge> : null}
            {status === MessageStatus.ERROR ? <Badge variant="destructive">{t("error")}</Badge> : null}
            {content ? <CopyButton text={content} /> : null}
            {onRegenerate ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={t("regenerate")} onClick={onRegenerate}>
                    <RefreshCwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("regenerate")}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const t = useTranslations("chat.message");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t("copy")} onClick={copy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? t("copied") : t("copy")}</TooltipContent>
    </Tooltip>
  );
}

function TypingIndicator() {
  return (
    <div className="flex h-7 items-center gap-1" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
