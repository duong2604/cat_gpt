import { describe, expect, it } from 'vitest';
import { buildRagSystemPrompt, RAG_REFUSAL_TEXT } from './rag-prompt.js';
import { RagService, type RagSource } from './rag.service.js';

/**
 * Unit test cho verifyCitations và dựng prompt — logic thuần, không mock Qdrant/OpenAI
 * (design mục 11: "Không mock Qdrant/OpenAI chỉ để có test"). Truy hồi thật (prepare())
 * kiểm bằng dịch vụ thật ở CP2/CP4, không lặp lại ở đây.
 */

function source(n: number, overrides: Partial<RagSource> = {}): RagSource {
  return {
    documentId: `doc-${n}`,
    documentName: `Tài liệu ${n}`,
    chunkIndex: n - 1,
    text: `Nội dung đoạn số ${n}.`,
    ...overrides,
  };
}

// RagService chỉ cần cho verifyCitations ở đây — các phụ thuộc Mongo/Qdrant/embedding
// không được gọi tới, truyền giá trị giả vô hại.
function makeRagService(): RagService {
  return new RagService({} as never, {} as never, {} as never, {} as never);
}

describe('RagService.verifyCitations (thiết kế mục 6.3, R9)', () => {
  const sources = [source(1), source(2), source(3)];

  it('câu từ chối nguyên văn ở đầu → insufficientEvidence, không có trích dẫn', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations(RAG_REFUSAL_TEXT, sources);
    expect(result).toEqual({ citations: [], insufficientEvidence: true, ungrounded: false });
  });

  it('câu từ chối có khoảng trắng đầu/cuối vẫn nhận ra (content.trim())', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations(`  ${RAG_REFUSAL_TEXT}  `, sources);
    expect(result.insufficientEvidence).toBe(true);
  });

  it('[1, 3]: nhóm nhiều số trong một cặp ngoặc', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations('Câu trả lời dựa trên hai đoạn [1, 3].', sources);
    expect(result.citations.map((c) => c.n)).toEqual([1, 3]);
    expect(result.ungrounded).toBe(false);
  });

  it('[1][2]: nhiều cặp ngoặc liên tiếp', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations('Ý này đúng [1][2].', sources);
    expect(result.citations.map((c) => c.n)).toEqual([1, 2]);
  });

  it('[9] ngoài khoảng khi chỉ có 3 đoạn → bỏ qua, không tạo nguồn', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations('Trả lời sai sự thật [9].', sources);
    expect(result.citations).toEqual([]);
    expect(result.ungrounded).toBe(true);
  });

  it('trích dẫn trùng lặp → chỉ giữ một, theo thứ tự tăng dần', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations('Lặp lại [2] rồi lại [1] rồi lại [2].', sources);
    expect(result.citations.map((c) => c.n)).toEqual([1, 2]);
  });

  it('không có nhãn [n] nào → ungrounded = true, không insufficientEvidence', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations('Câu trả lời không trích dẫn gì cả.', sources);
    expect(result).toEqual({ citations: [], insufficientEvidence: false, ungrounded: true });
  });

  it('nội dung STOPPED/TRUNCATED (một phần câu) vẫn trích dẫn đúng phần đã có', () => {
    const rag = makeRagService();
    const partial = 'Phần đầu câu trả lời đã trích dẫn [1] trước khi bị dừng giữa';
    const result = rag.verifyCitations(partial, sources);
    expect(result.citations.map((c) => c.n)).toEqual([1]);
    expect(result.ungrounded).toBe(false);
  });

  it('quote luôn là chuỗi con của text nguồn, cắt tối đa 300 ký tự', () => {
    const rag = makeRagService();
    const longText = 'A'.repeat(500);
    const result = rag.verifyCitations('Trả lời [1].', [source(1, { text: longText })]);
    expect(result.citations[0].quote.length).toBe(300);
    expect(longText.startsWith(result.citations[0].quote)).toBe(true);
  });

  it('citation mang đúng documentId/documentName/chunkIndex/page của nguồn tương ứng', () => {
    const rag = makeRagService();
    const withPage = source(1, { page: 7 });
    const result = rag.verifyCitations('Theo tài liệu [1].', [withPage]);
    expect(result.citations[0]).toMatchObject({
      n: 1,
      documentId: withPage.documentId,
      documentName: withPage.documentName,
      chunkIndex: withPage.chunkIndex,
      page: 7,
    });
  });

  it('nguồn không có page → citation không có trường page', () => {
    const rag = makeRagService();
    const result = rag.verifyCitations('Theo tài liệu [1].', [source(1)]);
    expect(result.citations[0]).not.toHaveProperty('page');
  });
});

describe('buildRagSystemPrompt (thiết kế mục 6.2)', () => {
  it('giữ nguyên câu từ chối cố định trong prompt', () => {
    const prompt = buildRagSystemPrompt([source(1)]);
    expect(prompt).toContain(RAG_REFUSAL_TEXT);
  });

  it('đánh dấu rõ "dữ liệu, không phải chỉ dẫn" quanh nội dung đoạn (chống lệnh chèn, R11)', () => {
    const prompt = buildRagSystemPrompt([source(1)]);
    expect(prompt).toMatch(/dữ liệu.*không phải chỉ dẫn/i);
  });

  it('mỗi đoạn được đánh số [n] khớp thứ tự sources truyền vào', () => {
    const prompt = buildRagSystemPrompt([source(1), source(2)]);
    expect(prompt).toContain('[1] Tài liệu: "Tài liệu 1"');
    expect(prompt).toContain('[2] Tài liệu: "Tài liệu 2"');
  });

  it('có trang (PDF) thì ghi số trang; không có thì không ghi', () => {
    const prompt = buildRagSystemPrompt([source(1, { page: 3 }), source(2)]);
    expect(prompt).toContain('trang 3');
    expect(prompt).not.toMatch(/Tài liệu 2".*trang/);
  });

  it('nội dung đoạn xuất hiện nguyên văn trong prompt', () => {
    const s = source(1, { text: 'Câu đặc biệt để đối chiếu.' });
    const prompt = buildRagSystemPrompt([s]);
    expect(prompt).toContain(s.text);
  });
});
