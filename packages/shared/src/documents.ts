export const DocumentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

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
}
