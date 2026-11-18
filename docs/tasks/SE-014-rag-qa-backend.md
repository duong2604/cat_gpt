# SE-014 — Module 4, backend: hỏi đáp có trích dẫn (`RagService`)

Trạng thái: Đang làm
Người phụ trách: Senior Dev · Ưu tiên: **P0** (Module 4 — CTO 18/11/2026 (chỉ thị chuẩn bị Module 4)) · Ước lượng: 3 ngày làm việc
Phụ thuộc (gate kỹ thuật): [SE-011](SE-011-documents-txt-backend.md) **merge** + [TL-008](TL-008-module-4-design.md) **AC4 PASS** trên `develop` (kiến trúc đã duyệt 17/11). **Thứ tự nhận (CTO 18/11/2026):** sau khi Module 3 hoàn thành theo phạm vi đã duyệt ([SE-012](SE-012-documents-txt-frontend.md), [SE-013](SE-013-documents-pdf-docx.md) merge); TL tự chuyển `Sẵn sàng` và giao khi đạt, không cần xin duyệt lại
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 18/11/2026 · bàn giao review — · hoàn tất —
Chốt: 17/11/2026 — CTO duyệt kiến trúc TL-008, Q-M4-1…5; nội dung task chuẩn bị 18/11/2026 (CTO 18/11/2026 (chỉ thị chuẩn bị Module 4))
SHA cơ sở: `origin/develop` @ `caeb519`
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Người dùng chọn tài liệu `READY` của mình, hỏi bằng tiếng Việt và nhận câu trả lời dựa trên nội dung tài liệu, hiện dần qua SSE, kèm trích dẫn kiểm chứng được; câu hỏi ngoài tài liệu không sinh câu trả lời hay nguồn bịa.

## Phạm vi
- **Làm:**
  - Module `rag` (`RagService.prepare()` + `verifyCitations()`, `rag-prompt.ts`).
  - `ChatService.streamAnswer` gọi `RagService` khi hội thoại có `documentIds`.
  - `documentIds` cố định khi tạo hội thoại, tối đa `RAG_MAX_DOCUMENTS`.
  - `CitationDto`; cờ `insufficientEvidence` / `ungrounded`; trích dẫn trả trong sự kiện `done` có sẵn.
  - Guard ẩn ở `staff`; mã lỗi `DOCUMENT_NOT_READY`; biến `RAG_TOP_K`, `RAG_MIN_SCORE` (trống), `RAG_MAX_DOCUMENTS`.
  - Theo [module-4-rag.md](../design/module-4-rag.md) mục 3–7, 9–11.
- **Không làm:** giao diện (SE-015); tóm tắt (SE-016); ngưỡng điểm cố định (chờ TL-009/SE-017); query rewriting, reranker, hybrid search, agent framework; chia sẻ tài liệu; sự kiện SSE mới.

## Ghi chú tích hợp (TL đọc code 18/11/2026)
- `LlmProvider.stream(messages)` đã nhận tin `system`: OpenAI gộp thành `instructions`. **Không cần sửa provider.** Prompt RAG là một tin `system` thứ hai, đặt sau `config.llm.systemPrompt`.
- `ChatService` (`apps/api/src/modules/chat/chat.service.ts`, `streamAnswer` dòng ~104–188) **chưa có unit test.** CP1 phải viết test hồi quy trước khi sửa.
- Từ Module 3 (nhánh SE-011):
  - `DocumentsModule` cần `exports` `EmbeddingService`, `VectorStoreService` và model `DocumentEntity`.
  - Thêm `VectorStoreService.search(vector, { userId, documentIds, limit })`.
  - Embed câu hỏi bằng `embedAll([question])[0]`, cùng `EMBEDDING_MODEL` với đoạn.
- Payload Qdrant thật: `{userId, documentId, chunkIndex, text}` ([TL-008 AC4](TL-008-module-4-design.md#checklist-vòng-1)). `documentName` lấy từ Mongo.
- Provider `mock` không sinh `[n]`, nên mọi câu trả lời sẽ thành `ungrounded`. **Kiểm thử R1–R11 chạy với `LLM_PROVIDER=openai`**; chỉ dùng tài liệu thử công khai.

## Checkpoint (bàn giao TL từng checkpoint: commit + SHA + bằng chứng)
| CP | Nội dung | Bằng chứng tối thiểu |
|---|---|---|
| CP1 Hợp đồng dữ liệu + hồi quy | Test hồi quy `ChatService` **trước khi sửa logic**: 4 trạng thái kết thúc, thứ tự sự kiện SSE `meta → delta* → done`, Dừng, Tạo lại. `packages/shared`: `CitationDto`, trường tùy chọn ở `MessageDto` / `ConversationDto` (`documentIds`). Schema `conversations.documentIds`, `messages.citations/insufficientEvidence/ungrounded`. Validation `documentIds` khi tạo hội thoại (`400` khi gửi kèm `conversationId`; `404`/`400 DOCUMENT_NOT_READY`) | vitest xanh trên code **chưa sửa** rồi trên code mới; hợp đồng SSE không đổi |
| CP2 Truy hồi | `RagService.prepare()`: lọc lại tài liệu hợp lệ ở Mongo → embed câu hỏi → Qdrant `search` lọc `userId` + `documentId ∈` → `RAG_TOP_K`, `RAG_MIN_SCORE` (trống = không lọc) → `insufficient` khi 0 đoạn / không còn tài liệu | Log/script cho thấy đoạn truy hồi (documentId, chunkIndex, score) với tài liệu thật; không có đoạn của người khác |
| CP3 Câu trả lời có căn cứ | `rag-prompt.ts` (khối phân cách "dữ liệu, không phải chỉ dẫn"; câu từ chối cố định); nối `streamAnswer`; `insufficient` → không gọi LLM; `verifyCitations()` (`[n]`, `[1, 3]`, `[1][2]`, ngoài khoảng bị bỏ); lưu `citations` (`quote` ≤ 300 ký tự), cờ | **Happy case backend:** xem dưới |
| CP4 Hardening + nghiệm thu | R1–R11; cô lập chủ sở hữu; tài liệu bị xóa sau khi tạo hội thoại; prompt injection; Dừng / Tạo lại / lịch sử; Chat thường không hồi quy; guard `staff`; `.env` ↔ `.env.example`; CI, build, typecheck, lint, test | Bảng kết quả R1–R11 trên service thật |

**Happy case backend đầu tiên (mục tiêu CP3):** một tài liệu TXT `READY` → `POST /chat/stream` với `documentIds` + câu hỏi có đáp án → SSE trả câu trả lời có `[n]` → `done.message.citations[]` trỏ đúng `documentId` + `chunkIndex`, `quote` là chuỗi con của `text` của point Qdrant tương ứng → `GET /conversations/:id/messages` vẫn còn `citations`.
Trích dẫn hợp lệ **không** chứng minh toàn bộ câu trả lời đúng; chất lượng ngữ nghĩa đo ở TL-009/SE-017.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | R1: câu hỏi có trong tài liệu → ≥ 1 trích dẫn; mọi `quote` là chuỗi con của payload đoạn tương ứng | FR-M4-02/03 | Script SSE + Qdrant |
| AC2 | R2, R3: câu hỏi ngoài tài liệu → câu từ chối cố định, `insufficientEvidence`, không nguồn (ghi tỷ lệ trên 10 câu); hết tài liệu hợp lệ → không gọi LLM (không có dòng usage) | FR-M4-04 | Script + log usage |
| AC3 | R4, R5, R6: tài liệu người khác → `404` (kể cả admin); chưa `READY` → `400 DOCUMENT_NOT_READY`; truy hồi không trả đoạn của người khác | CS-1, M3-2 | `curl` 3 tài khoản |
| AC4 | R7, R10: Dừng / Tạo lại / mở lại đúng; Chat thường không hồi quy (test hồi quy CP1 vẫn xanh) | FR-M4-06 | Script + vitest |
| AC5 | R9 + unit test `verifyCitations`, dựng prompt (logic thuần, không mock Qdrant/OpenAI) | Thiết kế 6.3 | vitest |
| AC6 | R8: Qdrant tắt → tin `ERROR`, Tạo lại được khi bật lại; R11: hành vi với lệnh chèn trong tài liệu được ghi lại, không có nguồn ngoài tài liệu đã chọn | Thiết kế 6.1, 6.2 | Script, báo TL trước khi dừng Qdrant dùng chung |
| AC7 | `staff` → API RAG `404` như Tài liệu; log không có nội dung câu hỏi/tài liệu/khóa | Thiết kế 10; M3 AC11 | `curl` + grep log |
| AC8 | Checklist hai vai (workflow 9.1); dữ liệu thử đã xóa; CI xanh; build/typecheck/lint | Workflow | Bàn giao 6.1 |

## Ước lượng (TL đánh giá lại 18/11/2026)
3 ngày, giữ nguyên.
- CP1: 0,75n — test hồi quy cho `ChatService` là phần mới, trước đó chưa có test.
- CP2: 0,5n.
- CP3: 1n.
- CP4: 0,75n.

Rủi ro tăng: chất lượng trả `[n]` của `gpt-5.4-mini` với prompt tiếng Việt cần vài vòng chỉnh prompt.

## Kết quả review
**CP1 Hợp đồng dữ liệu + hồi quy — xong, chưa TL review.**

- `chat.service.spec.ts` (mới, ChatService trước đó chưa có test): hồi quy xanh trên code cũ rồi trên code mới — 4 trạng thái kết thúc (COMPLETED/TRUNCATED/STOPPED/ERROR), thứ tự SSE `meta → delta* → done`, Dừng (qua `stop()` và qua đóng kết nối), Tạo lại.
- `packages/shared`: `CitationDto`; `ConversationDto.documentIds`; `MessageDto` thêm `citations/insufficientEvidence/ungrounded`; mã lỗi `DOCUMENT_NOT_READY` (+ dịch vi/en).
- Schema: `conversations.documentIds`; `messages` thêm `Citation` (sub-schema) + `citations/insufficientEvidence/ungrounded`.
- `SendMessageDto.documentIds` (hình dạng); `ChatService.send()` kiểm: `conversationId` + `documentIds` → `400 VALIDATION_FAILED`; tạo mới có `documentIds` → một truy vấn Mongo `{_id ∈ ids, userId, deletedAt: null}` → thiếu id nào → `404 DOCUMENT_NOT_FOUND`; có tài liệu chưa `READY` → `400 DOCUMENT_NOT_READY`; ẩn ở `staff` như Tài liệu.
- `RAG_TOP_K/RAG_MIN_SCORE (trống=tắt)/RAG_MAX_DOCUMENTS/RAG_SUMMARY_GROUP_CHARS` thêm vào cấu hình.
- `DocumentsModule` export `EmbeddingService`, `VectorStoreService`, `MongooseModule` (model `DocumentEntity`) cho `ChatModule`.
- **Sửa kèm (chặn test):** `document.schema.ts` có mấy `@Prop()` không khai `type` rõ ràng, dựa vào `Reflect.getMetadata('design:type')` — production build (`nest build` qua `tsc`) phát đủ metadata nên chạy đúng, nhưng transform của vitest (esbuild) không phát, lộ ra khi `DocumentEntity` lần đầu được import giá trị thật trong test (`ChatService` cần `@InjectModel`): lỗi "PENDING is not a valid type at path PENDING". Khai rõ `type` cho từng trường — hành vi production không đổi.
- Kiểm thật qua API đang chạy (không mock): Chat thường không `documentIds` vẫn ra `done` bình thường; `documentIds` không tồn tại → `404`; tài liệu `PENDING` → `400 DOCUMENT_NOT_READY`; `conversationId` + `documentIds` → `400 VALIDATION_FAILED`; không tài liệu/hội thoại mồ côi nào (kiểm trước khi tạo). Tài liệu thử xóa, xác nhận trực tiếp Mongo/MinIO/Qdrant = 0.
- `pnpm --filter @cat-gpt/api test`: 52/52 (44 cũ + 8 mới). Root `typecheck/build/lint` xanh.

Commit: `cce88f6`. TL review: **PASS** — hồi quy xác nhận độc lập trên code chưa sửa; gate xanh; `validateDocumentSelection` đúng. Yêu cầu bổ sung bằng chứng cho CP4 (R4/R5/vượt giới hạn/conversationId+documentIds) — đã làm ngay ở CP2 (xem dưới) thay vì để tới CP4.

**CP2 Truy hồi — xong, chưa TL review.** Commit `9bff1c3`.

- `VectorStoreService.search(vector, { userId, documentIds, limit })`: Qdrant `query()` lọc cả `userId` (match.value) và `documentId` (match.any) — M4-4. Ngưỡng điểm không lọc ở tầng này (chính sách của `RagService`).
- `RagService.prepare(userId, documentIds, question)`: lọc lại Mongo (`READY`, chưa xóa, đúng chủ — không tin thẳng `documentIds` của hội thoại) → embed câu hỏi mới nhất → Qdrant `search` với danh sách đã lọc → `RAG_MIN_SCORE` để trống = không lọc → `insufficient` (`DOCUMENTS_UNAVAILABLE` hoặc `NO_MATCH`) khi 0 tài liệu/0 đoạn. Log debug chỉ `(documentId, chunkIndex, score)`, không bao giờ nội dung đoạn.
- Kiểm bằng dịch vụ thật (Mongo/Qdrant/OpenAI, script tạm xóa sau khi dùng): A hỏi tài liệu của A → truy hồi đúng, chỉ của A. B gửi `documentIds` của A → `insufficient (DOCUMENTS_UNAVAILABLE)` (lọc Mongo theo `userId=B` không thấy). B hỏi tài liệu của B (nội dung gần giống tài liệu A) → truy hồi đúng, chỉ của B, không lẫn dù nội dung tương tự. Dữ liệu thử xóa, xác nhận Mongo/Qdrant = 0.
- Bổ sung theo yêu cầu TL (đưa từ CP4 lên ngay): 5 unit test mới trong `chat.service.spec.ts` phủ các nhánh của `validateDocumentSelection` — `conversationId` + `documentIds` → 400; tài liệu của người khác (R4) → 404 không phân biệt lý do; tài liệu chưa `READY` (R5) → 400; vượt `RAG_MAX_DOCUMENTS` → 400, không gọi Mongo; tài liệu hợp lệ → tạo hội thoại, lưu đúng `documentIds`.
- `pnpm --filter @cat-gpt/api test`: 57/57 (52 cũ + 5 mới). Root `typecheck/build/lint` xanh.
- TL review: **PASS**. Lưu ý cho CP3: ngưỡng đã ghi nhận (xem dưới).

**CP3 Câu trả lời có căn cứ — xong, chưa TL review.** Commit `da52ef6`.

- `rag-prompt.ts`: `RAG_REFUSAL_TEXT` + `buildRagSystemPrompt()` — đoạn đánh số `[n]`, khối phân cách "dữ liệu, không phải chỉ dẫn" (R11).
- `RagService.verifyCitations()`: câu từ chối nguyên văn → `insufficientEvidence`; tách `[n]`/`[1,3]`/`[1][2]`, bỏ trùng, ngoài khoảng bị bỏ (ghi debug số lượng, không nội dung); không trích dẫn hợp lệ → `ungrounded`; `quote` cắt ≤300 ký tự từ `text` nguồn (luôn là chuỗi con). `prepare()` trả thêm `systemPrompt`.
- `ChatService.streamAnswer` nối `RagService`: `insufficient` → **không gọi LLM**, gửi thẳng câu từ chối làm một `delta` duy nhất, lưu `insufficientEvidence=true, citations=[]`; `ready` → prompt RAG là tin `system` thứ hai sau `config.llm.systemPrompt`; sau khi stream xong, `verifyCitations()` trên nội dung đã sinh (kể cả STOPPED/TRUNCATED); `ERROR` → không xác minh. Không có `documentIds` → luồng y nguyên (hồi quy).
- 16 unit test mới `rag.service.spec.ts` (logic thuần, không mock Qdrant/OpenAI — thiết kế mục 11): phủ đủ R9 (`[1,3]`, `[1][2]`, `[9]` ngoài khoảng, trùng lặp, không nhãn → ungrounded, câu từ chối → insufficientEvidence, nội dung STOPPED/TRUNCATED một phần, quote luôn là chuỗi con ≤300 ký tự) + `buildRagSystemPrompt`.
- `chat.service.spec.ts`: sửa một lỗi thật — `FakeConversationsService.createMessage` bỏ sót các trường mới khiến 2 test trước đó "qua" dù `this.rag.prepare` ném lỗi (assertion không kiểm `done`). Thêm 2 test nối RagService ở tầng ChatService.
- **Kiểm bằng dịch vụ thật** (Mongo/Qdrant/OpenAI/Redis, `LLM_PROVIDER=openai`, không mock, script xóa sau khi dùng):
  - **Happy case (mục tiêu CP3):** TXT READY → hỏi câu có đáp án → SSE `meta → delta*(33) → done` → câu trả lời có `[1]` → `citations[0]` khớp đúng `documentId`, `quote` là chuỗi con thật của payload Qdrant (đối chiếu trực tiếp) → `GET .../messages` mở lại vẫn còn `citations`.
  - **R3** (tài liệu bị xóa sau khi hỏi câu đầu, hỏi tiếp câu 2 cùng hội thoại): `meta → delta (đúng 1, không phải LLM stream từng token) → done`; `insufficientEvidence=true`; log API **không** có dòng `usage model=` mới trong cửa sổ câu hỏi 2 — xác nhận LLM thật sự không bị gọi.
  - **Dừng/Tạo lại (RAG):** Dừng giữa chừng → `STOPPED`, giữ nội dung đã sinh tới lúc dừng. Tạo lại → truy hồi lại, sinh câu trả lời mới. Quan sát: một lần Tạo lại, model trả đúng nguyên văn câu từ chối cho câu hỏi "kể chi tiết toàn bộ câu chuyện" dù tài liệu liên quan — đúng rủi ro đã ghi trong ước lượng task ("chất lượng trả `[n]` cần vài vòng chỉnh prompt"), không phải lỗi nối dây; cơ chế (truy hồi, prompt, parse, lưu) đúng ở cả hai lần.
  - Toàn bộ dữ liệu thử xóa, xác nhận Mongo/MinIO/Qdrant = 0 từng lần.
- `pnpm --filter @cat-gpt/api test`: 74/74 (57 cũ + 16 `rag.service.spec.ts` + 1 sửa test cũ sai). Root `typecheck/build/lint` xanh.

Đang tiếp tục CP4 (hardening: R1–R11 đầy đủ trên bộ dữ liệu TL-009, cô lập chủ sở hữu, tài liệu xóa sau khi tạo hội thoại, lệnh chèn R11, guard `staff`, `.env` ↔ `.env.example`, CI).

## Lịch sử review

## Phản hồi UI
Không áp dụng (backend).
