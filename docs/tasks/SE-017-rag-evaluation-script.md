# SE-017 — Script đánh giá RAG và so sánh mô hình embedding

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 2 ngày làm việc
Phụ thuộc (gate): [TL-009](TL-009-rag-evaluation-dataset.md) duyệt **và** [SE-014](SE-014-rag-qa-backend.md) merge (cả hai chặn); phương án mô hình CTO chọn (A cần quyền `text-embedding-3-large`)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 18/11/2026 — CTO chọn phương án A (`text-embedding-3-small` vs `text-embedding-3-large`); chạy `-large` chỉ sau khi xác nhận quyền API. TL-009 Done 18/11/2026; còn chờ SE-014 merge
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

## Mục tiêu
Một lệnh chạy lại được để đo chất lượng truy hồi và câu trả lời trên bộ dữ liệu TL-009, so sánh ít nhất 2 mô hình embedding, xuất bảng kết quả cho báo cáo đồ án. Mô hình so sánh theo phương án CTO chọn ở [TL-009](TL-009-rag-evaluation-dataset.md#tính-khả-thi-so-sánh-mô-hình-embedding-để-cto-quyết); đề xuất: `text-embedding-3-small` và `text-embedding-3-large`.

## Phạm vi
- **Làm:**
  - Script trong `apps/api/scripts/` (Node, dùng lại `chunkText`, `EmbeddingService`, `VectorStoreService`, `RagService.prepare()`).
  - Một collection Qdrant **riêng cho đánh giá** theo mô hình (`document_chunks_eval_<model>`). **Không ghi vào collection sản phẩm.**
  - Đọc `questions.jsonl`; tính hit@k, MRR, refusal accuracy, false refusal, citation precision/coverage (định nghĩa ở TL-009).
  - Xuất `results-<model>-<date>.md/json`: chỉ số + token + thời gian; ghi phân bố điểm top-1 để chọn `RAG_MIN_SCORE`.
  - Tham số mô hình qua đối số dòng lệnh / biến môi trường của script. Không đổi `EMBEDDING_MODEL` mặc định của sản phẩm.
- **Không làm:** framework đánh giá; LLM-chấm làm kết quả chính; thay đổi mặc định sản phẩm khi chưa có kết quả và TL/CTO duyệt.

## Checkpoint
| CP | Nội dung | Bằng chứng tối thiểu |
|---|---|---|
| CP1 | Nạp bộ dữ liệu vào collection đánh giá (mô hình 1); đối chiếu nhãn `chunkIndex` | Số point = tổng đoạn |
| CP2 | Chỉ số truy hồi (hit@k, MRR) cho mô hình 1; chạy 2 lần cùng kết quả | Tệp kết quả |
| CP3 | Chỉ số trả lời (refusal, citation) qua `RagService` + LLM thật; token + thời gian | Tệp kết quả |
| CP4 | Mô hình 2; bảng so sánh; dọn collection đánh giá khi xong (hoặc giữ có tên rõ) | Bảng so sánh |

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Chạy lại 2 lần cho cùng kết quả truy hồi (cùng dữ liệu, cùng mô hình) | Đầu ra |
| AC2 | Bảng hit@k, MRR, tỷ lệ từ chối, độ chính xác trích dẫn cho từng mô hình | Tệp kết quả |
| AC3 | Ghi chi phí token và thời gian chạy | Đầu ra |
| AC4 | Collection sản phẩm không bị ghi/xóa; CI xanh; không đổi hành vi sản phẩm | Đếm point trước/sau + link run |

## Ước lượng (TL đánh giá lại 18/11/2026)
2 ngày với phương án A. Phương án B/C cộng ~0,5n (cài và kiểm Ollama, cần CTO duyệt).

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Không áp dụng.
