# SE-017 — Script đánh giá RAG và so sánh mô hình embedding

Trạng thái: Chờ Review — phần `text-embedding-3-small` đã nghiệm thu và merge (PR #33 → `09fbcff`); phần `text-embedding-3-large` **bị chặn** (chờ CTO xác nhận quyền API). Chưa `Done` vì AC2 yêu cầu bảng cho từng mô hình (TL đính chính 20/11/2026, [Review vòng 2](#review-vòng-2))
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 2 ngày làm việc
Phụ thuộc (gate): [TL-009](TL-009-rag-evaluation-dataset.md) duyệt **và** [SE-014](SE-014-rag-qa-backend.md) merge (cả hai chặn); phương án mô hình CTO chọn (A cần quyền `text-embedding-3-large`)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 20/11/2026 · bàn giao review — 20/11/2026 · hoàn tất — 20/11/2026 (phần `-small`)
Chốt: 18/11/2026 — CTO chọn phương án A (`text-embedding-3-small` vs `text-embedding-3-large`); chạy `-large` chỉ sau khi xác nhận quyền API. TL-009 Done 18/11/2026; SE-014 merge 19/11 (`124ccee`). **CTO 19/11/2026:** được chạy `text-embedding-3-small`; **chưa chạy `-large`** khi quyền chưa xác nhận; không đổi phương án/mô hình mặc định; ghi rõ phần xong / phần bị chặn. TL chuyển `Sẵn sàng` 20/11 (sau SE-016 Done `7ff3c62`)
SHA cơ sở: `origin/develop` @ `7ff3c62`
PR: https://github.com/duong2604/cat_gpt/pull/33 (head `bed18f8`, merge `09fbcff`)

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
**TL 20/11/2026: phần `text-embedding-3-small` đạt, đã merge.** [PR #33](https://github.com/duong2604/cat_gpt/pull/33) · SHA đã review `bed18f8` · merge vào `develop` @ `09fbcff`. Phần `text-embedding-3-large` (AC2 cột mô hình 2) **bị chặn** theo chỉ thị CTO 19/11. Khi CTO xác nhận quyền, chạy `RAG_EVAL_PERMISSION_CONFIRMED=yes node scripts/rag-eval.mjs --model text-embedding-3-large` và bổ sung bảng so sánh (vòng mới của task này). Chi tiết: [Review vòng 1](#review-vòng-1).

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

#### Review vòng 1
**Task** — SE-017 · PR https://github.com/duong2604/cat_gpt/pull/33 · SHA đã review `bed18f8` · vòng 1
**Kết luận** — Đạt cho phần `text-embedding-3-small`; merge bằng `--match-head-commit bed18f8` → `develop` @ `09fbcff`. Phần `-large` bị chặn (không phải lỗi bàn giao).
**Checklist** (TL kiểm trên tệp kết quả đã commit + Qdrant + code; TL không chạy lại script vì script đọc `apps/api/.env` của thư mục SE)
- [x] AC1 lặp lại — Đạt — 3 tệp truy hồi (hai lượt trong mỗi tiến trình, ba tiến trình) cùng hash xếp hạng `155ffd12cfca6dc5`, cùng hit@5 0,925, MRR 0,758.
- [x] AC2 (mô hình 1) — Đạt — `-small`: hit@1 65,0%, hit@3 85,0%, hit@5 92,5%, MRR 0,758; từ chối đúng 10/10; từ chối nhầm 3/40 (q01, q09, q37); precision trích dẫn 35/43 = 81,4%; coverage 85%. TL đọc tệp `answers`: số liệu khớp, 0 câu bị cắt. **Mô hình 2: bị chặn** (guard `RAG_EVAL_PERMISSION_CONFIRMED`, ném lỗi trước mọi lệnh gọi mạng; TL đọc code).
- [x] AC3 — Đạt — token 94.654 vào / 1.975 ra; truy hồi 11–12 s / 50 câu; trả lời 70,5 s.
- [x] AC4 — Đạt — collection sản phẩm `document_chunks` 0 trước / 0 sau (trong tệp kết quả + TL xem Qdrant). Không có diff ở `apps/api/src`, `apps/web`, `packages`. Không có secret trong script/kết quả. typecheck/lint xanh, api test 83/83, CI `build` SUCCESS. Collection đánh giá `document_chunks_eval_text-embedding-3-small` được giữ, tên rõ (CP4).
- [x] Nhãn gold — Chấp nhận cách SE tính lại theo `evidence`. TL xác nhận số đoạn script (wiki-pho 33, wiki-vinh-ha-long 77, noi-bo-nghi-phep 4) khớp số đoạn sản phẩm TL tự đo khi review SE-015/016. Nhãn `chunkIndex` của TL-009 (209 đoạn) đã cũ → **việc của TL**: cập nhật nhãn TL-009 (không chặn SE-017).

**Ghi nhận cho TL/CTO (không chặn):**
- Bước trả lời gọi `responses.create` trực tiếp (không stream) với cùng prompt (`LLM_SYSTEM_PROMPT` + `buildRagSystemPrompt`, nối `\n\n` như `OpenAiLlmProvider`) và `verifyCitations` của sản phẩm; không qua `RagService.prepare()` vì tài liệu đánh giá không nằm trong Mongo. Truy hồi dùng `VectorStoreService.search` như `prepare()`.
- `RAG_MIN_SCORE`: điểm top-1 chồng lấn (có căn cứ 0,464–0,749; ngoài tài liệu 0,260–0,599). Mọi ngưỡng đều đổi lấy từ chối nhầm → TL đề xuất **giữ để trống** (prompt + câu từ chối đã đạt 10/10 câu ngoài tài liệu); CTO quyết.
- Chưa đo: `[n]` của lượt trước (cần kịch bản nhiều lượt), rubric 0–2.

**Dọn nhánh sau merge** — chờ SE chuyển khỏi nhánh; TL xóa remote.
**Trạng thái** — Done (phần `-small`); phần `-large` bị chặn.

#### Review vòng 2
**Task** — SE-017 · PR https://github.com/duong2604/cat_gpt/pull/33 (đã merge) · `develop` @ `09fbcff` · vòng 2 (TL, 20/11/2026, theo chỉ thị CTO 20/11: chất lượng câu trả lời, chi phí, ca hallucination/trích dẫn sai)
**Kết luận** — Phần `-small` đủ các chỉ số CTO yêu cầu (bổ sung bằng chấm tay của TL, không cần SE làm thêm). **Đính chính trạng thái:** vòng 1 ghi "Done (phần `-small`)" — không đúng workflow mục 4 (`Done` cần mọi tiêu chí đạt; AC2 cần bảng cho từng mô hình). Chuyển về **`Chờ Review`, bị chặn bởi quyền `text-embedding-3-large`**. Khi CTO xác nhận quyền: SE chạy `-large` (vòng 3), TL review bảng so sánh rồi `Done`. Nếu CTO bỏ yêu cầu so sánh: TL ghi quyết định vào `Chốt:` và chuyển `Done`.
**Checklist** (TL kiểm trên tệp `results-text-embedding-3-small-answers-…T18-11-00-864Z.json` + văn bản đoạn lấy từ collection đánh giá `document_chunks_eval_text-embedding-3-small`; chi tiết từng câu: [`TL-REVIEW-text-embedding-3-small.md`](../evaluation/rag-dataset/results/TL-REVIEW-text-embedding-3-small.md))
- [x] Chất lượng câu trả lời (rubric 0–2 của TL-009, TL chấm tay **40/40** câu có căn cứ, ≥ 20 theo TL-009) — điểm 2: 31 (77,5%); điểm 1: 6 (q06, q08, q16, q23, q26, q31 — đúng nhưng thiếu một ý `answer_points`); điểm 0: 3 (q01, q09, q37 — từ chối nhầm). Trung bình **1,70/2**.
- [x] Hallucination — **0/37** câu đã trả lời có dữ kiện không nằm trong đoạn được trích. 10/10 câu ngoài tài liệu từ chối đúng, không bịa.
- [x] Trích dẫn sai — 8/43 trích dẫn "không trúng gold" (q23, q26 ×2, q27, q31, q32, q38 ×2). TL đọc từng đoạn: **cả 8 đoạn đều chứa dữ kiện được trích** (ví dụ q26 trích #1 và #57, cả hai ghi "1.969 hòn đảo"). Precision theo đoạn hỗ trợ (TL chấm tay) = **43/43**; 81,4% là giới hạn dưới do nhãn gold chỉ ghi một đoạn trong khi dữ kiện lặp ở nhiều đoạn. → việc TL-009 (nhãn nhiều gold).
- [x] Độ trễ — trả lời tuần tự 50 câu: p50 1,35 s, p95 2,06 s, max 2,30 s (tổng 70,5 s); truy hồi 50 câu 11–12 s.
- [x] Chi phí — LLM `gpt-5.4-mini`: 94.654 token vào × $0,75/1M + 1.975 token ra × $4,50/1M = **≈ $0,080 / 50 câu (≈ $0,0016/câu)**, giá theo [trang model OpenAI](https://developers.openai.com/api/docs/models/gpt-5.4-mini) tra 20/11/2026. Embedding: script không ghi token; tài liệu + câu hỏi ≈ 146 nghìn ký tự → **< $0,01** với `text-embedding-3-small` (ước lượng, không phải số đo).
- [x] Collection đánh giá riêng — `document_chunks_eval_text-embedding-3-small` 175 point; `document_chunks` (sản phẩm) không bị ghi (vòng 1).
- [ ] So sánh mô hình 2 — **bị chặn**: chờ CTO xác nhận quyền `text-embedding-3-large`. Không gọi mô hình này.

**Phát hiện cho TL-009 (việc của TL, vòng mới TL-009):** (1) nhãn `chunkIndex` cũ không khớp chunker hiện tại (22/50); (2) nhãn chỉ một gold/câu trong khi dữ kiện lặp ở nhiều đoạn → precision trích dẫn bị tính thấp; (3) q38 `answer_points` ghi 2 lần UNESCO công nhận, nguồn có lần thứ 3 (2023) — câu trả lời nêu 3 lần là đúng theo nguồn.
**Phát hiện chất lượng (chưa có task, đề xuất sau nghiệm thu M4):** 3 câu từ chối nhầm dù đoạn đúng nằm trong top-3 (q01 hạng 3, q09 và q37 hạng 2) — prompt RAG thiên về từ chối; câu trả lời hay bỏ ý phụ (6 câu điểm 1).
**Trạng thái** — `Chờ Review` (phần `-large` bị chặn).

#### Review vòng 3
**Task** — SE-017 · `develop` @ `b2d2098` · vòng 3 (TL, 21/11/2026, theo quyết định CTO 20/11: chưa cấp quyền `-large`; sửa nhãn TL-009 nhiều nguồn; chạy lại đánh giá; không đổi code sản phẩm)
**Kết luận** — Phần `text-embedding-3-small` đạt trên nhãn v2. Giữ **`Chờ Review`, bị chặn** bởi quyền `text-embedding-3-large` (AC2 cột mô hình 2). Không có việc cho SE ở vòng này.
**Đính chính vòng 1–2:** "nhãn TL-009 cũ, 22/50 lệch, chunker hiện tại cho 175 đoạn" là **sai nguyên nhân**. Chunker không đổi; lượt 19/11 chạy trên bản checkout CRLF (`core.autocrlf=true`), làm ranh giới đoạn đổi (175 thay vì 209). Trên tài liệu LF (nội dung repo), nhãn TL-009 vòng 1 khớp 100%. Chỉ số 19/11 vì vậy đo trên văn bản khác với repo. Biện pháp: `.gitattributes` ép LF cho tài liệu đánh giá ([TL-009 vòng 2](TL-009-rag-evaluation-dataset.md#checklist-vòng-2)).
**Checklist** (bảng đầy đủ: [TL-RERUN-2026-11-21.md](../evaluation/rag-dataset/results/TL-RERUN-2026-11-21.md))
- [x] AC1 lặp lại — Đạt — 2 lượt cùng hash `52d2f7346de0caae`.
- [x] AC2 `text-embedding-3-small` — Đạt — nhãn v2: hit@1 80,0%, hit@3 97,5%, hit@5 100%, MRR 0,881; từ chối đúng 10/10; từ chối nhầm 1/40 (q09); precision trích dẫn 95,7% (45/47), TL đọc đoạn 46/47 hỗ trợ đúng. Tách tác động: riêng sửa CRLF→LF với nhãn v1 cho hit@5 97,5%, MRR 0,798, precision 80,9%.
- [ ] AC2 `text-embedding-3-large` — **Bị chặn** — CTO 20/11/2026 chưa cấp quyền. Không gọi mô hình này.
- [x] AC3 — Đạt — 87.713 / 1.846 token; ≈ $0,074 / 50 câu; trả lời p50 1,30 s, p95 1,72 s.
- [x] AC4 — Đạt — `document_chunks` 0 trước / 0 sau; collection đánh giá 209/209 point; không đổi code sản phẩm hay script.
- [x] Chất lượng câu trả lời (TL chấm tay 40 câu) — rubric 1,78/2 (32 / 7 / 1); 1 khẳng định không có căn cứ (q38 "2 lần", nguồn có 3); 0 dữ kiện bịa ngoài tài liệu.
**Trạng thái** — `Chờ Review` (phần `-large` bị chặn).

## Phản hồi UI
Không áp dụng.
