# Backend Structural Quality Review — `apps/api`

Người lập: TL · 21/11/2026 · Cơ sở: `origin/develop` @ `547b06f` (CI success) · Chế độ: **chỉ đọc** (không sửa source, không commit, không giao task).

Ký hiệu nguồn của mỗi kết luận: **[CODE]** đã kiểm chứng trực tiếp bằng code/lệnh · **[NHẬN ĐỊNH]** đánh giá kỹ thuật của TL · **[ĐỀ XUẤT]** chưa được CTO phê duyệt.

> **Trạng thái (cập nhật 22/11/2026 khi lưu vào kho):** bản chụp chỉ đọc @ `547b06f`, **chờ CTO review**. Đã xử lý sau bản chụp: S4 (`streamAnswer` dài) — SE-022 PR-C3b; phần Chat của S2 (Chat đọc model Documents) — SE-022 PR-C3a; SSE — SE-029 (Native Streaming). Còn mở: S1, S3, S5 và phần `RagService` của S2 — chưa giao task.

## 1. Executive Summary

- **Không có mục MUST FIX.** Không thấy cấu trúc nào đang gây lỗi hoặc coupling nghiêm trọng cản trở bảo trì. [NHẬN ĐỊNH, dựa trên CODE ở mục 4–5]
- **5 SHOULD FIX**, đều phạm vi nhỏ, lợi ích cụ thể: (S1) vòng phụ thuộc `users ↔ storage`; (S2) quy tắc "tài liệu thuộc người dùng" lặp ở 3 nơi và model `DocumentEntity` bị export ra ngoài module; (S3) hợp đồng job BullMQ (tên, kiểu dữ liệu, hằng) nằm trong `documents.service.ts`; (S4) `ChatService.streamAnswer` 126 dòng gom 6 trách nhiệm; (S5) chú thích/TODO sai về lưu trữ.
- **4 OPTIONAL**, **10+ ACCEPT** (giữ nguyên, có lý do).
- **Auth/Sessions:** ranh giới hợp lý, giữ nguyên — không đề xuất thay đổi chính sách bảo mật đã duyệt.
- **ChatService:** **không** tách thành service mới; chỉ đề xuất chia `streamAnswer` thành các bước private trong cùng class để giữ nguyên cơ chế khóa stream / Dừng / Tạo lại.
- Tổng: 15 module, 96 tệp `.ts` (không tính spec), 5.916 dòng. [CODE]

## 2. Inventory module/file [CODE]

| Module | Tệp | Dòng | Vai trò |
|---|---|---|---|
| `documents` | 19 | 1.547 | Upload/kiểm tra, MinIO, Qdrant, embedding, worker BullMQ (xử lý, xóa, tóm tắt), lập lịch tóm tắt |
| `chat` | 13 | 995 | Hội thoại, tin nhắn, SSE, stream LLM, Dừng/Tạo lại, giới hạn tốc độ, guard ẩn Chat |
| `config` | 4 | 506 | Biến môi trường, chính sách R1–R12, DNS, `AppConfigService` |
| `common` | 17 | 403 | Guard JWT/Roles, filter lỗi, pipe validate, decorator, util, transform |
| `admin-users` | 4 | 360 | Quản trị tài khoản |
| `sessions` | 4 | 360 | Vòng đời phiên, xoay/thu hồi refresh token |
| `auth` | 6 | 338 | Đăng nhập/refresh/logout, JWT strategy, cookie |
| `users` | 6 | 307 | Truy cập user, presenter, admin seed |
| `llm` | 5 | 303 | `LlmProvider` (OpenAI + mock) |
| `me` | 6 | 266 | Hồ sơ, đổi mật khẩu, ảnh đại diện, phiên của tôi, tính năng |
| `rag` | 3 | 206 | Truy hồi + xác minh trích dẫn, prompt |
| `storage` | 5 | 173 | Lưu ảnh đại diện trên đĩa, phục vụ ảnh |
| `health` | 1 | 24 | Health check |
| `app.module.ts`, `main.ts` | 2 | 128 | Đăng ký, khởi động |

## 3. Module Responsibility Matrix

| Module | Trách nhiệm chính | Phụ thuộc vào (số import) [CODE] | Đánh giá |
|---|---|---|---|
| auth | Xác thực, phát/làm mới token | common 12, users 6, sessions 3, config 3 | Đúng hướng (auth → sessions/users) — ACCEPT |
| sessions | Phiên + phân loại token | common 3, config 1 | Không phụ thuộc module nghiệp vụ — ACCEPT |
| users | Dữ liệu user | common 3, config 1, **storage 1** | Cạnh `users → storage` qua `UserPresenter` (S1) |
| storage | Hạ tầng file | common 2, config 1, **users 2** | **Hạ tầng phụ thuộc nghiệp vụ** (S1) |
| admin-users | Quản trị | common 8, users 5, sessions 2 | ACCEPT |
| me | Tài khoản của tôi | common 7, users 4, sessions 3, storage 2, llm 2, **chat 1** | `me → chat` chỉ để lấy cờ tính năng (O2) |
| chat | Hội thoại + stream | common 10, rag 4, config 3, **documents 3**, llm 3 | `chat → documents` đọc thẳng model (S2) |
| rag | Truy hồi | **documents 4**, config 1 | Hướng đúng (RAG dùng dữ liệu đã lập chỉ mục); đọc thẳng model (S2) |
| documents | Tài liệu + worker | common 10, config 8, llm 2 | ACCEPT về hướng; tổ chức nội bộ (S3, O1) |
| llm | Provider LLM | config 3 | ACCEPT |

Vòng phụ thuộc duy nhất: **`users ↔ storage`** (S1). [CODE]

## 4. Dependency / Coupling Findings

| ID | Phân loại | File:dòng | Bằng chứng [CODE] | Tác động thực tế |
|---|---|---|---|---|
| **S1** | SHOULD FIX | `storage/storage.module.ts` (`@Global`, `imports: [UsersModule]`); `storage/files.controller.ts:5` import `UsersService`; `users/user.presenter.ts:3` import `StorageService` | Vòng `users → storage → users`. Nest giải được nhờ `@Global`. Nguyên nhân: `FilesController` (phục vụ ảnh đại diện, kiểm chủ sở hữu bằng `UsersService`) nằm trong module hạ tầng | Hạ tầng lưu trữ phụ thuộc nghiệp vụ user; muốn dùng storage cho tính năng khác phải kéo theo `UsersModule`; vòng import dễ gây lỗi thứ tự khởi tạo nếu bỏ `@Global` |
| **S2** | SHOULD FIX | `documents/documents.module.ts` `exports: [EmbeddingService, VectorStoreService, MongooseModule]`; `chat/chat.service.ts:54` `@InjectModel(DocumentEntity.name)` + `validateDocumentSelection` (dòng 268); `rag/rag.service.ts:59-70`; `documents/documents.service.ts:162` `getOwnedOrThrow` | Quy tắc "tài liệu thuộc `userId`, chưa xóa (`deletedAt: null`), [READY]" viết riêng ở **3 nơi** với 3 truy vấn Mongo; model `DocumentEntity` lộ ra ngoài module | Đây là quy tắc **cô lập dữ liệu giữa người dùng** (bảo mật). Hiện 3 nơi nhất quán, nhưng đổi ngữ nghĩa xóa mềm/trạng thái phải sửa 3 chỗ — dễ lệch |
| O2 | OPTIONAL | `me/me.service.ts` import `isChatHidden` từ `chat/chat-hidden.guard.ts`; `chat/chat.service.ts` import `isDocumentsHidden` từ `documents/documents-hidden.guard.ts` | Hàm cờ tính năng nằm trong file guard; service khác import file guard | Nhỏ: phải biết hàm nằm trong guard. Đã có chú thích "nguồn quyết định duy nhất" |
| — | ACCEPT | `rag → documents`, `chat → rag/llm`, `documents → llm` | Hướng phụ thuộc từ tầng dùng tới tầng cung cấp | Không có phụ thuộc ngược ngoài S1 |

## 5. Code Quality Findings

| ID | Phân loại | Tiêu chí | File:dòng | Bằng chứng [CODE] | Tác động |
|---|---|---|---|---|---|
| **S3** | SHOULD FIX | A, D, G | `documents/documents.service.ts:19-51` export `ProcessJobData`, `DeleteJobData`, `SummarizeJobData`, `DOCX_MIME_TYPE`, `JOB_BACKOFF_DELAY_MS`, `FAILED_JOB_RETENTION_SECONDS`, `QUEUE_ADD_TIMEOUT_MS`; `document-processor.ts` và `document-summary.service.ts` import từ service | Hợp đồng job (tên `'process'`/`'delete'`/`'summarize'` dạng chuỗi lặp ở 3 tệp, kiểu dữ liệu, tùy chọn retry) nằm trong service nghiệp vụ; worker phụ thuộc service để lấy kiểu | Người sửa job phải mở 3 tệp; đổi tên job dễ sót (BullMQ không báo lỗi khi tên sai — job rơi vào nhánh mặc định `handleProcess`, `document-processor.ts:52-60`) |
| **S4** | SHOULD FIX | C, F, H | `chat/chat.service.ts:135-260` `streamAnswer` (126 dòng) | Gom: mở SSE + `meta`; truy hồi RAG + xử lý lỗi; nhánh `insufficient` tự lưu tin; dựng messages; vòng stream LLM + abort; xác định trạng thái; xác minh trích dẫn; lưu; gửi `done`/`error` | Khó đọc và debug luồng quan trọng nhất; nhánh `insufficient` lặp logic lưu tin với nhánh chính |
| **S5** | SHOULD FIX | B, G (chú thích sai) | `storage/storage.service.ts:9-16` ("Module 3: thay bằng MinioStorageProvider"); `storage/storage.module.ts:8` `TODO(module-3)`; `storage/files.controller.ts` inject `LocalStorageProvider` (lớp cụ thể) | Module 3 làm MinIO **riêng** (`DocumentFilesService`); abstraction `StorageService` chỉ có 1 cài đặt và chính consumer bỏ qua nó | Chú thích dẫn người đọc sai hướng; TODO không còn đúng |
| O1 | OPTIONAL | C, D | `documents/document-processor.ts:66-128` (`handleSummarize`, `complete`) + `document-summary.service.ts` + `document-summary.ts` | Logic tóm tắt ở 3 tệp (lập lịch / chạy job / prompt) | Phải mở 3 tệp để hiểu tóm tắt; nhưng mỗi tệp đúng vai trò của nó |
| O3 | OPTIONAL | A, C | `config/env.validation.ts` (≈ 330 dòng: schema + chính sách R1–R12 + hằng giá trị mẫu) | Chính sách nằm cuối `validateEnv` | Chấp nhận được; tách ra chỉ giúp đọc |
| O4 | OPTIONAL | J | `storage/storage.service.ts` | Abstract class một cài đặt | Không khuyến nghị gỡ (xem mục 9) |
| — | ACCEPT | I | Toàn `src` | 0 `any`, 0 ép kiểu kép; ép kiểu chỉ ở `error as Error` và payload Qdrant (đã ép lại bằng `String()`/`Number()`) | — |
| — | ACCEPT | G | Toàn `src` | Không còn phương thức public không có caller (đã gỡ `countByDocumentId` ở #40); 1 TODO cũ (S5) | — |
| — | ACCEPT | H | `common/filters/all-exceptions.filter.ts`; log ở worker/chat/sessions | Lỗi chuẩn hóa một chỗ; log chỉ số liệu, không nội dung/secret (đã cải thiện ở #41, #42) | — |

## 6. Refactor Candidates — cost / benefit / risk [ĐỀ XUẤT]

| ID | Thay đổi đề xuất | Chi phí | Lợi ích | Rủi ro | Kiểm chứng cần có |
|---|---|---|---|---|---|
| S1 | Chuyển `FilesController` sang `MeModule` (route `files/avatars` giữ nguyên); `StorageModule` bỏ `imports: [UsersModule]` | ~0,25 ngày | Hết vòng phụ thuộc; storage là hạ tầng thuần | Thấp | Ảnh đại diện: chủ `200`, ẩn danh `401`, người khác `404`; hồi quy |
| S2 | Thêm `DocumentsService.findOwnedDocuments(userId, ids, { readyOnly })`; `ChatService` và `RagService` dùng hàm này; `DocumentsModule` export `DocumentsService` thay `MongooseModule` | ~0,5 ngày | Quy tắc cô lập dữ liệu ở **một** nơi | Trung bình (đụng luồng hỏi tài liệu) | Cô lập 2 user (404 tài liệu người khác), tài liệu đã xóa / chưa READY, RAG `insufficientEvidence`; hồi quy 27 bước |
| S3 | Tạo `documents/document-jobs.ts` (tên job dạng hằng, kiểu dữ liệu, tùy chọn retry, `DOCX_MIME_TYPE`); service/worker/summary import từ đó | ~0,25 ngày | Một nơi cho hợp đồng job; tên job không còn chuỗi rời | Thấp | Upload → READY, xóa, tóm tắt; test hiện có |
| S4 | Chia `streamAnswer` thành bước private **trong cùng `ChatService`**: truy hồi, stream LLM, lưu câu trả lời (dùng chung cho nhánh `insufficient`) | ~0,5 ngày | Đọc/debug luồng chat dễ hơn; bỏ lặp logic lưu | **Trung bình–cao**: đụng Dừng, Tạo lại, khóa stream đồng thời | Kịch bản race B2 (2 stream song song → 200+409; Dừng trong cửa sổ → STOPPED); Tạo lại; hồi quy |
| S5 | Sửa chú thích `StorageService`, bỏ `TODO(module-3)` | < 0,1 ngày | Hết thông tin sai | Không | Build |

## 7. Proposed Target Structure

**Không cần cấu trúc đích mới.** Cấu trúc module theo nghiệp vụ hiện tại phù hợp quy mô; chỉ điều chỉnh cục bộ theo S1–S5. [NHẬN ĐỊNH] Không đề xuất repository/use-case layer, interface mới hay Clean Architecture — không có lợi ích cụ thể ở quy mô ~6.000 dòng.

## 8. Prioritized Refactoring Plan [ĐỀ XUẤT — chờ CTO]

| Thứ tự | Mục | Lý do thứ tự |
|---|---|---|
| 1 | S5 (chú thích) + S1 (vòng phụ thuộc) — một PR nhỏ | Rủi ro thấp nhất, cùng module storage |
| 2 | S3 (hợp đồng job) | Rủi ro thấp; làm trước S2 để giảm import chéo trong `documents` |
| 3 | S2 (quy tắc sở hữu tài liệu) | Liên quan bảo mật; cần hồi quy cô lập dữ liệu |
| 4 | S4 (`streamAnswer`) | Rủi ro cao nhất; **làm sau PR-B10** (SE-F9, Tạo lại) vì cùng sửa `ChatService` — tránh xung đột và phải kiểm lại race một lần |
| — | O1–O4 | Không lên kế hoạch; xem lại khi có thay đổi nghiệp vụ liên quan |
Không ảnh hưởng thứ tự hiện tại (SE-005 → PR-B10 → PR-B11 → PR-B12) nếu CTO duyệt đặt S1–S4 sau các task đó.

## 9. Thành phần nên giữ nguyên và lý do [NHẬN ĐỊNH, dựa trên CODE]

| Thành phần | Lý do giữ |
|---|---|
| **Auth/Sessions** (`AuthService`, `SessionsService`, `JwtStrategy`, `AuthCookieService`, `refresh-token.ts`) | Ranh giới rõ: auth điều phối, sessions giữ vòng đời + phân loại token (B2a), strategy kiểm phiên/khóa mỗi request, cookie tách riêng. Chính sách đã duyệt (B2a, SR-1) — không đổi |
| `ChatService` là một service (không tách thành nhiều service) | Khóa stream (`inFlight`), Dừng và Tạo lại cần chung một trạng thái trong tiến trình; tách service sẽ phải chia sẻ trạng thái đó — tăng rủi ro race đã sửa ở #39 |
| `ConversationsService` (hội thoại + tin nhắn) | Cùng aggregate, lọc theo `userId` nhất quán |
| `LlmProvider` (abstract + OpenAI + mock) | Hai cài đặt thật; mock phục vụ phát triển offline (C2 đã duyệt) |
| `DocumentFilesService` (MinIO) tách khỏi lưu ảnh đại diện | Quyết định thiết kế M3-5 |
| `DocumentSummaryService` (đã tách ở #43) | Lập lịch tóm tắt tách khỏi CRUD tài liệu, dùng chung `getOwnedOrThrow` — đúng hướng |
| `RagService` | Truy hồi + xác minh trích dẫn thuần logic; hướng phụ thuộc đúng |
| `StorageService` abstract (O4) | Gỡ chỉ tạo thay đổi, không có lợi ích chức năng; sửa chú thích là đủ (S5) |
| Tầng `common` (guard, filter, pipe, decorator) | Gọn, dùng chung, không phụ thuộc module nghiệp vụ |
| Tệp dài nhưng một trách nhiệm (`env.validation.ts`, `document-processor.ts`, `sessions.service.ts`) | Độ dài do số quy tắc/nhánh nghiệp vụ, không do trộn trách nhiệm |

## 10. Phạm vi đã kiểm và giới hạn
- Đã đọc trực tiếp toàn bộ tệp module, các service/controller/guard chính; đồ thị import giữa module đo bằng script; kiểm `any`, ép kiểu, phương thức không có caller, TODO bằng lệnh. [CODE]
- Không chạy lại hồi quy (giai đoạn chỉ đọc; `develop` `547b06f` đã có hồi quy 27/27 sau merge, xem tracker mục 11).
- Chưa đo độ phức tạp chu trình bằng công cụ; đánh giá độ phức tạp dựa trên đọc code và độ dài hàm. [NHẬN ĐỊNH]
- Báo cáo này **chưa commit** — chờ CTO review.
