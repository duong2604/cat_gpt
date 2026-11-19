"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileTextIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { DEFAULT_PAGE_SIZE, type DocumentDto, DocumentStatus, type ErrorCode } from "@cat-gpt/shared";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useDocuments, useDownloadDocument } from "../hooks";
import { AskDocumentDialog } from "./ask-document-dialog";
import { DeleteDocumentDialog } from "./delete-document-dialog";
import { DocumentStatusBadge } from "./document-status-badge";
import { UploadDocumentButton } from "./upload-document-button";

const ALL = "ALL";
const COLUMN_COUNT = 4;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function DocumentsManagement() {
  const t = useTranslations("documents");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DocumentStatus | typeof ALL>(ALL);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());
  const [deleteTarget, setDeleteTarget] = useState<DocumentDto | null>(null);
  const [askTarget, setAskTarget] = useState<DocumentDto | null>(null);

  const documents = useDocuments({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    q: debouncedSearch || undefined,
    status: status === ALL ? undefined : status,
  });

  const isFiltered = Boolean(debouncedSearch) || status !== ALL;
  const meta = documents.data?.meta;

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<UploadDocumentButton />}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => withPageReset(setSearch)(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={withPageReset((v: string) => setStatus(v as DocumentStatus))}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
            {Object.values(DocumentStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: bảng. Mobile: danh sách thẻ (thiết kế mục 11). */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t("columns.name")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("columns.size")}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{t("columns.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={documents.isPlaceholderData ? "opacity-60" : undefined}>
            {documents.isPending ? (
              <LoadingRows />
            ) : documents.isError ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-destructive">{errorMessage(documents.error)}</span>
                    <Button variant="outline" size="sm" onClick={() => documents.refetch()}>
                      {tCommon("retry")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : documents.data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT}>
                  <DocumentsEmpty filtered={isFiltered} />
                </TableCell>
              </TableRow>
            ) : (
              documents.data.items.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  onAsk={() => setAskTarget(doc)}
                  onDelete={() => setDeleteTarget(doc)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: thẻ */}
      <div className="space-y-3 md:hidden">
        {documents.isPending ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : documents.isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
            <span className="text-destructive">{errorMessage(documents.error)}</span>
            <Button variant="outline" size="sm" onClick={() => documents.refetch()}>
              {tCommon("retry")}
            </Button>
          </div>
        ) : documents.data.items.length === 0 ? (
          <div className="rounded-lg border">
            <DocumentsEmpty filtered={isFiltered} />
          </div>
        ) : (
          documents.data.items.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onAsk={() => setAskTarget(doc)}
              onDelete={() => setDeleteTarget(doc)}
            />
          ))
        )}
      </div>

      {meta ? (
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>{tCommon("totalItems", { total: meta.total })}</span>
          <div className="flex items-center gap-2">
            <span>{tCommon("pageOf", { page: meta.page, totalPages: meta.totalPages })}</span>
            <Button
              variant="outline"
              size="icon"
              aria-label={tCommon("previous")}
              disabled={page <= 1 || documents.isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={tCommon("next")}
              disabled={page >= meta.totalPages || documents.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      ) : null}

      {askTarget ? (
        <AskDocumentDialog document={askTarget} onOpenChange={(open) => !open && setAskTarget(null)} />
      ) : null}

      <DeleteDocumentDialog
        document={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </div>
  );

  function DocumentsEmpty({ filtered }: { filtered: boolean }) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyDescription>{filtered ? t("emptyFiltered") : t("empty")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
}

function DocumentActions({
  document,
  onAsk,
  onDelete,
}: {
  document: DocumentDto;
  onAsk: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("documents");
  const errorMessage = useErrorMessage();
  const download = useDownloadDocument();
  const ready = document.status === DocumentStatus.READY;

  const onDownload = () => {
    download.mutate(document, {
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("actions.open")}>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!ready} onSelect={onAsk}>
          <MessageSquareIcon />
          {t("actions.ask")}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!ready || download.isPending}
          onSelect={onDownload}
        >
          <DownloadIcon />
          {t("actions.download")}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2Icon />
          {t("actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DocumentNameCell({ document }: { document: DocumentDto }) {
  const t = useTranslations("documents");
  const tErrors = useTranslations("errors");
  return (
    <div className="min-w-0">
      <div className="truncate font-medium text-foreground">{document.name}</div>
      {document.status === DocumentStatus.FAILED && document.errorCode ? (
        <div className="truncate text-xs text-destructive">
          {t("errorCodeLabel")}: {tErrors(document.errorCode as ErrorCode)}
        </div>
      ) : null}
    </div>
  );
}

function DocumentRow({
  document,
  onAsk,
  onDelete,
}: {
  document: DocumentDto;
  onAsk: () => void;
  onDelete: () => void;
}) {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });

  return (
    <TableRow>
      <TableCell>
        <DocumentNameCell document={document} />
      </TableCell>
      <TableCell>
        <DocumentStatusBadge status={document.status} />
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {formatSize(document.size)} · {format.relativeTime(new Date(document.createdAt), now)}
      </TableCell>
      <TableCell>
        <DocumentActions document={document} onAsk={onAsk} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}

function DocumentCard({
  document,
  onAsk,
  onDelete,
}: {
  document: DocumentDto;
  onAsk: () => void;
  onDelete: () => void;
}) {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <DocumentNameCell document={document} />
        <div className="flex items-center gap-2">
          <DocumentStatusBadge status={document.status} />
          <span className="text-xs text-muted-foreground">
            {formatSize(document.size)} · {format.relativeTime(new Date(document.createdAt), now)}
          </span>
        </div>
      </div>
      <DocumentActions document={document} onAsk={onAsk} onDelete={onDelete} />
    </div>
  );
}

function LoadingRows() {
  return Array.from({ length: 3 }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell />
    </TableRow>
  ));
}
