import JSZip from 'jszip';
import mammoth from 'mammoth';
import type { Readable } from 'node:stream';
import { extractText, getDocumentProxy } from 'unpdf';

/** Giải mã TXT: UTF-8 hợp lệ, bỏ BOM. Ném lỗi nếu không giải mã được. */
export function extractTxt(buffer: Buffer): string {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return decoder.decode(buffer).replace(/^﻿/, '');
}

/**
 * Kiểm chữ ký TXT (thiết kế mục 5): UTF-8 hợp lệ và không chứa byte 0x00.
 * `TextDecoder` tự nó chấp nhận 0x00 (NUL là một ký tự UTF-8 hợp lệ) nên phải kiểm riêng.
 */
export function isValidTxtSignature(buffer: Buffer): boolean {
  if (buffer.includes(0x00)) return false;
  try {
    extractTxt(buffer);
    return true;
  } catch {
    return false;
  }
}

/** Một "trang" văn bản đã bóc tách — TXT/DOCX chỉ có một trang ảo (`page: null`). */
export interface ExtractedPage {
  page: number | null;
  text: string;
}

/** Tệp đúng chữ ký nhưng nội dung hỏng, không bóc tách được (thiết kế mục 7, SE-013). */
export class DocumentUnreadableError extends Error {}
/** Vượt giới hạn trang/kích thước trước khi bóc tách — chặn chi phí (SE-013). */
export class DocumentTooLargeToProcessError extends Error {}

/** Kiểm chữ ký PDF (thiết kế mục 5): bắt đầu bằng `%PDF-`. */
export function isValidPdfSignature(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}

/**
 * Bóc tách PDF theo trang (giữ `page` cho payload Qdrant — thiết kế mục 4.3).
 * Kiểm số trang trước khi bóc chữ từng trang để không bỏ công cho tệp quá lớn
 * (`maxPages`, mặc định `DOCUMENT_MAX_PDF_PAGES`); PDF scan (không có lớp chữ)
 * trả về các trang với `text` rỗng — tầng gọi coi như `DOCUMENT_NO_TEXT` (permanent-error.ts).
 */
export async function extractPdf(buffer: Buffer, maxPages: number): Promise<ExtractedPage[]> {
  let pdf;
  try {
    pdf = await getDocumentProxy(new Uint8Array(buffer));
  } catch (error) {
    throw new DocumentUnreadableError((error as Error).message);
  }
  if (pdf.numPages > maxPages) {
    throw new DocumentTooLargeToProcessError(`PDF có ${pdf.numPages} trang, vượt giới hạn ${maxPages}`);
  }
  try {
    const { text } = await extractText(pdf, { mergePages: false });
    return text.map((pageText, index) => ({ page: index + 1, text: pageText }));
  } catch (error) {
    throw new DocumentUnreadableError((error as Error).message);
  }
}

/** Kiểm chữ ký DOCX (thiết kế mục 5): zip (`PK\x03\x04`) có `word/document.xml`. */
export async function isValidDocxSignature(buffer: Buffer): Promise<boolean> {
  if (buffer.subarray(0, 4).toString('latin1') !== 'PK\x03\x04') return false;
  try {
    const zip = await JSZip.loadAsync(buffer);
    return zip.file('word/document.xml') !== null;
  } catch {
    return false;
  }
}

/**
 * Đếm thật số byte đã giải nén của một entry zip bằng stream, dừng ngay khi vượt giới
 * hạn — KHÔNG đọc kích thước khai trong header zip (`uncompressedSize`), vì đó là giá
 * trị tự khai của người tải lên và jszip không đối chiếu với dữ liệu giải nén thật: một
 * tệp zip dựng tay có thể khai nhỏ trong khi dữ liệu nén bên trong giải ra gấp hàng
 * nghìn lần — "zip bomb" (TL phát hiện khi review 18/11/2026). Đo không được (lỗi
 * stream) thì coi là hỏng, đóng an toàn thay vì bỏ qua.
 */
function measureEntryWithinBudget(entry: JSZip.JSZipObject, budget: { remaining: number }): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const stream = entry.nodeStream('nodebuffer') as Readable;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      stream.destroy();
      reject(error);
    };
    stream.on('data', (chunk: Buffer) => {
      budget.remaining -= chunk.length;
      if (budget.remaining < 0) {
        fail(new DocumentTooLargeToProcessError('Các phần XML của DOCX giải nén vượt ngân sách'));
      }
    });
    stream.on('error', (error: Error) => fail(new DocumentUnreadableError(error.message)));
    stream.on('end', () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    });
  });
}

/**
 * Phần XML/rels mà mammoth có thể đọc (document, styles, numbering, footnotes, headers, rels…).
 * Không tính `word/media/*`: ảnh là dữ liệu nhị phân mà chế độ lấy văn bản thô không giải mã,
 * và tính vào sẽ chặn nhầm DOCX hợp lệ có ảnh lớn.
 */
function isXmlPart(name: string): boolean {
  return (name.endsWith('.xml') || name.endsWith('.rels')) && !name.startsWith('word/media/');
}

/**
 * Bóc tách DOCX bằng mammoth, sau khi đo thật toàn bộ phần XML/rels (một ngân sách chung
 * `maxXmlBytes`, dừng ngay khi vượt) — chặn zip bomb ở styles.xml/numbering.xml… (F04-N1).
 */
export async function extractDocx(buffer: Buffer, maxXmlBytes: number): Promise<ExtractedPage[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch (error) {
    throw new DocumentUnreadableError((error as Error).message);
  }
  if (!zip.file('word/document.xml')) {
    throw new DocumentUnreadableError('Không tìm thấy word/document.xml');
  }
  const budget = { remaining: maxXmlBytes };
  for (const entry of Object.values(zip.files)) {
    if (entry.dir || !isXmlPart(entry.name)) continue;
    await measureEntryWithinBudget(entry, budget);
  }
  try {
    const result = await mammoth.extractRawText({ buffer });
    return [{ page: null, text: result.value }];
  } catch (error) {
    throw new DocumentUnreadableError((error as Error).message);
  }
}
