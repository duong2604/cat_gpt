# SE-022 — Refactor cấu trúc module Chat (module mẫu)

Trạng thái: Sẵn sàng — **PR-C3a làm ngay** (ưu tiên của chủ dự án/CTO, giao 21:33); PR-C3b sau PR-B10
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,75 ngày (PR-C3a 0,25 + PR-C3b 0,5)
Phụ thuộc: PR-C3a không phụ thuộc; PR-C3b sau PR-B10 (cùng vùng code). SE-005 tạm dừng ở điểm an toàn
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Chốt: 21/11/2026 — chỉ thị CTO "Chat Module Structural Refactor" (TL thiết kế, SE triển khai, TL review/merge PR không đổi hành vi)
SHA cơ sở: `origin/develop` mới nhất khi tạo nhánh (sau PR-B10)
Thiết kế và findings: [chat-module-structural-review.md](../reports/chat-module-structural-review.md)

## Mục tiêu
Module Chat rõ trách nhiệm, ít coupling, luồng stream dễ đọc/debug — **không đổi hành vi, API contract, schema, chính sách bảo mật**.

## PR-C3a `refactor/api-chat-document-selection` (C-1, C-3)
- `DocumentsService.findReadyOwnedDocuments(userId: string, ids: string[]): Promise<Types.ObjectId[]>` — một truy vấn `{ _id ∈ ids, userId, deletedAt: null }`; thiếu bất kỳ id → `404 DOCUMENT_NOT_FOUND`; có tài liệu chưa `READY` → `400 DOCUMENT_NOT_READY` (giữ nguyên hành vi `chat.service.ts:268-288`).
- `DocumentsModule` export thêm `DocumentsService` (giữ export `MongooseModule` — `RagService` còn dùng, ngoài phạm vi).
- `ChatService`: bỏ `@InjectModel(DocumentEntity)` và import `DocumentStatus`/`DocumentEntity`; inject `DocumentsService`; kiểm `RAG_MAX_DOCUMENTS` vẫn ở Chat (ràng buộc hội thoại).
- Gộp `assertRagNotHidden` + `assertRagNotHiddenRaw` thành `assertDocumentsVisible()`; gọi có điều kiện `if (conversation.documentIds?.length)` tại chỗ dùng.
- `chat.service.spec.ts`: **chỉ** chỉnh phần dựng mock theo constructor mới (thay mock model bằng mock `DocumentsService`); không thêm test.

## PR-C3b `refactor/api-chat-stream-steps` (C-2, C-4)
- `streamAnswer` thành phần điều phối ngắn gọi các bước private trong `ChatService`:
  - `retrieveContext(conversation, question)` → `{ plan, failed }` (RAG prepare, log lỗi, không ném).
  - `generate(messages, controller, sse)` → `{ content, status }` (vòng stream, abort, `TRUNCATED`/`STOPPED`/`ERROR`, log `cause`).
  - `saveAnswer(conversation, fields, sse)` → kiểm `exists`, `createMessage`, `touch`, gửi `done` — **dùng chung** cho nhánh `insufficient` và nhánh chính.
- Hàm thuần cấp module `buildLlmMessages(systemPrompt, plan, history)` (cạnh `makeTitle`). **Không** tạo tệp/folder/service/interface mới.
- Chú thích: mô tả hành vi hiện tại; bỏ tham chiếu PR/ngày (vd "không đổi logic ở PR này").
- Giữ nguyên: `inFlight`, `reserveStream`, thứ tự sự kiện SSE, cách xác định trạng thái, logic Tạo lại sau PR-B10.

## Không được thay đổi
Route, mã HTTP, mã lỗi, hình dạng event SSE (`meta`/`delta`/`done`/`error`); schema `conversations`/`messages`; giới hạn tốc độ; guard; `RagService`; hành vi Tạo lại/Dừng; `inFlight` trong bộ nhớ.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Cấu trúc khớp thiết kế (mục 4 báo cáo); không tệp/abstraction mới ngoài `findReadyOwnedDocuments`, các bước private, `buildLlmMessages` | Đọc diff |
| AC2 | Không đổi API contract: tạo hội thoại có tài liệu người khác/đã xóa → `404`, chưa READY → `400`, vượt số lượng → `400`; SSE event giữ nguyên | Kịch bản API trước/sau |
| AC3 | Kịch bản `f03-verify` (TL cung cấp) đạt đủ — kỳ vọng SE-F9 theo hành vi sau PR-B10 | Chạy trên DB `cat_gpt_loadtest` |
| AC4 | Race: 2 stream song song cùng hội thoại → `200` + `409`; Dừng trong cửa sổ khởi động → `STOPPED` | Kịch bản race |
| AC5 | Test hiện có pass (chỉ chỉnh mock theo constructor) | `pnpm -C apps/api test` |
| AC6 | typecheck/lint/build; CI xanh tại SHA đầu PR; diff chỉ `apps/api/src/modules/chat`, `apps/api/src/modules/documents/documents.{service,module}.ts` | Lệnh + `git diff --stat` |
| AC7 | Báo cáo trước/sau trong mô tả PR (cấu trúc, dependency, hàm thay đổi) | Mô tả PR |

## Kết quả review
Chưa có.

## Lịch sử review
### PR-C3a #49 — TL review vòng 1 (SHA `68333ca`, base `547b06f`) — **Cần sửa**
| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| AC1 cấu trúc | Đạt | Diff 4 tệp; `findReadyOwnedDocuments` trong `DocumentsService`; `ChatService` bỏ `@InjectModel(DocumentEntity)`; một hàm `assertDocumentsVisible()`; không tệp/abstraction mới |
| AC2 không đổi contract | Đạt | Kịch bản TL `c3a-check.mjs` (DB `cat_gpt_loadtest`) 5/5: chưa READY → `400 DOCUMENT_NOT_READY`; của người khác → `404`; đã xóa → `404`; 6 id → `400 VALIDATION_FAILED`; của mình READY → `200` |
| AC3 f03-verify | Đạt | 13/13 |
| AC4 race | Đạt | Nằm trong f03-verify (200+409; Dừng → `STOPPED`) |
| AC5 test hiện có | Đạt | 83/83; spec chỉ đổi phần dựng `ChatService` (dùng `DocumentsService` thật với model giả) |
| AC6 typecheck/lint/build | Đạt (local) | 4/4 task, lint 0 cảnh báo; CI chưa xong lúc review |
| AC7 mô tả PR | Đạt | SE báo trước/sau trong PR |
| Chất lượng chú thích | **Không đạt** | (1) JSDoc lặp nguyên văn 2 lần trên `assertDocumentsVisible`; (2) chú thích `validateDocumentSelection` vẫn mô tả truy vấn Mongo đã chuyển sang `DocumentsService` |
Yêu cầu: sửa chú thích (không đổi code chạy), cập nhật cùng PR, checklist vòng 2.

## Phản hồi UI
Không áp dụng.
