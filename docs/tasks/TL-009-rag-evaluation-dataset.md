# TL-009 — Bộ dữ liệu và quy trình đánh giá RAG tiếng Việt

Trạng thái: Nháp
Người phụ trách: TL · Ưu tiên: P2 · Ước lượng: 1 ngày làm việc
Phụ thuộc: chọn tài liệu + viết câu hỏi: **không chặn**. Gắn nhãn `chunkIndex`: [SE-011](SE-011-documents-txt-backend.md) merge (cần đoạn thật). Sinh viên có thể bổ sung tài liệu thử công khai
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: — (khung đánh giá là kết quả cam kết trong đề cương; kế hoạch chuẩn bị 18/11/2026, chờ CTO chọn phương án so sánh mô hình A/B/C)
SHA cơ sở: `origin/develop` @ SHA khi bắt đầu
PR: Không — tài liệu TL

## Mục tiêu
Đề cương cam kết "khung đánh giá: bộ câu hỏi–đáp tiếng Việt mẫu cùng các chỉ số đo độ chính xác truy hồi và chất lượng câu trả lời; có so sánh giữa một số mô hình embedding". Task này lập bộ dữ liệu và quy trình. Script chạy ở SE-017. Kết quả dùng để chọn `RAG_MIN_SCORE` (TL-008).

## Phạm vi
- **Làm:**
  - 5–10 tài liệu công khai tiếng Việt.
  - 30–50 câu hỏi có căn cứ, gắn nhãn đoạn đúng, cộng 10 câu ngoài tài liệu.
  - Chỉ số và rubric.
  - Danh sách mô hình embedding so sánh.
- **Không làm:** tài liệu nội bộ/nhạy cảm; đánh giá tải.

## Kế hoạch bộ dữ liệu (TL chuẩn bị 18/11/2026)
- **Nguồn (chỉ công khai, ghi giấy phép):**
  - Bài Wikipedia tiếng Việt (CC BY-SA 4.0, ghi nguồn).
  - Văn bản quy phạm pháp luật công khai (không thuộc đối tượng bảo hộ quyền tác giả theo Luật SHTT Điều 15).
  - Tài liệu TL tự soạn mô phỏng quy trình nội bộ (ví dụ: nghỉ phép, công tác phí), không chứa dữ liệu thật.
  - Mỗi tài liệu dài 5.000–60.000 ký tự để có cả câu hỏi một đoạn và nhiều đoạn.
- **Tệp dữ liệu (dự kiến):** `docs/evaluation/rag-dataset/`. Tài liệu `.txt` + `questions.jsonl`, mỗi dòng có:
  - `id`, `question`;
  - `type`: `single` / `multi` / `out_of_scope`;
  - `gold`: danh sách `{file, chunkIndex}`;
  - `answer_points`: các ý bắt buộc.
  - Nhãn đoạn theo **tên tệp + `chunkIndex`** (không theo `documentId`, vì id đổi mỗi lần tải lên). Việc chia đoạn tất định với `DOCUMENT_CHUNK_SIZE/OVERLAP` hiện tại; đổi tham số thì gắn nhãn lại.
- **Cơ cấu câu hỏi:**
  - 30–50 câu có căn cứ: khoảng 70% một đoạn, 30% cần ≥ 2 đoạn; có câu dùng từ đồng nghĩa / diễn đạt khác với văn bản.
  - 10 câu ngoài tài liệu, trong đó 3 câu "gần chủ đề" dễ bịa.
- **Chỉ số (định nghĩa tái lập được):**
  - Truy hồi: **hit@k** (k = 1, 3, 5) = tỷ lệ câu có ≥ 1 đoạn gold trong top-k; **MRR** = trung bình 1/rank của đoạn gold đầu tiên (0 nếu không có trong top-k).
  - Từ chối: **refusal accuracy** = tỷ lệ câu ngoài tài liệu trả đúng câu từ chối; **false refusal** = tỷ lệ câu có căn cứ bị từ chối.
  - Trích dẫn: **citation precision** = trích dẫn trỏ vào đoạn gold / tổng trích dẫn; **citation coverage** = câu trả lời có ≥ 1 trích dẫn gold.
  - Chất lượng câu trả lời: **rubric 0–2** cho mỗi câu (2 = đủ `answer_points`, không thông tin ngoài nguồn; 1 = thiếu ý hoặc có chi tiết không kiểm chứng được; 0 = sai/bịa). TL chấm tay trên mẫu ≥ 20 câu; không dùng LLM-chấm làm kết quả chính.
- **Chọn `RAG_MIN_SCORE`:** vẽ phân bố điểm của đoạn top-1 cho câu có căn cứ và câu ngoài tài liệu, chọn ngưỡng giảm câu bịa mà không tăng false refusal quá 5 điểm phần trăm. Có thể kết luận "không đặt ngưỡng" nếu hai phân bố chồng lấn.

## Tính khả thi so sánh mô hình embedding (để CTO quyết)
| Phương án | Chi phí | RAM/CPU | Quyền / cài đặt | Ảnh hưởng dữ liệu |
|---|---|---|---|---|
| **A (đề xuất)** `text-embedding-3-small` vs `text-embedding-3-large` (OpenAI) | Bộ dữ liệu ~10 tài liệu × ≤ 60k ký tự ≈ ≤ 200k token: **dưới 0,05 USD** cho cả hai mô hình (large: 0,13 USD / 1M token) | Không | Project OpenAI hiện **chỉ có quyền `-small`** (`-large` trả `403 model_not_found`, TL kiểm 17/11) → CTO cấp thêm quyền `-large` | Collection riêng `document_chunks_eval_3large` (3072 chiều); collection sản phẩm không đổi |
| B `text-embedding-3-small` vs `bge-m3` qua Ollama (chạy máy dev) | 0 USD | Mô hình ~1,2 GB; RAM ~2–3 GB khi chạy. Máy dev 15,8 GB, **trống ~4 GB** khi đang chạy Docker + app (đo 18/11) → chật, phải tắt web khi chạy | Cài Ollama (chưa có) + tải mô hình → **cần CTO duyệt cài runtime** | Collection riêng 1024 chiều |
| C Cả A và B | như A + B | như B | như A + B | 2 collection đánh giá |

Phương án đơn giản nhất: **A**. Không cài thêm gì; script SE-017 chỉ đổi tên mô hình + collection. B cho thêm góc "mô hình mở chạy nội bộ" nhưng tốn RAM và cài đặt.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Mỗi tài liệu có nguồn công khai, giấy phép dùng được | Bảng nguồn |
| AC2 | Mỗi câu hỏi có đoạn đúng (tệp + `chunkIndex`) đối chiếu được trên Qdrant sau khi tải lên `develop` | Truy vấn |
| AC3 | Định nghĩa chỉ số và cách tính rõ, tái lập được | Đọc tài liệu |
| AC4 | CTO/khách hàng duyệt | Review |

## Việc TL làm được ngay (không chờ SE)
Chọn và tải tài liệu công khai, viết câu hỏi + `answer_points`. Gắn nhãn `chunkIndex` sau khi SE-011 merge: tải lên `develop` và đọc `chunkIndex` từ Qdrant.

## Kết quả review
Chưa bắt đầu.

## Lịch sử review

## Phản hồi UI
Không áp dụng.
