"use client";

import { useEffect, useState } from "react";
import { advance, createFakeDocument, type FakeDocument, SEED_DOCUMENTS } from "./fake-data";

const TICK_MS = 600;

const isBusy = (d: FakeDocument) => d.status === "UPLOADING" || d.status === "PROCESSING";

/** Kho tài liệu giả lập trong bộ nhớ trình duyệt (tải lại trang sẽ về dữ liệu mẫu). */
export function useFakeDocuments() {
  const [documents, setDocuments] = useState<FakeDocument[]>(SEED_DOCUMENTS);
  const busy = documents.some(isBusy);

  // Chỉ chạy đồng hồ khi còn tài liệu đang tải lên / đang xử lý.
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setDocuments((docs) => docs.map(advance)), TICK_MS);
    return () => clearInterval(timer);
  }, [busy]);

  return {
    documents,
    upload: (files: File[], uploadedBy: string) =>
      setDocuments((docs) => [...files.map((f) => createFakeDocument(f, uploadedBy)), ...docs]),
    remove: (id: string) => setDocuments((docs) => docs.filter((d) => d.id !== id)),
    reprocess: (id: string) =>
      setDocuments((docs) =>
        docs.map((d) =>
          d.id === id ? { ...d, status: "PROCESSING", step: "EXTRACTING", progress: 0, errorKey: null } : d,
        ),
      ),
  };
}
