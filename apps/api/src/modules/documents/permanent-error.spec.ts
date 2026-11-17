import { ErrorCode } from '@cat-gpt/shared';
import { describe, expect, it } from 'vitest';
import { permanentErrorFor } from './permanent-error.js';

describe('permanentErrorFor', () => {
  it('DOCUMENT_NO_TEXT khi không còn đoạn nào sau khi chia (chỉ khoảng trắng)', () => {
    expect(permanentErrorFor('   \n\t  ', [], 500, true)).toBe(ErrorCode.DOCUMENT_NO_TEXT);
  });

  it('DOCUMENT_TOO_MANY_CHUNKS khi vượt giới hạn', () => {
    const chunks = Array.from({ length: 501 }, (_, i) => `đoạn ${i}`);
    expect(permanentErrorFor('nội dung', chunks, 500, true)).toBe(ErrorCode.DOCUMENT_TOO_MANY_CHUNKS);
  });

  it('DOCUMENT_EMBEDDING_UNAVAILABLE khi thiếu OPENAI_API_KEY', () => {
    expect(permanentErrorFor('nội dung', ['đoạn 1'], 500, false)).toBe(
      ErrorCode.DOCUMENT_EMBEDDING_UNAVAILABLE,
    );
  });

  it('null khi hợp lệ — lỗi tiếp theo (embedding/Qdrant) là tạm thời, BullMQ thử lại', () => {
    expect(permanentErrorFor('nội dung', ['đoạn 1', 'đoạn 2'], 500, true)).toBeNull();
  });
});
