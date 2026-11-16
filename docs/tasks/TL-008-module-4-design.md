# TL-008 — Thiết kế Module 4: truy hồi, hỏi đáp có trích dẫn, tóm tắt

Trạng thái: Sẵn sàng
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: [TL-007](TL-007-module-3-design.md) — Done 17/11/2026. Nên viết song song [SE-011](SE-011-documents-txt-backend.md) để đối chiếu payload Qdrant thật; **chặn** SE-014…SE-016
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 16/11/2026 — CTO vòng 2: Module 4 dùng lại Chat UI/SSE nhưng tách nghiệp vụ truy hồi/ngữ cảnh trong `RagService` (hoặc tương đương đơn giản); không chốt ngưỡng điểm trước khi có đánh giá; làm rõ xử lý câu hỏi thiếu căn cứ và xác minh trích dẫn
SHA cơ sở: `origin/develop` @ SHA khi bắt đầu
PR: Không — tài liệu TL

## Mục tiêu
Bản FS/BD Module 4 đủ để Senior Dev làm hỏi đáp có trích dẫn và tóm tắt mà không tự quyết luồng truy hồi, cách xử lý thiếu căn cứ, mô hình trích dẫn và quyền.

## Output
- `docs/design/module-4-rag.md`.

## Phạm vi
- Làm: FS theo đề cương Module 4 (tóm tắt; hỏi–đáp dựa trên tài liệu kèm trích dẫn; tối ưu tiếng Việt); BD gồm:
  - `RagService` (module `rag`): kiểm quyền `documentIds` (chỉ tài liệu `READY` của người gọi), truy hồi Qdrant lọc `userId` + `documentIds`, dựng ngữ cảnh + prompt. `ChatService` chỉ gọi `RagService` khi hội thoại có `documentIds`; SSE, Dừng, Tạo lại, lịch sử, Chat UI giữ nguyên.
  - Dữ liệu: `conversations.documentIds?` (cố định khi tạo); `messages.citations?` `[{ documentId, documentName, chunkIndex, page?, quote }]`; cờ `insufficientEvidence`, `ungrounded`.
  - Thiếu căn cứ: chặn cứng khi truy hồi 0 đoạn (câu cố định, không gọi LLM); prompt bắt buộc trích `[n]` và câu từ chối cố định; `RAG_MIN_SCORE` để trống (tắt) tới khi có kết quả đánh giá ([TL-009](TL-009-rag-evaluation-dataset.md)); top-k qua `.env`.
  - Xác minh trích dẫn: tách `[n]` sau khi stream xong, chỉ giữ `n` thuộc tập đoạn đã truy hồi; `quote`/tên/trang lấy từ payload Qdrant (không lấy chữ do model sinh); câu trả lời không phải câu từ chối mà không có trích dẫn hợp lệ → `ungrounded` + cảnh báo trên UI.
  - Tóm tắt: `POST /documents/:id/summary` (map-reduce đơn giản trên các đoạn), lưu kết quả vào bản ghi tài liệu; tài liệu thử công khai.
  - Kịch bản kiểm thử bằng service thật (Qdrant, OpenAI) + tiêu chí của SE-014…SE-016.
- Không làm: code; khung đánh giá (TL-009, SE-017); chia sẻ tài liệu giữa người dùng.

## Nguồn yêu cầu
- Đề cương Module 4 ([bản chép](../thesis/sources/de-cuong-datn.md)); CTO vòng 2 mục 4–5 (16/11/2026); [module-3-documents.md](../design/module-3-documents.md) mục 4.3 (payload Qdrant).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Mỗi FR Module 4 trong đề cương có API, màn hình, trạng thái | Đề cương | Đối chiếu |
| AC2 | Luồng thiếu căn cứ và xác minh trích dẫn có quy tắc kiểm chứng được, không phụ thuộc ngưỡng chưa đo | CTO vòng 2 mục 5 | Đọc mục tương ứng |
| AC3 | Quyền: không truy hồi được tài liệu người khác / chưa `READY` | CS-1, M3-2 | Kịch bản kiểm thử |
| AC4 | Đối chiếu payload Qdrant thật của SE-011 | Thiết kế M3 | Truy vấn Qdrant |
| AC5 | CTO/khách hàng duyệt | Workflow | Review vòng 1 |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| — | Chưa có (ghi khi viết thiết kế) | — | — |

## Kết quả review
Chưa bắt đầu.

## Lịch sử review

## Phản hồi UI
Không áp dụng (tài liệu).
