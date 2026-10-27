"use client";

import {
  BookOpenCheckIcon,
  CheckCircle2Icon,
  DownloadIcon,
  EyeIcon,
  FilesIcon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
  RotateCwIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UploadIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SEARCHABLE_DOCUMENTS } from "@/features/ask/fake-knowledge";
import { useCurrentUser } from "@/features/auth/hooks";
import { routes } from "@/lib/routes";
import { DOCUMENT_STATUSES, type DocumentStatus, type FakeDocument } from "../fake-data";
import { useFakeDocuments } from "../use-fake-documents";
import { DocumentDetailSheet } from "./document-detail-sheet";
import { DocumentIcon, DocumentProgress, DocumentStatusBadge, useFormatBytes } from "./document-status";
import { SummaryDialog } from "./summary-dialog";
import { UploadDialog } from "./upload-dialog";

const ALL = "ALL";
const COLUMN_COUNT = 5;

export function DocumentsManagement() {
  const t = useTranslations("documents");
  const tCommon = useTranslations("common");
  const user = useCurrentUser();
  const { documents, upload, remove, reprocess } = useFakeDocuments();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DocumentStatus | typeof ALL>(ALL);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FakeDocument | null>(null);
  const [summaryTarget, setSummaryTarget] = useState<FakeDocument | null>(null);

  const keyword = search.trim().toLowerCase();
  const filtered = documents.filter(
    (d) =>
      (status === ALL || d.status === status || (status === "PROCESSING" && d.status === "UPLOADING")) &&
      (!keyword || d.name.toLowerCase().includes(keyword)),
  );
  const count = (s: DocumentStatus[]) => documents.filter((d) => s.includes(d.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Badge variant="outline" className="text-muted-foreground">
              {t("demoBadge")}
            </Badge>
            <Button onClick={() => setUploadOpen(true)}>
              <UploadIcon />
              {t("upload.action")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={FilesIcon} label={t("stats.total")} value={documents.length} />
        <StatCard icon={CheckCircle2Icon} label={t("stats.ready")} value={count(["READY"])} className="text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={LoaderCircleIcon} label={t("stats.processing")} value={count(["UPLOADING", "PROCESSING"])} className="text-primary" />
        <StatCard icon={TriangleAlertIcon} label={t("stats.failed")} value={count(["FAILED"])} className="text-destructive" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
            {DOCUMENT_STATUSES.filter((s) => s !== "UPLOADING").map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t("columns.name")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("columns.size")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("columns.uploaded")}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{tCommon("actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT}>
                  <Empty className="py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FilesIcon />
                      </EmptyMedia>
                      <EmptyDescription>
                        {keyword || status !== ALL ? t("emptyFiltered") : t("empty")}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  onView={() => setDetailId(doc.id)}
                  onSummarize={() => setSummaryTarget(doc)}
                  onReprocess={() => reprocess(doc.id)}
                  onDelete={() => setDeleteTarget(doc)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUpload={(files) => upload(files, user.fullName)} />
      <DocumentDetailSheet
        document={documents.find((d) => d.id === detailId) ?? null}
        onOpenChange={(open) => !open && setDetailId(null)}
      />
      <SummaryDialog document={summaryTarget} onOpenChange={(open) => !open && setSummaryTarget(null)} />
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("delete.description", { name: deleteTarget?.name ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) remove(deleteTarget.id);
                toast.success(t("delete.done"));
                setDeleteTarget(null);
              }}
            >
              {t("delete.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <Icon className={className ?? "text-muted-foreground"} />
      <div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function DocumentRow({
  document,
  onView,
  onSummarize,
  onReprocess,
  onDelete,
}: {
  document: FakeDocument;
  onView: () => void;
  onSummarize: () => void;
  onReprocess: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("documents");
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const formatBytes = useFormatBytes();
  const ready = document.status === "READY";
  const canAsk = SEARCHABLE_DOCUMENTS.some((d) => d.id === document.id);

  return (
    <TableRow>
      <TableCell>
        <button type="button" onClick={onView} className="flex min-w-0 items-center gap-3 text-left">
          <DocumentIcon type={document.type} />
          <div className="min-w-0">
            <div className="max-w-[16rem] truncate font-medium hover:underline sm:max-w-md">{document.name}</div>
            <div className="text-xs text-muted-foreground">
              {document.chunks ? t("chunksCount", { count: document.chunks }) : document.type.toUpperCase()}
            </div>
          </div>
        </button>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">{formatBytes(document.sizeBytes)}</TableCell>
      <TableCell>
        <DocumentStatusBadge document={document} />
        <DocumentProgress document={document} />
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        <div>{format.relativeTime(new Date(document.uploadedAt), now)}</div>
        <div className="text-xs">{document.uploadedBy}</div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("actions.open")}>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onView}>
              <EyeIcon />
              {t("actions.view")}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!ready} onSelect={onSummarize}>
              <SparklesIcon />
              {t("actions.summarize")}
            </DropdownMenuItem>
            {canAsk ? (
              <DropdownMenuItem asChild>
                <Link href={`${routes.ask}?docs=${document.id}`}>
                  <BookOpenCheckIcon />
                  {t("actions.ask")}
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem disabled={!ready} onSelect={() => toast.info(t("actions.downloadDemo", { name: document.name }))}>
              <DownloadIcon />
              {t("actions.download")}
            </DropdownMenuItem>
            {document.status === "FAILED" ? (
              <DropdownMenuItem onSelect={onReprocess}>
                <RotateCwIcon />
                {t("actions.reprocess")}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2Icon />
              {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
