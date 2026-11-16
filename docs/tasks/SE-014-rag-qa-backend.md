# SE-014 — Module 4, backend: hỏi đáp có trích dẫn (`RagService`)

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 3 ngày làm việc
Phụ thuộc: [TL-008](TL-008-module-4-design.md) duyệt (chặn); [SE-011](SE-011-documents-txt-backend.md) merge (chặn — cần đoạn + vector thật)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: — (chờ TL-008 duyệt)
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

## Mục tiêu
Người dùng chọn tài liệu `READY` của mình, hỏi bằng tiếng Việt và nhận câu trả lời dựa trên nội dung tài liệu, hiện dần qua SSE, kèm trích dẫn kiểm chứng được; câu hỏi ngoài tài liệu không sinh câu trả lời hay nguồn bịa.

## Phạm vi (sơ bộ — chốt theo TL-008)
- Làm: module `rag` (`RagService`: kiểm quyền, truy hồi Qdrant, dựng ngữ cảnh); `ChatService` gọi `RagService` khi hội thoại có `documentIds`; trích dẫn + kiểm `[n]`; cờ `insufficientEvidence`/`ungrounded`; sự kiện SSE `citations`.
- Không làm: giao diện (SE-015); tóm tắt (SE-016); ngưỡng điểm cố định (chờ TL-009); chia sẻ tài liệu.

## Checklist nghiệm thu (sơ bộ)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Câu hỏi có trong tài liệu thử công khai → câu trả lời có ≥ 1 trích dẫn, mỗi trích dẫn mở ra đúng đoạn nguồn (đối chiếu payload Qdrant) | Script SSE + Qdrant |
| AC2 | Câu hỏi ngoài tài liệu → câu từ chối cố định, không có trích dẫn; không có tài liệu `READY` → không gọi LLM | Script + log usage |
| AC3 | Không truy hồi được tài liệu của người khác hoặc chưa `READY` (2 tài khoản cùng vai) | `curl` |
| AC4 | Dừng / Tạo lại / mở lại hội thoại vẫn đúng; Chat thường (không tài liệu) không hồi quy — **viết test hồi quy `ChatService` (4 trạng thái kết thúc) trước khi sửa** | Script + vitest |
| AC5 | Unit test cho kiểm trích dẫn và dựng ngữ cảnh | vitest |
| AC6 | Checklist hai vai; CI xanh | Bàn giao 6.1 |

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Không áp dụng (backend).
