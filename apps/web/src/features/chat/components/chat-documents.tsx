"use client";

import { FileTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueries } from "@tanstack/react-query";
import { ErrorCode } from "@cat-gpt/shared";
import { Badge } from "@/components/ui/badge";
import { documentsApi } from "@/features/documents/api";
import { getErrorCode } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

/** Tài liệu gắn với hội thoại hỏi tài liệu, hiển thị ở đầu khung chat (Q-M4-3: không thêm/bớt sau khi tạo). */
export function ChatDocuments({ ids }: { ids: string[] }) {
  const t = useTranslations("chat.documents");
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.documents.detail(id),
      queryFn: () => documentsApi.get(id),
      retry: false,
    })),
  });

  if (ids.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2 text-xs md:px-4">
      <span className="text-muted-foreground">{t("label")}:</span>
      {queries.map((query, i) => {
        let label: string;
        if (query.isPending) label = t("loading");
        else if (query.isError)
          label = getErrorCode(query.error) === ErrorCode.DOCUMENT_NOT_FOUND ? t("deleted") : t("unavailable");
        else label = query.data.name;
        return (
          <Badge key={ids[i]} variant={query.isError ? "outline" : "secondary"} className="max-w-full gap-1">
            <FileTextIcon className="size-3 shrink-0" />
            <span className="truncate">{label}</span>
          </Badge>
        );
      })}
    </div>
  );
}

/** Đọc `?documents=id1,id2` từ URL: tối đa CHAT_MAX_DOCUMENTS id, bỏ trùng và id sai định dạng. */
export function parseDocumentIds(raw: string | null, max: number): string[] {
  if (!raw) return [];
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s, i, all) => /^[a-f0-9]{24}$/i.test(s) && all.indexOf(s) === i);
  return ids.slice(0, max);
}
