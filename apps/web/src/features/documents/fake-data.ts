/**
 * Dữ liệu và pipeline GIẢ LẬP cho màn hình Tài liệu (bản demo nhanh, chưa có backend).
 * Khi làm Module 3 thật sẽ thay toàn bộ file này bằng API.
 */

export type DocumentStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
export type ProcessingStep = "EXTRACTING" | "CHUNKING" | "EMBEDDING" | "INDEXING";
export type DocumentType = "pdf" | "docx" | "txt";

export const PROCESSING_STEPS: readonly ProcessingStep[] = ["EXTRACTING", "CHUNKING", "EMBEDDING", "INDEXING"];
export const DOCUMENT_STATUSES: readonly DocumentStatus[] = ["UPLOADING", "PROCESSING", "READY", "FAILED"];
export const ACCEPTED_EXTENSIONS: readonly DocumentType[] = ["pdf", "docx", "txt"];
export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;

export interface FakeDocument {
  id: string;
  name: string;
  type: DocumentType;
  sizeBytes: number;
  status: DocumentStatus;
  /** Bước hiện tại khi PROCESSING; bước bị lỗi khi FAILED. */
  step: ProcessingStep | null;
  /** Tiến độ 0–100 của bước hiện tại (hoặc của việc tải lên). */
  progress: number;
  pages: number | null;
  chunks: number | null;
  uploadedBy: string;
  uploadedAt: string;
  processedAt: string | null;
  errorKey: "ocrRequired" | null;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const SEED_DOCUMENTS: FakeDocument[] = [
  { id: "d1", name: "Quy-che-lam-viec-2026.pdf", type: "pdf", sizeBytes: 2_480_000, status: "READY", step: null, progress: 100, pages: 32, chunks: 118, uploadedBy: "Nguyễn Thị Lan", uploadedAt: hoursAgo(3), processedAt: hoursAgo(2.9), errorKey: null },
  { id: "d2", name: "So-tay-nhan-vien-moi.docx", type: "docx", sizeBytes: 1_150_000, status: "READY", step: null, progress: 100, pages: 18, chunks: 64, uploadedBy: "Trần Minh Đức", uploadedAt: hoursAgo(26), processedAt: hoursAgo(25.9), errorKey: null },
  { id: "d3", name: "Bao-cao-tai-chinh-Q3-2026.pdf", type: "pdf", sizeBytes: 5_920_000, status: "PROCESSING", step: "EMBEDDING", progress: 40, pages: 57, chunks: null, uploadedBy: "Lê Hoàng Nam", uploadedAt: hoursAgo(0.05), processedAt: null, errorKey: null },
  { id: "d4", name: "Huong-dan-su-dung-VPN.txt", type: "txt", sizeBytes: 18_400, status: "READY", step: null, progress: 100, pages: 1, chunks: 6, uploadedBy: "Phạm Quốc Huy", uploadedAt: hoursAgo(50), processedAt: hoursAgo(49.9), errorKey: null },
  { id: "d5", name: "Hop-dong-mau-scan.pdf", type: "pdf", sizeBytes: 8_700_000, status: "FAILED", step: "EXTRACTING", progress: 0, pages: 12, chunks: null, uploadedBy: "Nguyễn Thị Lan", uploadedAt: hoursAgo(74), processedAt: null, errorKey: "ocrRequired" },
  { id: "d6", name: "Quy-trinh-mua-sam-thiet-bi.docx", type: "docx", sizeBytes: 640_000, status: "READY", step: null, progress: 100, pages: 9, chunks: 31, uploadedBy: "Võ Thanh Tùng", uploadedAt: hoursAgo(120), processedAt: hoursAgo(119.9), errorKey: null },
  { id: "d7", name: "Chinh-sach-bao-mat-thong-tin.pdf", type: "pdf", sizeBytes: 3_310_000, status: "READY", step: null, progress: 100, pages: 24, chunks: 87, uploadedBy: "Trần Minh Đức", uploadedAt: hoursAgo(200), processedAt: hoursAgo(199.9), errorKey: null },
  { id: "d8", name: "Bien-ban-hop-giao-ban-thang-10.docx", type: "docx", sizeBytes: 230_000, status: "READY", step: null, progress: 100, pages: 4, chunks: 12, uploadedBy: "Lê Hoàng Nam", uploadedAt: hoursAgo(310), processedAt: hoursAgo(309.9), errorKey: null },
];

export function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function createFakeDocument(file: File, uploadedBy: string): FakeDocument {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    type: extensionOf(file.name) as DocumentType,
    sizeBytes: file.size,
    status: "UPLOADING",
    step: null,
    progress: 0,
    pages: null,
    chunks: null,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    processedAt: null,
    errorKey: null,
  };
}

const UPLOAD_SPEED = 25;
const STEP_SPEED = 20;

/**
 * Tiến thêm một nhịp của pipeline giả lập: tải lên → bóc tách → chia đoạn → sinh vector → lưu chỉ mục.
 * Tên tệp chứa "scan" → lỗi ở bước bóc tách (minh họa giới hạn: chưa hỗ trợ OCR).
 */
export function advance(doc: FakeDocument): FakeDocument {
  if (doc.status === "UPLOADING") {
    const progress = Math.min(100, doc.progress + UPLOAD_SPEED);
    return progress < 100
      ? { ...doc, progress }
      : { ...doc, status: "PROCESSING", step: "EXTRACTING", progress: 0 };
  }
  if (doc.status !== "PROCESSING" || !doc.step) return doc;

  const progress = Math.min(100, doc.progress + STEP_SPEED);
  const pages = doc.pages ?? Math.max(1, Math.round(doc.sizeBytes / 90_000));

  if (doc.step === "EXTRACTING" && progress >= 60 && /scan/i.test(doc.name)) {
    return { ...doc, status: "FAILED", progress: 0, pages, errorKey: "ocrRequired" };
  }
  if (progress < 100) return { ...doc, progress, pages };

  const next = PROCESSING_STEPS[PROCESSING_STEPS.indexOf(doc.step) + 1];
  if (next) return { ...doc, step: next, progress: 0, pages };
  return {
    ...doc,
    status: "READY",
    step: null,
    progress: 100,
    pages,
    chunks: Math.max(1, Math.round(pages * 3.6)),
    processedAt: new Date().toISOString(),
  };
}
