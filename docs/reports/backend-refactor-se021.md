# Chương trình Backend Codebase Refactoring (SE-021) — bảng theo dõi

Tài liệu theo dõi **duy nhất** của chương trình (chỉ thị CTO "Autonomous Backend Review & Merge" 21/11/2026, mục 4). Hồ sơ task: [SE-021](../tasks/SE-021-backend-codebase-audit.md). Chi tiết theo vòng: [báo cáo ngày 21/11](daily/2026-11-21.md) (vòng 6–10).

Phạm vi: chỉ `apps/api`; giữ API contract và nghiệp vụ, trừ sửa bug đã duyệt; không viết unit test mới. TL tự review/merge PR đạt gate; thay đổi chính sách bảo mật phiên, schema, contract → CTO.

Cập nhật: 21/11/2026 12:12 · `develop` @ `f173090`

Quy ước trạng thái: **Partial** = đã sửa một phần, còn phạm vi ghi ở cột Status; **Audited** = đã audit + xác minh, chưa refactor; **Not started** = chưa audit đủ. Không có flow nào **Done** ở thời điểm này.

## 1. Bảng tổng

| Flow ID | Luồng | Findings | SE Refactored | TL Reviewed | Regression | PR | Merge SHA | Status |
|---|---|---|---|---|---|---|---|---|
| F01 | Authentication, Refresh Token, Sessions | TL-F1 (BLOCKER), TL-F2 = SE-F3 (MAJOR) | TL-F2/SE-F3 (CAS) | Có — race 2 refresh: develop cũ thu hồi phiên, sau sửa phiên còn | 27/27 + race sau merge | #39 | `3e9abe7` | **Partial** — TL-F1 và giới hạn ân hạn 30 s một bước → PR-B3 (SE đang phân tích; phần đổi chính sách cần CTO) |
| F02 | Authorization, Roles, Ownership | TL-F9 = SE-F13, TL-F12 = SE-F12 (MINOR); **SE-F27 (MAJOR)** mật khẩu admin seed không theo chính sách mạnh; SE-F28, F29 (MINOR), SE-F30 (SUGGESTION) | SE-F27 (#42) | Đã đọc guard, roles, admin service, files controller; SE đọc thêm `users.service`, `me.controller`, DTO — TL xác minh SE-F27 và `.env` demo đạt chính sách | 401/403/404 trong 27/27; probe `validateEnv` | #42 | `582865b` | **Partial** — SE-F27 xong; SE-F28/F29 backlog; SE-F30 không làm (đổi 400→413 là đổi contract) |
| F03 | Chat, Streaming, Stop, Regenerate | TL-F3 = SE-F4 (MAJOR), TL-F4 = SE-F11 (MAJOR), SE-F8, SE-F20, SE-F21 (MINOR), SE-F9, SE-F10 (CTO) | SE-F4 (khóa stream), TL-F4 (bỏ giới hạn trùng) | Có — 2 stream song song: cũ 200+200, sau sửa 200+409; Dừng trong cửa sổ → STOPPED; 429 sau 20 lần | 27/27 + race + rate limit | #39, #40, #43 | `3e9abe7`, `310ee02`, `f173090` | **Partial** — SE-F8: chú thích đã sửa (#43), khe hẹp logic giữ (MINOR, ghi nhận); còn SE-F9, SE-F10 (CTO) |
| F04 | Documents Upload, Validation, Download | SE-F1 (BLOCKER), SE-F2 (MAJOR), TL-F7 (MINOR), SE-F18 (SUGGESTION) | SE-F1, SE-F2, TL-F7 (2/3 khối) | Có — probe: cũ sập tiến trình, sau sửa sống; tải về khớp byte | probe B1 trước/sau merge; tải về MinIO thật | #38, #40, #41 | `7433ce3`, `310ee02`, `646fcb4` | **Partial** — điều kiện B1 đã xong (#41); còn: chưa đọc `text-extract.ts`, `sanitize-filename`, `upload-size.filter` |
| F05 | Documents Processing, Delete, Cleanup | TL-F5 = SE-F6 (MAJOR), SE-F22 (MINOR, CTO) | TL-F5 (log nguyên nhân, giữ mapping) | Có — DOCX hỏng → `DOCUMENT_UNREADABLE` + 1 dòng WARN | B4 runtime; probe B5 | #40, #41 | `310ee02`, `646fcb4` | **Partial** — log parser đã cắt (#41); còn SE-F22 reconcile chờ CTO |
| F06 | RAG Retrieval, Embedding, Citations | SE-F14, SE-F15 (MINOR), TL-F11, SE-F16, SE-F17 (SUGGESTION, CTO) | SE-F14 (index idempotent), SE-F15 (xóa code chết) | Có — TXT READY trên collection có sẵn; RAG + `insufficientEvidence` | 27/27 | #40 | `310ee02` | **Partial** — SE-F16/F17 chờ CTO; TL-F11 tùy chọn |
| F07 | Summary, BullMQ, Retry, Cache | TL-F8 (MINOR), SE-F5 (MINOR, CTO) | TL-F8 (một phần) | Có — tóm tắt READY sau B4 | B4 runtime | #40 | `310ee02` | **Partial** — TL-F8: `new AbortController().signal` vẫn tạo inline vì `LlmStreamOptions.signal` bắt buộc (chấp nhận, có chú thích); timeout chờ CTO |
| F08 | Configuration, Logging, Exception Handling | TL-F6 = SE-F7 (MAJOR, CTO), TL-F13 = SE-F23 (MINOR), **SE-F24 (MAJOR, CTO)** cookie không bắt buộc `secure` khi production, SE-F25 (MINOR), SE-F26 (MINOR, CTO) | SE-F23, SE-F25 (#42) | Filter, pipe, guard — đạt; TL xác minh `isProduction` không được dùng, `.env` demo `NODE_ENV=development` | 27/27 sau merge; probe `LlmError` | #42 | `582865b` | **Partial** — SE-F23/F25 xong; DNS, SE-F24, SE-F26 chờ CTO |
| F09 | Module Structure, Dependencies, Code Organization | TL-F10, SE-F20, SE-F19 (MINOR/SUGGESTION) | SE-F20 phần 1: tách lập lịch tóm tắt → `DocumentSummaryService` (#43); TL-F7 | Có — di chuyển nguyên văn, 202/200/400/404 giữ nguyên | b7-check; test 83/83 | #43 | `f173090` | **Partial** — tách `ChatService` không yêu cầu (không có lợi ích rõ); TL-F10 chấp nhận; SE-F19 giữ (dữ liệu mock của demo) |

## 2. Checklist từng flow

Ký hiệu: [x] có bằng chứng · [ ] chưa · ~ một phần (ghi lý do).

| Mục | F01 | F02 | F03 | F04 | F05 | F06 | F07 | F08 | F09 |
|---|---|---|---|---|---|---|---|---|---|
| SE audit và có findings | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| TL xác minh findings | [x] | [x] | [x] | [x] probe SE-F1 | [x] | [x] | [x] SDK timeout | [x] | [x] |
| SE refactor hoàn thành | ~ (B3) | ~ (B6; MINOR backlog) | ~ | ~ | ~ (SE-F22 CTO) | ~ | ~ | ~ (B6; CTO: DNS, F24, F26) | ~ (#43) |
| SE self-review | [x] #39 | [x] #42 | [x] #39 #40 | [x] #38 #40 | [x] #40 | [x] #40 | [x] #40 | [x] #42 | [x] #43 |
| Typecheck, lint, build đạt | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Regression liên quan đạt | [x] | [x] 27/27 | [x] | [x] | [x] | [x] | [x] | [x] 27/27 | [x] |
| TL đọc diff, review logic độc lập | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| TL review readability/naming/complexity | [x] | [x] | [x] | [x] | [x] | [x] | ~ (TL-F8 inline) | [x] | [x] |
| TL review module/file organization | [x] | [x] | ~ (SE-F20 chưa) | [x] | [x] | [x] | [x] | [x] | [x] |
| Không có blocking findings | [ ] TL-F1 | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| PR đạt CI | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| TL merge vào develop | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Xác minh sau merge | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Cập nhật tài liệu và báo cáo | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |

## 3. PR của chương trình

| PR | Nội dung | Flow | SHA review | Merge SHA | Kết luận TL |
|---|---|---|---|---|---|
| [#38](https://github.com/duong2604/cat_gpt/pull/38) PR-B1 | Sập API khi tải về lỗi; hủy stream khi client ngắt | F04 | `d1873f6` | `7433ce3` | APPROVED WITH CONDITIONS (log → B5) |
| [#39](https://github.com/duong2604/cat_gpt/pull/39) PR-B2 | CAS xoay refresh token; đặt chỗ stream đồng bộ | F01, F03 | `711ccdc` | `3e9abe7` | APPROVED WITH CONDITIONS (giới hạn ân hạn → B3) |
| [#40](https://github.com/duong2604/cat_gpt/pull/40) PR-B4 | Dọn code không đổi hành vi | F03, F04, F05, F06, F07 | `a5cb975` | `310ee02` | APPROVED WITH CONDITIONS (cắt log parser → B5) |
| [#41](https://github.com/duong2604/cat_gpt/pull/41) PR-B5 | Follow-up: log tải về lỗi; cắt thông điệp lỗi parser | F04, F05 | `adac390` | `646fcb4` | APPROVED |
| [#43](https://github.com/duong2604/cat_gpt/pull/43) PR-B7 | Tách lập lịch tóm tắt (SE-F20 phần 1); sửa chú thích (SE-F8) | F03, F07, F09 | `e1c77c3` | `f173090` | APPROVED |
| PR-B3 | Chính sách phiên (TL-F1 + ân hạn) | F01 | — | — | Phân tích xong ([tài liệu](../tasks/SE-021-b3-refresh-analysis.md)); TL khuyến nghị B2a; **chờ CTO** |
| [#42](https://github.com/duong2604/cat_gpt/pull/42) PR-B6 | Giữ lỗi gốc LLM (SE-F23), chính sách mật khẩu admin seed (SE-F27), cảnh báo mock ở production (SE-F25) | F02, F08 | `113fef6` | `582865b` | APPROVED |

## 4. Findings còn lại cần CTO
SE-F7/TL-F6 (DNS), SE-F24 (bắt buộc cookie `secure` khi production — ảnh hưởng triển khai HTTP nội bộ), SE-F26 (Swagger mặc định), SE-F5 (giá trị timeout LLM/embedding), SE-F9 (Tạo lại xóa câu cũ trước), SE-F10 (phân trang tin nhắn — đổi contract), SE-F16 (kiểm nội dung trích dẫn), SE-F17 (vị trí dữ liệu trong prompt), SE-F22 (reconcile xóa), PR-B3 (khuyến nghị B2a — xem daily vòng 12).
