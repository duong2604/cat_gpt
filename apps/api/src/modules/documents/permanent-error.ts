import { ErrorCode } from '@cat-gpt/shared';

/**
 * Phân loại lỗi vĩnh viễn trước khi gọi embedding (thiết kế mục 6.3 bước 2–3).
 * `null` nghĩa là không có lỗi vĩnh viễn — lỗi từ bước embedding/Qdrant sau đó là tạm thời,
 * BullMQ thử lại.
 */
export function permanentErrorFor(
  text: string,
  chunks: string[],
  maxChunks: number,
  hasKey: boolean,
): ErrorCode | null {
  if (text.trim().length === 0 || chunks.length === 0) return ErrorCode.DOCUMENT_NO_TEXT;
  if (chunks.length > maxChunks) return ErrorCode.DOCUMENT_TOO_MANY_CHUNKS;
  if (!hasKey) return ErrorCode.DOCUMENT_EMBEDDING_UNAVAILABLE;
  return null;
}
