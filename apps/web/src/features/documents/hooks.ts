"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Query } from "@tanstack/react-query";
import { DocumentStatus, ErrorCode, type Paginated, type DocumentDto } from "@cat-gpt/shared";
import { getErrorCode } from "@/lib/api/errors";
import { type DocumentsFilter, queryKeys } from "@/lib/api/query-keys";
import { documentsApi } from "./api";

const PROCESSING_POLL_MS = 3000;

/** Chỉ cập nhật định kỳ khi danh sách còn tài liệu PENDING/PROCESSING (thiết kế mục 11). */
function refetchIntervalWhileProcessing(
  query: Query<Paginated<DocumentDto>, Error, Paginated<DocumentDto>>,
): number | false {
  const items = query.state.data?.items;
  const hasActive = items?.some(
    (d) => d.status === DocumentStatus.PENDING || d.status === DocumentStatus.PROCESSING,
  );
  return hasActive ? PROCESSING_POLL_MS : false;
}

export function useDocuments(filter: DocumentsFilter) {
  return useQuery({
    queryKey: queryKeys.documents.list(filter),
    queryFn: () => documentsApi.list(filter),
    placeholderData: keepPreviousData,
    refetchInterval: refetchIntervalWhileProcessing,
  });
}

function useInvalidateDocuments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
}

export function useUploadDocument() {
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: (file: File) => documentsApi.upload(file),
    onSuccess: invalidate,
  });
}

/**
 * Một thẻ `<a href download>` thuần đi thẳng qua trình duyệt, bỏ qua interceptor refresh
 * token của axios — access token hết hạn sẽ tải về một tệp lỗi JSON thay vì làm mới phiên.
 * Gọi `GET /documents/:id` qua axios trước (làm mới phiên nếu cần, xác nhận còn tồn tại)
 * rồi mới kích hoạt tải xuống thật.
 */
export function useDownloadDocument() {
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: (document: DocumentDto) => documentsApi.get(document.id),
    onSuccess: (document) => {
      const a = window.document.createElement("a");
      a.href = documentsApi.downloadUrl(document.id);
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
    },
    onSettled: (_data, error) => {
      if (error && getErrorCode(error) === ErrorCode.DOCUMENT_NOT_FOUND) invalidate();
    },
  });
}

export function useDeleteDocument() {
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    // Xóa thành công, hoặc đã bị xóa ở tab khác (404) — cả hai đều coi là "đã xóa",
    // phải làm mới danh sách để dòng biến mất (không chỉ khi thành công).
    onSettled: (_data, error) => {
      if (!error || getErrorCode(error) === ErrorCode.DOCUMENT_NOT_FOUND) invalidate();
    },
  });
}
