# TL-007 — Thiết kế Module 3: vòng đời tài liệu, hợp đồng API, đường ống

Trạng thái: Chờ Review
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 16/11/2026 · bàn giao review 16/11/2026 (vòng 1) · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2 (APPROVED WITH CONDITIONS): Module 3–4 là đường găng; lát dọc TXT trước; chỉ chủ sở hữu truy cập tài liệu; OpenAI chỉ dùng tài liệu thử công khai; Redis/MinIO/Qdrant chạy Docker local
SHA cơ sở: `origin/develop` @ `eb1ce4d` (code `d6832e0`)
PR: Không — tài liệu TL

## Mục tiêu
Một bản FS/BD đủ chặt để Senior Dev làm lát TXT (SE-011, SE-012) mà không phải tự quyết vòng đời, thử lại, xóa khi đang xử lý, dọn dữ liệu MinIO/Mongo/Qdrant và quyền truy cập.

## Output
- [docs/design/module-3-documents.md](../design/module-3-documents.md).

## Phạm vi
- Làm: FS (FR-M3-01…08), BD (thành phần, dữ liệu, API, vòng đời, mã lỗi, cấu hình, kịch bản kiểm thử, giao diện).
- Không làm: Module 4 (TL-008); code.

## Nguồn yêu cầu
- Đề cương: [Module 3, giới hạn định dạng](../thesis/sources/de-cuong-datn.md).
- CTO vòng 2 (16/11/2026) mục 2–3, 8; CTO duyệt Wave 0–2 (16/11/2026) mục 3–5.
- Quyền: [access-control CS-1](../design/access-control.md#4-chính-sách-đã-chốt).
- Khuôn code hiện có: `apps/api/src/modules/chat/`, `me.controller.ts` (upload), `common/dto/pagination-query.dto.ts`, `packages/shared`.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Mỗi FR Module 3 trong đề cương có API, màn hình, trạng thái tương ứng | Đề cương | Đối chiếu [mục 2](../design/module-3-documents.md#2-chức-năng-function-spec) |
| AC2 | Vòng đời, thử lại, idempotency, xóa khi đang xử lý, dọn MinIO/Mongo/Qdrant có quy tắc cụ thể | CTO vòng 2 mục 2 | [mục 6](../design/module-3-documents.md#6-vòng-đời-thử-lại-và-idempotency) |
| AC3 | Quyền: chỉ chủ sở hữu; admin không đọc; `404` đồng nhất | CTO 16/11 | [mục 5](../design/module-3-documents.md#5-api) |
| AC4 | Có kịch bản kiểm thử bằng service thật cho từng ca vòng đời | CTO 16/11 mục 4 | [mục 10](../design/module-3-documents.md#10-kiểm-thử-bắt-buộc-dùng-service-thật) |
| AC5 | Biến môi trường mới có tên, mẫu, mặc định | CTO 16/11 mục 1 | [mục 8](../design/module-3-documents.md#8-cấu-hình) |
| AC6 | CTO/khách hàng duyệt | Workflow mục 2 | Ghi ở Review vòng 1 |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q4 | `@langchain/textsplitters` hay tự viết bộ chia đoạn (xem [thiết kế mục 9](../design/module-3-documents.md#9-quyết-định-còn-mở)) | `@langchain/textsplitters` | Chờ CTO/khách hàng |
| Q-M3-1 | Giới hạn 20 MB / 500 đoạn | Đồng ý | Chờ (không chặn) |

## Kết quả review
Vòng 1 bàn giao 16/11/2026 — chờ CTO/khách hàng. Khi duyệt: TL chuyển [SE-011](SE-011-documents-txt-backend.md), [SE-012](SE-012-documents-txt-frontend.md) sang `Sẵn sàng`.

## Lịch sử review
### Checklist vòng 1
**Task hoặc yêu cầu** — TL-007 · [module-3-documents.md](../design/module-3-documents.md) · cơ sở `eb1ce4d` · vòng 1
**Kết luận** — Bản FS/BD đủ cho lát TXT; còn Q4 (thư viện chia đoạn) chờ chốt, không chặn SE-010.
**Checklist**
- [x] AC1 — 8 FR, mỗi FR gắn lát/task — [mục 2](../design/module-3-documents.md#2-chức-năng-function-spec)
- [x] AC2 — bảng chuyển trạng thái có điều kiện; upload hoàn tác theo bước; `jobId` cố định; xóa-point-trước-rồi-upsert; lỗi vĩnh viễn/tạm thời; xóa bằng `deletedAt` + job `delete` idempotent; worker kiểm `deletedAt` trước `READY`
- [x] AC3 — lọc `{userId, deletedAt: null}`; `404 DOCUMENT_NOT_FOUND` cho mọi trường hợp; tải xuống qua API, bucket riêng tư
- [x] AC4 — T1–T10 dùng Redis/MinIO/Qdrant/OpenAI thật, tài liệu thử công khai
- [x] AC5 — 16 biến, mẫu không chứa credential thật
- [x] Đối chiếu kiến trúc thật: ảnh đại diện đang dùng `LocalStorageProvider` qua `FilesController` (`getAbsolutePath`) → tài liệu dùng service MinIO riêng, không đổi `StorageService` toàn cục (M3-5)
- [ ] AC6 — chờ CTO/khách hàng

**Trạng thái và bước tiếp theo** — Chờ Review.

## Phản hồi UI
Không áp dụng (tài liệu).
