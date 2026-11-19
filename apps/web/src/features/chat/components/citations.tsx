"use client";

import { useTranslations } from "next-intl";
import type { Components } from "react-markdown";
import type { CitationDto } from "@cat-gpt/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Hash thay vì scheme riêng: react-markdown bỏ href có scheme lạ (như `cite:`). */
const CITE_PREFIX = "#cite-";

/**
 * `[1]`, `[1, 3]`, `[1][2]` → liên kết nội bộ `[n](cite:n)` để Markdown vẽ nhãn trích dẫn.
 * Chỉ áp dụng cho tin có `citations` (hội thoại hỏi tài liệu); Chat thường giữ nguyên chữ.
 */
export function linkCitations(content: string): string {
  return content.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_, group: string) =>
    group
      .split(/\s*,\s*/)
      .map((n) => `[${n}](${CITE_PREFIX}${n})`)
      .join(""),
  );
}

/** Ghi đè thẻ `a` của Markdown: liên kết `cite:` → nhãn nguồn bấm được; không có trong `citations` → làm mờ. */
export function citationComponents(citations: CitationDto[]): Components {
  return {
    a: ({ href, children, className }) => {
      if (href?.startsWith(CITE_PREFIX)) {
        return <CitationLabel n={Number(href.slice(CITE_PREFIX.length))} citations={citations} />;
      }
      return (
        <a
          href={href}
          className={className ?? "font-medium text-primary underline underline-offset-4"}
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      );
    },
  };
}

function CitationLabel({ n, citations }: { n: number; citations: CitationDto[] }) {
  const t = useTranslations("chat.citation");
  const cite = citations.find((c) => c.n === n);

  if (!cite) {
    return (
      <span className="mx-0.5 align-super text-[11px] text-muted-foreground opacity-40" title={t("missing")}>
        [{n}]
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("open", { n })}
          className="mx-0.5 inline-flex h-5 min-w-5 -translate-y-px items-center justify-center rounded bg-primary/15 px-1 align-middle text-[11px] font-semibold text-primary transition-colors hover:bg-primary/25"
        >
          {n}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{t("title", { n })}</p>
          <p className="text-xs text-muted-foreground">
            {t("document")}: <span className="text-foreground">{cite.documentName}</span>
            {cite.page ? ` · ${t("page", { page: cite.page })}` : null}
          </p>
          <p className="text-xs text-muted-foreground">{t("quote")}</p>
          <blockquote className="max-h-48 overflow-y-auto border-l-2 pl-3 text-xs leading-5 whitespace-pre-wrap">
            {cite.quote}
          </blockquote>
        </div>
      </PopoverContent>
    </Popover>
  );
}
