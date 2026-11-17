# SE-014 — Module 4, backend: hỏi đáp có trích dẫn (`RagService`)

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: **P0** (Module 4 — CTO 18/11/2026 (chỉ thị chuẩn bị Module 4)) · Ước lượng: 3 ngày làm việc
Phụ thuộc (gate kỹ thuật): [SE-011](SE-011-documents-txt-backend.md) **merge** + [TL-008](TL-008-module-4-design.md) **AC4 PASS** trên `develop` (kiến trúc đã duyệt 17/11). **Thứ tự nhận (CTO 18/11/2026):** sau khi Module 3 hoàn thành theo phạm vi đã duyệt ([SE-012](SE-012-documents-txt-frontend.md), [SE-013](SE-013-documents-pdf-docx.md) merge); TL tự chuyển `Sẵn sàng` và giao khi đạt, không cần xin duyệt lại
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 17/11/2026 — CTO duyệt kiến trúc TL-008, Q-M4-1…5; nội dung task chuẩn bị 18/11/2026 (CTO 18/11/2026 (chỉ thị chuẩn bị Module 4))
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

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
Chưa có.

## Lịch sử review

## Phản hồi UI
Không áp dụng (backend).
