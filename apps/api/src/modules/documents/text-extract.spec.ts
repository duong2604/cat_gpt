import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DocumentTooLargeToProcessError,
  DocumentUnreadableError,
  extractDocx,
  extractPdf,
  extractTxt,
  isValidDocxSignature,
  isValidPdfSignature,
  isValidTxtSignature,
} from './text-extract.js';

const FIXTURES = 'test/fixtures';
const readFixture = (name: string) => readFileSync(`${FIXTURES}/${name}`);

const SENTENCES = [
  'Hà Nội là thủ đô của Việt Nam, nằm bên bờ sông Hồng.',
  'Phở và bánh mì là hai món ăn quen thuộc của người Việt.',
  'Mùa thu ở miền Bắc thường có tiết trời se lạnh và nắng nhẹ.',
];

describe('text-extract', () => {
  it('giải mã UTF-8 hợp lệ và bỏ BOM', () => {
    const withBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('xin chào', 'utf-8')]);
    expect(extractTxt(withBom)).toBe('xin chào');
  });

  it('chấp nhận tệp TXT UTF-8 hợp lệ', () => {
    expect(isValidTxtSignature(Buffer.from('nội dung tiếng Việt', 'utf-8'))).toBe(true);
  });

  it('từ chối byte không phải UTF-8 hợp lệ', () => {
    expect(isValidTxtSignature(Buffer.from([0xff, 0xfe, 0x00, 0x01]))).toBe(false);
  });

  it('từ chối tệp chứa byte 0x00 dù phần còn lại là UTF-8 hợp lệ', () => {
    const buf = Buffer.concat([Buffer.from('abc'), Buffer.from([0x00]), Buffer.from('def')]);
    expect(isValidTxtSignature(buf)).toBe(false);
  });

  describe('PDF', () => {
    it('chấp nhận chữ ký %PDF-', () => {
      expect(isValidPdfSignature(readFixture('se013-pdf-text-vi.pdf'))).toBe(true);
    });

    it('từ chối tệp không bắt đầu bằng %PDF-', () => {
      expect(isValidPdfSignature(Buffer.from('không phải PDF'))).toBe(false);
    });

    it('trích đúng tiếng Việt có dấu, giữ page cho từng trang (AC4)', async () => {
      const pages = await extractPdf(readFixture('se013-pdf-text-vi.pdf'), 2000);
      expect(pages).toHaveLength(1);
      expect(pages[0].page).toBe(1);
      for (const sentence of SENTENCES) {
        expect(pages[0].text).toContain(sentence);
      }
    });

    it('PDF nhiều trang: mỗi đoạn giữ đúng số trang nguồn (AC4, payload page)', async () => {
      const pages = await extractPdf(readFixture('se013-pdf-multipage-vi.pdf'), 2000);
      expect(pages).toHaveLength(3);
      pages.forEach((p, i) => {
        expect(p.page).toBe(i + 1);
        expect(p.text.trim()).toBe(SENTENCES[i]);
      });
    });

    it('PDF scan (chỉ ảnh) trả về trang với text rỗng — tầng gọi coi là DOCUMENT_NO_TEXT', async () => {
      const pages = await extractPdf(readFixture('se013-pdf-scan.pdf'), 2000);
      expect(pages).toHaveLength(1);
      expect(pages[0].text.trim()).toBe('');
    });

    it('PDF đúng chữ ký nhưng hỏng → DocumentUnreadableError (AC3)', async () => {
      await expect(extractPdf(readFixture('se013-pdf-corrupt.pdf'), 2000)).rejects.toBeInstanceOf(
        DocumentUnreadableError,
      );
    });

    it('vượt số trang tối đa → DocumentTooLargeToProcessError, không bóc chữ', async () => {
      await expect(extractPdf(readFixture('se013-pdf-text-vi.pdf'), 0)).rejects.toBeInstanceOf(
        DocumentTooLargeToProcessError,
      );
    });
  });

  describe('DOCX', () => {
    it('chấp nhận zip có word/document.xml', async () => {
      expect(await isValidDocxSignature(readFixture('se013-docx-valid.docx'))).toBe(true);
    });

    it('từ chối tệp không phải zip', async () => {
      expect(await isValidDocxSignature(Buffer.from('không phải zip'))).toBe(false);
    });

    it('từ chối zip hợp lệ nhưng không có word/document.xml', async () => {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      zip.file('hello.txt', 'xin chào');
      const buf = await zip.generateAsync({ type: 'nodebuffer' });
      expect(await isValidDocxSignature(buf)).toBe(false);
    });

    it('trích đúng tiếng Việt có dấu (AC4)', async () => {
      const pages = await extractDocx(readFixture('se013-docx-valid.docx'), 50 * 1024 * 1024);
      expect(pages).toHaveLength(1);
      expect(pages[0].page).toBeNull();
      for (const sentence of SENTENCES) {
        expect(pages[0].text).toContain(sentence);
      }
    });

    it('DOCX đúng chữ ký nhưng XML hỏng → DocumentUnreadableError (AC3)', async () => {
      await expect(
        extractDocx(readFixture('se013-docx-corrupt.docx'), 50 * 1024 * 1024),
      ).rejects.toBeInstanceOf(DocumentUnreadableError);
    });

    it('document.xml giải nén thật lớn hơn giới hạn → DocumentTooLargeToProcessError, không gọi mammoth', async () => {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      zip.file('word/document.xml', ' '.repeat(2000), { compression: 'DEFLATE' });
      const buf = await zip.generateAsync({ type: 'nodebuffer' });
      await expect(extractDocx(buf, 1000)).rejects.toBeInstanceOf(DocumentTooLargeToProcessError);
    });

    it('header zip khai kích thước nhỏ giả (zip bomb) vẫn bị chặn — đếm byte giải nén thật, không tin header', async () => {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      zip.file('word/document.xml', 'A'.repeat(5000), { compression: 'DEFLATE' });
      let buf = await zip.generateAsync({ type: 'nodebuffer', streamFiles: false });

      // Khai man trường "uncompressed size" (4 byte) trong local header VÀ central directory
      // record của riêng entry "word/document.xml" (không phải thư mục cha "word/" mà
      // JSZip tự tạo) — tìm theo đúng tên tệp để không vá nhầm bản ghi.
      const filenameBytes = Buffer.from('word/document.xml');
      const lie = Buffer.alloc(4);
      lie.writeUInt32LE(1, 0);
      let searchFrom = 0;
      let patched = 0;
      while (true) {
        const nameIdx = buf.indexOf(filenameBytes, searchFrom);
        if (nameIdx === -1) break;
        searchFrom = nameIdx + 1;
        const localHeaderStart = nameIdx - 30;
        if (localHeaderStart >= 0 && buf.readUInt32LE(localHeaderStart) === 0x04034b50) {
          lie.copy(buf, localHeaderStart + 22);
          patched++;
          continue;
        }
        const centralHeaderStart = nameIdx - 46;
        if (centralHeaderStart >= 0 && buf.readUInt32LE(centralHeaderStart) === 0x02014b50) {
          lie.copy(buf, centralHeaderStart + 24);
          patched++;
        }
      }
      expect(patched).toBe(2); // local header + central directory record của word/document.xml

      // Header giờ khai 1 byte; đếm thật vẫn thấy 5000 byte và chặn đúng.
      await expect(extractDocx(buf, 1000)).rejects.toBeInstanceOf(DocumentTooLargeToProcessError);
    });
  });
});
