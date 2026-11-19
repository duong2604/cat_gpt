# SE-017 — Script đánh giá RAG và so sánh mô hình embedding

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 2 ngày làm việc
Phụ thuộc (gate): [TL-009](TL-009-rag-evaluation-dataset.md) duyệt **và** [SE-014](SE-014-rag-qa-backend.md) merge (cả hai chặn); phương án mô hình CTO chọn (A cần quyền `text-embedding-3-large`)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 20/11/2026 · bàn giao review — · hoàn tất —
Chốt: 18/11/2026 — CTO chọn phương án A (`text-embedding-3-small` vs `text-embedding-3-large`); chạy `-large` chỉ sau khi xác nhận quyền API. TL-009 Done 18/11/2026; còn chờ SE-014 merge
SHA cơ sở: `origin/develop` @ `7ff3c62`
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

### Checklist vòng 1 (CP1–CP4)

Commit theo checkpoint: CP1 `3e68f64` (script `apps/api/scripts/rag-eval.mjs`, nạp collection), CP2 `9f64703` (truy hồi), CP3 `42ef548` (trả lời), CP4 = commit tài liệu này (bảng so sánh + `results/SUMMARY-text-embedding-3-small.md`). Kết quả: `docs/evaluation/rag-dataset/results/`. Chỉ chạy `text-embedding-3-small`; **không gọi `text-embedding-3-large`** (chờ xác nhận quyền API, CTO 19/11/2026).

**Phần đã xong:** CP1–CP3 cho `text-embedding-3-small`. **Phần bị chặn:** cột `text-embedding-3-large` (CP4) — "Bị chặn: chờ xác nhận quyền API". Script có tham số `--model` nhưng từ chối mô hình khác khi chưa có `RAG_EVAL_PERMISSION_CONFIRMED=yes`; đã kiểm bằng lệnh `--model text-embedding-3-large`: lỗi ném ra, không có lệnh gọi mạng.

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| AC1 chạy lại 2 lần cho cùng kết quả truy hồi | Đạt: hai lượt trong một tiến trình và hai tiến trình độc lập cùng hash thứ hạng `155ffd12cfca6dc5` | `results-…-retrieval-…T18-11-33…json`, `…T18-12-12…json` |
| AC2 bảng hit@k, MRR, từ chối, trích dẫn | Đạt (`text-embedding-3-small`): hit@1 65,0%, hit@3 85,0%, hit@5 92,5%, MRR 0,758; từ chối đúng 100% (10/10); từ chối nhầm 7,5% (3/40); precision trích dẫn 81,4% (35/43); coverage 85,0% | `SUMMARY-text-embedding-3-small.md` |
| AC3 token và thời gian | Đạt: 94.654 token vào, 1.975 token ra (50 câu); 70,5 s trả lời tuần tự; truy hồi 50 câu ~11 s | `…answers-…json`, `SUMMARY` |
| AC4 collection sản phẩm không đổi; CI; không đổi hành vi | Đạt: nạp vào `document_chunks_eval_text-embedding-3-small` (175/175 đoạn); collection `document_chunks` 0 trước và 0 sau (hiện không có dữ liệu sản phẩm). Không đổi code sản phẩm, không đổi `EMBEDDING_MODEL` | `…ingest-…json` |

**Phát hiện cần TL quyết định:**
- **Nhãn gold TL-009 không khớp chunker hiện tại:** 22/50 câu có `chunkIndex` không chứa bằng chứng (số đoạn README 38/94/32/37/4/4 so với chunker hiện tại 33/77/27/31/4/3). Script tính gold lại theo bằng chứng `evidence`; không sửa bộ dữ liệu gốc. TL-009 cần xác nhận cách này.
- **q01** (nghỉ phép năm): đoạn gold ở hạng 3 trong top-5 nhưng bị từ chối. Lỗi sinh câu trả lời, không phải truy hồi.
- **Phân bố điểm top-1 chồng lấn:** nhóm có căn cứ 0,464–0,749 (median 0,608); nhóm ngoài tài liệu 0,260–0,599 (median 0,470). Bảng theo ngưỡng trong SUMMARY: ngưỡng 0,50 loại 5,0% câu có căn cứ nhưng vẫn cho 40% câu ngoài tài liệu đi tiếp; ngưỡng 0,55 loại 22,5% câu có căn cứ, 20% câu ngoài tài liệu đi tiếp. Chưa đổi `RAG_MIN_SCORE`.
- **Hiện tượng `[n]` của lượt trước (SE-014):** không đo trong script một lượt; cần kịch bản nhiều lượt riêng nếu cần số liệu.
- **Nhãn của một bản kết quả bị loại:** tệp truy hồi đầu tiên (`…T18-09-00…`) được tạo khi script còn lỗi gold rỗng (hit@k = 0 giả); đã xóa, không dùng số liệu của nó.

**Giới hạn:**
- 40 câu có căn cứ và 10 câu ngoài tài liệu: một câu sai lệch ~2,5 hoặc ~10 điểm phần trăm.
- Chỉ một mô hình embedding; mô hình thứ hai bị chặn.
- Trả lời không stream (`responses.create`) để đọc token; nội dung tương đương luồng của sản phẩm.
- Chưa chấm rubric 0–2 (`answer_points`); chưa dùng LLM làm kết quả chính.
- Chưa đo chuỗi nhiều lượt (lịch sử, `[n]` cũ).

**Dọn dữ liệu:** không có dữ liệu thử trên sản phẩm. Collection đánh giá `document_chunks_eval_text-embedding-3-small` được giữ có tên rõ (CTO/TL có thể xóa khi cần); không ghi vào collection sản phẩm.

## Phản hồi UI
Không áp dụng.
