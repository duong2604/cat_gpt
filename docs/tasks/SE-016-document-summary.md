# SE-016 — Module 4: tóm tắt tài liệu

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: **P1** (CTO 18/11/2026 (chỉ thị chuẩn bị Module 4)) · Ước lượng: 1,5 ngày làm việc
Phụ thuộc (gate): [SE-012](SE-012-documents-txt-frontend.md) merge **và** [SE-014](SE-014-rag-qa-backend.md) hoàn thành (dùng chung export Module 3 + cách gọi LLM); kiến trúc TL-008 đã duyệt
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 17/11/2026 — Q-M4-4 (job nền); nội dung task chuẩn bị 18/11/2026
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

## Mục tiêu
Người dùng bấm "Tóm tắt" ở một tài liệu `READY` của mình và nhận bản tóm tắt tiếng Việt dựa trên toàn bộ nội dung; bản tóm tắt được lưu để mở lại không phải sinh lại.

## Phạm vi
- **Làm:**
  - `POST /documents/:id/summary`: `202` khi tạo job, `200` khi đã có bản lưu.
  - Job `summarize-<id>` trên **queue `documents` có sẵn** (không tạo queue mới), `attempts = 2`.
  - `VectorStoreService.scroll(documentId)`, sắp theo `chunkIndex`.
  - Map-reduce đơn giản: nhóm ≤ `RAG_SUMMARY_GROUP_CHARS` → tóm tắt nhóm → một lượt gộp. Dùng `LlmProvider` có sẵn (đọc hết stream, không stream ra client).
  - Trường `summary*`; `DOCUMENT_SUMMARY_FAILED`; polling `summaryStatus`; nút + hộp thoại ở trang Tài liệu.
  - Theo [module-4-rag.md mục 8](../design/module-4-rag.md#8-tóm-tắt-se-016); kiểm thử S1–S2.
- **Không làm:** tóm tắt nhiều tài liệu một lúc; chỉnh độ dài tùy ý; stream tóm tắt ra client.

## Checkpoint
| CP | Nội dung | Bằng chứng tối thiểu |
|---|---|---|
| CP1 | API + `summaryStatus` (`PENDING/READY/FAILED`), schema `summary*`, `DocumentDto`; tài liệu người khác `404`, chưa `READY` `400 DOCUMENT_NOT_READY` | `curl` |
| CP2 | Job `summarize-<id>`: `scroll` Qdrant → nhóm → map-reduce → `READY`; `attempts = 2`; lỗi cuối → `FAILED DOCUMENT_SUMMARY_FAILED` | Log job + bản ghi Mongo |
| CP3 | Lưu `summary`, `summaryModel`, `summarizedAt`; polling; nút/hộp thoại ở trang Tài liệu; vi/en; 375 px | Ảnh/GIF |
| CP4 | S1 (gọi lại → `200`, **không có dòng usage mới**); S2 (xóa khi đang tóm tắt → không lưu, dọn như Module 3 — update có điều kiện `deletedAt: null`); retry; đọc lại trên service thật | Bảng kết quả |

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Tài liệu thử công khai (một nhóm và ≥ 2 nhóm) → tóm tắt tiếng Việt nêu đúng ý chính (TL đối chiếu nguồn) | Ảnh + đối chiếu |
| AC2 | S1: mở lại → trả bản đã lưu, không gọi LLM lần hai | Log usage |
| AC3 | Tài liệu người khác → `404`; chưa `READY` → `400` đã dịch; `staff` → ẩn/`404` | `curl` |
| AC4 | S2 + lỗi LLM → `FAILED` đúng mã sau 2 lượt; Tóm tắt lại được sau `FAILED` | Bảng kết quả |
| AC5 | Checklist hai vai; CI xanh | Bàn giao 6.1 |

## Ước lượng (TL đánh giá lại 18/11/2026)
1,5 ngày, giữ nguyên. Queue/worker BullMQ, polling trạng thái và `LlmProvider` đã có; phần mới là `scroll`, job tóm tắt và hộp thoại.

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Chưa có.
