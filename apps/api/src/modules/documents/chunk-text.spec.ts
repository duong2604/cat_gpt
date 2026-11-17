import { describe, expect, it } from 'vitest';
import { chunkText } from './chunk-text.js';

describe('chunkText', () => {
  it('trả về một đoạn duy nhất khi văn bản ngắn hơn chunkSize', async () => {
    const chunks = await chunkText('một đoạn văn ngắn', 1000, 150);
    expect(chunks).toEqual(['một đoạn văn ngắn']);
  });

  it('chia thành nhiều đoạn khi văn bản dài hơn chunkSize', async () => {
    const text = Array.from({ length: 50 }, (_, i) => `Câu số ${i}.`).join(' ');
    const chunks = await chunkText(text, 100, 20);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeGreaterThan(0);
  });

  it('bỏ đoạn rỗng sau khi trim', async () => {
    const chunks = await chunkText('   \n\n   ', 1000, 150);
    expect(chunks).toEqual([]);
  });
});
