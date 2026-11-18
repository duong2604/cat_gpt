import JSZip from 'jszip';
import mammoth from 'mammoth';
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
 * Bóc tách DOCX bằng mammoth. Kiểm kích thước đã giải nén của `word/document.xml`
 * trước (zip bomb — jszip biết kích thước này từ header mà không cần giải nén toàn bộ,
 * `_data` là trường nội bộ của jszip nhưng là cách duy nhất lấy giá trị này mà không
 * tự giải nén), để tránh giải nén một entry khổng lồ (maxXmlBytes, mặc định
 * `DOCUMENT_MAX_DOCX_XML_MB`).
 */
export async function extractDocx(buffer: Buffer, maxXmlBytes: number): Promise<ExtractedPage[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch (error) {
    throw new DocumentUnreadableError((error as Error).message);
  }
  const entry = zip.file('word/document.xml');
  const uncompressedSize = (entry as unknown as { _data?: { uncompressedSize?: number } } | null)?._data
    ?.uncompressedSize;
  if (typeof uncompressedSize === 'number' && uncompressedSize > maxXmlBytes) {
    throw new DocumentTooLargeToProcessError(
      `word/document.xml giải nén ${uncompressedSize} byte, vượt giới hạn ${maxXmlBytes}`,
    );
  }
  try {
    const result = await mammoth.extractRawText({ buffer });
    return [{ page: null, text: result.value }];
  } catch (error) {
    throw new DocumentUnreadableError((error as Error).message);
  }
}
