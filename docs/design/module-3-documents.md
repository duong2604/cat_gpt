# Module 3 — Quản lý tài liệu và đường ống xử lý bất đồng bộ

> Trạng thái: **Chờ Review** — bản thiết kế [TL-007](../tasks/TL-007-module-3-design.md) (16/11/2026), cơ sở `origin/develop` @ `eb1ce4d` (code `d6832e0`). Chưa có code trên `develop`.
> Phạm vi theo đề cương: tải lên/tải xuống, xem thông tin (metadata), tìm kiếm, xóa và theo dõi trạng thái xử lý; đường ống bất đồng bộ bóc tách văn bản → chia đoạn → sinh vector → lưu vào cơ sở dữ liệu vector. Định dạng: TXT, PDF dạng text, DOCX; không OCR ([đề cương](../thesis/sources/de-cuong-datn.md)).
> Quyết định CTO 16/11/2026: lát dọc đầu tiên chỉ TXT ([SE-011](../tasks/SE-011-documents-txt-backend.md), [SE-012](../tasks/SE-012-documents-txt-frontend.md)), sau đó PDF/DOCX ([SE-013](../tasks/SE-013-documents-pdf-docx.md)); chỉ chủ sở hữu truy cập tài liệu; OpenAI chỉ nhận tài liệu thử công khai, không nhạy cảm.

## 1. Quyết định đã chốt

| # | Quyết định | Nguồn |
|---|---|---|
| M3-1 | Hạ tầng dev: Redis + BullMQ, MinIO, Qdrant chạy Docker local (một bộ dùng chung); MongoDB vẫn Atlas | CTO 16/11/2026 |
| M3-2 | Quyền: **chỉ chủ sở hữu** đọc, tải xuống, xóa tài liệu của mình. Admin **không** mặc nhiên đọc nội dung (giữ [CS-1](access-control.md#4-chính-sách-đã-chốt)) | CTO 16/11/2026 |
| M3-3 | Embedding cho lát đầu: OpenAI `text-embedding-3-small` qua SDK `openai` đã có; **chỉ tài liệu thử công khai, không nhạy cảm** cho tới khi có quyết định về dữ liệu nội bộ | CTO 16/11/2026 |
| M3-4 | Thứ tự: TXT đầu–cuối trước, PDF/DOCX sau khi TL nghiệm thu lát TXT | CTO 16/11/2026 |
| M3-5 | Ảnh đại diện **giữ** `LocalStorageProvider` hiện có; tài liệu dùng MinIO qua một service riêng của module tài liệu. Không đổi `StorageService` toàn cục, không thêm `STORAGE_DRIVER` (chỉ một nơi dùng MinIO — YAGNI) | TL, Simplicity First |
| M3-7 | Máy chủ MinIO dev: `bitnamilegacy/minio:2025.7.23-debian-12-r5` (image chính thức đã gỡ khỏi Docker Hub, repo upstream archive — TL kiểm 16/11/2026). Code chỉ dùng S3 API (bucket/object) để có thể đổi máy chủ S3-compatible bằng `.env` | TL, chờ CTO chốt lâu dài (Q-INF-1 ở [SE-010](../tasks/SE-010-dev-infra-ci.md#quyết-định-còn-mở)) |
| M3-6 | Thư viện chia đoạn (LangChain `@langchain/textsplitters` hay tự viết) | **Chờ** — xem [mục 9](#9-quyết-định-còn-mở) Q4 |

## 2. Chức năng (Function Spec)

| FR | Chức năng | Ai | Lát |
|---|---|---|---|
| FR-M3-01 | Tải lên một tệp TXT / PDF dạng text / DOCX, tối đa `DOCUMENT_MAX_SIZE_MB` (mặc định 20) | Nhân viên, admin (với tài liệu của chính mình) | TXT: SE-011; PDF/DOCX: SE-013 |
| FR-M3-02 | Danh sách tài liệu của mình: tên, loại, kích thước, trạng thái, số đoạn, ngày tải; phân trang; mới nhất lên đầu | như trên | SE-011/012 |
| FR-M3-03 | Tìm theo tên (không phân biệt hoa thường) và lọc theo trạng thái | như trên | SE-011/012 |
| FR-M3-04 | Xem thông tin chi tiết, kể cả mã lỗi khi `FAILED` | như trên | SE-011/012 |
| FR-M3-05 | Tải xuống đúng tệp gốc | như trên | SE-011/012 |
| FR-M3-06 | Xóa tài liệu ở mọi trạng thái (kể cả đang xử lý); tài liệu biến mất khỏi danh sách ngay | như trên | SE-011/012 |
| FR-M3-07 | Theo dõi trạng thái xử lý: `PENDING` → `PROCESSING` → `READY` / `FAILED` (giao diện tự cập nhật) | như trên | SE-011/012 |
| FR-M3-08 | Đường ống: bóc tách văn bản → chia đoạn → embedding → lưu Qdrant | hệ thống | TXT: SE-011; PDF/DOCX: SE-013 |

Ngoài phạm vi: OCR; chia sẻ tài liệu giữa người dùng/phòng ban; xử lý lại thủ công (`FAILED` → người dùng xóa và tải lại); chống trùng nội dung; xem trước nội dung trong trình duyệt; chuyển ảnh đại diện sang MinIO.

## 3. Kiến trúc và thành phần

```
apps/api/src/modules/documents/
  documents.module.ts
  documents.controller.ts        # REST: upload, list, detail, download, delete
  documents.service.ts           # nghiệp vụ + quyền + vòng đời
  document-processor.ts          # worker BullMQ: process + delete
  document-files.service.ts      # MinIO: put / get stream / remove (chỉ module này dùng)
  vector-store.service.ts        # Qdrant: ensure collection, upsert, delete theo documentId
  embedding.service.ts           # OpenAI embeddings (một bản cài, không interface)
  text-extract.ts                # TXT (SE-011); PDF, DOCX (SE-013)
  chunk-text.ts                  # chia đoạn (theo Q4)
  schemas/document.schema.ts
  dto/*.dto.ts
  document.presenter.ts
```

- Worker chạy **trong tiến trình API** (`@nestjs/bullmq` processor) — đủ cho prototype và một máy dev. Tách tiến trình worker riêng khi cần mở rộng (ghi `ponytail:` tại chỗ).
- Đi theo khuôn module hiện có (`chat/`: controller / service / schema / presenter / dto), dùng lại `AppException`, `ErrorCode`, `PaginationQueryDto`, `JwtAuthGuard` toàn cục, `FileInterceptor` như avatar (`me.controller.ts`).
- `vector-store.service.ts` sẽ được Module 4 dùng lại cho truy hồi; chưa thêm hàm search ở Module 3.
- Không thêm repository, factory, adapter hay base class.

## 4. Dữ liệu

### 4.1. MongoDB `documents`

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `_id` | ObjectId | Tạo trước khi ghi MinIO để dùng làm key |
| `userId` | ObjectId → users | Chủ sở hữu; mọi truy vấn lọc theo trường này |
| `name` | string | Tên tệp gốc (đã chuẩn hóa Unicode NFC, bỏ ký tự điều khiển và đường dẫn), ≤ 255 ký tự |
| `mimeType` | string | Theo kết quả kiểm chữ ký tệp, không tin header client |
| `size` | number | byte |
| `storageKey` | string | `documents/<userId>/<documentId>` |
| `status` | `DocumentStatus` | `PENDING` · `PROCESSING` · `READY` · `FAILED` |
| `errorCode` | string? | Chỉ khi `FAILED` (mục 7) |
| `chunkCount` | number? | Khi `READY` |
| `deletedAt` | Date? | Đặt khi người dùng xóa; bản ghi bị ẩn khỏi mọi API |
| `createdAt`, `updatedAt` | Date | `timestamps: true` |

Index: `{ userId: 1, deletedAt: 1, createdAt: -1 }` cho danh sách.
`DocumentStatus` và mã lỗi mới đặt trong `packages/shared` (`enums.ts`, `error-codes.ts`), cùng kiểu `DocumentDto`.

### 4.2. MinIO

- Một bucket `MINIO_BUCKET` (riêng tư). API tạo bucket khi khởi động nếu chưa có; **không** đặt chính sách public.
- Object key `documents/<userId>/<documentId>` — không chứa tên tệp gốc.

### 4.3. Qdrant

- Collection `QDRANT_COLLECTION` (mặc định `document_chunks`), distance Cosine. Kích thước vector lấy từ kết quả embedding đầu tiên khi tạo collection; nếu collection có sẵn mà kích thước khác → job `FAILED` (`DOCUMENT_PROCESSING_FAILED`) và log rõ (đổi model thì đổi tên collection — dùng ở đánh giá WP-11).
- Point: `id` = UUID ngẫu nhiên; `vector`; `payload` = `{ userId, documentId, chunkIndex, text }` (PDF thêm `page` ở SE-013). Payload index trên `userId`, `documentId`.

### 4.4. Hàng đợi BullMQ

- Một queue `documents` với hai loại job: `process` (`jobId = process:<documentId>`) và `delete` (`jobId = delete:<documentId>`). `jobId` cố định để BullMQ bỏ job trùng.
- `process`: `attempts = DOCUMENT_JOB_ATTEMPTS` (mặc định 3), backoff mũ 5 s. `delete`: `attempts = 5`.
- Tách dữ liệu giữa các phiên dev bằng `BULLMQ_PREFIX` (mặc định `cat-gpt`).

## 5. API

Prefix `/api/v1`; mọi endpoint cần đăng nhập.

| Endpoint | Thành công | Lỗi |
|---|---|---|
| `POST /documents` (multipart, trường `file`) | `201` `DocumentDto` (`status: PENDING`) | `400 FILE_REQUIRED` · `400 FILE_TOO_LARGE` · `400 FILE_INVALID_TYPE` · `503 DOCUMENT_QUEUE_UNAVAILABLE` |
| `GET /documents?q=&status=&page=&pageSize=` | `200` `{ items: DocumentDto[], meta }` | `400 VALIDATION_FAILED` |
| `GET /documents/:id` | `200` `DocumentDto` | `404 DOCUMENT_NOT_FOUND` |
| `GET /documents/:id/download` | `200` luồng tệp; `Content-Type` = `mimeType`; `Content-Disposition: attachment; filename*=UTF-8''<tên>`; `Cache-Control: private, no-store` | `404 DOCUMENT_NOT_FOUND` |
| `DELETE /documents/:id` | `204` | `404 DOCUMENT_NOT_FOUND` |

`DocumentDto`: `{ id, name, mimeType, size, status, errorCode?, chunkCount?, createdAt, updatedAt }` — không lộ `storageKey`, `userId`.
Tài liệu không tồn tại, đã xóa, hay thuộc người khác (kể cả admin gọi) đều trả **cùng** `404 DOCUMENT_NOT_FOUND` (không lộ sự tồn tại — giống `CONVERSATION_NOT_FOUND`).

**Kiểm định dạng (chữ ký tệp, không tin `Content-Type` client):**

| Loại | Đuôi | Điều kiện |
|---|---|---|
| TXT | `.txt` | Giải mã UTF-8 hợp lệ (`TextDecoder('utf-8', { fatal: true })`), bỏ BOM; không chứa byte `0x00` |
| PDF | `.pdf` | Bắt đầu `%PDF-` (SE-013) |
| DOCX | `.docx` | Zip (`PK\x03\x04`) có `word/document.xml` (SE-013) |

Trong lát TXT, `.pdf`/`.docx` trả `400 FILE_INVALID_TYPE` cho tới khi SE-013 merge.

## 6. Vòng đời, thử lại và idempotency

### 6.1. Trạng thái

```
            upload OK
  (none) ───────────────► PENDING ──worker nhận──► PROCESSING ──xong──► READY
                                                      │
                                                      └─lỗi vĩnh viễn / hết lượt thử──► FAILED(errorCode)
  DELETE ở bất kỳ trạng thái → deletedAt = now (ẩn ngay) → job delete → bản ghi bị xóa hẳn
```

Mọi chuyển trạng thái là **update có điều kiện** trên `{ _id, deletedAt: null, status: <trạng thái trước> }`; không khớp (đã bị xóa hoặc đã đổi) thì worker dừng, không ghi đè.

| Từ | Sang | Ai | Điều kiện |
|---|---|---|---|
| — | `PENDING` | API upload | Object đã lên MinIO và job đã vào hàng đợi |
| `PENDING` hoặc `PROCESSING` | `PROCESSING` | worker | Bắt đầu một lần chạy (lần thử lại vào lại từ `PROCESSING`) |
| `PROCESSING` | `READY` | worker | Đã upsert đủ point và kiểm `deletedAt` lần cuối |
| `PENDING`/`PROCESSING` | `FAILED` | worker | Lỗi vĩnh viễn, hoặc lỗi tạm thời ở lần thử cuối |

### 6.2. Upload (đồng bộ trong request)

1. Kiểm kích thước và định dạng (mục 5). Lỗi → `400`, chưa ghi gì.
2. Tạo `_id`; ghi object MinIO.
3. Ghi bản ghi Mongo `PENDING`. Lỗi → xóa object vừa ghi, trả lỗi.
4. Đưa job `process` vào hàng đợi. Lỗi (Redis không sẵn sàng) → xóa bản ghi Mongo và object, trả `503 DOCUMENT_QUEUE_UNAVAILABLE`.

### 6.3. Job `process`

1. Chuyển `PROCESSING` (update có điều kiện; không khớp → kết thúc job).
2. Đọc object từ MinIO → bóc tách văn bản → chia đoạn. Không có chữ (sau khi bỏ khoảng trắng) → `DOCUMENT_NO_TEXT`; số đoạn vượt `DOCUMENT_MAX_CHUNKS` → `DOCUMENT_TOO_MANY_CHUNKS`. Hai lỗi này là **vĩnh viễn** (`UnrecoverableError`) → `FAILED` ngay, không thử lại.
3. Embedding theo lô. Thiếu `OPENAI_API_KEY` → vĩnh viễn, `DOCUMENT_EMBEDDING_UNAVAILABLE`. Lỗi mạng/429/5xx → **tạm thời**, ném lỗi để BullMQ thử lại.
4. **Xóa mọi point của `documentId` rồi upsert** point mới → chạy lại bao nhiêu lần cũng không trùng, không sót đoạn cũ.
5. Đọc lại bản ghi: nếu đã có `deletedAt` → xóa point của `documentId`, kết thúc (không đặt `READY`).
6. Chuyển `READY` + `chunkCount` (update có điều kiện).
7. Lần thử cuối vẫn lỗi tạm thời → `FAILED` + `DOCUMENT_PROCESSING_FAILED` (handler `failed` của worker, chỉ khi `attemptsMade >= attempts`).

API tắt giữa chừng: BullMQ tự đưa job "stalled" trở lại hàng đợi; bước 1 nhận lại từ `PROCESSING`, bước 4 bảo đảm idempotent. Không viết thêm cơ chế khôi phục.

### 6.4. Xóa (kể cả khi job đang chạy)

1. `DELETE` đặt `deletedAt` (update có điều kiện theo `userId`; không khớp → `404`), đưa job `delete` vào hàng đợi, trả `204`. Từ lúc này mọi API coi như không còn tài liệu.
2. Job `delete` (idempotent, mỗi bước bỏ qua "không tồn tại"): xóa point Qdrant theo `documentId` → xóa object MinIO → xóa bản ghi Mongo.
3. Job `process` đang chạy song song sẽ dừng ở bước 1/5/6 vì `deletedAt`; nếu nó upsert sau khi job `delete` đã dọn Qdrant, bước 5 của chính nó xóa lại point. Kết quả cuối luôn: 0 point, 0 object, 0 bản ghi.
4. Đưa job `delete` vào hàng đợi lỗi → vẫn trả `204` (tài liệu đã ẩn); ghi log cảnh báo kèm `documentId`. Bản ghi còn `deletedAt` là dấu vết để dọn tay. *(ponytail: chưa có job quét dọn định kỳ; thêm khi thấy bản ghi `deletedAt` tồn đọng.)*

## 7. Mã lỗi

| Mã | HTTP / trạng thái | Loại | Ý nghĩa |
|---|---|---|---|
| `FILE_REQUIRED`, `FILE_TOO_LARGE`, `FILE_INVALID_TYPE` | `400` | — | Dùng lại mã có sẵn |
| `DOCUMENT_NOT_FOUND` | `404` | — | Không có / đã xóa / của người khác |
| `DOCUMENT_QUEUE_UNAVAILABLE` | `503` | — | Không đưa được job vào hàng đợi; upload đã được hoàn tác |
| `DOCUMENT_NO_TEXT` | `FAILED` | Vĩnh viễn | Không trích được chữ (PDF scan, tệp rỗng) |
| `DOCUMENT_TOO_MANY_CHUNKS` | `FAILED` | Vĩnh viễn | Vượt `DOCUMENT_MAX_CHUNKS` (chặn chi phí embedding) |
| `DOCUMENT_UNREADABLE` | `FAILED` | Vĩnh viễn | Tệp hỏng, không bóc tách được (SE-013) |
| `DOCUMENT_EMBEDDING_UNAVAILABLE` | `FAILED` | Vĩnh viễn | Chưa cấu hình `OPENAI_API_KEY` |
| `DOCUMENT_PROCESSING_FAILED` | `FAILED` | Tạm thời hết lượt | Qdrant/embedding/mạng lỗi sau `DOCUMENT_JOB_ATTEMPTS` lần |

Log chỉ ghi `documentId`, `userId`, mã lỗi, số đoạn, số token embedding — **không** ghi nội dung tài liệu hay khóa API.

## 8. Cấu hình

`apps/api/.env` ↔ `apps/api/.env.example`, đồng bộ danh sách biến theo quy định CTO 16/11/2026.

| Biến | Mẫu trong `.env.example` | Ghi chú |
|---|---|---|
| `REDIS_HOST`, `REDIS_PORT` | `localhost`, `6379` | |
| `BULLMQ_PREFIX` | `cat-gpt` | Tách dữ liệu hàng đợi giữa các phiên |
| `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL` | `localhost`, `9000`, `false` | |
| `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | `example_access_key`, `example_secret_key` | Giá trị thật chỉ trong `.env` và compose local |
| `MINIO_BUCKET` | `cat-gpt-dev` | Riêng tư |
| `QDRANT_URL` | `http://localhost:6333` | |
| `QDRANT_COLLECTION` | `document_chunks` | |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Dùng `OPENAI_API_KEY` có sẵn |
| `DOCUMENT_MAX_SIZE_MB` | `20` | |
| `DOCUMENT_MAX_CHUNKS` | `500` | |
| `DOCUMENT_CHUNK_SIZE`, `DOCUMENT_CHUNK_OVERLAP` | `1000`, `150` (ký tự) | Tạm; hiệu chỉnh ở đánh giá WP-11 |
| `DOCUMENT_JOB_ATTEMPTS` | `3` | |

Tất cả có giá trị mặc định trong `env.validation.ts` trừ `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY` (bắt buộc). Tên cuối cùng do SE-010/SE-011 chốt theo cấu trúc thực tế, giữ nguyên ý nghĩa.

## 9. Quyết định còn mở

| # | Câu hỏi | Đề xuất TL | Chốt |
|---|---|---|---|
| Q4 | Đề cương ghi "Thư viện hỗ trợ RAG: LangChain hoặc LlamaIndex" (mục công nghệ). Dùng `@langchain/textsplitters` cho bước chia đoạn, hay tự viết (~40 dòng) và ghi lý do lệch trong báo cáo? | Dùng `@langchain/textsplitters` (`RecursiveCharacterTextSplitter`) — đáp ứng đề cương, ít code tự viết; không dùng chain/agent | Chờ CTO/khách hàng — **không chặn** SE-010; chặn bước chia đoạn của SE-011 (mặc định nếu chưa chốt khi SE tới bước đó: tự viết, đổi sau chỉ sửa `chunk-text.ts`) |
| Q-M3-1 | Giới hạn mặc định 20 MB / 500 đoạn mỗi tài liệu | Đồng ý; đổi qua `.env` | Chờ — không chặn |

## 10. Kiểm thử bắt buộc (dùng service thật)

Chạy với Redis, MinIO, Qdrant thật (Docker local) và MongoDB Atlas dev; OpenAI thật với **tài liệu thử công khai** (ví dụ văn bản pháp luật công khai, bài viết Wikipedia tiếng Việt) đặt trong `apps/api/test/fixtures/`.

| Ca | Kịch bản | Mong đợi |
|---|---|---|
| T1 | Upload TXT hợp lệ | `201 PENDING` → `READY`, `chunkCount > 0`, số point Qdrant theo `documentId` = `chunkCount` |
| T2 | Sai đuôi / sai chữ ký / không phải UTF-8 / quá cỡ | `400` đúng mã; không có object, bản ghi |
| T3 | Dừng Qdrant trước khi upload, bật lại trước lần thử cuối | Thử lại rồi `READY` |
| T4 | Dừng Qdrant suốt mọi lần thử | `FAILED DOCUMENT_PROCESSING_FAILED` |
| T5 | Chạy lại job `process` cho tài liệu đã `READY` | Số point không đổi |
| T6 | Xóa khi đang `PROCESSING` (tệp lớn) | Cuối cùng 0 point, 0 object, 0 bản ghi; không có `READY` |
| T7 | Hai tài khoản cùng vai + admin gọi detail/download/delete tài liệu của người khác | `404` cho tất cả; chưa đăng nhập `401` |
| T8 | Tải xuống | SHA-256 trùng tệp gốc; header `private, no-store`; tên tiếng Việt đúng |
| T9 | Dừng Redis rồi upload | `503 DOCUMENT_QUEUE_UNAVAILABLE`; không còn object, bản ghi |
| T10 | Tệp chỉ có khoảng trắng | `FAILED DOCUMENT_NO_TEXT`, không thử lại |

Unit test (vitest) chỉ cho phần logic thuần: kiểm định dạng, chia đoạn, quyết định vĩnh viễn/tạm thời. Không mock MinIO/Qdrant/Redis chỉ để có test; mock chỉ khi cần tái hiện lỗi khó (ghi rõ lý do).

## 11. Giao diện (SE-012)

- Route `/documents` thay trang "Đang phát triển": bảng (desktop) / danh sách thẻ (mobile) theo [chuẩn giao diện](ui-release-standards.md#1-chuẩn-dùng-chung); nút Tải lên (hộp thoại chọn tệp, báo lỗi đã dịch theo mã); ô tìm theo tên; lọc trạng thái; nhãn trạng thái; menu thao tác Tải xuống / Xóa (xác nhận).
- Tự cập nhật trạng thái: TanStack Query `refetchInterval` 3 s **chỉ khi** danh sách còn `PENDING`/`PROCESSING`.
- Chế độ `staff`: Tài liệu vẫn ẩn theo [SE-003](../tasks/SE-003-release-mode-navigation.md) cho tới khi khách hàng quyết bật.
- Dùng lại component từ nhánh preview (`features/documents/components/*`) khi phù hợp; bỏ `fake-data`, `use-fake-documents`.

## 12. Lịch sử review

### Checklist vòng 1
Xem [TL-007](../tasks/TL-007-module-3-design.md#checklist-vòng-1).
