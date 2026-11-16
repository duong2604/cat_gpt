# SE-011 — Lát TXT, backend: tải lên → xử lý bất đồng bộ → READY → danh sách / tải xuống / xóa

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 3 ngày làm việc
Phụ thuộc: [TL-007](TL-007-module-3-design.md) được duyệt (chặn); [SE-010](SE-010-dev-infra-ci.md) đã merge (chặn); Q4 (thư viện chia đoạn) — không chặn
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-011 triển khai backend lát TXT bằng service thật; chỉ chủ sở hữu truy cập; OpenAI chỉ dùng tài liệu thử công khai
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

**Thử nghiệm skills:** task pilot số 1 ([TL-010](TL-010-engineering-guide-skills-pilot.md)) — đọc [engineering-guide](../project/engineering-guide.md) trước khi làm.

## Mục tiêu
Một tệp TXT tải lên được lưu thật ở MinIO, xử lý bất đồng bộ qua BullMQ thành các đoạn có vector trong Qdrant, đạt `READY`, rồi xem danh sách, tải xuống và xóa sạch được — đúng [thiết kế Module 3](../design/module-3-documents.md).

## Output
- PR từ `feature/module-3-documents-txt` vào `develop`.
- Module `apps/api/src/modules/documents/` theo [thiết kế mục 3](../design/module-3-documents.md#3-kiến-trúc-và-thành-phần); chỉ bộ bóc tách TXT.
- `packages/shared`: `DocumentStatus`, mã lỗi mục 7, `DocumentDto`.
- Biến môi trường mục 8 trong `env.validation.ts`, `app-config.service.ts`, `.env.example` (đồng bộ `.env`; `pnpm env:check` đạt).
- Dependency mới (đã duyệt hạ tầng 16/11): `bullmq`, `@nestjs/bullmq`, `minio`, `@qdrant/js-client-rest`; `@langchain/textsplitters` chỉ khi Q4 chốt dùng. Thêm gói khác → hỏi TL trước.
- Tệp thử công khai trong `apps/api/test/fixtures/` (ghi nguồn).
- Tài liệu: cập nhật trạng thái trong `module-3-documents.md`; [access-control](../design/access-control.md) thêm dòng ma trận cho tài liệu.

## Phạm vi
- Làm: API mục 5; vòng đời mục 6; mã lỗi mục 7; tìm theo tên, lọc trạng thái.
- Không làm: PDF/DOCX (SE-013); giao diện (SE-012); truy hồi/RAG; chuyển ảnh đại diện sang MinIO; job quét dọn định kỳ.

## Nguồn yêu cầu
- [module-3-documents.md](../design/module-3-documents.md) mục 2–8, 10.
- CTO 16/11/2026 mục 4: kiểm thử bằng service thật, không mock/fake chỉ để đánh dấu xong.

## Checklist nghiệm thu
Kiểm bằng Redis/MinIO/Qdrant thật (Docker local), MongoDB Atlas dev, OpenAI thật với tệp thử công khai. Tài khoản: nhân viên A, nhân viên B (cùng vai), admin.

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | T1: upload TXT → `201 PENDING` → `READY`; `chunkCount > 0`; số point Qdrant theo `documentId` = `chunkCount` | FR-M3-01, 07, 08 | Script/`curl` + truy vấn Qdrant |
| AC2 | T2, T10: sai đuôi / sai chữ ký / không UTF-8 / quá cỡ → `400` đúng mã, không còn object/bản ghi; tệp chỉ khoảng trắng → `FAILED DOCUMENT_NO_TEXT`, không thử lại | Thiết kế mục 5–7 | `curl` + kiểm MinIO/Mongo |
| AC3 | T3, T4: Qdrant tắt rồi bật trước lần thử cuối → `READY`; tắt suốt → `FAILED DOCUMENT_PROCESSING_FAILED` sau đúng `DOCUMENT_JOB_ATTEMPTS` lần | Mục 6.3 | `docker compose stop qdrant` / `start` + log |
| AC4 | T5: chạy lại job `process` cho tài liệu `READY` → số point không đổi | Mục 6.3 bước 4 | Đếm point trước/sau |
| AC5 | T6: xóa khi đang `PROCESSING` → cuối cùng 0 point, 0 object, 0 bản ghi; không có `READY` | Mục 6.4 | Tệp lớn + kiểm 3 nơi |
| AC6 | T9: Redis tắt → upload `503 DOCUMENT_QUEUE_UNAVAILABLE`, không còn object/bản ghi | Mục 6.2 | `docker compose stop redis` |
| AC7 | T7: B và admin gọi detail/download/delete tài liệu của A → `404 DOCUMENT_NOT_FOUND`; chưa đăng nhập `401`; danh sách của B không thấy tài liệu của A | M3-2, CS-1 | `curl` 3 cookie jar |
| AC8 | T8: tải xuống — SHA-256 trùng tệp gốc; `Cache-Control: private, no-store`; tên tiếng Việt đúng | FR-M3-05 | `curl -OJ` + `sha256sum` |
| AC9 | Tìm theo tên không phân biệt hoa thường; lọc `status`; phân trang | FR-M3-02, 03 | `curl` |
| AC10 | Unit test cho kiểm định dạng, chia đoạn, phân loại lỗi vĩnh viễn/tạm thời; mock (nếu có) ghi lý do | CTO 16/11 mục 4 | `pnpm --filter @cat-gpt/api test` |
| AC11 | Log không có nội dung tài liệu, khóa API | Thiết kế mục 7 | Trích log |
| AC12 | `.env` ↔ `.env.example` đồng bộ; `.env.example` không có credential thật | CTO 16/11 mục 1 | `pnpm env:check` |
| AC13 | Checklist hai vai (mục 9.1), dữ liệu thử đã xóa (tài liệu, point, object; tài khoản thử khóa) | Workflow 9.1 | Bàn giao 6.1 |
| AC14 | CI xanh; `pnpm build`, `typecheck`, `lint` đạt | Quy ước repo | Link run |

**Bàn giao bổ sung (Simplicity First):** (1) đã đổi gì, vì sao; (2) vì sao đây là cách đơn giản nhất đủ dùng; (3) abstraction/dependency mới và lý do; (4) test đã chạy + kết quả; (5) giới hạn còn lại, rủi ro.

## Rủi ro xung đột
`app.module.ts`, `env.validation.ts`, `app-config.service.ts`, `.env.example`, `packages/shared` — cũng bị PR #6 (SE-003) sửa. Chỉ **thêm khối mới**; nếu PR #6 chưa merge khi bàn giao, ghi rõ trong PR.

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q4 | Thư viện chia đoạn | `@langchain/textsplitters`; nếu chưa chốt khi tới bước này: tự viết trong `chunk-text.ts` | Chờ CTO/khách hàng |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review

## Phản hồi UI
Không áp dụng (backend). Giao diện ở [SE-012](SE-012-documents-txt-frontend.md).
