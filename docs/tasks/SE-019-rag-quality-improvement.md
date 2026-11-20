# SE-019 — Cải thiện chất lượng RAG (từ chối nhầm, độ đầy đủ, trích dẫn)

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 2 ngày làm việc (TL ước lượng, xem lại khi chuyển `Sẵn sàng`)
Phụ thuộc: **CTO nghiệm thu trực tiếp M1–M4 xong** (CTO 20/11/2026: làm sau nghiệm thu); [TL-009](TL-009-rag-evaluation-dataset.md) vòng 2 được duyệt (bộ nhãn dùng để đo trước/sau); [SE-018](SE-018-dependency-security-patch.md) merge (không làm song song trên cùng phần phụ thuộc)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 20/11/2026 — CTO cho phép TL tạo task và acceptance criteria; **chưa triển khai, chưa đổi production** cho tới khi gate đạt và TL chuyển `Sẵn sàng`
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Đánh giá TL-009 cho thấy RAG đúng và có căn cứ (0 dữ kiện bịa, 10/10 từ chối đúng câu ngoài tài liệu), nhưng còn: từ chối nhầm câu có căn cứ (3/40 lượt 19/11, 1/40 lượt 21/11) dù đoạn đúng nằm trong top-3; câu trả lời bỏ ý phụ (7/40 điểm rubric 1); có trường hợp khẳng định sai do thiếu ngữ cảnh (q38 "2 lần" khi nguồn có 3 lần). Task này nghiên cứu và chứng minh bằng số liệu trước/sau trên cùng bộ dữ liệu, rồi mới đổi hành vi sản phẩm.

## Output
- Báo cáo `docs/evaluation/rag-dataset/results/SE-019-<ngày>.md`: bảng trước/sau, từng giả thuyết, từng câu thay đổi.
- Nếu có thay đổi được chọn: PR nhắm `develop` chứa đúng thay đổi đó + kết quả `rag-eval.mjs` sau thay đổi.

## Phạm vi
- **Làm (nghiên cứu, đo):**
  - Mốc trước: chạy `rag-eval.mjs --model text-embedding-3-small` trên `develop` lúc nhận task, nhãn TL-009 hiện hành, tài liệu LF. Ghi SHA, nhãn, cấu hình.
  - Giả thuyết H1 — prompt (`apps/api/src/modules/rag/rag-prompt.ts`): hướng dẫn trả lời khi bằng chứng không ở hạng 1, nêu đủ các ý có trong nguồn, không khẳng định số lượng/tổng khi ngữ cảnh có thể chưa đủ.
  - Giả thuyết H2 — ký tự xuống dòng: chuẩn hóa CRLF → LF trước `chunkText` (tệp CRLF cho 175 đoạn thay vì 209 và chỉ số thấp hơn, xem [TL-RERUN-2026-11-21](../evaluation/rag-dataset/results/TL-RERUN-2026-11-21.md)). Đo trên cả bản LF và CRLF của bộ tài liệu.
  - Đánh giá citation grounding: mỗi trích dẫn có hỗ trợ dữ kiện được trích không (TL chấm tay; script giữ precision theo gold).
  - Mỗi giả thuyết đo **riêng** (đổi một thứ mỗi lượt), ≥ 2 lượt LLM cho mỗi cấu hình để thấy dao động.
- **Không làm:** đổi mô hình embedding hoặc gọi `text-embedding-3-large` (chưa có quyền); đặt `RAG_MIN_SCORE` (CTO 20/11 giữ trống); đổi `LLM_MAX_OUTPUT_TOKENS`; sửa nhãn TL-009 (việc của TL); sửa code chỉ để tăng chỉ số mà không cải thiện hành vi thật; thay đổi ngoài module `rag` / bước chia đoạn mà không được TL duyệt.

## Nguồn yêu cầu
- Quyết định CTO 20/11/2026 (mục 5: task cải thiện RAG; mục 4: giữ `RAG_MIN_SCORE`).
- Basic Design: [module-4-rag.md mục 6](../design/module-4-rag.md#6-truy-hồi-thiếu-căn-cứ-xác-minh-trích-dẫn), [M4-3](../design/module-4-rag.md).
- Bộ đo: [TL-009](TL-009-rag-evaluation-dataset.md), [SE-017](SE-017-rag-evaluation-script.md).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Có mốc trước và sau trên **cùng** bộ dữ liệu, cùng nhãn, cùng mô hình, cùng `LLM_MAX_OUTPUT_TOKENS`; ghi SHA và cấu hình của mỗi lượt | CTO 20/11 mục 5 | Tệp kết quả + báo cáo |
| AC2 | Từ chối nhầm câu có căn cứ giảm so với mốc trước (trung bình các lượt), **và** từ chối đúng câu ngoài tài liệu giữ 10/10 | CTO 20/11 mục 5 | `rag-eval.mjs` ≥ 2 lượt |
| AC3 | Rubric 0–2 không giảm; số câu điểm 1 do thiếu ý giảm | TL-009 rubric | TL chấm tay 40 câu |
| AC4 | Citation grounding: 0 dữ kiện bịa ngoài tài liệu; số khẳng định không có căn cứ không tăng; precision trích dẫn (theo gold) không giảm | Module 4 mục 6.3 | Script + TL đọc từng trích dẫn ngoài gold |
| AC5 | Mỗi giả thuyết có kết quả riêng (giữ / bỏ) và lý do; thay đổi bị bỏ không nằm trong PR | Phạm vi | Báo cáo |
| AC6 | Không hồi quy sản phẩm: hỏi tài liệu và Chat thường như checklist nghiệm thu M4 (SSE, Dừng, Tạo lại, `insufficientEvidence`, trích dẫn mở đúng đoạn); `api test`, `typecheck`, `lint`, `build`, CI xanh | Quy ước repo | Lệnh + kiểm API/UI |
| AC7 | Không gọi `text-embedding-3-large`; collection sản phẩm không bị ghi; không đổi `RAG_MIN_SCORE` | CTO 19–20/11 | Đếm point trước/sau, diff cấu hình |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q1 | H2 (chuẩn hóa xuống dòng) đổi số đoạn của tài liệu đã tải lên trước đó? | Chỉ áp dụng cho tài liệu tải lên sau khi merge; không xử lý lại tài liệu cũ | Chờ TL khi chuyển `Sẵn sàng` |
| Q2 | Ngưỡng "giảm" ở AC2 khi mốc trước chỉ 1/40 | Báo cáo theo nhiều lượt; nếu mốc trước đã ≤ 1/40 thì AC2 đạt khi không tăng và AC3/AC4 cải thiện | Chờ TL |

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Chưa có.
