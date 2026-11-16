# TL-006 — Mốc so sánh, đối chiếu tài liệu, lộ trình Module 3–4 và đề xuất sửa workflow

Trạng thái: Chờ Review — vòng 2 (17/11/2026): W1 đã áp dụng; AC4 đạt; chờ CTO xác nhận
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không (AC4 cần `OPENAI_API_KEY` trong `apps/api/.env` của TL)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 16/11/2026 · bàn giao review 16/11/2026 (vòng 1) · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2 (APPROVED WITH CONDITIONS); giữ nguyên hạn đã chốt, task mới "Không đặt — theo phụ thuộc"; chỉ **đề xuất** sửa workflow và mục lục
SHA cơ sở: `origin/develop` @ `eb1ce4d`
PR: Không — tài liệu TL

## Mục tiêu
Tài liệu trên `develop` phản ánh đúng trạng thái thật và lộ trình Module 3–4 đã duyệt; các đề xuất sửa workflow được ghi rõ để CTO duyệt.

## Output
- [plan.md mục 8](../project/plan.md#8-lộ-trình-module-34-cto-duyệt-16112026) — lộ trình theo phụ thuộc; giữ nguyên mốc demo 20/11.
- [Mục lục task](README.md): thêm TL-006, TL-007, TL-010, SE-010…SE-013; ghi chú trạng thái thật của SE-003 và thứ tự nhận task (phương án 1 SE).
- Sửa chỗ lệch: [ui-release-standards R-6](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) (OpenAI đã tích hợp); [access-control CS-1](../design/access-control.md#4-chính-sách-đã-chốt) (quyền tài liệu Module 3).
- Đề xuất sửa workflow (dưới đây) — **chưa áp dụng**.

## Chỗ lệch đã ghi nhận (audit 16/11/2026)
| # | Chỗ lệch | Xử lý |
|---|---|---|
| 1 | Mục lục và `SE-003…md` trên `develop` ghi `Sẵn sàng`; thực tế PR #6 `Chờ Review` vòng 3, `CONFLICTING`/`DIRTY` @ `df42697` | Ghi chú dưới bảng mục lục; không sửa dòng SE-003 vì PR #6 đang sửa dòng này (tránh thêm xung đột) |
| 2 | R-6 ghi "Chưa có AI thật" | Đã sửa |
| 3 | `plan.md` chỉ có kế hoạch demo Chat | Thêm mục 8 |
| 4 | SE-004/005/006 mang ngày "Dự kiến … chưa duyệt" | **Giữ nguyên** (CTO 16/11: không xóa/đổi hạn đã có); thứ tự nhận task ghi ở mục lục |
| 5 | `llm.provider.ts` chú thích "chưa có LLM thật" | Code — để Senior Dev sửa khi chạm file (không tạo task riêng) |
| 6 | `apps/api/.env` của TL thiếu 6 biến `LLM_*`/`OPENAI_API_KEY`; thư mục Senior Dev thiếu `LLM_HISTORY_TOKEN_BUDGET`, `LLM_SYSTEM_PROMPT` | TL đã bổ sung `.env` của TL (giá trị mẫu, không in giá trị); thư mục Senior Dev → báo Senior Dev tự đồng bộ; SE-010 thêm `pnpm env:check` |

## Đề xuất sửa workflow (CTO duyệt 17/11/2026 — đã áp dụng vào `workflow.md`)
1. **Mục 3.1 — thứ tự nhận task:** thêm mức `P0`; chọn theo **ưu tiên trước**, trong cùng mức thì `Cần sửa` → `Đang làm` → `Sẵn sàng`; cùng mức và cùng trạng thái: theo "Thứ tự nhận task" ở mục lục, rồi ID nhỏ hơn. (Hiện tại `Cần sửa` P2 chen trước `Sẵn sàng` P0; và task có hạn "dự kiến" chen trước task đường găng không đặt hạn.)
2. **Mục 3.1, 5, 11 — hạn:** task mới được ghi "Không đặt — theo phụ thuộc"; cột Tiến độ ghi "vị trí trên đường găng · ước lượng · đã dùng"; đánh giá `Đúng ước lượng` / `Vượt ước lượng`. Hạn đã chốt giữ nguyên.
3. **Mục 6.1 — mẫu bàn giao:** thêm 5 dòng Simplicity First ([engineering-guide mục 1](../project/engineering-guide.md#1-simplicity-first-mọi-task)).
4. **Mục 2.1, 3.2 — hai phiên Senior Dev (khi mở):** ghi "Senior Dev (phiên A/B)"; một bộ Docker dùng chung, mỗi lúc một bộ app chạy; tách dữ liệu bằng `.env` (DB, bucket, collection, `BULLMQ_PREFIX`).
5. **Mục 9.1 — môi trường:** quy định `.env` ↔ `.env.example` và Docker local (CTO 16/11/2026 mục 1–2) dẫn vào workflow.

## Nguồn yêu cầu
- CTO directive 16/11/2026 (audit), CTO vòng 2 mục 10, CTO duyệt Wave 0–2 mục 1–6.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Mục lục, file task, PR không còn lệch không giải thích | CTO audit | Đối chiếu `gh pr list` + mục lục |
| AC2 | `plan.md` có lộ trình theo phụ thuộc; mốc demo 20/11 không đổi | CTO vòng 2 | Đọc |
| AC3 | Không hạn đã chốt nào bị xóa/đổi | CTO vòng 2 mục 10 | `git diff` |
| AC4 | OpenAI thật trên `develop`: `COMPLETED`/`TRUNCATED`/`STOPPED`, lượt Dừng không có usage; chỉ câu hỏi không nhạy cảm | Audit WP-02 | Script SSE + log |
| AC5 | Đề xuất sửa workflow được CTO duyệt hoặc từ chối | CTO vòng 2 mục 10 | Review vòng 1 |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| W1 | Áp dụng 5 đề xuất sửa workflow ở trên | Đồng ý cả 5 | **Duyệt 17/11/2026 (CTO)** |

## Kết quả review
Vòng 1 bàn giao 16/11/2026 — chờ CTO. AC4 chưa chạy.

## Lịch sử review
### Checklist vòng 1
**Task hoặc yêu cầu** — TL-006 · cơ sở `eb1ce4d` · vòng 1
**Kết luận** — Đối chiếu xong, lộ trình và task Wave 0–2 đã ghi; đề xuất workflow chờ duyệt; AC4 chưa chạy.
**Checklist**
- [x] AC1 — 6 chỗ lệch ghi ở bảng trên, đã sửa hoặc có lý do giữ
- [x] AC2 — [plan.md mục 8](../project/plan.md#8-lộ-trình-module-34-cto-duyệt-16112026)
- [x] AC3 — chỉ thêm nội dung; dòng hạn của mọi task cũ không đổi (`git diff` các file task cũ: 0 dòng `Hạn` bị sửa)
- [ ] AC4 — NOT VERIFIED: `apps/api/.env` của TL chưa có `OPENAI_API_KEY` (đã bổ sung tên biến, giá trị trống); chạy khi có khóa
- [ ] AC5 — chờ CTO

**Trạng thái và bước tiếp theo** — Chờ CTO duyệt W1; TL chạy AC4 khi có khóa.


### Checklist vòng 2
**Task hoặc yêu cầu** — TL-006 · cơ sở `c111fd2` · vòng 2
**Kết luận** — W1 áp dụng vào `workflow.md`; AC4 đạt trên đầu PR #6 (`6c941b8` = code `develop` + SE-003, phần OpenAI không đổi).
**Checklist**
- [x] AC5 (W1) — CTO duyệt 17/11/2026; [workflow](../project/workflow.md) mục 3.1 (P0, ưu tiên trước rồi trạng thái, "Thứ tự nhận task", phiên A/B, "Không đặt — theo phụ thuộc"), mục 5 (dòng hạn), mục 6.1 (5 dòng Simplicity First), mục 9.1 (môi trường dev), mục 11 (đánh giá theo ước lượng)
- [x] AC4 — Đạt trên PR #6 @ `6c941b8` (API bản build cổng 4200, `RELEASE_MODE=staff`, `LLM_PROVIDER=openai`, MongoDB Atlas dev, câu hỏi không nhạy cảm): câu ngắn `COMPLETED` (34 ký tự; usage 77/17, `end=completed`); bài dài `TRUNCATED` (3.662 ký tự; usage 86/1000, `end=max_output_tokens`); Dừng sau 5 đoạn `STOPPED` (65 ký tự đã lưu), **không có dòng usage**; mở lại hội thoại giữ đúng 3 trạng thái, model `gpt-5.4-mini`; log không chứa nội dung câu hỏi hay khóa (`grep` 0 dòng); hội thoại thử đã xóa — **Nguồn: TL chạy 17/11/2026**. Ghi lại một dòng xác nhận trên `develop` khi PR #6 merge
- [x] Khóa OpenAI dev đặt trong `apps/api/.env` của thư mục TL (CTO cho phép 17/11/2026); không commit, không in

- [x] AC4 trên `develop`: PR #6 merge `783a8a3`; `git diff 6c941b8 783a8a3 -- apps packages` rỗng → code đã kiểm trùng `develop` — PASS

**Trạng thái và bước tiếp theo** — Chờ Review (CTO xác nhận TL-006).

## Phản hồi UI
Không áp dụng.
