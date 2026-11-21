# Chương trình Backend Codebase Refactoring (SE-021) — bảng theo dõi

Tài liệu theo dõi **duy nhất** của chương trình (chỉ thị CTO "Autonomous Backend Review & Merge" 21/11/2026, mục 4). Hồ sơ task: [SE-021](../tasks/SE-021-backend-codebase-audit.md). Chi tiết theo vòng: [báo cáo ngày 21/11](daily/2026-11-21.md) (vòng 6–10).

Phạm vi: chỉ `apps/api`; giữ API contract và nghiệp vụ, trừ sửa bug đã duyệt; không viết unit test mới. TL tự review/merge PR đạt gate; thay đổi chính sách bảo mật phiên, schema, contract → CTO.

Cập nhật: 21/11/2026 11:46 · `develop` @ `310ee02`

Quy ước trạng thái: **Partial** = đã sửa một phần, còn phạm vi ghi ở cột Status; **Audited** = đã audit + xác minh, chưa refactor; **Not started** = chưa audit đủ. Không có flow nào **Done** ở thời điểm này.

## 1. Bảng tổng

| Flow ID | Luồng | Findings | SE Refactored | TL Reviewed | Regression | PR | Merge SHA | Status |
|---|---|---|---|---|---|---|---|---|
| F01 | Authentication, Refresh Token, Sessions | TL-F1 (BLOCKER), TL-F2 = SE-F3 (MAJOR) | TL-F2/SE-F3 (CAS) | Có — race 2 refresh: develop cũ thu hồi phiên, sau sửa phiên còn | 27/27 + race sau merge | #39 | `3e9abe7` | **Partial** — TL-F1 và giới hạn ân hạn 30 s một bước → PR-B3 (SE đang phân tích; phần đổi chính sách cần CTO) |
| F02 | Authorization, Roles, Ownership | TL-F9 = SE-F13 (MINOR), TL-F12 = SE-F12 (MINOR) | — | Đã đọc guard, roles, admin service, files controller, cô lập `userId` — đạt | 401/403/404 trong 27/27 | — | — | **Audited** — không blocker; 2 MINOR backlog (SE-006); chưa đọc đủ `users.service`, `me.controller`, DTO admin |
| F03 | Chat, Streaming, Stop, Regenerate | TL-F3 = SE-F4 (MAJOR), TL-F4 = SE-F11 (MAJOR), SE-F8, SE-F20, SE-F21 (MINOR), SE-F9, SE-F10 (CTO) | SE-F4 (khóa stream), TL-F4 (bỏ giới hạn trùng) | Có — 2 stream song song: cũ 200+200, sau sửa 200+409; Dừng trong cửa sổ → STOPPED; 429 sau 20 lần | 27/27 + race + rate limit | #39, #40 | `3e9abe7`, `310ee02` | **Partial** — còn SE-F8 (TOCTOU tin mồ côi/chú thích), SE-F9, SE-F10 (CTO) |
| F04 | Documents Upload, Validation, Download | SE-F1 (BLOCKER), SE-F2 (MAJOR), TL-F7 (MINOR), SE-F18 (SUGGESTION) | SE-F1, SE-F2, TL-F7 (2/3 khối) | Có — probe: cũ sập tiến trình, sau sửa sống; tải về khớp byte | probe B1 trước/sau merge; tải về MinIO thật | #38, #40 | `7433ce3`, `310ee02` | **Partial** — điều kiện B1 (log lỗi giữa chừng) → PR-B5; chưa đọc `text-extract.ts`, `sanitize-filename`, `upload-size.filter` |
| F05 | Documents Processing, Delete, Cleanup | TL-F5 = SE-F6 (MAJOR), SE-F22 (MINOR, CTO) | TL-F5 (log nguyên nhân, giữ mapping) | Có — DOCX hỏng → `DOCUMENT_UNREADABLE` + 1 dòng WARN | B4 runtime | #40 | `310ee02` | **Partial** — cắt độ dài thông điệp lỗi parser trong log → PR-B5; SE-F22 reconcile chờ CTO |
| F06 | RAG Retrieval, Embedding, Citations | SE-F14, SE-F15 (MINOR), TL-F11, SE-F16, SE-F17 (SUGGESTION, CTO) | SE-F14 (index idempotent), SE-F15 (xóa code chết) | Có — TXT READY trên collection có sẵn; RAG + `insufficientEvidence` | 27/27 | #40 | `310ee02` | **Partial** — SE-F16/F17 chờ CTO; TL-F11 tùy chọn |
| F07 | Summary, BullMQ, Retry, Cache | TL-F8 (MINOR), SE-F5 (MINOR, CTO) | TL-F8 (một phần) | Có — tóm tắt READY sau B4 | B4 runtime | #40 | `310ee02` | **Partial** — TL-F8: `new AbortController().signal` vẫn tạo inline vì `LlmStreamOptions.signal` bắt buộc (chấp nhận, có chú thích); timeout chờ CTO |
| F08 | Configuration, Logging, Exception Handling | TL-F6 = SE-F7 (MAJOR, CTO), TL-F13 (MINOR) | — | Filter, pipe, guard đã đọc — đạt | — | — | — | **Audited** — DNS chờ CTO; TL-F13 (mất lỗi gốc ở `openai-llm.provider.ts:112`) chưa giao; chưa đọc `env.validation`, `app-config.service` |
| F09 | Module Structure, Dependencies, Code Organization | TL-F10, SE-F20, SE-F19 (MINOR/SUGGESTION) | Một phần qua TL-F7 | Đã đánh giá — không bắt thêm abstraction | — | — | — | **Audited** — không blocker; chưa có PR |

## 2. Checklist từng flow

Ký hiệu: [x] có bằng chứng · [ ] chưa · ~ một phần (ghi lý do).

| Mục | F01 | F02 | F03 | F04 | F05 | F06 | F07 | F08 | F09 |
|---|---|---|---|---|---|---|---|---|---|
| SE audit và có findings | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| TL xác minh findings | [x] | [x] | [x] | [x] probe SE-F1 | [x] | [x] | [x] SDK timeout | [x] | [x] |
| SE refactor hoàn thành | ~ (B3) | [ ] | ~ | ~ (B5) | ~ (B5) | ~ | ~ | [ ] | [ ] |
| SE self-review | [x] #39 | — | [x] #39 #40 | [x] #38 #40 | [x] #40 | [x] #40 | [x] #40 | — | — |
| Typecheck, lint, build đạt | [x] | — | [x] | [x] | [x] | [x] | [x] | — | — |
| Regression liên quan đạt | [x] | [x] (401/403/404) | [x] | [x] | [x] | [x] | [x] | — | — |
| TL đọc diff, review logic độc lập | [x] | — | [x] | [x] | [x] | [x] | [x] | — | — |
| TL review readability/naming/complexity | [x] | — | [x] | [x] | [x] | [x] | ~ (TL-F8 inline) | — | — |
| TL review module/file organization | [x] | [x] | ~ (SE-F20 chưa) | [x] | [x] | [x] | [x] | [ ] | ~ |
| Không có blocking findings | [ ] TL-F1 | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| PR đạt CI | [x] | — | [x] | [x] | [x] | [x] | [x] | — | — |
| TL merge vào develop | [x] | — | [x] | [x] | [x] | [x] | [x] | — | — |
| Xác minh sau merge | [x] | — | [x] | [x] | [x] | [x] | [x] | — | — |
| Cập nhật tài liệu và báo cáo | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |

## 3. PR của chương trình

| PR | Nội dung | Flow | SHA review | Merge SHA | Kết luận TL |
|---|---|---|---|---|---|
| [#38](https://github.com/duong2604/cat_gpt/pull/38) PR-B1 | Sập API khi tải về lỗi; hủy stream khi client ngắt | F04 | `d1873f6` | `7433ce3` | APPROVED WITH CONDITIONS (log → B5) |
| [#39](https://github.com/duong2604/cat_gpt/pull/39) PR-B2 | CAS xoay refresh token; đặt chỗ stream đồng bộ | F01, F03 | `711ccdc` | `3e9abe7` | APPROVED WITH CONDITIONS (giới hạn ân hạn → B3) |
| [#40](https://github.com/duong2604/cat_gpt/pull/40) PR-B4 | Dọn code không đổi hành vi | F03, F04, F05, F06, F07 | `a5cb975` | `310ee02` | APPROVED WITH CONDITIONS (cắt log parser → B5) |
| PR-B5 | Follow-up: log tải về lỗi; cắt thông điệp lỗi parser | F04, F05 | — | — | Đã giao SE |
| PR-B3 | Chính sách phiên (TL-F1 + ân hạn) | F01 | — | — | SE phân tích trước; phần đổi chính sách cần CTO |

## 4. Findings còn lại cần CTO
SE-F7/TL-F6 (DNS), SE-F5 (giá trị timeout LLM/embedding), SE-F9 (Tạo lại xóa câu cũ trước), SE-F10 (phân trang tin nhắn — đổi contract), SE-F16 (kiểm nội dung trích dẫn), SE-F17 (vị trí dữ liệu trong prompt), SE-F22 (reconcile xóa), phần đổi chính sách của PR-B3.
