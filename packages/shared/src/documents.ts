export const DocumentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

/** Trạng thái tóm tắt (Module 4, SE-016) — tách khỏi trạng thái xử lý tài liệu. */
export const SummaryStatus = {
  PENDING: 'PENDING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;
export type SummaryStatus = (typeof SummaryStatus)[keyof typeof SummaryStatus];

export interface DocumentDto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  errorCode?: string;
  chunkCount?: number;
  createdAt: string;
  updatedAt: string;
  /** Có khi đã yêu cầu tóm tắt. */
  summaryStatus?: SummaryStatus;
  /** Có khi `summaryStatus = READY`. */
  summary?: string;
  summaryErrorCode?: string;
  summaryModel?: string;
  summarizedAt?: string;
}
