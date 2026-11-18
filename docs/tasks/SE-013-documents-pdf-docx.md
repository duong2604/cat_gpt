# SE-013 — Mở rộng định dạng: PDF dạng text và DOCX

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1,5 ngày làm việc
Phụ thuộc: TL nghiệm thu lát TXT trên `develop` ([SE-011](SE-011-documents-txt-backend.md) + [SE-012](SE-012-documents-txt-frontend.md)) — **đạt 18/11/2026** (`cd386e5`); không còn phụ thuộc chặn
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 18/11/2026 · bàn giao review — 18/11/2026 · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-013 mở rộng PDF/DOCX sau khi nghiệm thu TXT
SHA cơ sở: `origin/develop` @ `b4c17be`
PR: https://github.com/duong2604/cat_gpt/pull/25

## Mục tiêu
Tài liệu PDF dạng text và DOCX đi qua cùng đường ống của lát TXT tới `READY`; PDF scan và tệp hỏng kết thúc `FAILED` có mã lỗi rõ, không thử lại.

## Output
- PR từ `feature/module-3-documents-pdf-docx` vào `develop`.
- `text-extract.ts`: thêm PDF (giữ số trang cho từng đoạn → payload `page`) và DOCX (`mammoth`). Thư viện PDF: SE đề xuất 1 lựa chọn kèm lý do (giấy phép, kích thước, bảo trì) — **TL duyệt trước khi thêm**.
- Kiểm chữ ký PDF/DOCX theo [thiết kế mục 5](../design/module-3-documents.md#5-api); mở `.pdf`/`.docx` ở giao diện tải lên.
- Tệp thử công khai PDF text, PDF scan, DOCX, DOCX hỏng trong `apps/api/test/fixtures/`.

## Phạm vi
- Làm: như Output.
- Không làm: OCR; DOC cũ, PPTX, XLSX; giữ định dạng.

## Nguồn yêu cầu
- Đề cương: giới hạn định dạng (PDF dạng text, DOCX, TXT; không OCR).
- [module-3-documents.md](../design/module-3-documents.md) mục 4.3 (`page`), 5, 7.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | PDF text và DOCX mẫu → `READY`, `chunkCount > 0`; point PDF có `page` | FR-M3-01, 08 | API + Qdrant |
| AC2 | PDF scan → `FAILED DOCUMENT_NO_TEXT`, 1 lần chạy (không thử lại) | Thiết kế mục 7 | Log BullMQ |
| AC3 | DOCX/PDF hỏng hoặc đổi đuôi → `400 FILE_INVALID_TYPE` (sai chữ ký) hoặc `FAILED DOCUMENT_UNREADABLE` (đúng chữ ký nhưng hỏng), không treo | Thiết kế mục 7 | `curl` |
| AC4 | Tiếng Việt có dấu trích đúng (so 3 câu mẫu với nguồn) | Đề cương (tiếng Việt) | Trích payload |
| AC5 | Không hồi quy lát TXT (AC1, AC5, AC7 của SE-011 chạy lại) | Không hồi quy | Đầu ra |
| AC6 | Unit test từng bộ bóc tách với tệp mẫu | CTO 16/11 mục 4 | `pnpm --filter @cat-gpt/api test` |
| AC7 | Giao diện nhận `.pdf`/`.docx`; nhãn lỗi đã dịch | SE-012 | Ảnh |
| AC8 | Checklist hai vai; CI xanh; build/typecheck/lint | Quy ước repo | Bàn giao 6.1 |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| — | Thư viện PDF | SE đề xuất `unpdf@1.9.1` (MIT, ~2,2 MB, không phụ thuộc bắt buộc, khớp Node ≥22 của repo, có sẵn `extractText({ mergePages: false })` cho `page` theo trang) | **TL duyệt 18/11/2026** (kèm 2 điều kiện: chặn số trang PDF trước khi bóc chữ, chặn kích thước giải nén `word/document.xml` trước khi gọi mammoth — đã làm, xem AC2/AC3) |

## Kết quả review
**Task:** SE-013 — mở rộng PDF (dạng text) và DOCX vào đường ống tài liệu hiện có (SE-011/SE-012), không tạo pipeline riêng.

**Kết quả:** Đã làm đủ phạm vi mục tiêu; tự kiểm toàn bộ AC1–AC8 bằng dịch vụ thật (Mongo/MinIO/Qdrant/Redis thật, API chạy thật qua watch mode), không mock; đã dọn toàn bộ dữ liệu thử, xác nhận bằng đếm trực tiếp 3 nơi.

**Checklist:**
- [x] AC1 PDF text và DOCX mẫu → READY, chunkCount>0; point PDF có page — Đạt — tải `se013-pdf-text-vi.pdf` qua UI thật → READY, chunkCount=1; Qdrant điểm có `page=1`; MinIO lưu đúng byte (SHA-256 khớp tệp gốc). DOCX (`se013-docx-valid.docx`) → READY, chunkCount=1, Qdrant điểm không có `page` (đúng thiết kế — chỉ PDF có), MinIO SHA-256 khớp
- [x] AC2 PDF scan → FAILED DOCUMENT_NO_TEXT, 1 lần chạy — Đạt — tải `se013-pdf-scan.pdf` → "Failed", "The file has no extractable text content."; BullMQ `attemptsMade=1`
- [x] AC3 Sai chữ ký → 400 FILE_INVALID_TYPE; đúng chữ ký nhưng hỏng → FAILED DOCUMENT_UNREADABLE, không treo — Đạt — tệp `.pdf` không có header `%PDF-` → toast "Invalid file type.", không có dòng nào xuất hiện (từ chối trước khi vào hàng đợi); `se013-pdf-corrupt.pdf` (đúng `%PDF-`, nội dung hỏng) → "The file is corrupted or unreadable.", BullMQ `attemptsMade=1`, `durationMs=170`; `se013-docx-corrupt.docx` (đúng zip, XML cắt giữa chừng) → cùng lỗi, `attemptsMade=1`, `durationMs=315`. Không dùng timeout kiểu `Promise.race` — không chặn được công việc CPU đồng bộ của pdf.js/mammoth đang chạy (chỉ chặn việc *chờ*); thay vào đó giới hạn số trang PDF trước khi bóc chữ từng trang (`DOCUMENT_MAX_PDF_PAGES=2000`, kiểm qua `getDocumentProxy` trước `extractText`) và giới hạn kích thước giải nén của `word/document.xml` trước khi gọi mammoth (`DOCUMENT_MAX_DOCX_XML_MB=50`, đọc từ metadata của jszip, không giải nén thật — chặn zip bomb); xác nhận thực tế 2 tệp hỏng ở trên FAILED nhanh, không treo. Log API chỉ có 1 dòng cảnh báo vô hại của pdf.js khi xử lý `se013-pdf-corrupt.pdf`: `Warning: Indexing all PDF objects` — không có nội dung tài liệu hay cảnh báo fake-worker nào khác
- [x] AC4 Tiếng Việt có dấu trích đúng — Đạt — cả PDF và DOCX chứa đúng 3 câu mẫu có dấu đầy đủ; so trực tiếp payload Qdrant/trích xuất với văn bản nguồn — khớp 100%, không mất/méo dấu. Unit test `text-extract.spec.ts` khẳng định cả 3 câu nằm trong văn bản trích được
- [x] AC5 Không hồi quy lát TXT (AC1/AC5/AC7 SE-011) — Đạt — AC1: tải `se-011-sample.txt` → READY, chunkCount=3, MinIO SHA-256 khớp, không có `page` trong payload (như trước). AC5 (cô lập theo chủ sở hữu): lặp lại kiểm tầng API với tài khoản A/B của TL, lần này dùng PDF — B liệt kê total=0, không thấy tài liệu A; B tải thẳng link A → 404. AC7 (dọn dữ liệu): toàn bộ 7 tài liệu thử (5 PDF/DOCX + 1 TXT + 1 PDF của kiểm AC5) xóa xong, đếm trực tiếp Mongo/MinIO/Qdrant = 0 cho từng tài liệu (MinIO liệt kê theo tiền tố `documents/`, không dựa vào bản ghi Mongo — theo đúng chuẩn TL yêu cầu sau đính chính AC13 của SE-011)
- [x] AC6 Unit test từng bộ bóc tách với tệp mẫu — Đạt — `text-extract.spec.ts` thêm 12 test: chữ ký PDF/DOCX (chấp nhận/từ chối), trích PDF theo trang + tiếng Việt, PDF scan → text rỗng, PDF/DOCX hỏng → `DocumentUnreadableError`, vượt số trang/kích thước → `DocumentTooLargeToProcessError`, trích DOCX + tiếng Việt. `pnpm --filter @cat-gpt/api test`: 42/42 qua (30 cũ + 12 mới)
- [x] AC7 Giao diện nhận .pdf/.docx; nhãn lỗi đã dịch — Đạt — `accept` của input tải lên thêm `.pdf`/`.docx` + mimetype tương ứng; mô tả trang và `uploadHint` cập nhật (không còn chỉ nói TXT); `DOCUMENT_UNREADABLE` dịch đủ vi/en, xác nhận hiện đúng trên UI thật (ảnh ở trên)
- [x] AC8 Checklist hai vai; CI xanh; build/typecheck/lint — Đạt — root `pnpm typecheck && pnpm build && pnpm lint` xanh; CI: [run 44324670475](https://github.com/duong2604/cat_gpt/actions/runs/44324670475) — xanh (env:check, typecheck, lint, api test 42/42, build) — TL dùng tài khoản A/B riêng để làm vòng kiểm UI khi bàn giao, như đã thống nhất ở SE-012

**Kiểm tra đã chạy:** `pnpm typecheck && pnpm build && pnpm lint` ở gốc repo (xanh); `pnpm --filter @cat-gpt/api test` (42/42); kiểm thủ công toàn bộ qua trình duyệt thật (Claude in Chrome) + script tầng API đối chiếu Mongo/MinIO/Qdrant trực tiếp (không mock, không dùng danh sách API để xác nhận đã xóa) cho từng AC ở trên; `pnpm audit --prod` sau khi thêm `unpdf`/`mammoth`/`jszip` — không có cảnh báo mới từ 3 gói này (31 cảnh báo cũ, toàn bộ thuộc Next.js/hono qua `apps/web`, ngoài phạm vi PR này).

**Simplicity First:**
- Dùng chung một đường ống xử lý (`document-processor.ts`), không tạo pipeline riêng cho PDF/DOCX — chỉ thêm một bước chọn bộ bóc tách theo `mimeType`.
- Tái dùng `DOCUMENT_TOO_MANY_CHUNKS` cho PDF vượt số trang thay vì thêm mã lỗi mới — cùng ý nghĩa "quá nhiều để xử lý, chặn chi phí" như chặn số đoạn embedding.
- Không thêm thư viện cho việc đọc kích thước zip-entry — dùng thẳng metadata jszip đã có sẵn (mammoth đã phụ thuộc jszip).
- Không thêm cơ chế timeout giả (Promise.race) khi biết trước nó không giải quyết được vấn đề CPU đồng bộ — chọn giới hạn đầu vào (số trang, kích thước XML) làm chặn thật sự, kiểm chứng bằng thời gian chạy thật trên tệp hỏng.
- Không đổi kiến trúc, không đổi API shape (`DocumentDto` không đổi).

**Dọn nhánh sau merge:** Senior Dev sẽ dọn `feature/module-3-documents-pdf-docx` theo [mục 2.1](../project/workflow.md#21-dọn-nhánh-và-worktree-sau-merge) sau khi TL merge.

**Trạng thái:** Chờ Review.

## Lịch sử review

### Checklist vòng 1
Xem bảng "Checklist" ở trên — toàn bộ AC1–AC8 tự kiểm ở vòng 1, chưa có phản hồi TL.

## Phản hồi UI
Chưa có.
