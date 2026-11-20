# TL chấm tay — `text-embedding-3-small` (SE-017 Review vòng 2)

Người chấm: TL · 20/11/2026 · Nguồn: `results-text-embedding-3-small-answers-2026-11-19T18-11-00-864Z.json` (LLM `gpt-5.4-mini`) và văn bản đoạn đọc từ collection `document_chunks_eval_text-embedding-3-small`.

Rubric (TL-009): **2** = đủ `answer_points`, không có thông tin ngoài nguồn; **1** = thiếu ý hoặc có chi tiết không kiểm chứng được; **0** = sai, bịa hoặc từ chối nhầm.
Cột "Trích dẫn hỗ trợ" = số trích dẫn mà đoạn được trích thực sự chứa dữ kiện câu trả lời dùng / tổng trích dẫn (TL đọc đoạn). Cột "Trúng gold" = số liệu của script.

## Tổng hợp

| Chỉ số | Giá trị |
|---|---|
| Rubric trung bình (40 câu có căn cứ) | **1,70 / 2** |
| Điểm 2 / 1 / 0 | 31 (77,5%) / 6 (15,0%) / 3 (7,5%) |
| Câu trả lời có dữ kiện ngoài nguồn (hallucination) | **0 / 37** câu đã trả lời |
| Trích dẫn hỗ trợ đúng dữ kiện (TL chấm) | **43 / 43** |
| Trích dẫn trúng gold (script) | 35 / 43 = 81,4% — giới hạn dưới, xem "Trích dẫn không trúng gold" |
| Từ chối đúng câu ngoài tài liệu | 10 / 10 |
| Độ trễ trả lời (tuần tự) | p50 1,35 s · p95 2,06 s · max 2,30 s |
| Chi phí LLM 50 câu | ≈ $0,080 (94.654 vào × $0,75/1M + 1.975 ra × $4,50/1M) |

## Từng câu

| Câu | Loại | Điểm | Trích dẫn hỗ trợ | Trúng gold | Ghi chú |
|---|---|---|---|---|---|
| q01 | single | 0 | — | — | Từ chối nhầm; đoạn đúng (#0, chứa "14 ngày… nguyên lương") ở hạng 3 |
| q02 | single | 2 | 1/1 | 1/1 | |
| q03 | single | 2 | 1/1 | 1/1 | |
| q04 | single | 2 | 1/1 | 1/1 | |
| q05 | single | 2 | 1/1 | 1/1 | |
| q06 | single | 1 | 1/1 | 1/1 | Thiếu ý "không trừ phép năm" |
| q07 | single | 2 | 1/1 | 1/1 | |
| q08 | single | 1 | 1/1 | 1/1 | Thiếu ý "quản lý duyệt trước 1 ngày làm việc" |
| q09 | single | 0 | — | — | Từ chối nhầm; đoạn #0 ghi rõ thực tập sinh không thuộc phạm vi, ở hạng 2 |
| q10 | single | 2 | 1/1 | 1/1 | |
| q11 | single | 2 | 1/1 | 1/1 | |
| q12 | single | 2 | 1/1 | 1/1 | Suy luận đúng từ ngưỡng 300 km |
| q13 | single | 2 | 1/1 | 1/1 | |
| q14 | single | 2 | 1/1 | 1/1 | Xếp Đà Nẵng vào "tỉnh, thành phố khác" — đúng |
| q15 | single | 2 | 1/1 | 1/1 | |
| q16 | single | 1 | 1/1 | 1/1 | Thiếu ý "quá 30 ngày không được thanh toán" (có trong đoạn được trích) |
| q17 | single | 2 | 1/1 | 1/1 | |
| q18 | single | 2 | 1/1 | 1/1 | |
| q19 | single | 2 | 1/1 | 1/1 | |
| q20 | single | 2 | 1/1 | 1/1 | |
| q21 | single | 2 | 1/1 | 1/1 | |
| q22 | single | 2 | 1/1 | 1/1 | |
| q23 | single | 1 | 1/1 | 0/1 | Thiếu ý "từ áo ngũ thân"; đoạn #6 chứa "Cát Tường… áo dài Lemur… 1934" |
| q24 | single | 2 | 1/1 | 1/1 | |
| q25 | single | 2 | 1/1 | 1/1 | |
| q26 | single | 1 | 2/2 | 0/2 | Thiếu ý "989 đảo có tên"; #1 và #57 đều ghi "1.969 hòn đảo" |
| q27 | single | 2 | 2/2 | 1/2 | #58 và #4 đều ghi năm 1994 |
| q28 | single | 2 | 1/1 | 1/1 | |
| q29 | single | 2 | 1/1 | 1/1 | |
| q30 | single | 2 | 1/1 | 1/1 | |
| q31 | single | 1 | 2/2 | 1/2 | Thiếu ý "bài thơ Lộ nhập Vân Đồn"; #4 và #75 đều nêu Nguyễn Trãi |
| q32 | single | 2 | 2/2 | 1/2 | #21 và #0 đều ghi 15,7 triệu (2024) |
| q33 | single | 2 | 1/1 | 1/1 | |
| q34 | single | 2 | 1/1 | 1/1 | |
| q35 | multi | 2 | 2/2 | 2/2 | Tính đúng 14 + 2 = 16 |
| q36 | multi | 2 | 1/1 | 1/1 | Tính đúng 3.600.000 và 900.000 |
| q37 | multi | 0 | — | — | Từ chối nhầm; đoạn đúng ở hạng 2 |
| q38 | multi | 2 | 2/2 | 0/2 | Nêu 3 lần công nhận (1994, 2000, 2023); `answer_points` chỉ ghi 2 — nguồn #63 có lần 3, câu trả lời đúng theo nguồn |
| q39 | multi | 2 | 1/1 | 1/1 | |
| q40 | multi | 2 | 1/1 | 1/1 | |
| o01–o10 | out_of_scope | — | 0 | — | Cả 10 từ chối đúng bằng câu cố định |

## Trích dẫn không trúng gold

Cả 8 trích dẫn script tính là sai (q23, q26 ×2, q27, q31, q32, q38 ×2) đều trỏ vào đoạn **có chứa** dữ kiện được trích. Nguyên nhân: nhãn gold mỗi câu chỉ có một đoạn, trong khi cùng dữ kiện xuất hiện ở nhiều đoạn của bài Wikipedia (ví dụ số đảo vịnh Hạ Long ở #1, #9, #57). Không có trường hợp trích dẫn trỏ sai nội dung trong lần chạy này. Sửa ở TL-009 (nhãn nhiều gold).

## Giới hạn

- Một người chấm (TL), không có người chấm thứ hai để đo độ đồng thuận.
- Chạy một lượt, không có lịch sử hội thoại: chưa đo `[n]` của lượt trước.
- Chi phí embedding là ước lượng (script không ghi token embedding); giá LLM tra trang model OpenAI ngày 20/11/2026.
