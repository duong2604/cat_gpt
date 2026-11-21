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
| PR-B3 | Chính sách phiên (TL-F1) theo B2a | F01 | — | — | **CTO duyệt có điều kiện 21/11** (B2a: secret lạ 401 không thu hồi; ≤ 5 hash có hạn; không log hash; giữ CAS, logout). SE nộp bảng timeline 8 tình huống trước khi code |
| PR-B8 | Cấu hình: SE-F24, SE-F26, DNS; audit timeout LLM/embedding | F08 | — | — | **CTO duyệt hướng 21/11**; giao SE sau B3 |
| [#42](https://github.com/duong2604/cat_gpt/pull/42) PR-B6 | Giữ lỗi gốc LLM (SE-F23), chính sách mật khẩu admin seed (SE-F27), cảnh báo mock ở production (SE-F25) | F02, F08 | `113fef6` | `582865b` | APPROVED |

## 4. Findings còn lại cần CTO
SE-F7/TL-F6 (DNS), SE-F24 (bắt buộc cookie `secure` khi production — ảnh hưởng triển khai HTTP nội bộ), SE-F26 (Swagger mặc định), SE-F5 (giá trị timeout LLM/embedding), SE-F9 (Tạo lại xóa câu cũ trước), SE-F10 (phân trang tin nhắn — đổi contract), SE-F16 (kiểm nội dung trích dẫn), SE-F17 (vị trí dữ liệu trong prompt), SE-F22 (reconcile xóa), PR-B3 (khuyến nghị B2a — xem daily vòng 12).

## 5. Dọn dữ liệu thử (C1) và code demo/fake (C2) — chỉ thị CTO 21/11/2026 "Backend Cleanup & Remove Demo/Fake Code"

Audit của TL lập 12:4x trên `develop` `4cd1784`. Phân loại: REMOVE / REPLACE / KEEP FOR DEVELOPMENT / KEEP FOR PRODUCTION / NEEDS CTO DECISION. Không mặc định xóa mọi thứ có chữ mock/demo/test.

### 5.1. C1 — Dữ liệu thử (DB `cat_gpt` dùng chung với máy demo; MinIO bucket `cat-gpt-dev`; Qdrant `document_chunks`; BullMQ prefix `cat-gpt`)
| Nhóm | Đối tượng | Nguồn ID | Phân loại | Ghi chú |
|---|---|---|---|---|
| A1 | 200 tài khoản `loadtest+001…200@catgpt.local` (`BLOCKED`) | Danh sách SE ghi lúc tạo (`6b012909ae1c6f727b276001` … `6b012978ae1c6f727b2760c8`) | **REMOVE** (CTO cho phép) | Kèm phiên (`sessions`) của các ID này; đã kiểm 0 hội thoại/tài liệu ở 20 tài khoản gửi tin |
| A2 | Tài khoản tạm `tl-smoke-*` của TL hôm nay (10): `6b0118bd45444726dd40d914`, `6b0118ed45444726dd40d924`, `6b011f91608199ab3abe4dc8`, `6b011fb7354c32526e414154`, `6b0121914ed23c5f5f8e287e`, `6b0121984ed23c5f5f8e2887`, `6b0121cfb165510ff7bd34c8`, `6b012632accf1493a116295b`, `6b012832103b87e23c2c2175`, `6b012833103b87e23c2c2177` | Hồ sơ SE-020/SE-021 + báo cáo ngày | **REMOVE** | Hội thoại/tài liệu đã xóa khi kiểm; còn tài khoản + phiên |
| A3 | Tài khoản thử của SE: `6b008bd67101bbcc7c52cd6e` (SE-018), `6b0116b2d17505482276e3b9` (SE-020), `6b011ccf81272454c1e8fc05` (B1) + tài khoản thử của các PR B2–B7 | Hồ sơ task; SE bổ sung ID từ ghi chép của mình | **REMOVE** sau khi SE nộp ID có nguồn | ID không có nguồn ghi chép → giữ, báo TL |
| A4 | Tài khoản/dữ liệu thử của các phiên trước 21/11 (vd `tl-smoke-*` cũ, tài khoản đánh giá RAG TL-009/SE-017) | Chưa rõ | **NEEDS CTO DECISION** nếu không có ghi chép ID | Dữ liệu đánh giá có thể là baseline — không xóa khi chưa xác minh |
| A5 | Tài khoản admin và mọi người dùng không thuộc A1–A3 | — | **KEEP FOR PRODUCTION** | Không đụng |
| A6 | Object MinIO, điểm Qdrant, job BullMQ gắn với tài liệu của A1–A3 | Dry-run theo `userId`/`documentId` của A1–A3 | **REMOVE** nếu còn sót | Không xóa toàn bucket/collection/queue; không wildcard |
| A7 | Object MinIO / điểm Qdrant mồ côi không gắn được với A1–A3 (vd `documentId` không còn trong Mongo) | Dry-run | **NEEDS CTO DECISION** | Chỉ liệt kê, không xóa |
| A8 | Ảnh đại diện (thư mục `uploads/avatars`) của A1–A3 | `avatarKey` của các ID | **REMOVE** | |

Quy trình bắt buộc: SE inventory + **dry-run (chỉ đọc)** → TL đối chiếu, lưu **manifest** (ID + số lượng theo collection) và **bản export JSON** các bản ghi sẽ xóa (ngoài repo, phục vụ rollback bằng chèn lại) → SE xóa đúng ID đã duyệt → kiểm trước/sau, mồ côi, hệ thống còn chạy. Chạy trên DB demo nên **đây là thao tác dữ liệu thật đầu tiên trên DB demo** — TL duyệt từng manifest.

### 5.2. C2 — Code demo/fake trong `apps/api`
| # | Mục | File | Phân loại | Lý do / việc cần làm |
|---|---|---|---|---|
| B1 | `MockLlmProvider` + `mock-answers.ts` | `modules/llm/*` | **KEEP FOR DEVELOPMENT** | Kiểm thử offline, không tốn chi phí OpenAI; chỉ chạy khi `LLM_PROVIDER=mock` |
| B2 | `LLM_PROVIDER` mặc định `mock`; production chỉ cảnh báo (#42) | `config/env.validation.ts:118`, `main.ts:24` | **REPLACE** | Production (`NODE_ENV=production`) với `mock` → **từ chối khởi động** (lỗi cấu hình rõ ràng); development giữ mặc định `mock`. Máy demo đang dùng `openai` (kiểm 11:57) → không ảnh hưởng |
| B3 | Trigger `/error`, `/limit` trong mock | `mock-llm.provider.ts:8-10` | **KEEP FOR DEVELOPMENT** | Chỉ có hiệu lực trong mock; sau B2 không thể chạy ở production |
| B4 | Không có fallback âm thầm sang mock khi OpenAI lỗi | `llm.module.ts:17-20` | **KEEP FOR PRODUCTION** | Đã đúng: lỗi OpenAI → `ERROR`, không đổi provider |
| B5 | `ChatHiddenGuard` / `DocumentsHiddenGuard` (chế độ `staff`) | `chat-hidden.guard.ts`, `documents-hidden.guard.ts` | **KEEP FOR PRODUCTION** | Cờ phát hành đã duyệt (CS-6, SE-003) — không phải fake |
| B6 | `RELEASE_MODE` mặc định `demo` | `env.validation.ts:98` | **NEEDS CTO DECISION** | Có giữ chế độ `demo` làm mặc định cho triển khai thật không (liên quan SE-F26 đã quyết) |
| B7 | Admin seed từ biến môi trường | `users/admin-seed.service.ts` | **KEEP FOR PRODUCTION** | Khởi tạo admin đầu tiên; đã áp chính sách mật khẩu (#42) |
| B8 | Override DNS mặc định | `main.ts:13-16` | **REPLACE** | Đã giao PR-B8 (biến `DNS_SERVERS` có kiểm soát) |
| B9 | `COOKIE_SECURE` mặc định `false`, Swagger theo `demo` | `env.validation.ts`, `app-config.service.ts` | **REPLACE** | Đã giao PR-B8 (production bắt buộc `secure`, Swagger tắt) |
| B10 | Credential hardcode | `src`, `scripts` | — | TL quét: **không có** |
| B11 | Bypass xác thực | `@Public` | **KEEP** | Chỉ 4 route: `auth/login`, `auth/refresh`, `auth/logout`, `health` — đúng thiết kế |
| B12 | Dependency `ioredis` khai báo nhưng không import trong `src` (chỉ có trong chú thích) | `apps/api/package.json:45` | **REMOVE** (sau khi SE xác minh BullMQ tự mang `ioredis`) | Kiểm build/test và hàng đợi sau khi gỡ |
| B13 | `reflect-metadata`, `rxjs` không import trực tiếp | `package.json` | **KEEP FOR PRODUCTION** | Peer dependency bắt buộc của NestJS |
| B14 | `scripts/rag-eval*.mjs`, `test/fixtures/*` | | **KEEP FOR DEVELOPMENT** | Công cụ đánh giá (SE-017) và dữ liệu kiểm thử hợp lệ |
| B15 | `LocalStorageProvider` (ảnh đại diện trên đĩa) | `modules/storage/*` | **KEEP FOR PRODUCTION** | Quyết định thiết kế M3-5, không phải fake |

### 5.3. Trạng thái
| Workstream | Trạng thái | PR | Ghi chú |
|---|---|---|---|
| C1 Data Cleanup | **Chưa bắt đầu** — TL lập danh sách; chờ SE inventory + dry-run (sau PR-B3) | — | Không xóa gì trước khi TL duyệt manifest |
| C2 Code Cleanup | **Chưa bắt đầu** — TL audit xong; B8/B9 nằm trong PR-B8; B2, B12 sẽ thành PR-C2 | — | PR riêng, không gộp với C1 |

## 6. Chính sách cấu hình theo môi trường (chỉ thị CTO vòng 20) — audit TL 12:5x, `develop` `4cd1784`

### 6.1. Hiện trạng (đọc code)
| Biến | Giá trị | Dùng ở đâu | Ý nghĩa thực tế |
|---|---|---|---|
| `NODE_ENV` | `development` (mặc định) / `production` / `test` | `AppConfigService.isProduction` → chỉ `main.ts:24` (cảnh báo mock, #42) | Trục runtime Node; gần như không điều khiển chính sách |
| `RELEASE_MODE` | `demo` (mặc định) / `staff` | `chat-hidden.guard.ts:9`, `documents-hidden.guard.ts:8`, `swaggerEnabled` (`app-config.service.ts:53`) | Trục mở tính năng (CS-6, SE-003) |
| `NEXT_PUBLIC_RELEASE_MODE` (web) | `demo` / `staff` | `apps/web/src/lib/release-mode.ts:2` — chỉ so `=== "staff"`; Chat lấy từ `/me/features` | Phải khớp API (ghi trong `.env.example` web) |
| `LLM_PROVIDER` | `mock` (mặc định) / `openai` | `llm.module.ts` | Không có fallback âm thầm khi OpenAI lỗi |
| `COOKIE_SECURE` | `false` (mặc định) | `auth-cookie.service.ts` | Không có ràng buộc theo môi trường |
| `SWAGGER_ENABLED` | không đặt → theo `demo` | `app-config.service.ts:51-54` | Bật mặc định ở `demo` |

**Rủi ro nếu làm theo kế hoạch cũ:** PR-B8/C2 gắn ràng buộc vào `NODE_ENV=production`, còn CTO yêu cầu `RELEASE_MODE=production` → **hai hệ thống cạnh tranh**. **Quyết định TL:** một nguồn chính sách duy nhất là `RELEASE_MODE`; `NODE_ENV` chỉ được kiểm nhất quán.

### 6.2. Quy tắc (thực hiện trong `validateEnv`, fail startup với thông báo rõ)
| # | Điều kiện | Kết quả |
|---|---|---|
| R1 | Thêm giá trị `RELEASE_MODE=production` (giữ `demo`, `staff`) | Guard `staff` không đổi; Swagger mặc định = chỉ `demo` → `production` **tắt** |
| R2 | `NODE_ENV=production` mà **không khai báo** `RELEASE_MODE` | **Fail** — triển khai thật phải khai báo rõ |
| R3 | `RELEASE_MODE=production` mà `NODE_ENV≠production` | **Fail** (mâu thuẫn) |
| R4 | `RELEASE_MODE=production` và `LLM_PROVIDER≠openai` (hoặc thiếu `OPENAI_API_KEY`) | **Fail** — thay cảnh báo của #42 |
| R5 | `RELEASE_MODE=production` và `COOKIE_SECURE≠true` | **Fail** — production bắt buộc HTTPS + cookie `secure`; không fallback ngầm |
| R6 | `RELEASE_MODE=production` và `SWAGGER_ENABLED=true` | Cho phép (bật rõ ràng), **log cảnh báo** lúc khởi động |
| R7 | `NODE_ENV=production`, `RELEASE_MODE=staff` (staging/thử nội bộ) và `LLM_PROVIDER=mock` | Cho phép (Chat tự ẩn theo CS-6); log cảnh báo "không dùng dữ liệu thật với mock" |
| R8 | `NODE_ENV=production`, `RELEASE_MODE=demo` và `LLM_PROVIDER=mock` | **Fail** (bản demo phát hành trả lời giả lập) |
| R9 | `RELEASE_MODE=production` và `TRUST_PROXY` = mặc định `loopback` | Cảnh báo (cần cấu hình proxy thật để lấy IP đúng cho giới hạn đăng nhập) |
| R10 | Development (`NODE_ENV=development`, mặc định) | **Không đổi**: `demo` mặc định, `mock` được phép, `COOKIE_SECURE=false` được phép |

Máy demo (`NODE_ENV=development`, `RELEASE_MODE=demo`, `LLM_PROVIDER=openai`) không bị ảnh hưởng. **Web:** không cần sửa code (chỉ so `=== "staff"`); chú thích `.env.example` web nêu `demo`/`staff` sẽ thiếu `production` — ghi nhận, sửa khi frontend được duyệt.

### 6.3. Gộp PR (đổi thứ tự có lý do)
Vì R4–R8 cùng sửa `env.validation.ts` và `main.ts` với SE-F24, SE-F26 và C2-B2: gộp thành **một PR cấu hình** (PR-B8 mở rộng). PR-C2 còn lại chỉ gỡ `ioredis` (B12) — tách riêng, không phụ thuộc. DNS (`DNS_SERVERS`) vẫn trong PR-B8.

### 6.4. PR-B3 — gate bổ sung của CTO và điều chỉnh thiết kế
**Phát hiện (TL):** với B2a như đã duyệt, bên **thua** CAS khi 2 tab refresh đồng thời **xoay thêm một lần** (h0 → h1 → h2). Nếu trình duyệt giữ cookie của **bên thắng** (h1 — phản hồi đến sau), h1 trở thành `previous` rồi vào lịch sử; lần refresh kế tiếp (~15 phút, ngoài ân hạn) khớp lịch sử → **thu hồi phiên nhầm** → **không qua gate 2**.
**Điều chỉnh (TL duyệt, không làm yếu bảo mật):** ở nhánh **thua CAS** (lần đọc đầu thấy token là `current`, CAS thất bại, đọc lại thấy token = `previous` vừa được xoay) → **không xoay thêm**; chỉ cấp **access token** cho cùng phiên và **không đặt lại refresh cookie** → cookie trong trình duyệt là của bên thắng = `current`. Nhánh ân hạn thông thường (lần đọc đầu đã thấy `previous`, vd thử lại sau khi mất phản hồi) giữ như cũ.
**Gate 1 (replay):** token chỉ được dùng ở nhánh ân hạn **một lần** (sau đó nó là lịch sử → dùng lại = thu hồi); token lịch sử không bao giờ dùng để xoay; nhánh thua CAS chỉ xảy ra trong lúc đua (mili giây), không kéo dài ân hạn.
**Bằng chứng bắt buộc:** kịch bản thật mô phỏng cookie jar trình duyệt (Set-Cookie đến sau thắng), chạy cả hai thứ tự phản hồi; sau đó refresh ngoài ân hạn (đợi > 30 s) → phiên **không** bị thu hồi.

## 7. Quản lý theo flow — Definition of Done (chỉ thị CTO "Flow-Based Quality Gate", áp dụng từ 21/11/2026)

Từ mục này, **trạng thái flow** dùng thang của CTO: NOT STARTED · IN PROGRESS · IN REVIEW · PARTIAL · DONE · BLOCKED. Số PR **không** phải thước đo chất lượng. Mục 1–2 giữ làm lịch sử; trạng thái hiện hành ở bảng 7.1.

DoD (16 mục): D1 audit toàn phạm vi · D2 findings phân loại và xử lý · D3 không còn BLOCKER/MAJOR mở · D4 đúng nghiệp vụ và API contract · D5 security/authorization đã review · D6 concurrency/error handling đã review · D7 dễ đọc, dễ debug · D8 trách nhiệm class/method rõ · D9 tổ chức file hợp lý · D10 không overengineering · D11 typecheck/lint/build · D12 regression liên quan · D13 TL independent review · D14 PR liên quan đã merge · D15 xác minh sau merge · D16 bằng chứng + SHA trong tracker.

### 7.1. Bảng trạng thái flow (`develop` `4cd1784`, cập nhật 15:2x)
| Flow | Scope | Findings còn mở | PR đã merge | TL review evidence | Regression evidence | DoD chưa đạt | Status | Next action |
|---|---|---|---|---|---|---|---|---|
| **F01** Auth & Sessions | login, refresh/xoay token, logout, phiên (`sessions`), JWT/strategy, cookie, giới hạn đăng nhập, `/me/sessions`, thu hồi khi khóa/đổi mật khẩu | **TL-F1 BLOCKER**; TL-F2/SE-F3 phần còn lại (2 tab) MAJOR; **F01-N1 MAJOR**; **F01-N2 MAJOR**; SE-F24 MAJOR; KT-3 MAJOR (SE-005); F01-N3 MINOR; F01-N4 SUGGESTION | 1 (#39) | Vòng 6 + 7.2 (toàn phạm vi) | 27/27 + race sau #39 | D2, D3, D14, D15 | **IN REVIEW** (PR-B3 #45 chờ TL review) | Review #45 → PR-B8 (SE-F24, F01-N1, F01-N2) → SE-005 → TL xác minh toàn F01 |
| F02 Authorization, Roles, Ownership | guard/roles, admin users, `/me`, avatar | SE-F28, F29, F12/TL-F12, F13/TL-F9 (MINOR) | 1 (#42) | Vòng 6, 13 | 27/27 | D13 (chưa review toàn phạm vi theo DoD) | PARTIAL | TL review toàn phạm vi sau F01 |
| F03 Chat | stream, Dừng, Tạo lại, lưu trữ | SE-F8 (MINOR), SE-F9, SE-F10 (cần CTO) | 3 | Vòng 3, 9 | race + 27/27 | D2 (chờ CTO SE-F9/F10) | PARTIAL | Chờ CTO SE-F9/F10 |
| F04 Documents upload/download | upload, kiểm tra, MinIO, tải về | SE-F18 (SUGGESTION) | 3 | Vòng 2, 5 | probe B1, MinIO thật | D1 (`text-extract`, `sanitize-filename` chưa đọc) | PARTIAL | TL đọc phần còn lại |
| F05 Processing/Delete/Cleanup | worker, xóa, dọn | SE-F22 (cần CTO) | 2 | Vòng 4, 5 | B4 runtime | D2 (CTO) | PARTIAL | Chờ CTO SE-F22 |
| F06 RAG | embed, Qdrant, trích dẫn | SE-F16, F17 (CTO), TL-F11 | 1 | Vòng 4 | 27/27 | D2 (CTO) | PARTIAL | Chờ CTO |
| F07 Summary/BullMQ | lập lịch, job, retry | SE-F5 timeout | 2 | Vòng 4, 7 | b7-check | D2 | PARTIAL | Audit timeout trong PR-B8 |
| F08 Config/Logging/Exceptions | env, log, filter, DNS, Swagger | DNS (MAJOR), SE-F24, SE-F26, C2-B2, R1–R12 | 1 (#42) | Vòng 13, 21 | validateEnv probe | D2, D3 | IN PROGRESS | PR-B8 mở rộng |
| F09 Module structure | tổ chức module, dependency | B12 `ioredis` (C2) | 1 (#43) | Vòng 7 | b7-check | D2 | PARTIAL | PR-C2 |

**Done: 0/9. Gần Done nhất:** F02 (chỉ còn MINOR backlog + TL review toàn phạm vi). **Blocked:** không có flow bị chặn hoàn toàn; F03/F05/F06 phụ thuộc quyết định CTO.

### 7.2. F01 — independent review toàn phạm vi (TL)
Đã đọc: `auth.service.ts`, `auth.controller.ts`, `auth.module.ts`, `jwt.strategy.ts`, `auth-cookie.service.ts`, `dto/login.dto.ts`, `sessions.service.ts` (sau #39), `refresh-token.ts`, `schemas/session.schema.ts`, `common/utils/password-hash.ts`, `common/constants.ts`, `common/guards/jwt-auth.guard.ts`, `me.controller.ts` (phiên), `admin-users.service.ts` (khóa/đặt lại mật khẩu → thu hồi), `apps/api/.env.example` (giá trị mẫu).

| ID | Mức | File:dòng | Bằng chứng | Ảnh hưởng | Sửa | Ở đâu |
|---|---|---|---|---|---|---|
| TL-F1 | BLOCKER | `auth.service.ts:78-81`; `sessions.service.ts` (`reuse` → `revoke`) | Vòng 6, phân tích B3 | Đăng xuất cưỡng bức bằng `sessionId` | B2a | PR-B3 |
| TL-F2/SE-F3 (phần còn lại) | MAJOR | `sessions.service.ts` nhánh thua CAS | Mục 6.4 | Thu hồi nhầm khi trình duyệt giữ cookie bên thắng | Thua CAS không xoay thêm | PR-B3 |
| **F01-N1** | **MAJOR** | `.env.example:12` `JWT_ACCESS_SECRET=change-me-to-a-long-random-string-at-least-32-chars` — ≥ 32 ký tự nên qua `@MinLength(32)` | Đọc file | Triển khai chép `.env.example` → secret ký JWT công khai trong repo; biết `sub` + `sid` là giả được access token (strategy chỉ kiểm phiên tồn tại) | `RELEASE_MODE=production` từ chối giá trị mẫu (R11) | PR-B8 |
| **F01-N2** | **MAJOR** | `.env.example:32` `ADMIN_PASSWORD=Admin@123` (qua chính sách #42); `login.dto.ts:12` ví dụ Swagger cùng giá trị | Đọc file | Admin seed với mật khẩu công khai nếu không đổi | Production từ chối giá trị mẫu (R12); ví dụ Swagger đổi giá trị trung tính | PR-B8 |
| SE-F24 | MAJOR | `env.validation.ts` `COOKIE_SECURE=false` | Vòng 13 | Cookie phiên qua HTTP | R5 | PR-B8 |
| KT-3 | MAJOR | `auth.controller.ts` `@Throttle 5/phút/IP` | SE-005 AC1: 25/200 thành công, 175 `429` | Nhân viên cùng IP không đăng nhập được | Giới hạn theo email/IP-sai | SE-005 |
| F01-N3 | MINOR | `auth.service.ts:42-44` | `touchLastLogin` rồi `getByIdOrThrow` = 2 truy vấn | Thêm 1 truy vấn mỗi lần đăng nhập | Gộp bằng `findOneAndUpdate` | Tùy chọn |
| F01-N4 | SUGGESTION | `auth.service.ts:57-69` | Xoay token trước khi kiểm user bị khóa | Ghi DB thừa rồi thu hồi | Giữ (kết quả đúng) | — |

Đã kiểm đạt: bcrypt 10 vòng + hash giả chống dò timing; JWT HS256 cố định thuật toán, hết hạn 900 s; mỗi request kiểm phiên + trạng thái khóa; cookie `httpOnly` + `sameSite=lax`, refresh chỉ gửi tới `/api/v1/auth`; `revokeOwn` lọc `userId`; khóa/đặt lại/đổi mật khẩu thu hồi phiên; phiên tự hết hạn bằng TTL index; chỉ 4 route `@Public`.

**Điều kiện để F01 DONE:** (1) PR-B3 merge, qua gate replay + gate 2 tab có bằng chứng thực tế; (2) PR-B8 merge với R5, R11, R12; (3) SE-005 merge (KT-3); (4) TL xác minh sau merge toàn F01 (27/27 + 8 tình huống B3 + ma trận khởi động + kịch bản SE-005); (5) không còn BLOCKER/MAJOR mở.
