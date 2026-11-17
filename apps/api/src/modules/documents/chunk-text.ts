import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

/** Chia văn bản thành đoạn bằng RecursiveCharacterTextSplitter (Q4 — không tự viết bộ chia đoạn). */
export async function chunkText(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  const chunks = await splitter.splitText(text);
  return chunks.map((c) => c.trim()).filter((c) => c.length > 0);
}
