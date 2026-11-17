"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Query } from "@tanstack/react-query";
import { DocumentStatus, type Paginated, type DocumentDto } from "@cat-gpt/shared";
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

export function useDeleteDocument() {
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: invalidate,
  });
}
