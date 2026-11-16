# TL-009 — Bộ dữ liệu và quy trình đánh giá RAG tiếng Việt

Trạng thái: Nháp
Người phụ trách: TL · Ưu tiên: P2 · Ước lượng: 1 ngày làm việc
Phụ thuộc: [SE-011](SE-011-documents-txt-backend.md) merge (cần đoạn + vector thật); tài liệu thử công khai (sinh viên có thể bổ sung)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: — (khung đánh giá là kết quả cam kết trong đề cương; chờ CTO/khách hàng chốt phạm vi khi TL-008 duyệt)
SHA cơ sở: `origin/develop` @ SHA khi bắt đầu
PR: Không — tài liệu TL

## Mục tiêu
Đề cương cam kết "khung đánh giá: bộ câu hỏi–đáp tiếng Việt mẫu cùng các chỉ số đo độ chính xác truy hồi và chất lượng câu trả lời; có so sánh giữa một số mô hình embedding". Task này lập bộ dữ liệu và quy trình; script chạy ở SE-017; kết quả dùng để chọn `RAG_MIN_SCORE` (TL-008).

## Phạm vi (sơ bộ)
- Làm: 5–10 tài liệu công khai tiếng Việt; 30–50 câu hỏi có nhãn đoạn đúng + 10 câu ngoài tài liệu; chỉ số hit@k, MRR (truy hồi), tỷ lệ từ chối đúng/sai, độ chính xác trích dẫn, rubric chất lượng câu trả lời; danh sách mô hình embedding so sánh.
- Không làm: tài liệu nội bộ/nhạy cảm; đánh giá tải.

## Checklist nghiệm thu (sơ bộ)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Mỗi tài liệu có nguồn công khai, giấy phép dùng được | Bảng nguồn |
| AC2 | Mỗi câu hỏi có đoạn đúng (documentId + chunkIndex) đối chiếu được trên Qdrant | Truy vấn |
| AC3 | Định nghĩa chỉ số và cách tính rõ, tái lập được | Đọc tài liệu |
| AC4 | CTO/khách hàng duyệt | Review |

## Kết quả review
Chưa bắt đầu.

## Lịch sử review

## Phản hồi UI
Không áp dụng.
