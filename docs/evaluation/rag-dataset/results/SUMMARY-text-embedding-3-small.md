# Kết quả đánh giá RAG — `text-embedding-3-small` (SE-017)

Bộ dữ liệu: TL-009 (6 tài liệu, 50 câu: 34 single, 6 multi, 10 out_of_scope; 40 câu có căn cứ).
Nhãn gold: tính lại từ `evidence` trên chunker hiện tại (chunkText 1000/150). Lý do: 22/50 câu có `chunkIndex` cũ không chứa bằng chứng — bộ chia đoạn của README TL-009 không khớp chunker hiện tại (số đoạn: wiki-pho 38 vs 33, wiki-vinh 94 vs 77, wiki-ao-dai 32 vs 27, wiki-dong-bang 37 vs 31, noi-bo-cong-tac-phi 4 vs 3, noi-bo-nghi-phep 4 vs 4).
Đối chiếu bộ dữ liệu gốc không sửa; nhãn cũ chỉ để ghi nhận.

## CP1 — Nạp collection đánh giá

| Mục | Kết quả |
|---|---|
| Collection | `document_chunks_eval_text-embedding-3-small` (riêng cho đánh giá) |
| Số point / số đoạn dự kiến | 175 / 175 |
| Collection sản phẩm `document_chunks` trước / sau | 0 / 0 (không đổi) |
| Thời gian nạp | 4.3 s |
| Tệp | `results-text-embedding-3-small-ingest-2026-11-19T18-08-29-345Z.json` |

## CP2 — Truy hồi (hit@k, MRR)

| Chỉ số | Giá trị |
|---|---|
| hit@1 | 65.0% |
| hit@3 | 85.0% |
| hit@5 | 92.5% |
| MRR (top-5) | 0.758 |
| Lặp lại (cùng dữ liệu, cùng mô hình) | Giống nhau trong cùng một lần chạy (hash 155ffd12cfca6dc5) |
| Lặp lại giữa hai tiến trình độc lập | Cùng hash `155ffd12cfca6dc5` với lần chạy trước (xem log) |
| Thời gian truy hồi 50 câu (lượt 1 / lượt 2) | 11.8 s / 11.3 s |
| Tệp | `results-text-embedding-3-small-retrieval-2026-11-19T18-12-12-287Z.json` |

**Phân bố điểm top-1 (cosine):**

| Nhóm | min | p25 | median | p75 | max |
|---|---|---|---|---|---|
| Có căn cứ (40) | 0.464 | 0.551 | 0.608 | 0.671 | 0.749 |
| Ngoài tài liệu (10) | 0.260 | 0.356 | 0.470 | 0.544 | 0.599 |

**Tỷ lệ theo ngưỡng (để TL đề xuất `RAG_MIN_SCORE`; chưa đổi cấu hình):** cột 2 = câu có căn cứ bị loại (điểm < ngưỡng); cột 3 = câu ngoài tài liệu vẫn đi tiếp tới LLM (điểm ≥ ngưỡng).

| Ngưỡng | Có căn cứ bị loại | Ngoài tài liệu đi tiếp |
|---|---|---|
| 0.40 | 0.0% (0/40) | 60.0% (6/10) |
| 0.45 | 0.0% (0/40) | 60.0% (6/10) |
| 0.50 | 5.0% (2/40) | 40.0% (4/10) |
| 0.55 | 22.5% (9/40) | 20.0% (2/10) |
| 0.60 | 45.0% (18/40) | 0.0% (0/10) |

Hai phân bố chồng lấn (top-1 của nhóm ngoài tài liệu kéo tới 0.599, nhóm có căn cứ thấp tới 0.464). Theo TL-009, có thể kết luận "không đặt ngưỡng" nếu chồng lấn; quyết định thuộc TL/CTO.

## CP3 — Trả lời qua pipeline RAG của sản phẩm + LLM

LLM: `gpt-5.4-mini` (cấu hình .env, `LLM_MAX_OUTPUT_TOKENS` giữ nguyên). Prompt hệ thống mặc định của sản phẩm + `buildRagSystemPrompt` của sản phẩm; trích dẫn kiểm bằng `RagService.verifyCitations` của sản phẩm.

| Chỉ số | Giá trị |
|---|---|
| Từ chối đúng (out_of_scope) — refusal accuracy | 100.0% (10/10) |
| Từ chối nhầm câu có căn cứ — false refusal | 7.5% (3/40) |
| Precision trích dẫn (trỏ vào đoạn gold / tổng trích dẫn) | 81.4% (35/43) |
| Coverage trích dẫn (câu có căn cứ có ≥1 trích dẫn gold) | 85.0% |
| Token đầu vào / đầu ra (50 câu) | 94654 / 1975 |
| Thời gian (50 câu, tuần tự) | 70.5 s |
| Tệp | `results-text-embedding-3-small-answers-2026-11-19T18-11-00-864Z.json` |

Các câu có căn cứ bị từ chối nhầm: q01 (hạng gold đầu: 3); q09 (hạng gold đầu: 2); q37 (hạng gold đầu: 2).

**q01 ("Nhân viên chính thức được nghỉ phép năm bao nhiêu ngày?"):** từ chối (`insufficientEvidence`, trích dẫn 0). Đoạn gold đầu tiên ở hạng 3 trong top-5 (truy hồi đúng ở mức top-5, chưa ở top-1). Câu trả lời: "Tôi không tìm thấy thông tin này trong các tài liệu đã chọn.". Lỗi là ở bước sinh câu trả lời khi bằng chứng không ở hạng 1, không phải vì thiếu đoạn trong top-5.

**Hiện tượng `[n]` của lượt trước trong lịch sử (SE-014):** không đo trong script này — script chỉ chạy một lượt, không có lịch sử hội thoại. Cần kịch bản nhiều lượt riêng nếu TL muốn đo.

## CP4 — Mô hình so sánh

| Mô hình | Trạng thái | hit@5 | MRR | Từ chối đúng | Từ chối nhầm | Precision trích dẫn |
|---|---|---|---|---|---|---|
| `text-embedding-3-small` | Đã chạy (CP1–CP3) | 92.5% | 0.758 | 100.0% | 7.5% | 81.4% |
| `text-embedding-3-large` | **Bị chặn: chờ xác nhận quyền API** (CTO 19/11/2026) | — | — | — | — | — |

Script từ chối chạy `text-embedding-3-large` khi chưa có `RAG_EVAL_PERMISSION_CONFIRMED=yes` (đã kiểm: lỗi ném ra trước mọi lệnh gọi mạng).

## Giới hạn
- Số câu nhỏ (40 có căn cứ, 10 ngoài tài liệu): mỗi câu sai thay đổi tỷ lệ ~2,5 điểm phần trăm hoặc ~10 điểm phần trăm.
- Chỉ một mô hình embedding; mô hình thứ hai bị chặn.
- Nhãn gold tính lại theo bằng chứng; nhãn cũ của TL-009 không khớp chunker hiện tại (xem đầu tệp).
- Chạy LLM không stream (`responses.create`) để đọc được token; nội dung trả lời tương đương luồng stream của sản phẩm.
- Không chấm rubric 0–2 (answer_points) trong vòng này; không dùng LLM làm kết quả chính.
- Dữ liệu chỉ là tài liệu công khai và tài liệu mô phỏng của TL-009.
