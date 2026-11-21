# Chương trình Backend Codebase Refactoring (SE-021) — bảng theo dõi

Tài liệu theo dõi **duy nhất** của chương trình (chỉ thị CTO "Autonomous Backend Review & Merge" 21/11/2026, mục 4). Hồ sơ task: [SE-021](../tasks/SE-021-backend-codebase-audit.md). Chi tiết theo vòng: [báo cáo ngày 21/11](daily/2026-11-21.md) (vòng 6–10).

Phạm vi: chỉ `apps/api`; giữ API contract và nghiệp vụ, trừ sửa bug đã duyệt; không viết unit test mới. TL tự review/merge PR đạt gate; thay đổi chính sách bảo mật phiên, schema, contract → CTO.

Cập nhật: 21/11/2026 19:54 · `develop` @ `fe06486` — trạng thái hiện hành: **mục 10** · DONE 1/9 (F04)

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
| C1 Data Cleanup | **DONE** (phạm vi 217 ID đã duyệt) — xóa sau xác nhận trực tiếp của chủ dự án; TL xác minh sau xóa 18:35 | — (thao tác dữ liệu, không có PR code) | 2 tài khoản UNVERIFIED giữ nguyên; export khôi phục ngoài repo |
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

### 7.1. Bảng trạng thái flow (`develop` `4cd1784`, cập nhật 15:2x) — *đã được thay bằng mục 8*
| Flow | Scope | Findings còn mở | PR đã merge | TL review evidence | Regression evidence | DoD chưa đạt | Status | Next action |
|---|---|---|---|---|---|---|---|---|
| **F01** Auth & Sessions | login, refresh/xoay token, logout, phiên (`sessions`), JWT/strategy, cookie, giới hạn đăng nhập, `/me/sessions`, thu hồi khi khóa/đổi mật khẩu | ~~TL-F1~~ (đóng #45); ~~TL-F2/SE-F3~~ (đóng #45, gate 2 đạt); **F01-N1 MAJOR**; **F01-N2 MAJOR**; SE-F24 MAJOR; KT-3 MAJOR (SE-005); F01-N3 MINOR; MINOR `initial` thừa | 2 (#39, #45) | Vòng 6, 7.2, review vòng 8 (gate 1/2 TL tự kiểm trên DB riêng) | 27/27 + gate 1/2 + TL-F1 (DB `cat_gpt_loadtest`) | D3 (4 MAJOR còn), D14, D15 | **IN PROGRESS** — không còn BLOCKER | PR-B8 (SE-F24, F01-N1, F01-N2) → SE-005 (KT-3) → TL xác minh toàn F01 |
| F02 Authorization, Roles, Ownership | guard/roles, admin users, `/me`, avatar | SE-F28, F29, F12/TL-F12, F13/TL-F9 (MINOR) | 1 (#42) | Vòng 6, 13 | 27/27 | D13 (chưa review toàn phạm vi theo DoD) | PARTIAL | TL review toàn phạm vi sau F01 |
| F03 Chat | stream, Dừng, Tạo lại, lưu trữ | SE-F8 (MINOR), SE-F9, SE-F10 (cần CTO) | 3 | Vòng 3, 9 | race + 27/27 | D2 (chờ CTO SE-F9/F10) | PARTIAL | Chờ CTO SE-F9/F10 |
| F04 Documents upload/download | upload, kiểm tra, bóc tách, MinIO, tải về | ~~F04-N1~~ (đóng #46); SE-F18 (SUGGESTION); F04-N2 (SUGGESTION); MINOR thông điệp lỗi | 4 (#38, #40, #41, #46) | Vòng 2, 5, 23 (toàn phạm vi), review vòng 9–10 | probe B1; MinIO thật; probe 3 biến thể bom + DOCX có ảnh; 27/27 sau merge | D2 (2 SUGGESTION + 1 MINOR chưa xử lý — không chặn), D15 toàn flow | **PARTIAL** — không còn BLOCKER/MAJOR | TL xác minh toàn F04 (upload TXT/PDF/DOCX, tải về, lỗi) → xét DONE |
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

### 7.3. F04 — independent review phần còn lại (TL, 15:24)
Đọc thêm: `text-extract.ts`, `sanitize-filename.ts`, `upload-size.filter.ts` → F04 đã đọc toàn phạm vi (D1).
| ID | Mức | File:dòng | Bằng chứng | Ảnh hưởng | Sửa | Ở đâu |
|---|---|---|---|---|---|---|
| **F04-N1** | **BLOCKER** (bảo mật — DoS) | `text-extract.ts:120-126` | Chỉ `word/document.xml` được đo giải nén; `mammoth.extractRawText` đọc thêm `styles.xml`… không giới hạn. **Probe TL** (bản build `955be7c`): docx **101 KB** có `styles.xml` giải nén 100 MB → `extractDocx` thành công, RSS **167 → 470 MB** | User đã đăng nhập tải lên docx 25 MB (≈ 1000× nén) → hết bộ nhớ, **sập tiến trình API** (worker chạy chung) | Đo byte giải nén thật của mọi entry `.xml`/`.rels`, cộng dồn ≤ `DOCUMENT_MAX_DOCX_XML_MB`, trước khi gọi mammoth | PR-B9 |
| F04-N2 | SUGGESTION | `sanitize-filename.ts:10-12` | Luôn đọc lại tên tệp latin1 → UTF-8 (đúng với multer 2.x hiện tại) | Nếu đổi cấu hình `defParamCharset` của multer/busboy sau này, tên tiếng Việt sẽ lỗi | Ghi chú phụ thuộc; không sửa | — |
Đã kiểm đạt: tên tệp chỉ là siêu dữ liệu (khóa lưu trữ dùng ID, không có path traversal); `Content-Disposition` mã hóa `encodeURIComponent`; PDF giới hạn số trang trước khi bóc chữ; TXT kiểm UTF-8 + byte 0; kiểm chữ ký DOCX lúc upload chỉ đọc thư mục zip (không giải nén); upload > giới hạn → `400 FILE_TOO_LARGE`.

### 5.4. C1 — duyệt manifest (TL, 15:54)
Manifest SE (ngoài repo, sha256 `ca3d509390e8ca57e8a1049cc74d37c9e65acc1e81d160c90d62ca5dc329a4a6`, tạo bằng script chỉ đọc): 216/216 ID tìm thấy trong DB `cat_gpt`, 0 lệch email/nguồn.
| Nhóm | Số ID | Phiên | Hội thoại | Tin nhắn | Tài liệu | Avatar / MinIO / Qdrant / BullMQ | TL đối chiếu |
|---|---|---|---|---|---|---|---|
| A1 `loadtest+` | 200 | 47 | 0 | 0 | 0 | 0 | 200/200 khớp danh sách SE ghi lúc tạo; tất cả `BLOCKED` |
| A2 `tl-smoke-*` | 10 | 16 | 0 | 0 | 0 | 0 | Khớp đúng 10 ID mục 5.1 |
| A2-11 (TL bổ sung) | 1 | ? | ? | ? | ? | ? | `6b01212557c88b5696a08b83` — tạo 04:42:13Z bởi kịch bản TL, 1 s sau khi API review TL khởi động (log 11:42:12); lần chạy bị ngắt nên chưa khóa/dọn. **Cần SE inventory trước khi xóa** |
| A3 tài khoản thử SE | 6 | 15 | 19 | 38 | 0 | 0 | Mỗi ID có file nguồn ghi lúc tạo (TL kiểm nội dung + giờ ghi trước giờ mở PR) hoặc hồ sơ SE-018 |
| UNVERIFIED | 2 | — | — | — | — | — | `b2-race-1795235391161`, `b7-1795237688343` (`@example.invalid`) — không có ID nguồn → **giữ nguyên** |
Điều kiện thực hiện: export JSON (sha256) của mọi bản ghi sẽ xóa → TL kiểm số bản ghi export → **TL GO** → xóa theo `$in` đúng danh sách, thứ tự Qdrant → MinIO → BullMQ → messages → conversations → documents → sessions → users → đếm lại, kiểm mồ côi, health.

### 5.5. C1 — kiểm export và GO (TL, 15:57)
Manifest v2 sha256 `a7fef1f6164874e95d1a50f8761b86d50d0ffbf31f507b75acd88953a72d67bd` (217 ID: A1 200, A2 11, A3 6). Export ngoài repo, `INDEX.json` sha256 `cbf0a9fe1351a3963ab346a62c904711396c7c68ba9f2981a33a7a550ff73c90`.
| Tệp export | Bản ghi | sha256 khớp INDEX | Kiểm phạm vi (TL) |
|---|---|---|---|
| users | 217 | Đạt | Đúng 217 ID manifest; 0 ADMIN; 0 UNVERIFIED |
| sessions | 79 | Đạt | Mọi `userId` ∈ 217 ID |
| conversations | 25 | Đạt | Mọi `userId` ∈ 217 ID |
| messages | 50 | Đạt | Mọi bản ghi thuộc 25 hội thoại trên và `userId` ∈ 217 ID |
| documents, MinIO, Qdrant, BullMQ | 0 | Đạt | — |
**GO xóa** với số kỳ vọng cố định: messages 50 → conversations 25 → sessions 79 → users 217; lệch là dừng. Export giữ ngoài repo (có hash mật khẩu tài khoản thử) để khôi phục.

### 5.6. C1 — kết quả xóa và xác minh (SE thực hiện sau xác nhận của chủ dự án; TL xác minh 18:35)
Chủ dự án xác nhận trực tiếp trong phiên Senior Dev ("Xác nhận xóa theo manifest v2"). SE kiểm lại sha256 export trước khi xóa, rồi xóa theo `{_id: {$in: [...]}}` đúng danh sách:
| Bước | Kỳ vọng | Đã xóa |
|---|---|---|
| Qdrant / MinIO / BullMQ | 0 | 0 (không có gì) |
| messages | 50 | 50 |
| conversations | 25 | 25 |
| documents | 0 | 0 |
| sessions | 79 | 79 |
| users | 217 | 217 |
**SE xác minh:** users 238 → 21; còn lại theo 217 ID = 0 ở mọi collection; messages của 25 hội thoại đã xóa = 0 (không mồ côi); 2 UNVERIFIED còn; admin còn. ID không xóa được: không có.
**TL xác minh độc lập** (API `develop` `fe06486` trên DB `cat_gpt`, chỉ đọc qua API quản trị, đăng xuất admin sau khi kiểm): `health` `200`; admin đăng nhập `200`; tổng users **21** (1 ADMIN, 20 USER) = 238 − 217; tìm theo `loadtest`, `tl-smoke`, `se018-regression`, `se020-regression`, `b1-e2e`, `b4-verify` → **0**; `b2-race` → 1 và `b7-` → 1 (đúng 2 UNVERIFIED được giữ). *Ghi chú trung thực:* lần kiểm đầu TL dùng sai tên tham số (`q` thay vì `search`) nên API trả `400` và kết quả 0 vô nghĩa; TL phát hiện và kiểm lại với `search`, kết quả trên là lần đúng. Số bản ghi phiên/hội thoại/tin nhắn mồ côi: theo kết quả SE (API quản trị không đọc được dữ liệu Chat của người khác — đúng thiết kế phân quyền).

## 8. Trạng thái thực tế F01–F09 (kiểm tra theo yêu cầu CTO, 21/11/2026 19:4x)

**`develop` @ `fe06486`** — CI `build` success ([run 44886404082](https://github.com/duong2604/cat_gpt/actions/runs/44886404082)). Không có PR mở. Bảng này **thay thế** bảng 7.1.

**PR #45 (PR-B3)** — MERGED → `73614c9` (head đã review `bfbbb5a`, CI SUCCESS). TL review vòng 8: APPROVED; gate 1 (replay) và gate 2 (2 tab, cả hai thứ tự cookie jar, sau 31 s không thu hồi) TL tự kiểm trên DB `cat_gpt_loadtest`; hồi quy 27/27. Đóng TL-F1 (BLOCKER), TL-F2/SE-F3. Còn MINOR: `const initial = first;` thừa. Rủi ro còn lại: ân hạn 30 s cho đổi token vừa bị thay đúng một lần.
**PR #46 (PR-B9)** — MERGED → `fe06486` (head đã review `bcbab5e`, CI SUCCESS). Vòng 1 `3729d68` **Cần sửa** (TL tái hiện vượt bằng tên tệp không `.xml`); vòng 2 APPROVED. Đóng F04-N1 (BLOCKER). Còn MINOR: thông điệp lỗi "Các phần XML…" chưa cập nhật.

### 8.1. Bảng tổng kết
| Flow | Audit toàn bộ | SE refactor xong | TL review độc lập toàn bộ | Findings còn mở (severity) | PR đã merge | Điều kiện còn thiếu để DONE | **Kết luận** |
|---|---|---|---|---|---|---|---|
| **F01** Auth & Sessions | Có (TL 7.2) | Chưa — PR-B8, SE-005 chưa xong | Có (7.2 + review vòng 8) | **MAJOR ×4**: F01-N1 (secret JWT mẫu), F01-N2 (mật khẩu admin mẫu), SE-F24 (cookie `secure`) → PR-B8 **chưa bắt đầu**; KT-3 (IP dùng chung bị chặn đăng nhập) → SE-005 **WIP chưa kiểm chứng**. MINOR: F01-N3, `initial` thừa | #39, #45 | PR-B8 + SE-005 merge; TL xác minh sau merge toàn F01 | **PARTIAL** |
| F02 Authorization, Roles, Ownership | Có (TL + SE-F23…F30) | Một phần (#42) | Chưa đủ — TL chưa tự đọc `users.service.ts` toàn bộ, DTO admin, `admin-users.controller.ts` | MINOR: SE-F12/TL-F12, SE-F13/TL-F9, SE-F28, SE-F29 (chưa quyết định xử lý hay backlog) | #42 | TL review toàn phạm vi; chốt từng MINOR (sửa hoặc chấp nhận có ghi lý do); xác minh sau merge | **PARTIAL** |
| F03 Chat | Có | Một phần (#39, #40, #43) | Có (từng PR) | MINOR: SE-F8 (khe hẹp tin mồ côi — chú thích đã sửa), SE-F9 (Tạo lại xóa câu cũ trước), SE-F10 (tin nhắn không phân trang — đổi contract) — **SE-F9/F10 chờ CTO quyết, chưa có chỉ đạo** | #39, #40, #43 | Quyết định CTO SE-F9/F10 → làm hoặc chấp nhận | **BLOCKED** (chờ CTO) |
| F04 Documents upload/validation/download | Có (TL 7.3) | Có (#38, #40, #41, #46) | Có (7.3 + review vòng 9–10) | MINOR: thông điệp lỗi "Các phần XML…" (PR-B8). SUGGESTION: SE-F18, F04-N2 (chấp nhận, không sửa) | #38, #40, #41, #46 | **Chỉ còn** MINOR thông điệp (PR-B8) → kiểm lại → DONE. **Xác minh toàn flow sau merge đã đạt 18/18** (mục 8.2) | **PARTIAL** (gần DONE nhất) |
| F05 Processing/Delete/Cleanup | Có | Một phần (#40) | Có (vòng 4–5) | MINOR: SE-F22 (không có reconcile khi job xóa thất bại) — **chờ CTO** | #40 | Quyết định CTO SE-F22 | **BLOCKED** (chờ CTO) |
| F06 RAG | Có | Một phần (#40) | Có | SUGGESTION: SE-F16 (kiểm nội dung trích dẫn), SE-F17 (vị trí dữ liệu trong prompt) — **chờ CTO**; TL-F11 (tùy chọn) | #40 | Quyết định CTO SE-F16/F17 | **BLOCKED** (chờ CTO) |
| F07 Summary/BullMQ | Có | Một phần (#40, #43) | Có | MINOR: SE-F5 (timeout LLM/embedding — audit trong PR-B8, **chưa bắt đầu**) | #40, #43 | PR-B8 (audit + đề xuất timeout) | **PARTIAL** |
| F08 Config/Logging/Exceptions | Có | Một phần (#42) | Có (vòng 13, 21) | **MAJOR**: DNS ghi đè toàn tiến trình; SE-F24 (chung F01). MINOR: SE-F26 (Swagger). R1–R12 chưa cài | #42 | PR-B8 | **PARTIAL** |
| F09 Module structure | Có | Một phần (#43) | Có | MINOR: B12 `ioredis` không dùng (PR-C2 **chưa bắt đầu**); TL-F10, SE-F19 chấp nhận | #43 | PR-C2 | **PARTIAL** |

**DONE: 0/9 · PARTIAL: 6 (F01, F02, F04, F07, F08, F09) · BLOCKED: 3 (F03, F05, F06 — chờ quyết định CTO).** Không còn BLOCKER mở; còn **5 MAJOR** (4 ở F01, 1 ở F08 — SE-F24 tính chung).
**Gần DONE nhất:** F04 (1 MINOR thông điệp). Kế tiếp: F02 (TL review toàn phạm vi + chốt MINOR).
**Việc chặn nhiều flow nhất:** PR-B8 — giao từ 12:4x nhưng **chưa bắt đầu** lúc 19:4x (SE bận PR-B3, PR-B9, C1). TL đã yêu cầu SE xác nhận bắt đầu và ước lượng.

### 8.2. F04 — xác minh toàn flow sau merge (TL, 19:4x)
`develop` `fe06486`, API `dist` cổng 4100 trên DB `cat_gpt_loadtest` (không dùng DB demo), kịch bản `f04-verify.mjs` ngoài repo, 2 tài khoản tạm:
| Ca | Kết quả |
|---|---|
| TXT, PDF text, PDF nhiều trang, DOCX hợp lệ | READY |
| DOCX hỏng, PDF hỏng | FAILED `DOCUMENT_UNREADABLE` |
| PDF scan | FAILED `DOCUMENT_NO_TEXT` |
| DOCX bom (rels styles → `word/st` 100 MB) | FAILED `DOCUMENT_TOO_MANY_CHUNKS` |
| Tên tệp tiếng Việt | Giữ nguyên |
| > 25 MB / `.exe` / chữ ký PDF giả | `400 FILE_TOO_LARGE` / `400 FILE_INVALID_TYPE` / `400 FILE_INVALID_TYPE` |
| Tải về TXT, PDF | `200`, khớp từng byte, `Cache-Control: private, no-store` |
| Người khác tải / ẩn danh / admin đọc | `404` / `401` / `404` |
| Health sau mọi ca | `200` |
**18/18 PASS.** Dọn: 8 tài liệu xóa theo ID (`204`), 2 tài khoản tạm `BLOCKED` (trên DB `cat_gpt_loadtest`).

### 8.3. Ngoài SE-021 (báo riêng, không tính vào tiến độ flow)
| Hạng mục | Trạng thái thực tế |
|---|---|
| **C1 Data Cleanup** | **DONE** (phạm vi 217 ID đã duyệt) — xóa sau xác nhận trực tiếp của chủ dự án; TL xác minh: users 238 → 21, không còn tài khoản thử trong phạm vi, admin đăng nhập được, health 200 (mục 5.6). Còn 2 tài khoản UNVERIFIED giữ nguyên |
| **C2 Code Cleanup** | **CHƯA BẮT ĐẦU** — B2 (production cấm mock) gộp vào PR-B8; B12 (`ioredis`) là PR-C2 riêng; cả hai chưa có PR |
| **SE-005** | **Tạm dừng, chưa kiểm chứng** — nhánh local `fix/shared-ip-throttling`, commit WIP `0167803` (không push); AC1 tái hiện trên DB demo (25/200 thành công, 175 `429`), chưa chạy lại trên DB riêng; chưa build/PR. Hạn bàn giao dự kiến 27/11 |

## 9. Đóng flow theo quyết định CTO (chỉ thị "Flow Closure & Blocker Resolution" + review vòng 31) — 21/11/2026 19:5x

**`develop` @ `fe06486`**, CI success (run 44886404082). Bảng 9.2 **thay thế** mục 8.1. Tiến độ đo bằng **số flow DONE**: **0/9**.

### 9.1. Risk-Based DoD (CTO điều chỉnh)
- BLOCKER/MAJOR: phải xử lý hoặc có ngoại lệ CTO rõ ràng.
- MINOR: TL được đưa backlog nếu có lý do, owner, không ảnh hưởng nghiêm trọng.
- SUGGESTION: không bắt buộc.
- DEFERRED: ghi phạm vi, rủi ro, owner, điều kiện mở lại.
- **Ghi chú mâu thuẫn chỉ thị (TL theo bản mới nhất):** chỉ thị "Flow Closure" cho đóng F04 ngay nếu chỉ còn MINOR; review vòng 31 (ban hành sau) yêu cầu final review F04 **sau PR-B8**. TL làm theo review vòng 31: F04 giữ PARTIAL, đủ điều kiện DONE ngay sau PR-B8.

### 9.2. Trạng thái từng flow
| Flow | Status | DoD còn thiếu | Findings resolved | Findings deferred / backlog (owner) | Evidence | PR → merge SHA | TL final review verdict | Next action |
|---|---|---|---|---|---|---|---|---|
| **F01** Auth & Sessions | **PARTIAL** | D3 (MAJOR mở), D14, D15 | TL-F1 (BLOCKER), TL-F2/SE-F3 | F01-N3 MINOR → backlog (SE, lý do: thêm 1 truy vấn/lần đăng nhập, không ảnh hưởng đúng sai); F01-N4 SUGGESTION — không làm; **residual risk ân hạn 30 s** — CTO chấp nhận tạm (9.4) | Review vòng 6, 7.2, 8; gate 1/2 trên DB riêng; 27/27 | #39 → `3e9abe7`; #45 → `73614c9` | Chưa final — **còn MAJOR**: F01-N1, F01-N2, SE-F24 (PR-B8); KT-3 (SE-005) | PR-B8 → SE-005 → final review |
| F02 Authorization, Roles, Ownership | **PARTIAL** | D3 (MAJOR mở) | SE-F27 (#42) | SE-F12/TL-F12 MINOR → backlog (SE; file ảnh mồ côi khi 2 upload đồng thời, không lộ dữ liệu); SE-F13/TL-F9 MINOR → SE-006 (công cụ khôi phục admin); SE-F28 MINOR → SE-005/SE-006 (giới hạn thử sai đổi mật khẩu); SE-F29 MINOR → backlog (SE; người gọi đã kiểm tồn tại) | **TL review toàn phạm vi xong 19:5x** (thêm `admin-users.controller.ts`, DTO admin, `users.service.ts` toàn bộ) | #42 → `582865b` | Chưa final — **MAJOR mới F02-N1** (9.3) | SE-006 (CS-3) hoặc ngoại lệ CTO |
| F03 Chat | **PARTIAL** (bỏ trạng thái chờ CTO) | D2 (SE-F9 chưa làm) | SE-F4/TL-F3, TL-F4/SE-F11, SE-F8 (chú thích) | **SE-F10 DEFERRED** (9.5); SE-F8 phần logic khe hẹp MINOR → backlog (SE) | Review vòng 3, 9; race + 27/27 | #39 → `3e9abe7`; #40 → `310ee02`; #43 → `f173090` | Chưa final | **Follow-up PR-B10 (SE-F9)** |
| **F04** Documents | **PARTIAL — đủ điều kiện DONE sau PR-B8** | D2: 1 MINOR (thông điệp lỗi) đang trong PR-B8 | SE-F1, SE-F2, F04-N1 (BLOCKER), TL-F7, log tải về | SE-F18, F04-N2 SUGGESTION — không làm | Review vòng 2, 5, 9, 10; **xác minh toàn flow 18/18** trên `fe06486` (8.2); CI xanh | #38 → `7433ce3`; #40 → `310ee02`; #41 → `646fcb4`; #46 → `fe06486` | Không còn BLOCKER/MAJOR; MINOR không sai contract/hành vi. **Final review ngay sau PR-B8** | PR-B8 merge → final review → DONE |
| F05 Processing/Delete | **PARTIAL** (bỏ chờ CTO) | D2 (SE-F22 chưa làm) | TL-F5/SE-F6 (log), TL-F7 | — | Review vòng 4, 5 | #40 → `310ee02`; #41 → `646fcb4` | Chưa final | **Follow-up PR-B11 (SE-F22)** — thiết kế trước, TL duyệt rồi mới code |
| F06 RAG | **PARTIAL** (bỏ chờ CTO) | D2 (SE-F16, SE-F17 chưa làm) | SE-F14, SE-F15 | TL-F11 SUGGESTION — không làm | Review vòng 4 | #40 → `310ee02` | Chưa final | **Follow-up PR-B12 (SE-F16/F17)** — phân tích + bằng chứng trước/sau |
| F07 Summary/BullMQ | **PARTIAL** | D2 (SE-F5 audit) | SE-F20 phần 1, TL-F8 (chấp nhận) | — | Review vòng 4, 7; b7-check | #40 → `310ee02`; #43 → `f173090` | Chưa final | PR-B8 (audit timeout) |
| F08 Config | **PARTIAL** | D3 (MAJOR DNS, SE-F24) | SE-F23, SE-F25, SE-F27 | — | Review vòng 13, 21 | #42 → `582865b` | Chưa final | PR-B8 |
| F09 Module structure | **PARTIAL — đủ điều kiện DONE sau PR-C2** | D2: MINOR B12 `ioredis` (PR-C2) | SE-F20 phần 1, TL-F7 | TL-F10, SE-F19 — chấp nhận (không abstraction thừa; dữ liệu mock của chế độ phát triển); SE-F20 phần 2 — không làm | Review vòng 7 | #43 → `f173090` | Không còn BLOCKER/MAJOR | PR-C2 → final review → DONE |

**DONE 0/9 · PARTIAL 9 · BLOCKED 0.**
**Đủ điều kiện DONE sớm:** F04 (sau PR-B8), F09 (sau PR-C2).
**MAJOR còn mở (6):** F01-N1, F01-N2, SE-F24 (F01/F08), DNS (F08) → PR-B8; KT-3 (F01) → SE-005; **F02-N1** (F02) → SE-006.

### 9.3. F02 — TL independent review toàn phạm vi (19:5x)
Đọc thêm: `admin-users.controller.ts` (`@Roles(ADMIN)` cấp class; 6 route), `dto/admin-users.dto.ts` (`CreateUserDto` dùng `IsStrongPassword`, `role` `@IsEnum`; `UpdateUserDto` có `email`, `fullName`, `role`, `phone`, `department` — **không** có `status`), `users.service.ts` toàn bộ (`update` `$set` + `runValidators`, map lỗi trùng email; `list` tìm theo regex đã escape).
| ID | Mức | File:dòng | Bằng chứng | Ảnh hưởng | Xử lý |
|---|---|---|---|---|---|
| **F02-N1** | **MAJOR** | `admin-users.service.ts` `update` (đổi email qua `UpdateUserDto.email`) | Không gọi `revokeAllForUser` khi email đổi; quy tắc **CS-3** (khách hàng duyệt 15/11: thu hồi mọi phiên khi đổi email) chưa cài | Admin đổi email (vd tài khoản bị chiếm) nhưng phiên cũ vẫn dùng được tới khi hết hạn | Thuộc **SE-006** (task Sẵn sàng, đã duyệt) — không mở rộng PR-B8; hoặc CTO cấp ngoại lệ |
Đã kiểm đạt: không leo quyền qua `PATCH /me`; admin không tự hạ quyền/khóa mình; khóa/đặt lại mật khẩu thu hồi mọi phiên; ID không hợp lệ → `404`.

### 9.4. Security risk register
| ID | Rủi ro | Trạng thái | Quyết định | Điều kiện mở lại |
|---|---|---|---|---|
| SR-1 | Ân hạn 30 s sau xoay refresh token: người giữ token vừa bị thay đổi được lấy token mới **một lần** | **Chấp nhận tạm** (CTO 21/11/2026) | Không mở rộng ân hạn hay số lần dùng lại; không coi là cơ chế chống đánh cắp token hoàn chỉnh | Có bằng chứng khai thác; đổi mô hình triển khai; yêu cầu bảo mật mới |

### 9.5. Deferred
| ID | Phạm vi | Rủi ro | Owner | Điều kiện mở lại |
|---|---|---|---|---|
| SE-F10 | `GET /conversations/:id/messages` trả toàn bộ tin nhắn, không phân trang | Hội thoại rất dài → phản hồi lớn, tốn bộ nhớ; hiện chưa quan sát vượt ngưỡng | TL (technical debt) | Có hội thoại > 500 tin hoặc phản hồi > 1 MB trong thực tế; hoặc frontend cần phân trang và CTO duyệt đổi API contract |

### 9.6. Follow-up task (không mở rộng PR-B8)
| PR | Flow | Nội dung (theo quyết định CTO) | Điều kiện bắt buộc | Thứ tự |
|---|---|---|---|---|
| PR-B10 | F03 | SE-F9: Tạo lại giữ câu trả lời cũ tới khi câu mới hoàn tất; lỗi/Dừng → câu cũ còn nguyên | Review thứ tự tin nhắn, Dừng, SSE; không đổi API contract | Sau SE-005 |
| PR-B11 | F05 | SE-F22: retry/reconcile cho dọn dẹp thất bại | **Thiết kế trước** (TL duyệt): idempotent, giới hạn retry, log, chỉ xóa theo ID đã đánh dấu, xử lý khi hết lượt; không đổi HTTP contract | Sau PR-B10 |
| PR-B12 | F06 | SE-F16 kiểm chứng trích dẫn (phạm vi hẹp); SE-F17 review cấu trúc prompt | Bằng chứng trước/sau trên baseline TL-009 (không đổi baseline); không thêm LLM verifier tốn chi phí/độ trễ; chi phí mới hoặc thay đổi lớn → báo CTO | Sau PR-B11 |
Thứ tự chung (CTO review vòng 31): **PR-B8 → PR-C2 → SE-005** (hạn 27/11) → PR-B10 → PR-B11 → PR-B12. Lý do đặt B10–B12 sau SE-005: CTO giữ nguyên kế hoạch B8 → C2 → SE-005; B10–B12 không có BLOCKER/MAJOR.

### 9.7. Tiêu chí review PR-B8 (CTO vòng 31)
TL sẽ kiểm độc lập trước khi merge: (1) đủ R1–R12 — mỗi quy tắc một ca fail/pass bằng `validateEnv` trên bản build; (2) production fail-closed, local/demo vẫn khởi động (kiểm `.env` máy demo); (3) `DNS_SERVERS` không đặt → **không** đổi DNS tiến trình (kiểm `dns.getServers()` trước/sau khởi động); đặt → dùng đúng giá trị; (4) báo cáo timeout LLM/embedding: giá trị hiện tại, đề xuất, cancellation, tác động; (5) đóng 2 MINOR (`initial` thừa; thông điệp "Các phần XML…"); (6) đọc diff, hồi quy, CI.

## 10. F04 DONE; F02-N1 MUST FIX (chỉ thị CTO "F02-N1 Security Fix & Flow Closure") — 21/11/2026 19:5x

**`develop` @ `fe06486`**, CI success ([run 44886404082](https://github.com/duong2604/cat_gpt/actions/runs/44886404082)). Bảng 10.3 **thay thế** bảng 9.2. **Tiến độ: DONE 1/9.**

### 10.1. F04 — TL final review: **DONE**
| Tiêu chí (CTO mục 2 + Risk-Based DoD) | Kết quả | Bằng chứng |
|---|---|---|
| Toàn bộ phạm vi đã audit | Đạt | TL 7.3 (`text-extract`, `sanitize-filename`, `upload-size.filter`) + review vòng 2, 5 |
| PR liên quan đã merge | Đạt | #38 → `7433ce3`; #40 → `310ee02`; #41 → `646fcb4`; #46 → `fe06486` |
| DOCX zip bomb đã xử lý | Đạt | F04-N1 đóng (#46 vòng 2); 3 biến thể bom bị chặn; xác minh lại trong 18/18 |
| Regression 18/18 | Đạt | Mục 8.2 — trên chính `fe06486` (= `develop` hiện tại; code `documents` không đổi sau xác minh) |
| Không còn BLOCKER/MAJOR | Đạt | SE-F1, SE-F2, F04-N1 đã đóng |
| MINOR không sai contract/bảo mật/nghiệp vụ | Đạt | Thông điệp nội bộ "Các phần XML của DOCX…" chỉ nằm trong log/exception nội bộ; client nhận mã `DOCUMENT_TOO_MANY_CHUNKS` không đổi |
| CI xanh | Đạt | run 44886404082 tại `fe06486` |
**Deferred:** MINOR thông điệp lỗi (`text-extract.ts`, `measureEntryWithinBudget`) — **owner SE, follow-up PR-B8**. SUGGESTION SE-F18, F04-N2 — không làm (lý do ở 7.3).
**TL final review verdict: DONE** (TL, `fe06486`, 19:5x).

### 10.2. F02-N1 — đối chiếu CS-3 và tách PR
- **CS-3** ([access-control](../design/access-control.md#4-chính-sách-đã-chốt), khách hàng chốt 15/11/2026): admin được đổi email nhân viên, có xác nhận, kiểm trùng, nhật ký; **đổi email → thu hồi mọi phiên** của nhân viên — request kế tiếp `401`, đăng nhập lại bằng email mới.
- **SE-006** gồm CS-2 (chặn đặt lại mật khẩu admin), CS-3 (hộp thoại UI, kiểm trùng, thu hồi phiên, nhật ký `audit_logs`), CS-4 (bỏ SĐT ở màn quản trị), công cụ khôi phục admin — phạm vi lớn (2,5 ngày).
- **Tách PR-B13** = chỉ **SE-006 AC4** (backend thu hồi phiên khi email đổi). Không làm hộp thoại UI (frontend), `audit_logs`, CS-2, CS-4, công cụ khôi phục — giữ trong SE-006.
- **Thiết kế TL duyệt:** cập nhật email trước → chỉ khi thành công **và** email thật sự đổi (sau chuẩn hóa) mới `revokeAllForUser`; cập nhật lỗi → không thu hồi; revoke lỗi → log + 5xx, không nuốt lỗi.
- **Phân tích race (TL):** (a) refresh song song: `swapToken` CAS có `revokedAt: null` → nếu thu hồi trước, CAS thua, đọc lại thấy đã thu hồi → `401`; nếu xoay xong trước, thu hồi ngay sau đó vô hiệu phiên và access token mới bị `JwtStrategy.findActive` chặn ở request kế tiếp; (b) request đã xác thực trước thời điểm thu hồi được chạy hết — giới hạn chấp nhận, ghi rõ; (c) đăng nhập bằng email mới chen giữa update và revoke sẽ bị thu hồi theo (khe vài ms) — chấp nhận, người dùng đăng nhập lại. TL sẽ kiểm (a) bằng kịch bản thật khi review.
- **AC (CTO):** đổi email thành công → phiên cũ bị thu hồi; access token cũ `401`; refresh token cũ `401`, không cấp phiên mới; user khác không ảnh hưởng; đổi email thất bại không thu hồi; quyền admin/ownership không đổi; bằng chứng trên DB riêng `cat_gpt_loadtest`.

### 10.3. Trạng thái flow
| Flow | Status | MAJOR còn mở | PR → merge SHA | TL final review | Next action | ETA |
|---|---|---|---|---|---|---|
| F01 Auth & Sessions | PARTIAL | F01-N1, F01-N2, SE-F24 (PR-B8); KT-3 (SE-005) | #39 → `3e9abe7`; #45 → `73614c9` | Chưa | PR-B8, SE-005 | PR-B8: 2–3 giờ từ ~19:48; SE-005: hạn 27/11 |
| F02 Authorization | PARTIAL | **F02-N1** (PR-B13) | #42 → `582865b` | Chưa (review toàn phạm vi xong 9.3) | PR-B13 | Sau PR-B8; ước lượng 0,25 ngày |
| F03 Chat | PARTIAL | — | #39, #40, #43 | Chưa | PR-B10 (SE-F9) | Sau SE-005 |
| **F04 Documents** | **DONE** | — | #38 → `7433ce3`; #40 → `310ee02`; #41 → `646fcb4`; #46 → `fe06486` | **DONE** (10.1) | MINOR thông điệp trong PR-B8 | — |
| F05 Processing/Delete | PARTIAL | — | #40, #41 | Chưa | PR-B11 (SE-F22, thiết kế trước) | Sau PR-B10 |
| F06 RAG | PARTIAL | — | #40 | Chưa | PR-B12 (SE-F16/F17) | Sau PR-B11 |
| F07 Summary/BullMQ | PARTIAL | — | #40, #43 | Chưa | PR-B8 (audit timeout) | Cùng PR-B8 |
| F08 Config | PARTIAL | DNS, SE-F24 (PR-B8) | #42 → `582865b` | Chưa | PR-B8 | Cùng PR-B8 |
| F09 Module structure | PARTIAL | — | #43 → `f173090` | Chưa — đủ điều kiện sau PR-C2 | PR-C2 → review dependency graph, xác nhận `ioredis` không dùng, build/lint/typecheck/runtime, final review | Sau PR-B13 |
**DONE 1/9 (F04) · PARTIAL 8 · BLOCKED 0.** **MAJOR còn mở: 6** — F01-N1, F01-N2, SE-F24, DNS, KT-3, F02-N1.
**Thứ tự (CTO):** PR-B8 → PR-B13 (F02-N1) → PR-C2 → SE-005 → PR-B10 → PR-B11 → PR-B12.
