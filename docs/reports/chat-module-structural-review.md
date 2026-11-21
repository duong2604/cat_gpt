# Chat Module (F03) — Structural Review & Refactor

Người lập: TL · Cơ sở: `origin/develop` @ `547b06f` (CI success) · Bắt đầu: 21/11/2026 21:30 · Kết thúc triển khai: 21:57 · `develop` @ `86b9f3f`
Task triển khai: [SE-022](../tasks/SE-022-chat-module-structural-refactor.md) · Chỉ thị: CTO "Chat Module Structural Refactor" (P1)

**Trạng thái: SE-022 `CTO STRUCTURAL ACCEPTED` (21/11/2026) · F03 `PARTIAL` — chờ SE-023 (nhất quán dữ liệu Tạo lại).** Xem mục 9. Convention review (test, `guards/`, SSE): mục 10 — chờ CTO duyệt mục 10.6.

Ký hiệu: **[CODE]** đã kiểm chứng bằng code/lệnh · **[NHẬN ĐỊNH]** đánh giá kỹ thuật · **[ĐỀ XUẤT]**.

## 1. Cấu trúc hiện tại [CODE]

```
apps/api/src/modules/chat/                     (13 tệp, 995 dòng)
├── chat.module.ts              imports Mongoose(Conversation, Message), DocumentsModule, LlmModule, RagModule
├── chat.controller.ts          POST chat/stream, POST conversations/:id/regenerate, POST conversations/:id/stop
├── conversations.controller.ts GET/PATCH/DELETE conversations, GET conversations/:id/messages
├── chat.service.ts      (306)  gửi/Tạo lại/Dừng, khóa stream inFlight, stream LLM, RAG, lưu câu trả lời, kiểm tài liệu
├── conversations.service.ts (161) truy cập hội thoại + tin nhắn (lọc userId)
├── sse-stream.ts               ghi SSE + heartbeat + phát hiện client đóng
├── chat.presenter.ts           entity → DTO
├── chat-hidden.guard.ts        ẩn Chat ở `staff` + mock (CS-6) + hàm isChatHidden
├── chat-throttler.guard.ts     20 lần/phút/người dùng
├── dto/chat.dto.ts, dto/chat.response.ts
├── schemas/conversation.schema.ts, schemas/message.schema.ts
└── chat.service.spec.ts        test hồi quy (4 trạng thái, Tạo lại, validate documentIds, RAG)
```

**Dependency [CODE]:** `chat → common (10), rag (4), config (3), documents (3), llm (3)`. `ChatService` có 5 phụ thuộc: `ConversationsService`, `LlmProvider`, `AppConfigService`, **`Model<DocumentEntity>`**, `RagService`. `ConversationsController` phụ thuộc `ChatService` (gọi `abort` khi xóa).

## 2. Kiểm chứng chức năng trước refactor [CODE]

Kịch bản TL `f03-verify.mjs` (ngoài repo) trên `develop` `547b06f`, DB `cat_gpt_loadtest`, LLM mock — **13/13**:
| # | Luồng | Kết quả |
|---|---|---|
| 1 | Tạo hội thoại | `meta` có `conversation` |
| 2–3 | Gửi tin, SSE | `meta → delta+ → done`, `COMPLETED` |
| 9 | Lưu tin | USER + ASSISTANT |
| 4 | Dừng | `204`, tin `STOPPED`, phần đã sinh được lưu |
| 5 | Tạo lại | `done COMPLETED`, vẫn 1 câu trả lời cho câu cuối |
| **SE-F9** | Tạo lại rồi Dừng | **Câu trả lời COMPLETED cũ bị xóa**, chỉ còn bản `STOPPED` — xác nhận lỗi đã được CTO duyệt sửa (PR-B10) |
| 6 | Đồng thời | `200` + `409 CHAT_STREAM_IN_PROGRESS` |
| 7 | LLM lỗi giữa chừng | `done` với `ERROR` |
| 8 | Hội thoại RAG | tạo được, `documentIds` đúng; người khác dùng `documentIds` → `404` |
| 10 | Phân quyền | người khác: get/messages/rename/stop/regenerate/stream/delete → `404` ×7; ẩn danh `401`; hội thoại chủ còn nguyên |
**Kết luận chức năng:** đúng, **trừ SE-F9** → F03 chưa DONE chức năng tới khi PR-B10 merge. SE-F10 (phân trang tin nhắn) DEFERRED theo CTO — không đổi API contract.

## 3. Findings (trước refactor)

| ID | Loại | File:dòng | Bằng chứng [CODE] | Tác động | Quyết định |
|---|---|---|---|---|---|
| **C-1** | Coupling / sai module | `chat.service.ts:7-8, 54, 268-288`; `documents.module.ts` `exports: [..., MongooseModule]` | `ChatService` inject `Model<DocumentEntity>` và tự viết truy vấn "tài liệu thuộc user, chưa xóa, READY" (trùng quy tắc của `DocumentsService.getOwnedOrThrow` `documents.service.ts:162` và `RagService.prepare` `rag.service.ts:62-70`) | Quy tắc cô lập dữ liệu (bảo mật) nằm trong module Chat; test Chat phải giả lập model Mongo của module khác | **Sửa** (PR-C3a) |
| **C-2** | Độ phức tạp / trùng lặp | `chat.service.ts:135-260` `streamAnswer` (126 dòng) | Một hàm làm 6 việc: mở SSE + `meta`; truy hồi RAG + lỗi; nhánh `insufficient` **tự lưu tin** (`:170-186`); dựng messages; vòng stream + abort; xác định trạng thái/trích dẫn; lưu + `done`. Lưu tin (`exists` → `createMessage` → `touch` → `done`) viết **2 lần** (`:173-184` và `:228-253`) | Khó đọc/debug luồng quan trọng nhất; sửa cách lưu phải sửa 2 chỗ (PR-B10 sẽ phải đụng cả hai) | **Sửa** (PR-C3b, **sau** PR-B10) |
| **C-3** | Naming | `chat.service.ts:296-304` `assertRagNotHidden` / `assertRagNotHiddenRaw` | Hai hàm, hậu tố `Raw` không nói lên ý nghĩa; thực chất là "Tài liệu có đang hiển thị không" | Đọc khó hiểu | **Sửa** (PR-C3a): một hàm `assertDocumentsVisible()` + gọi có điều kiện ở chỗ dùng |
| **C-4** | Chú thích | `chat.service.ts:226-227` ("ghi nhận SE-F8, không đổi logic ở PR này"); `:154-156`, `:190` nhắc ngày/PR | Chú thích mang lịch sử PR, sẽ lỗi thời | Gây nhiễu | **Sửa** (PR-C3b): mô tả hành vi, bỏ tham chiếu PR |
| C-5 | Hành vi (đã có task) | `chat.service.ts:102-105` | Tạo lại xóa câu cũ trước | Mất câu trả lời khi Tạo lại lỗi/bị dừng | **PR-B10** (thay đổi hành vi, tách riêng) |
| C-6 | Giới hạn triển khai | `chat.service.ts:46-48` `inFlight` trong bộ nhớ | Chỉ đúng một tiến trình (có chú thích) | Nhiều instance phá Dừng/chặn song song | **Giữ** — ghi nhận (SE-F21), xem lại khi triển khai nhiều instance |
| C-7 | Nhất quán API | `dto/chat.dto.ts:27` tham số `q`; admin dùng `search` | Khác tên giữa module | Nhỏ | **Giữ** — đổi là đổi API contract |

**Đã kiểm, giữ nguyên [CODE + NHẬN ĐỊNH]:** `ConversationsService` (một aggregate hội thoại + tin nhắn, mọi truy vấn lọc `userId`); `SseStream` (lớp nhỏ, một trách nhiệm, đúng chỗ); `chat.presenter.ts` (hàm thuần); DTO (validate đủ, `@IsMongoId`, độ dài từ `@cat-gpt/shared`); schema (index đúng truy vấn); `ChatThrottlerGuard` (một nguồn giới hạn sau #40); `ChatHiddenGuard`; controller mỏng; xử lý lỗi nhất quán (trước khi mở SSE → JSON qua filter; trong stream → tin `ERROR`/event `error`); log chỉ có ID, không nội dung; không `any`; test hồi quy hiện có đủ 4 trạng thái kết thúc.

## 4. Phương án

**Option A — giữ nguyên.** Khả thi: chức năng đúng (trừ SE-F9), ranh giới controller/service/persistence rõ, có test. Chi phí 0. Nhược: C-1 (quy tắc bảo mật của module khác nằm trong Chat) và C-2 (luồng chính khó đọc, lưu tin lặp) vẫn còn; PR-B10 sẽ phải sửa logic lưu ở 2 chỗ.

**Option B — refactor có chọn lọc (TL chọn).** Không tạo service/folder mới, không interface mới.

```
apps/api/src/modules/chat/          (giữ nguyên danh sách tệp)
├── chat.service.ts   ChatService: send / regenerate / stop / abort / reserveStream (giữ inFlight)
│                      streamAnswer → điều phối ngắn, gọi các bước private:
│                        retrieveContext()  — RAG prepare + lỗi truy hồi
│                        generate()         — stream LLM, abort, trạng thái kết thúc
│                        saveAnswer()       — exists → createMessage → touch → done (dùng chung cho insufficient)
│                      hàm thuần cấp module: makeTitle(), buildLlmMessages()
│                      assertDocumentsVisible()
└── (các tệp khác không đổi)

apps/api/src/modules/documents/
├── documents.service.ts  + findReadyOwnedDocuments(userId, ids): 404 nếu thiếu/không thuộc/đã xóa, 400 nếu chưa READY
└── documents.module.ts   + export DocumentsService
```

**Dependency trước → sau:**
```
Trước: ChatService ─► ConversationsService, LlmProvider, AppConfigService, RagService, Model<DocumentEntity> (module documents)
Sau:   ChatService ─► ConversationsService, LlmProvider, AppConfigService, RagService, DocumentsService
```
`RagService` vẫn đọc model (phạm vi F06/PR-B12, không đổi ở đây).

**Lợi ích:** quy tắc sở hữu tài liệu cho Chat nằm ở module Documents (một nơi với `getOwnedOrThrow`); `streamAnswer` còn phần điều phối, mỗi bước một trách nhiệm, debug theo bước; lưu câu trả lời một nơi; test Chat không cần giả lập model Mongo của module khác.
**Chi phí:** PR-C3a ~0,25 ngày; PR-C3b ~0,5 ngày.
**Rủi ro:** C3a thấp–trung bình (luồng tạo hội thoại có tài liệu — mã lỗi 404/400 phải giữ nguyên); C3b trung bình (đụng Dừng/Tạo lại/khóa stream) → bắt buộc kịch bản race + `f03-verify`.
**Lý do không tách `ChatService` thành nhiều service:** `inFlight` (khóa stream, Dừng, Tạo lại) là trạng thái chung trong tiến trình; tách "StreamOrchestrator"/"RagContextService" phải chia sẻ trạng thái đó qua DI → thêm điểm sai cho race đã sửa ở #39, không có lợi ích kiểm chứng được.

## 5. Kế hoạch và thứ tự
| Thứ tự | PR | Nội dung | Phụ thuộc |
|---|---|---|---|
| 1 | SE-005 | (đang làm — bảo mật, hạn 27/11) | — |
| 2 | **PR-B10** | SE-F9 — thay đổi **hành vi** Tạo lại (đã duyệt), tách riêng | Sau SE-005 |
| 3 | **PR-C3a** | C-1, C-3 | Sau PR-B10 (không chồng chéo nhưng giữ một luồng review) |
| 4 | **PR-C3b** | C-2, C-4 | Sau PR-B10 (cùng vùng code) |
| 5 | PR-B11, PR-B12 | Giữ phạm vi độc lập | — |
Lý do: không gộp cấu trúc với thay đổi hành vi (B10); không trì hoãn SE-005.

## 6. Lịch sử
| Thời điểm | Gate | Nội dung |
|---|---|---|
| 21/11 21:30 | Gate 1 | TL review độc lập + kiểm chứng 13/13; chọn Option B; tạo SE-022 |
| 21/11 21:33 | Gate 2 (giao) | Chủ dự án/CTO yêu cầu ưu tiên module Chat → TL đổi thứ tự: **PR-C3a ngay** → PR-B10 → PR-C3b; SE-005 dừng ở điểm an toàn (giữ số liệu đo, chưa mở PR; hạn 27/11 vẫn kịp). Đã giao SE kèm kịch bản kiểm chứng |
| 21/11 21:42 | Gate 3 | PR-C3a #49 (`68333ca`) TL review vòng 1: hành vi/cấu trúc đạt (c3a-check 5/5, f03-verify 13/13, test 83/83, build/lint sạch); **Cần sửa** chú thích (JSDoc lặp 2 lần; chú thích `validateDocumentSelection` lỗi thời). Không merge |
| 21/11 21:44 | Gate 3–4 | PR-C3a #49 vòng 2 (`1e8b709`, chỉ chú thích): đạt, CI pass → **merge `e0adb75`** |
| 21/11 21:48 | Gate 3–4 | PR-B10 #50 (`583ef69`, SE-F9): TL đọc diff + web (`chat-stream-provider.tsx` ẩn câu cũ, `done` → `appendMessage`); chấp nhận "Dừng/lỗi → `done` mang câu cũ" (hình dạng event không đổi). Build/test 83/83; f03-verify **14/14** trên bản B10 **và** trên bản merge thử develop+B10 (thêm ca Tạo lại bị LLM lỗi). CI pass → **merge `2569caf`**. MINOR backlog: B10-M1 (xóa câu cũ lỗi sau khi lưu câu mới → 2 câu trả lời, Tạo lại sau đó 400), B10-M2 (UX: Tạo lại lỗi không có thông báo) |
| 21/11 21:57 | Gate 3–4 | PR-C3b #51 (`578e0cd`): TL đọc toàn bộ, đối chiếu trường lưu và thứ tự với bản cũ (`verifyCitations` thuần, đổi thứ tự vô hại); build/test 83/83, f03 15/15 (thêm ca Tạo lại RAG), c3a-check 5/5, CI pass → **merge `86b9f3f`** |

## 7. Quality gates
| Gate | PR-C3a | PR-C3b |
|---|---|---|
| Cấu trúc khớp thiết kế | Đạt | Đạt (1 khác biệt nhỏ, mục 8.3) |
| Không đổi API contract (route, mã HTTP, mã lỗi, SSE event) | Đạt (c3a-check 5/5) | Đạt (c3a-check 5/5, f03 15/15) |
| `f03-verify` (13 ca; 15 ca sau B10 + ca RAG) | Đạt 13/13 | Đạt 15/15 |
| Race 2 stream (200+409), Dừng trong cửa sổ | Đạt | Đạt |
| Test hiện có (`chat.service.spec.ts` chỉ chỉnh mock theo constructor, không thêm test) | Đạt 83/83 | Đạt 83/83 (spec không đổi) |
| typecheck/lint/build, CI | Đạt | Đạt (CI pass tại `578e0cd`) |
| Merge SHA | `e0adb75` | `86b9f3f` |

PR-B10 (#50, SE-F9, thay đổi hành vi đã duyệt — không thuộc refactor): build/test 83/83, f03 14/14 trên bản B10 và trên bản merge thử, CI pass → `2569caf`.

## 8. Bàn giao CTO (Gate 5)

### 8.1 Cấu trúc thư mục trước/sau [CODE]
Danh sách tệp **không đổi** (không thêm tệp/folder/service/interface). `git diff --stat 547b06f 86b9f3f -- apps/api`: 4 tệp — `chat.service.ts`, `chat.service.spec.ts` (chỉ phần dựng service), `documents.service.ts` (+21), `documents.module.ts` (+1 export).

| `chat.service.ts` | Trước (`547b06f`) | Sau (`86b9f3f`) |
|---|---|---|
| Dòng | 306 | 336 (gồm hành vi B10 + JSDoc từng bước) |
| `streamAnswer` | 126 dòng, 6 việc, lưu tin viết 2 lần | 75 dòng, chỉ điều phối |
| Hàm private | `streamAnswer`, `validateDocumentSelection`, `assertRagNotHidden`, `assertRagNotHiddenRaw`, `reserveStream` | `streamAnswer`, `retrieveContext`, `generate`, `saveAnswer`, `validateDocumentSelection`, `assertDocumentsVisible`, `reserveStream` |
| Hàm thuần cấp module | `makeTitle` | `makeTitle`, `buildLlmMessages` |
| Phụ thuộc inject | `ConversationsService`, `LlmProvider`, `AppConfigService`, **`Model<DocumentEntity>`**, `RagService` | `ConversationsService`, `LlmProvider`, `AppConfigService`, **`DocumentsService`**, `RagService` |

### 8.2 Responsibility matrix (sau) [CODE]
| Thành phần | Trách nhiệm |
|---|---|
| `ChatController` / `ConversationsController` | HTTP mỏng: route, guard, gọi service; xóa hội thoại gọi `ChatService.abort` |
| `ChatService.send` / `regenerate` / `stop` / `abort` | Use case + khóa stream `inFlight` (409, Dừng) |
| `ChatService.streamAnswer` | Điều phối: mở SSE + `meta` → `retrieveContext` → (câu từ chối cố định, hoặc `buildLlmMessages` + `generate`) → xác minh trích dẫn → `saveAnswer`; lỗi ngoài dự kiến → event `error` |
| `retrieveContext` | Truy hồi RAG; lỗi embed/Qdrant → `failed` (lưu ERROR, không ném) |
| `generate` | Vòng stream LLM, gửi `delta`, xác định COMPLETED/TRUNCATED/STOPPED/ERROR, log tên lỗi gốc |
| `saveAnswer` | Một nơi lưu câu trả lời: hội thoại còn → (Tạo lại Dừng/lỗi: `done` câu cũ) → `createMessage` → xóa câu cũ → `touch` → `done` |
| `buildLlmMessages` | Hàm thuần: prompt hệ thống, prompt RAG, lịch sử |
| `validateDocumentSelection` / `assertDocumentsVisible` | Ràng buộc của Chat: Tài liệu hiển thị, `RAG_MAX_DOCUMENTS`; uỷ quyền kiểm sở hữu/READY |
| `DocumentsService.findReadyOwnedDocuments` | Quy tắc sở hữu tài liệu (404 thiếu/không thuộc/đã xóa, 400 chưa READY) — cùng module với `getOwnedOrThrow` |
| `ConversationsService` | Truy cập hội thoại + tin nhắn, mọi truy vấn lọc `userId` (không đổi) |
| `SseStream`, presenter, DTO, schema, guard | Không đổi |

### 8.3 Thay đổi chính và lý do
| Finding | Thay đổi | Lý do (lợi ích kiểm chứng được) |
|---|---|---|
| C-1 | Chat không còn inject model của module Documents | Quy tắc cô lập dữ liệu tài liệu ở một module; test Chat dùng `DocumentsService` thật thay vì tự dựng truy vấn |
| C-2 | `streamAnswer` → 3 bước + 1 hàm thuần; lưu câu trả lời 1 nơi | Mỗi bước một trách nhiệm, debug theo bước; logic giữ/thay câu cũ của B10 trước nằm ở 2 nhánh, nay ở `saveAnswer` |
| C-3 | 2 hàm `assertRagNotHidden*` → `assertDocumentsVisible` | Tên nói đúng ý nghĩa |
| C-4 | Bỏ tham chiếu PR/ngày/mã finding trong chú thích | Chú thích mô tả hành vi, không lỗi thời |
| Khác thiết kế (chấp nhận) | `generate` nhận thêm `key` (ID hội thoại) | Giữ nguyên nội dung log; không ảnh hưởng hành vi |

**Không làm (có chủ đích):** không tách `ChatService` thành nhiều service — `inFlight` là trạng thái chung của gửi/Tạo lại/Dừng; tách phải chia sẻ qua DI, tăng rủi ro race đã sửa ở #39.

### 8.4 Dependency graph trước/sau [CODE]
```
Trước: ChatService ─► ConversationsService, LlmProvider, AppConfigService, RagService
                  └─► Model<DocumentEntity>   (đọc thẳng collection của module documents)
Sau:   ChatService ─► ConversationsService, LlmProvider, AppConfigService, RagService
                  └─► DocumentsService.findReadyOwnedDocuments   (API công khai của module documents)
```
Không vòng phụ thuộc mới. `RagService` vẫn đọc model `DocumentEntity` (ngoài phạm vi; PR-B12 / finding S2 của báo cáo cấu trúc tổng).

### 8.5 PR và merge SHA
| PR | Nội dung | SHA đã review | Merge | Vòng |
|---|---|---|---|---|
| #49 PR-C3a | C-1, C-3 | `1e8b709` | `e0adb75` | 2 (vòng 1: chú thích lặp/lỗi thời) |
| #50 PR-B10 | SE-F9 (hành vi, đã duyệt) | `583ef69` | `2569caf` | 1 |
| #51 PR-C3b | C-2, C-4 | `578e0cd` | `86b9f3f` | 1 |

### 8.6 Regression và CI (TL tự chạy, DB `cat_gpt_loadtest`, LLM mock)
- `f03-verify` 15/15 trên `578e0cd`: tạo/gửi/SSE, lưu, Dừng, Tạo lại, Tạo lại + Dừng (câu cũ còn), 2 stream song song 200+409, LLM lỗi, Tạo lại khi LLM lỗi (câu cũ còn), RAG (tạo, Tạo lại thay đúng 1 câu, `documentIds` người khác 404), phân quyền (7 thao tác người khác 404, ẩn danh 401).
- `c3a-check` 5/5 trên `578e0cd`: 400 chưa READY, 404 người khác, 404 đã xóa, 400 vượt số lượng, 200 hợp lệ.
- Build/typecheck/lint sạch, test 83/83 tại từng SHA; CI pass tại SHA đầu từng PR. CI `develop` @ `86b9f3f`: **success**.
- ~~Chưa chạy runtime~~ nhánh "không đủ căn cứ" khi Tạo lại và nhánh truy hồi lỗi: **đã kiểm runtime sau CTO verdict, 12/12** — mục 9.2.

### 8.7 Vấn đề còn tồn tại
| ID | Mức | Mô tả | Hướng |
|---|---|---|---|
| B10-M1 | **MAJOR** (CTO nâng) | Mongo lỗi đúng lúc xóa câu cũ sau khi lưu câu mới → 2 câu trả lời liên tiếp; Tạo lại sau đó 400 | [SE-023](../tasks/SE-023-chat-regenerate-data-consistency.md) — thiết kế trước |
| B10-M2 | MINOR (UX) | Tạo lại bị lỗi LLM: câu cũ hiện lại, không thông báo | [SE-024](../tasks/SE-024-chat-regenerate-failure-notice.md) — backlog, Senior Dev |
| C-6 | Ghi nhận | `inFlight` trong bộ nhớ một tiến trình | Khi chạy nhiều instance (SE-F21) |
| C-7 | Ghi nhận | Tham số tìm kiếm `q` khác `search` của admin | Đổi là đổi API contract |
| SE-F10 | DEFERRED | GET messages không phân trang | Theo CTO |

### 8.8 TL final review verdict
**ĐẠT.** Module Chat đạt mục tiêu chỉ thị: trách nhiệm từng hàm rõ, luồng stream đọc theo bước, coupling sang Documents qua API công khai, không abstraction thừa, không đổi API contract/schema/bảo mật; SE-F9 đã sửa — F03 không còn bị chặn chức năng.

**CTO acceptance:** ~~AWAITING~~ → **CTO STRUCTURAL ACCEPTED** (mục 9). CTO kiểm trực tiếp: `apps/api/src/modules/chat/chat.service.ts` @ `86b9f3f`.

## 9. CTO Review Verdict và follow-up — 21/11/2026 22:07

### 9.1 Quyết định CTO
1. **ACCEPT** structural refactor SE-022 → **SE-022: CTO STRUCTURAL ACCEPTED.**
2. Chấp nhận giữ `ChatService`, tách trách nhiệm bằng private method + hàm thuần; không thêm service/interface/folder.
3. **F03: PARTIAL** — chờ nhất quán dữ liệu (B10-M1) và kiểm chứng runtime RAG.
4. Không mở thêm structural refactor cho Chat khi chưa có finding mới có bằng chứng.

| Follow-up | Mức | Xử lý | Trạng thái |
|---|---|---|---|
| B10-M1 nhất quán dữ liệu khi thay câu trả lời | **MAJOR** | [SE-023](../tasks/SE-023-chat-regenerate-data-consistency.md): SE phân tích ≥1 phương án (atomicity, concurrency, retry, recovery; không đổi schema/contract) → TL duyệt thiết kế → code → TL failure injection + hồi quy | Sẵn sàng (giai đoạn thiết kế) |
| B10-M2 thông báo khi Tạo lại thất bại | MINOR | [SE-024](../tasks/SE-024-chat-regenerate-failure-notice.md), owner Senior Dev, P3, không gộp với SE-023 | Nháp (backlog) |
| RAG runtime: Tạo lại khi insufficient; truy hồi lỗi | — | TL tự kiểm (9.2) | **Đạt 12/12** |

### 9.2 Kiểm chứng runtime RAG [CODE]
Kịch bản TL `rag-runtime.mjs` (ngoài repo) trên `develop` `86b9f3f`, DB `cat_gpt_loadtest`, **collection Qdrant riêng `tl_review_chunks`**, cấu hình đổi **chỉ qua biến môi trường tiến trình** (không sửa `.env`), 4 lần khởi động API:
| Pha | Cấu hình | Kết quả |
|---|---|---|
| setup | thường | 2/2 — tài liệu READY; câu trả lời RAG bình thường `COMPLETED` |
| insufficient | `RAG_MIN_SCORE=1.01` (lọc hết kết quả → `NO_MATCH`) | **5/5** — Tạo lại → câu từ chối `insufficientEvidence=true`, thay đúng câu cũ (số tin không đổi, câu cũ bị xóa); không gọi LLM (tin không có `model`); gửi tin mới → câu từ chối, `citations` rỗng; Tạo lại câu từ chối → câu từ chối mới thay câu cũ |
| retrieval failure | `QDRANT_URL` trỏ cổng không có dịch vụ | **5/5** — Tạo lại → `done` mang câu cũ (không phải event `error`), câu cũ còn, không thêm tin, không có `delta` (không gọi LLM); gửi tin mới → lưu tin `ERROR` rỗng, không trích dẫn; Tạo lại tin `ERROR` khi vẫn lỗi → tin `ERROR` cũ còn. Log: `Truy hồi lỗi ở hội thoại <id>` — chỉ ID, không nội dung |
| cleanup | thường | hội thoại `204`, tài liệu `204`, tài khoản thử `BLOCKED` |
**Tổng 12/12.** Dữ liệu thật không bị tác động: DB `cat_gpt_loadtest`, collection riêng (điểm vector của tài liệu thử đã xóa cùng tài liệu; collection rỗng còn lại, không chứa dữ liệu).

### 9.3 Trạng thái F03
**PARTIAL.** Đã đạt: cấu trúc (CTO accepted), SE-F9, hồi quy 15/15, RAG runtime 12/12. Còn mở: **SE-023 (B10-M1 MAJOR)**. F03 có thể đề nghị DONE khi SE-023 merge và TL failure injection đạt. SE-F10 DEFERRED; SE-024 MINOR backlog (không chặn).

## 10. Convention Review (chỉ thị CTO "Chat Module Convention Review") — 21/11/2026 22:17

Cơ sở: `origin/develop` @ `86b9f3f`; NestJS `@nestjs/common` / `@nestjs/core` **12.2.0**; Node **v24.18.0**. Không mở rộng ngoài 3 vấn đề.

### 10.1 Unit test `chat.service.spec.ts`

**Kết luận: test có từ SE-014 theo phạm vi đã duyệt; SE-022 không thêm test. Giữ nguyên.**

| Câu hỏi | Trả lời | Bằng chứng [CODE] |
|---|---|---|
| Nguồn gốc | Tạo ở **SE-014 CP1** (`cce88f6`, 18/11/2026) — test hồi quy `ChatService` **bắt buộc trước khi sửa** `streamAnswer` cho RAG, vì trước đó Chat chưa có test | `git log --follow`: `cce88f6` → `9bff1c3` → `da52ef6` → `24622b6` → `6e9649b` (SE-014) → `68333ca` (SE-022). Task SE-014: dòng 27 ("chưa có unit test. CP1 phải viết test hồi quy trước khi sửa"), dòng 38 (CP1), dòng 60 (ước lượng); dòng 89 (5 test `validateDocumentSelection` theo yêu cầu TL) |
| SE-022 có thêm test? | **Không.** Chỉ PR-C3a sửa spec: +11/−1 dòng trong hàm dựng `makeService` (constructor đổi từ `Model<DocumentEntity>` sang `DocumentsService`). PR-B10, PR-C3b không chạm spec | `git diff 547b06f 86b9f3f -- …/chat.service.spec.ts`: không có dòng `it(`/`describe(` thêm/bớt; số test 83 tại `547b06f` và 83 tại `86b9f3f` |
| "Không viết test mới" ≠ "không có test" | Quy định "không viết unit test mới" (các chỉ thị SE-021/SE-022, 21/11) cấm **thêm** test trong chương trình refactor. Test đã có (8 tệp spec trong `apps/api/src`) là **lưới an toàn hồi quy** — được giữ, chạy ở mọi PR/CI, và được **bảo trì** khi chữ ký constructor đổi (sửa wiring ≠ test mới) | `find apps/api/src -name "*.spec.ts"`: 8 tệp (chat 1, documents 5, llm 1, rag 1) |

### 10.2 Thư mục `guards/`

**Kết luận: giữ nguyên (không chuyển). Convention hiện tại đã nhất quán trên toàn backend; chuyển riêng Chat sẽ tạo ra bất nhất.**

Audit [CODE] (`apps/api/src`):
| Vị trí | Cách tổ chức |
|---|---|
| `common/` (dùng chung) | **Thư mục theo loại** cho mọi thứ, kể cả khi chỉ 1 tệp: `guards/` (2), `filters/` (1), `pipes/` (1), `exceptions/` (1), `dto/` (1), `types/` (1), `decorators/`, `utils/`, `validation/` |
| `modules/<feature>/` (11 module) | **Phẳng** cho tệp hành vi có hậu tố Nest; **chỉ `dto/` và `schemas/`** là thư mục con (kể cả 1 tệp: `admin-users/dto` 1, `sessions/schemas` 1, `users/schemas` 1) |
| Guard theo feature (3) | Cả 3 phẳng: `chat/chat-hidden.guard.ts`, `chat/chat-throttler.guard.ts`, `documents/documents-hidden.guard.ts`. Tương tự filter feature `documents/upload-size.filter.ts` phẳng |

Đánh giá [NHẬN ĐỊNH]:
- Chuyển **chỉ** 2 guard Chat vào `chat/guards/` → Chat khác Documents (guard + filter vẫn phẳng) → **giảm** nhất quán.
- Chuyển nhất quán → phải thêm `documents/guards/` (1 tệp) và, theo cùng lý lẽ, `documents/filters/` (1 tệp) — mở rộng sang module khác, sửa import ở `chat.controller.ts`, `chat.module.ts`, `chat.service.ts`, `conversations.controller.ts`, `documents.controller.ts`, `documents.module.ts`, `me.service.ts` (7 tệp), không thêm khả năng đọc: tên tệp đã mang hậu tố `.guard.ts`, module có ≤ 2 guard.
- Thư mục theo loại có lợi khi một loại có nhiều tệp (như `common/`); ở feature, gom theo feature đã đủ.

**Convention đề xuất (ghi thành quy ước, không đổi code):**
1. `common/<loại>/` — thành phần dùng chung, thư mục theo loại.
2. `modules/<feature>/` — tệp hành vi phẳng với hậu tố Nest (`*.module|controller|service|guard|filter|presenter|processor|provider.ts`, `sse-stream.ts`); thư mục con **chỉ** cho `dto/` và `schemas/`.
3. Test `*.spec.ts` đặt cạnh tệp được test.
4. Một feature có **≥ 3** tệp cùng loại (ngoài dto/schemas) → xem xét thư mục loại cho **riêng** feature đó, kèm lý do.

### 10.3 SSE — `sse-stream.ts` so với NestJS `@Sse()`

**Kết luận: giữ implementation tự viết.** Chuyển sang `@Sse()` **phá API contract** với web hiện tại và vẫn phải tự viết heartbeat. Một phát hiện cần sửa: chú thích lý do ở `chat.controller.ts:22-23` **sai** với NestJS 12.

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| Vì sao POST cần custom SSE? | Lý do ghi trong code — "`@Sse()` chỉ hỗ trợ GET" (`chat.controller.ts:23`) — **không còn đúng**: NestJS 12.2.0 `@Sse(path, { method })` nhận method bất kỳ. Lý do **thật** để giữ custom: (1) định dạng wire — xem dòng dưới; (2) heartbeat; (3) kiểm quyền/khóa stream rồi mới mở stream, lỗi trước đó trả JSON đúng mã (404/409/400) | `node_modules/@nestjs/common/decorators/http/sse.decorator.js`: `options[METHOD_METADATA] ?? RequestMethod.GET` |
| Có cách dùng built-in mà giữ contract? | **Không, nếu không sửa web.** `@nestjs/core` `SseStream.writeMessage` tự gán `id` tăng dần cho mọi event không có `id` → mỗi khối thành `id: N\ndata: {...}\n\n`, và ghi thêm `\n` đầu stream. Parser web chỉ nhận khối **bắt đầu** bằng `data: ` → **bỏ qua mọi event**. Muốn dùng phải sửa parser web (thay đổi contract wire, cần CTO) | `@nestjs/core/router/sse-stream.js` `writeMessage` (`lastEventId++`, `id: …`), `commitHeaders` (`write('\n')`); `apps/web/src/features/chat/stream.ts:44` `if (raw.startsWith("data: "))` |
| Disconnect / heartbeat / abort / cleanup đúng không? | **Đúng.** `close` → xóa heartbeat; chưa `end` thì gọi `onClientClose` → `controller.abort()` → vòng LLM dừng → lưu `STOPPED` → `finally` giải phóng `inFlight` → `sse.end()` (idempotent). Heartbeat 15 s bị xóa ở cả `close` và `end`; chỉ tạo sau `open()` | Code `sse-stream.ts:17-41`; runtime TL `sse-disconnect.mjs` **5/5**: 3 lần client cắt kết nối giữa chừng (không gọi Stop) → tin `STOPPED` đã lưu; gửi tiếp → `200 COMPLETED` (khóa đã nhả); API sống; log server không có ERROR/WARN. Unit test hiện có: "đóng tab/mất mạng … STOPPED" |
| Rủi ro ghi sau khi socket đóng? | **Có ghi, nhưng vô hại.** Sau khi client ngắt, `writableEnded=false`, `destroyed=true` → `send()` vẫn gọi `write()` (vd `done` sau khi lưu `STOPPED`). Node v24: `write()` trả `false`, dữ liệu bị bỏ, **không** phát `error`, **không** exception. Có thể dùng `res.writable` cho chính xác, nhưng không có lợi ích kiểm chứng được → **không đổi** | Probe TL `sse-write-after-close.mjs` (Node v24.18.0): `close: writableEnded=false destroyed=true` → 3 lần `write` `ret=false`, 0 `error`, 0 uncaught |
| Backpressure? | **Không cần ở quy mô hiện tại.** `write()` bỏ qua giá trị trả về → client đọc chậm thì Node đệm trong bộ nhớ. Lượng đệm bị chặn trên bởi **một** câu trả lời: `LLM_MAX_OUTPUT_TOKENS` mặc định 1000, tối đa 8192 (validation) → cỡ chục KB, tối đa vài trăm KB tính cả khung JSON mỗi `delta`; số stream bị chặn bởi 1 stream/hội thoại + 20/phút/người. Ngưỡng cần xử lý: nội dung không giới hạn (stream file/log). Phương án khi đó: chờ `drain` (hoặc dùng cơ chế `maxPendingDataLength` của NestJS) | `env.validation.ts:150-152` `@Max(8192) LLM_MAX_OUTPUT_TOKENS = 1000`; NestJS có `drain` + `maxPendingDataLength` 4M (`sse.decorator.js`, `sse-stream.js`) |
| Tự làm thứ framework làm tốt hơn? | Một phần: NestJS 12 có `drain`, `maxPendingDataLength`, `@SseSignal()`, header chống cache đầy đủ hơn (`private, no-store, …`, `Pragma`, `Expires`). Nhưng **không** có heartbeat, ép `id` vào wire, và chuyển sang Observable buộc tách kiểm tra/khóa stream khỏi phần stream trong `ChatService`. Lợi ích chính (backpressure) không cần ở giới hạn hiện tại → chi phí > lợi ích | Như trên |

### 10.4 Thay đổi
| Thay đổi | Trạng thái | Lý do |
|---|---|---|
| Sửa chú thích `chat.controller.ts:22-23` thành lý do thật (định dạng wire/parser web, heartbeat, lỗi trước stream trả JSON) | **Giao SE** — [SE-025](../tasks/SE-025-chat-sse-comment.md), chỉ chú thích, TL review/merge | Chú thích sai sự thật ở module mẫu |
| Chuyển guard vào `guards/` | **Không làm** | 10.2 |
| Thay SSE bằng `@Sse()` | **Không làm** | 10.3 — phá contract web, không lợi ích kiểm chứng được |
| Đổi `!writableEnded` → `writable` trong `send()` | **Không làm** | Vô hại trên Node v24 (probe) |
| Xóa/thêm unit test | **Không làm** | 10.1 |

### 10.5 Kết quả review và regression
- Runtime TL trên `develop` `86b9f3f`, DB `cat_gpt_loadtest`: `sse-disconnect` **5/5**; probe ghi-sau-đóng (Node v24.18.0) như trên. Không có thay đổi code nào được merge trong mục này (SE-025 sẽ ghi kết quả khi merge).

### 10.6 Cần CTO phê duyệt
1. **Quy ước thư mục** (10.2): giữ guard/filter feature **phẳng** + ghi quy ước 4 điểm. Nếu CTO vẫn muốn `guards/`: TL đề nghị làm **đồng loạt** (chat 2 guard + documents 1 guard; filter `upload-size` có làm theo hay không cần CTO chốt), một PR không đổi hành vi, ~0,25 ngày.
2. **SSE** (10.3): xác nhận giữ implementation tự viết. Nếu muốn dùng `@Sse()` về sau → là thay đổi contract wire (sửa parser web để chấp nhận dòng `id:`), cần duyệt riêng.
