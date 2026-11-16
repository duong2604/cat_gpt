# SE-017 — Script đánh giá RAG và so sánh mô hình embedding

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 2 ngày làm việc
Phụ thuộc: [TL-009](TL-009-rag-evaluation-dataset.md) duyệt (chặn); [SE-014](SE-014-rag-qa-backend.md) merge (chặn)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: — (chờ TL-009 duyệt)
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

## Mục tiêu
Một lệnh chạy lại được để đo chất lượng truy hồi và câu trả lời trên bộ dữ liệu TL-009, so sánh ít nhất 2 mô hình embedding (đề xuất `text-embedding-3-small` và một mô hình đa ngữ chạy nội bộ, ví dụ `bge-m3` qua Ollama nếu máy đủ RAM), xuất bảng kết quả cho báo cáo đồ án.

## Phạm vi (sơ bộ)
- Làm: script trong `apps/api/scripts/` (Node, dùng lại service có sẵn); collection Qdrant riêng theo mô hình; lúc này mới thêm lựa chọn mô hình embedding qua `.env` (một tham số, không framework).
- Không làm: thay đổi mặc định sản phẩm khi chưa có kết quả và TL/CTO duyệt.

## Checklist nghiệm thu (sơ bộ)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Chạy lại 2 lần cho cùng kết quả truy hồi (cùng dữ liệu, cùng mô hình) | Đầu ra |
| AC2 | Bảng hit@k, MRR, tỷ lệ từ chối, độ chính xác trích dẫn cho từng mô hình | Tệp kết quả |
| AC3 | Ghi chi phí token và thời gian chạy | Đầu ra |
| AC4 | CI xanh; không đổi hành vi sản phẩm | Link run |

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Không áp dụng.
