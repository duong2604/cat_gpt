# Chat Module (F03) — Structural Review & Refactor

Người lập: TL · Cơ sở: `origin/develop` @ `547b06f` (CI success) · Bắt đầu: 21/11/2026 21:3x
Task triển khai: [SE-022](../tasks/SE-022-chat-module-structural-refactor.md) · Chỉ thị: CTO "Chat Module Structural Refactor" (P1)

**Trạng thái hiện tại: PR-C3a merge (`e0adb75`), PR-B10/SE-F9 merge (`2569caf`); SE đang làm PR-C3b.** Không tự đánh dấu CTO ACCEPTED.

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

## 7. Quality gates (sẽ điền khi triển khai)
| Gate | PR-C3a | PR-C3b |
|---|---|---|
| Cấu trúc khớp thiết kế | Đạt | — |
| Không đổi API contract (route, mã HTTP, mã lỗi, SSE event) | Đạt (c3a-check 5/5) | — |
| `f03-verify` (13 ca; 14 ca sau B10) | Đạt 13/13 | — |
| Race 2 stream (200+409), Dừng trong cửa sổ | Đạt | — |
| Test hiện có (`chat.service.spec.ts` chỉ chỉnh mock theo constructor, không thêm test) | Đạt 83/83 | — |
| typecheck/lint/build, CI | Đạt | — |
| Merge SHA | `e0adb75` | — |

**CTO acceptance:** chưa — sau khi merge, trạng thái sẽ là `IMPLEMENTED — TL APPROVED — AWAITING CTO ACCEPTANCE`.
