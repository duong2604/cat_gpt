# TL-007 — Thiết kế Module 3: vòng đời tài liệu, hợp đồng API, đường ống

Trạng thái: Done
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 16/11/2026 · bàn giao review 16/11/2026 (vòng 1), 17/11/2026 (vòng 2) · hoàn tất 17/11/2026
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
| Q4 | `@langchain/textsplitters` hay tự viết bộ chia đoạn (xem [thiết kế mục 9](../design/module-3-documents.md#9-quyết-định-còn-mở)) | `@langchain/textsplitters` | **Chốt 17/11/2026 (CTO):** `@langchain/textsplitters` + `RecursiveCharacterTextSplitter` |
| Q-M3-1 | Giới hạn 20 MB / 500 đoạn | Đồng ý | Chờ (không chặn) |

## Kết quả review
- Vòng 1 (16/11/2026): CTO **duyệt hướng thiết kế** 17/11/2026, kèm điều chỉnh bắt buộc — [Review vòng 1](#review-vòng-1).
- Vòng 2 (17/11/2026): đã đưa đủ điều chỉnh vào thiết kế — [Checklist vòng 2](#checklist-vòng-2). TL-007 `Done` (quyết định CTO 17/11: "TL hoàn thiện các điều chỉnh kỹ thuật … trước khi SE-011 triển khai pipeline"). [SE-011](SE-011-documents-txt-backend.md) → `Sẵn sàng` (nhận sau khi [SE-010](SE-010-dev-infra-ci.md) merge).

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

#### Review vòng 1
CTO (17/11/2026), "CTO APPROVAL — CAT GPT REPORT ROUND 5": **duyệt hướng thiết kế Module 3**; TL hoàn thiện các điều chỉnh kỹ thuật trước khi SE-011 triển khai pipeline. Q4: chọn `@langchain/textsplitters` với `RecursiveCharacterTextSplitter`, không tự viết bộ chia đoạn nếu thư viện đáp ứng. Q-INF-1: cho phép `bitnamilegacy/minio:2025.7.23-debian-12-r5` tạm thời cho local development, không phải giải pháp production; TL đề xuất phương án S3-compatible còn bảo trì. Điều chỉnh bắt buộc: kiểm tra quy tắc custom job ID của phiên bản BullMQ, tránh dấu `:`; bổ sung kiểm thử thực tế cho xóa khi worker đang xử lý, retry và cleanup; không khẳng định idempotency hoặc cleanup tuyệt đối khi chưa có bằng chứng kiểm thử; MinIO chỉ local, bucket private; đồng bộ `.env`/`.env.example`; ưu tiên kiểm thử bằng service thật.

### Checklist vòng 2
**Task hoặc yêu cầu** — TL-007 · [module-3-documents.md](../design/module-3-documents.md) · cơ sở `c111fd2` · vòng 2
**Kết luận** — Đã đưa đủ điều chỉnh bắt buộc của CTO vào thiết kế; Q4 và Q-INF-1 ghi chốt; thêm đề xuất object storage thay MinIO có kiểm thử.
**Checklist**
- [x] Job ID BullMQ — Đạt — TL đọc mã nguồn `bullmq@6.7.6` (`npm pack`, `dist/cjs/classes/job.js:911–918`): jobId là số → `Custom Id cannot be integers`; có `:` mà không tách đúng 3 phần → `Custom Id cannot contain :`. Đổi thành `process-<documentId>`, `delete-<documentId>`; ghi `removeOnComplete`/`removeOnFail` và hành vi `add` trùng id bị bỏ qua — [thiết kế mục 4.4](../design/module-3-documents.md#44-hàng-đợi-bullmq)
- [x] Kiểm thử thực tế xóa khi worker đang xử lý, retry, cleanup — Đạt — thêm T11 (xóa ở 2 giai đoạn, ≥ 3 lần mỗi giai đoạn), T12 (kill API giữa job → stalled → chạy lại, không trùng point), T13 (MinIO tắt khi xóa → job `delete` thử lại); yêu cầu ghi số liệu thật cho T5, T6, T11–T13 — [mục 10](../design/module-3-documents.md#10-kiểm-thử-bắt-buộc-dùng-service-thật)
- [x] Không khẳng định tuyệt đối — Đạt — mục 6.3 bước 4 và 6.4 bước 3 đổi thành "mục tiêu / kết quả kỳ vọng, chỉ ghi đạt khi T… có số liệu"; ghi rõ khoảng hở đã biết (worker bị dừng giữa bước 4 và 5)
- [x] MinIO local, bucket private — Đạt — M3-7; [SE-010](SE-010-dev-infra-ci.md) AC3 (bind `127.0.0.1`, kiểm chính sách ẩn danh)
- [x] Q4, Q-INF-1 ghi chốt CTO — [mục 1](../design/module-3-documents.md#1-quyết-định-đã-chốt), [mục 9](../design/module-3-documents.md#9-quyết-định-còn-mở)
- [x] Đề xuất object storage còn bảo trì — Đạt — [mục 13](../design/module-3-documents.md#13-object-storage-s3-compatible-thay-minio): RustFS 1.0.6 (Apache-2.0) chạy thử local: `mc` tạo bucket, upload/download TXT tiếng Việt SHA-256 trùng, bucket mặc định `private`, ~35 MiB RAM; SeaweedFS dự phòng; Garage (AGPL), Ceph (nặng) không chọn
- [x] `.env`/`.env.example` — quy định đưa vào [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) (W1)

**Trạng thái và bước tiếp theo** — Done (CTO đã duyệt hướng thiết kế; điều chỉnh đã đưa vào). Đề xuất RustFS chờ CTO khi tới task đóng gói Docker.

## Phản hồi UI
Không áp dụng (tài liệu).
