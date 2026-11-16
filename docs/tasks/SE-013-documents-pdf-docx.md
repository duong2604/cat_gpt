# SE-013 — Mở rộng định dạng: PDF dạng text và DOCX

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1,5 ngày làm việc
Phụ thuộc: TL nghiệm thu lát TXT trên `develop` ([SE-011](SE-011-documents-txt-backend.md) + [SE-012](SE-012-documents-txt-frontend.md)) (chặn)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-013 mở rộng PDF/DOCX sau khi nghiệm thu TXT
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

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
| — | Thư viện PDF | SE đề xuất khi nhận task, TL duyệt | — |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review

## Phản hồi UI
Chưa có.
