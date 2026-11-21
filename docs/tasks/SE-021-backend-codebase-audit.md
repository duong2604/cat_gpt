# SE-021 — Backend Codebase Audit & Refactoring (`apps/api`)

Trạng thái: Đang làm — giai đoạn B (A bàn giao 21/11/2026, `d6020f8`; TL duyệt phạm vi B 21/11/2026)
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: A 0,5 ngày; B theo phạm vi duyệt (mỗi PR ≤ 0,5 ngày)
Phụ thuộc: làm **sau** khi bàn giao [SE-020](SE-020-dependency-security-patch-r2.md) (cùng phiên SE; không làm song song trên cùng nhánh). Không chặn bởi nghiệm thu M1–M4 ở giai đoạn A (chỉ đọc code)
Hạn bàn giao review: A — 21/11/2026 trong ngày nếu kịp, không thì phiên sau · B — Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 21/11/2026 · bàn giao review A 21/11/2026 · hoàn tất —
Chốt: 21/11/2026 — chỉ thị CTO "TL Independent Backend Code Review": TL tạo task, giao SE audit độc lập, TL duyệt phạm vi refactor nhỏ **không đổi hành vi**; thay đổi kiến trúc lớn / API contract / schema DB / nghiệp vụ trình CTO; **không merge PR refactor khi CTO chưa cho phép**; không viết unit test mới
SHA cơ sở: `origin/develop` @ `b7af2fb` (A); B: `origin/develop` mới nhất khi tạo nhánh
PR: A — không có PR code (báo cáo ghi vào file này); B — <Senior Dev ghi từng PR>

## Mục tiêu
Backend dễ hiểu, dễ bảo trì, dễ debug, ít lỗi, đủ để developer con người tiếp quản. Giai đoạn A tìm vấn đề có bằng chứng; giai đoạn B sửa các mục TL duyệt bằng PR nhỏ, không đổi hành vi.

## Phạm vi
- **Làm (A):** đọc trực tiếp `apps/api/src` theo 6 luồng: (1) Auth & phân quyền; (2) Chat; (3) Documents; (4) RAG; (5) Document Summary; (6) Cross-cutting (config, log, exception filter, DTO validation, rate limit, DI, ranh giới module). Checklist: đúng/đủ logic, dễ đọc, naming, trách nhiệm hàm/class, vị trí file, duplicate/dead code, magic values, abstraction thừa, điều kiện lồng nhau, type assertion không an toàn, async/concurrency, nhất quán DB, exception bị nuốt, thiếu cleanup, log (đủ, không lộ dữ liệu), edge case, mô tả code cho người mới.
- **Làm (B):** chỉ các finding TL đánh dấu "Duyệt — refactor nhỏ"; mỗi PR một chủ đề.
- **Không làm:** đổi API contract (đường dẫn, mã lỗi, response shape), schema DB, hành vi nghiệp vụ; thêm interface/repository/factory không có lợi ích rõ; viết unit test mới; sửa `apps/web`; style chủ quan.

## Định dạng finding (bắt buộc)
| ID | Severity | Luồng | File:dòng | Bằng chứng | Ảnh hưởng | Cách sửa đề xuất | Blocking? |
|---|---|---|---|---|---|---|---|
| SE-F1 | BLOCKER / MAJOR / MINOR / SUGGESTION | 1–6 | `apps/api/src/...:n` | trích code / kịch bản tái hiện | | | Có / Không |

BLOCKER: lỗi logic, bảo mật, dữ liệu, concurrency, regression. MAJOR: khó bảo trì, coupling nghiêm trọng. MINOR: đọc hiểu, naming, tổ chức. SUGGESTION: tùy chọn.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | (A) Báo cáo audit đủ 6 luồng; mỗi luồng ghi rõ đã đọc file nào; finding đúng định dạng trên | Chỉ thị CTO mục 2–5 | TL đối chiếu với code |
| AC2 | (A) Finding BLOCKER/concurrency/nhất quán dữ liệu có kịch bản tái hiện hoặc lập luận theo dòng code cụ thể | Chỉ thị CTO mục 7 | TL tự kiểm chứng |
| AC3 | (B) Mỗi PR không đổi API contract: cùng route, mã HTTP, mã lỗi, response shape — đối chiếu trước/sau bằng gọi API thật | Chỉ thị CTO mục 7 | Kịch bản API trước/sau |
| AC4 | (B) Hồi quy luồng liên quan (M1–M4 38 bước như SE-018) và ca concurrency/cleanup của vùng sửa | Chỉ thị CTO mục 7 | Kịch bản + đầu ra |
| AC5 | (B) `pnpm typecheck`, `lint`, `build`, `pnpm -C apps/api test` (test hiện có), CI xanh tại SHA đầu PR | Quy ước repo | Lệnh + link run |
| AC6 | (B) Diff chỉ trong `apps/api/src` (+ hồ sơ task); không đổi schema, không đổi `.env` | Phạm vi | `git diff --stat` |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q1 | Quyền merge PR refactor (B) | Chờ CTO cho phép từng PR | **CTO 21/11/2026: TL tự review/merge khi đạt gate** (chỉ chương trình SE-021, chỉ `apps/api`) |

## Kết quả review
**A — TL 21/11/2026: Đạt** (AC1, AC2). 22 finding SE đối chiếu với 13 finding TL: xác nhận SE-F1 (BLOCKER, TL tự chạy probe), F2, F3, F4, F6, F7, F14, F15; hạ mức SE-F5, SE-F22 → MINOR; bác cách sửa "retry" của SE-F6. Bảng đầy đủ và phạm vi B: [daily 21/11 vòng 7](../reports/daily/2026-11-21.md#vòng-7--1114-se-020-done-đối-chiếu-audit-se-021-phạm-vi-giai-đoạn-b); finding TL: [vòng 6](../reports/daily/2026-11-21.md#vòng-6--1047-backend-independent-code-review--vòng-tl-đầu-tiên).
**B — phạm vi TL duyệt:** PR-B1 (SE-F1+F2), PR-B2 (SE-F3/TL-F2 + SE-F4/TL-F3), PR-B4 (dọn không đổi hành vi). PR-B3 (TL-F1) và các mục đổi hành vi/thiết kế: chờ CTO. Merge PR B: CTO ủy quyền TL tự merge khi đạt gate (21/11/2026, chỉ thị "Autonomous Backend Review & Merge"). Đã merge #38 → `7433ce3`, #39 → `3e9abe7`, #40 → `310ee02`. Theo dõi flow: [backend-refactor-se021.md](../reports/backend-refactor-se021.md).

## Lịch sử review
### Checklist vòng 1 — giai đoạn A (audit, chỉ đọc)
Căn cứ: `origin/develop` @ `b7af2fb` (`apps/api/src` trùng hệt, đã kiểm `git diff` = 0). Không sửa code, không test mới, không chạy API/web (đúng yêu cầu TL). Kiểm chứng bằng đọc code, thực nghiệm Node độc lập (probe ngoài repo) và mô phỏng logic.

**Phạm vi đã đọc (AC1)**

| Luồng | File đã đọc trực tiếp |
|---|---|
| 1. Auth & phân quyền | `modules/auth/auth.service.ts`, `auth.controller.ts`, `jwt.strategy.ts`; `modules/sessions/sessions.service.ts`; `common/guards/jwt-auth.guard.ts`, `roles.guard.ts`; `app.module.ts`; `modules/me/me.service.ts` (+ danh sách route `me.controller.ts`); `modules/admin-users/admin-users.service.ts`, `dto/admin-users.dto.ts` (`UpdateUserDto`); `modules/storage/files.controller.ts`; `modules/users/admin-seed.service.ts` |
| 2. Chat | `modules/chat/chat.service.ts` (305 dòng, đọc đủ), `chat.controller.ts`, `sse-stream.ts`, `conversations.service.ts`, `conversations.controller.ts`, `dto/chat.dto.ts`, `chat-throttler.guard.ts`, `schemas/message.schema.ts` (index); `modules/llm/openai-llm.provider.ts` |
| 3. Documents | `documents.service.ts`, `documents.controller.ts`, `document-processor.ts` (worker), `document-files.service.ts`, `schemas/document.schema.ts`, `vector-store.service.ts`, `embedding.service.ts` (đọc đủ); `upload-size.filter.ts` (tên, không đọc sâu) |
| 4. RAG | `rag/rag.service.ts`, `rag/rag-prompt.ts`, `vector-store.service.ts` |
| 5. Summary | `documents/document-summary.ts`, `document-processor.ts` (`handleSummarize`, `complete`, `onFailed`), `documents.service.ts` (`requestSummary`, `enqueueSummary`) |
| 6. Cross-cutting | `main.ts`, `common/filters/all-exceptions.filter.ts`, `common/pipes/app-validation.pipe.ts` (cấu hình whitelist), `modules/llm/mock-answers.ts`, `chat-hidden`/`documents-hidden` guard (tên và cách dùng) |

**Chưa đọc sâu (ghi nhận giới hạn, không phải kết luận "đạt"):** `config/app-config.service.ts`, `config/env.validation.ts` (chỉ grep), `storage/local-storage.provider.ts`, `documents/text-extract.ts` (bộ bóc tách PDF/DOCX), `users/users.service.ts` (chỉ `create`/`update`), `common/utils/*`, phần lớn DTO còn lại. Nên bổ sung ở vòng sau nếu TL cần độ phủ đầy đủ 100%.

**Finding (AC1 đúng định dạng; AC2: BLOCKER/concurrency có bằng chứng)**

| ID | Severity | Luồng | File:dòng | Bằng chứng | Ảnh hưởng | Cách sửa đề xuất | Blocking? |
|---|---|---|---|---|---|---|---|
| SE-F1 | BLOCKER | 3 | `modules/documents/documents.controller.ts:96` (`stream.pipe(res)`); `document-files.service.ts:43-44` | Thực nghiệm Node (probe, ngoài repo): nguồn `Readable` đã `pipe` vào response, không có listener `error`, phát `error` giữa chừng → tiến trình thoát mã 1, dòng "still alive" không in. `main.ts` không đăng ký `uncaughtException`/`unhandledRejection`. | Một lỗi MinIO giữa lúc tải về làm **sập toàn bộ API** (mọi người dùng). | `stream.on('error', () => res.destroy())`; `res.on('close', () => stream.destroy())` (xem SE-F2 cùng vùng) | Có |
| SE-F2 | MAJOR | 3 | `documents.controller.ts:90-96` | Client ngắt giữa chừng: `res` đóng nhưng không `destroy()` stream MinIO → kết nối giữ mở tới khi MinIO tự đóng (rò tài nguyên). Cùng vùng với SE-F1, sửa chung. | Rò socket/kết nối MinIO khi người dùng hủy tải; tích lũy dưới tải. | Gắn `res.on('close')` → `stream.destroy()` | Có (gộp cùng SE-F1) |
| SE-F3 | MAJOR | 1 | `modules/sessions/sessions.service.ts:61-108`: đọc `session` (:65), kiểm `matchesCurrent` (:71), `findOneAndUpdate({_id, revokedAt:null})` (:87-104) không có điều kiện trên `tokenHash`; `previousTokenHash: session.tokenHash` (:93) lấy từ **bản đọc cũ** | Thực nghiệm mô phỏng (`rotate()` đúng trường dữ liệu): hai request refresh đồng thời cùng token → cả hai đều được cấp token mới; request thứ hai ghi đè `previousTokenHash` bằng h0, nên token của request thứ nhất (h1) **không còn** trong ân hạn → lần refresh sau của client đó bị coi là dùng lại → **thu hồi phiên**. Kết quả: `REVOKED (reuse detected)`. | Người dùng bị đăng xuất ngoài ý muốn khi có hai refresh song song (hai tab, hoặc hai request 401 đồng thời). Cửa sổ `REFRESH_REUSE_GRACE_MS` không bảo vệ như thiết kế. | Thêm điều kiện `tokenHash: session.tokenHash` vào `findOneAndUpdate`; nếu không khớp (số bản ghi = 0) đọc lại phiên và so với hash hiện tại, không thu hồi nếu token là bản vừa bị thay trong ân hạn; lưu `previousTokenHash` từ đúng phiên bản bị thay. | Có (liên quan xác thực) |
| SE-F4 | MAJOR | 2 | `chat/chat.service.ts:74-76, 84-92, 102-111` (trước khi đăng ký), kiểm tra `:75` & `:99`, đăng ký `inFlight.set` `:133` | Cửa sổ có nhiều `await` giữa kiểm tra và đăng ký: `getOwnedOrThrow` → `assertNotStreaming` (:75) → `createMessage` (:84) → `touch` (:90) → `recentMessages` (:129) → `inFlight.set` (:133). Hai `POST /chat/stream` (hai tab, hoặc bấm đúp) cùng hội thoại đều qua kiểm tra. Kịch bản: cả hai tạo tin người dùng, cả hai stream, hai tin trợ lý. `regenerate` cùng lúc `send` có thể xóa tin trợ lý cuối (:104) giữa chừng. **Dừng** trong cửa sổ này: `stop()` gọi `abort()` không có controller → trả 204 nhưng không hủy gì. | Hội thoại có hai luồng song song, lịch sử lệch thứ tự, chi phí LLM gấp đôi; nút Dừng có thể bị bỏ qua (chưa lan sang user khác). | Đăng ký ngay sau kiểm tra, không có `await` xen giữa: `if (inFlight.has(key)) throw …; inFlight.set(key, controller)` trước `createMessage`/`deleteMessage`; giữ `finally` hiện có (:240-243). Không đổi API. | Có |
| SE-F5 | MAJOR | 5, 3, 4 | `document-processor.ts:105-124` (`complete`), `:180` (embed); `embedding.service.ts:16` (`maxRetries: 1`); `openai-llm.provider.ts:72-82` | Không có `timeout`/`AbortSignal` cho lời gọi tóm tắt và embedding; SDK dùng mặc định của nó (phải đo phiên bản đang cài). Đã đọc: không có `timeout` trong `apps/api/src` ngoài spec. | Job treo giữ concurrency worker, tóm tắt có thể kẹt ở `PENDING` rất lâu (không tự `FAILED`). | Đặt `timeout` tường minh trên client OpenAI; truyền `AbortSignal` có hạn cho `complete()`. | Không |
| SE-F6 | MAJOR | 3 | `document-processor.ts:147-156` | `catch` gán **mọi** lỗi từ `extractPages` thành `failPermanently(DOCUMENT_NO_TEXT)` (không retry), kể cả lỗi nội bộ/tạm thời. Nguyên nhân gốc bị nuốt (không log). | Lỗi tạm thời trở thành `FAILED` vĩnh viễn, mã lỗi sai với người dùng; khó debug production. | Chỉ map lỗi miền (`DocumentUnreadableError`, `DocumentTooLargeToProcessError`, lỗi "không có text"); lỗi khác ném ra để BullMQ thử lại, log đủ. | Không |
| SE-F7 | MAJOR | 6 | `main.ts:13-16` | Khi resolver hệ thống là loopback, đặt DNS **toàn tiến trình** sang `8.8.8.8`/`1.1.1.1`. | Trong mạng nội bộ không có Internet, SRV lookup `mongodb+srv` có thể thất bại; truy vấn DNS hostname nội bộ bị gửi ra resolver công cộng; tác dụng phụ toàn cục khó đoán. | Bỏ workaround, hoặc đưa thành cấu hình tường minh (`DNS_SERVERS`) mặc định không đổi. Quyết định TL/CTO vì ảnh hưởng triển khai. | Cần CTO |
| SE-F8 | MINOR | 2 | `chat/chat.service.ts:211` (kiểm `exists`), `:220` (`createMessage`); `conversations.service.ts:108-112` (xóa không transaction) | Kiểm `exists` rồi ghi là TOCTOU: xóa xen giữa tạo ra tin trợ lý mồ côi. Chú thích ở `:210` nói "không lưu tin nhắn mồ côi" nhưng chưa đúng hoàn toàn. | Dữ liệu rác không truy cập được. | Ghi tin rồi dọn nếu hội thoại đã mất; hoặc sửa chú thích cho đúng. | Không |
| SE-F9 | MINOR | 2 | `chat.service.ts:102-106` | `regenerate` xóa câu trả lời cũ **trước** khi có câu mới; lỗi LLM/Dừng giữa chừng làm mất câu cũ. | Mất nội dung người dùng đã nhận. | Thay tin cũ sau khi tin mới hoàn tất (thay đổi hành vi). | Cần CTO |
| SE-F10 | MINOR | 2 | `conversations.controller.ts:81-87`; `conversations.service.ts:126-132` | `GET /conversations/:id/messages` trả toàn bộ tin, không phân trang. | Hội thoại dài → phản hồi lớn; đổi sang phân trang là đổi contract. | Phân trang cursor (đổi contract). | Cần CTO |
| SE-F11 | MINOR | 1, 2 | `chat/chat-throttler.guard.ts:18-25` và `chat.service.ts:23-25, 53, 296-304` | Hai bộ giới hạn 20/phút chồng nhau (guard + `sendLog`); `sendLog` không xóa key cũ (Map tăng theo số user); chỉ đúng trong một tiến trình. | Logic trùng, bộ nhớ tăng chậm; khó đọc. | Giữ guard, bỏ `sendLog` (hoặc ngược lại). | Không |
| SE-F12 | MINOR | 1 | `me/me.service.ts:54-72` | Hai upload ảnh đồng thời: cả hai đọc `current` cũ; ghi đè DB bằng ảnh cuối, ảnh còn lại thành file mồ côi. | Rác trong storage. | Ghi DB có điều kiện (`avatarKey` bằng giá trị đã đọc) và xóa file của bên thua. | Không |
| SE-F13 | MINOR | 1 | `admin-users/admin-users.service.ts:73-81, 95-100` | Kiểm "còn ít nhất 1 admin" là check-then-act (`countActiveAdmins` rồi `update`): hai admin khóa nhau đồng thời có thể còn 0 admin. | Mất quyền quản trị, cần khôi phục thủ công. | Kiểm tra lại sau khi cập nhật hoặc dùng điều kiện nguyên tử. | Không |
| SE-F14 | MINOR | 4 | `documents/vector-store.service.ts:45-61` | `ensured` chỉ xác nhận collection tồn tại. Crash giữa `createCollection` và `createPayloadIndex` làm thiếu index `userId`/`documentId` **mãi mãi** (lần sau không tạo lại). Hai tiến trình tạo đồng thời → một bên lỗi. | Truy vấn lọc chậm hoặc lỗi khi khởi động mới. | Luôn đảm bảo index (idempotent) sau khi kiểm collection. | Không |
| SE-F15 | MINOR | 4 | `vector-store.service.ts:143-151` | `countByDocumentId` không có caller trong `src` (code chết). | Nhiễu khi đọc. | Xóa. | Không |
| SE-F16 | SUGGESTION | 4 | `rag/rag.service.ts:115-149` | Xác minh trích dẫn chỉ kiểm chỉ số `[n]` nằm trong khoảng, **không** kiểm nội dung có được đoạn nguồn hỗ trợ. `ungrounded` chỉ bật khi không có trích dẫn nào. (Giả thuyết 9 của CTO: xác nhận.) | Trích dẫn sai nội dung vẫn được coi là hợp lệ. | Kiểm tra ngữ nghĩa là thay đổi hành vi/thiết kế. | Cần CTO |
| SE-F17 | SUGGESTION | 4 | `rag/rag-prompt.ts:13-15, 22-46` | Nội dung tài liệu đặt trong **system message**; vô hiệu hóa chỉ `<<<`/`>>>`. Rủi ro chèn lệnh còn lại (R11 đã ghi nhận). | Lệnh trong tài liệu có thể ảnh hưởng trả lời. | Đánh giá đối kháng riêng; cân nhắc đưa dữ liệu sang user message. Không viết test mới trong task này. | Cần CTO |
| SE-F18 | SUGGESTION | 3 | `documents.controller.ts:48` (`limits.fileSize` 25 MB) | Multer giữ toàn bộ file trong RAM (`memoryStorage`); không giới hạn số upload song song. | Áp lực bộ nhớ khi nhiều upload đồng thời. | Giới hạn đồng thời hoặc stream lên MinIO. | Không |
| SE-F19 | MINOR | 6 | `modules/llm/mock-answers.ts` (~70 dòng) | Đoạn trả lời LLM (có khối code và `console.log` dạng văn bản) dán nguyên trong template literal làm dữ liệu mock. Không chạy lúc runtime, nhưng gây nhiễu. | Khó đọc, dễ nhầm là code. | Thay bằng dữ liệu mock tối thiểu. | Không |
| SE-F20 | MINOR | 2, 3 (bảo trì) | `documents/documents.service.ts` (297 dòng), `chat/chat.service.ts` (305 dòng) | Gộp nhiều trách nhiệm: `DocumentsService` gồm upload, danh sách, lập lịch tóm tắt, tải về, xóa, quản lý hàng đợi; `ChatService` gồm stream, giới hạn tốc độ, kiểm tài liệu, nhánh RAG. (Giả thuyết 5, 6 của CTO.) | Khó thay đổi an toàn từng phần. | Tách lập lịch tóm tắt và giới hạn tốc độ ra khỏi service chính; không thêm interface/repository. | Không |
| SE-F21 | MINOR | 2 | `chat.service.ts:49-53` | `inFlight` và `sendLog` in-memory: đúng cho một tiến trình (có ghi chú ponytail). Nhiều instance phá Stop và chặn song song. | Giới hạn triển khai, đã ghi nhận. | Giữ; ghi rõ trong tài liệu triển khai. | Không |
| SE-F22 | MAJOR | 3 | `documents/documents.service.ts:276-295` (xóa: đặt `deletedAt` rồi đưa job; lỗi enqueue chỉ `warn`, vẫn 204); `document-processor.ts:257-262` (`onFailed` delete chỉ log); `:282-289` | Không có cơ chế reconcile (không cron/quét): grep `reconcil|@Cron|scheduleJob` trong `src` không có kết quả. Enqueue lỗi → tài liệu đã ẩn, vector/object còn lại; `jobId` cố định `delete-<id>` và API trả 404 khi xóa lại, nên người dùng không thể kích hoạt lại. (Giả thuyết 4 của CTO: xác nhận.) | Rác trong MinIO và Qdrant không bao giờ được dọn tự động. Không lộ qua RAG (lọc theo danh sách hợp lệ trong Mongo), nhưng vi phạm mục đích xóa dữ liệu. | Cần CTO quyết cơ chế (job quét định kỳ theo `deletedAt` cũ, hoặc endpoint nội bộ). Không tự thêm. | Cần CTO |

**Kết quả 10 giả thuyết CTO (mục 3)**

| # | Giả thuyết | Kết luận | Finding |
|---|---|---|---|
| 1 | Race `assertNotStreaming` vs đăng ký `inFlight` | **Xác nhận** (cửa sổ nhiều `await`) | SE-F4 |
| 2 | Race Stop/Regenerate | **Xác nhận** (Stop trong cửa sổ là no-op; regenerate xóa tin trong lúc send) | SE-F4, SE-F9 |
| 3 | Consistency MongoDB/BullMQ | Luồng upload **an toàn**: timeout enqueue → worker bỏ qua nhờ `matchedCount` (`document-processor.ts:136`); xóa giữa chừng khi xử lý được dọn (`:195-199`). Phần còn lại là xóa (xem #4). | Không lỗi mới |
| 4 | Job delete thất bại có reconciliation? | **Không có** (không cron, `onFailed` chỉ log, API không xếp lại được vì tài liệu đã ẩn) | SE-F22 |
| 5 | `DocumentsService` quá nhiều trách nhiệm | **Xác nhận**, mức MINOR | SE-F20 |
| 6 | `ChatService` quá nhiều trách nhiệm | **Xác nhận**, mức MINOR | SE-F20 |
| 7 | `sendLog`/`inFlight` in-memory | **Xác nhận giới hạn** (một tiến trình) | SE-F21, SE-F11 |
| 8 | DNS workaround trong `main.ts` | **Xác nhận rủi ro triển khai** | SE-F7 |
| 9 | Trích dẫn chỉ kiểm chỉ số | **Xác nhận** | SE-F16 |
| 10 | Query/ownership/validation nhất quán | **Nhất quán** (xem mục "đã kiểm đạt" bên dưới). Ngoại lệ: không | — |


**Đã kiểm và đạt (không phải lỗi)**
- Phân quyền admin: `@Roles(ADMIN)` ở cấp class `admin-users.controller.ts:37`; không có route admin nào thiếu.
- Cô lập dữ liệu: mọi truy vấn theo `userId` (`conversations.service.ts:57, 83`; `documents.service.ts:140, 163, 270`; `rag.service.ts:65`; lọc Qdrant `vector-store.service.ts:124`).
- Mass assignment: `UpdateUserDto` không có `status`; pipe bật `whitelist` + `forbidNonWhitelisted` (`app-validation.pipe.ts:27-28`). Không có đường bỏ qua `setStatus`.
- Không log nội dung hội thoại/prompt/secret (grep các lệnh log; chỉ log số liệu).
- Dừng và SSE đóng: `abort` đúng, tin được lưu với `STOPPED` (`chat.service.ts:198-200`).
- Provider LLM: hủy đúng qua `signal`; `finish_reason` `max_output_tokens` → `TRUNCATED`.
- Cô lập tài liệu ở RAG: lọc lại trong Mongo theo `userId`, `READY`, `deletedAt:null` trước khi truy vấn Qdrant (`rag.service.ts:62-70`).

**Kiểm tra đã chạy:** đọc code (file:dòng ở trên); thực nghiệm Node độc lập: `pipe-error-probe` (SE-F1, thoát mã 1), `rotate-race-probe` (SE-F3, mô phỏng logic `rotate()`). Không chạy API/web/Docker (theo yêu cầu TL). Không sửa code, không test mới.

**Simplicity First:** audit chỉ đọc, không đề xuất interface/repository mới; đề xuất sửa nhỏ nhất đi kèm mỗi finding.

**Trạng thái** — giai đoạn A bàn giao TL review. Chưa có PR refactor. Giai đoạn B chờ TL duyệt phạm vi và CTO cho phép từng PR (Q1).

### Checklist vòng 2 — PR-B1 (chép từ mô tả [PR #38](https://github.com/duong2604/cat_gpt/pull/38), PR mở 21/11/2026 11:24)
**Task** — SE-021 · PR-B1 (`fix/api-download-stream`) · SHA đầu PR `d1873f6` · vòng 2
**Kết quả** — SE-F1 (BLOCKER) + SE-F2 (MAJOR) theo TL-F-chỉ-định: lỗi MinIO không còn làm sập tiến trình; client ngắt không rò kết nối.
**Checklist**
- [x] AC-a lỗi MinIO giữa chừng → API vẫn sống — **Đạt, mức controller**: probe dùng controller `download` từ `dist`, stream giả phát 4 KB rồi `destroy(error)`. Trước sửa: tiến trình thoát mã 1 (`Unhandled 'error'`). Sau sửa: phản hồi bị cắt đúng (header đã gửi), `GET /health` 200 sau đó. **Chưa kiểm** với MinIO thật bị ngắt giữa chừng (không ngắt container dùng chung).
- [x] AC-a lỗi trước byte đầu → JSON lỗi qua filter — **Đạt, mức controller**: trước sửa sập; sau sửa `download` ném lỗi, probe nhận 500 (filter thật sẽ trả `INTERNAL_ERROR` chuẩn; chưa kiểm qua filter thật vì probe không chạy Nest).
- [x] AC-b client hủy giữa chừng → không rò — **Đạt**: probe `abort`: trước `stream.destroyed=false`, sau `true`. API thật: client hủy sau byte đầu, `health` 200.
- [x] AC-c tải bình thường không đổi (so byte) — **Đạt**: API thật (MinIO thật, TXT 358 889 byte): tải về 200, header `Content-Type`/`Cache-Control: private, no-store` đúng, **bytes == bytes upload**. Probe: 150 000 byte khớp từng byte. Ghi chú: `Content-Type` là `text/plain; charset=utf-8` (Express tự thêm charset từ `res.set`, không đổi so với trước).
- [x] Đối chiếu route/HTTP/mã lỗi — `GET /documents/:id/download`: 200 (chủ sở hữu), 404 (admin / người khác), 401 (chưa đăng nhập) — **giống trước sửa**.
- [x] `pnpm turbo run typecheck lint build --force` — 8/8 thành công.
- [x] `pnpm -C apps/api test` — 83/83 pass.
- [ ] CI `build` tại SHA đầu PR — xem check của PR.
- [x] Dữ liệu thử dọn theo ID đã ghi: tài liệu `6b011cd081272454c1e8fc07` đã xóa (204), Qdrant 0 điểm; user thử `6b011ccf81272454c1e8fc05` đã khóa `BLOCKED`. Không dùng tài khoản thật.

**Kiểm tra đã chạy:** probe controller (`midstream`, `beforebyte`, `normal`, `abort`) trước/sau; API thật: upload → READY → tải về (so byte) → hủy giữa chừng → health → 404/401 → dọn theo ID; `pnpm turbo run typecheck lint build --force`; `pnpm -C apps/api test`.
**Simplicity First** — đổi: một hàm nhỏ `waitForFirstChunk` + hai listener; không abstraction, không dependency. Giới hạn: lỗi giữa chừng cắt kết nối (không có thông báo lỗi JSON vì header đã gửi); chưa kiểm với MinIO thật bị ngắt giữa chừng.
**Trạng thái** — Chờ Review (TL).
**Trạng thái** — Chờ Review (TL).

#### Review vòng 2 — PR-B1
**Task** — SE-021 PR-B1 · PR https://github.com/duong2604/cat_gpt/pull/38 · SHA đã review `d1873f6` (base `e040e08`) · vòng 2
**Kết luận** — **APPROVED WITH CONDITIONS** (review đạt; điều kiện không chặn). **Không merge — chờ CTO cho phép** (chỉ thị CTO; Q1).
**Checklist** (TL đọc diff + probe riêng ngoài repo `b1-probe.mjs`: gọi `DocumentsController.download` đã build với `http.ServerResponse` thật)
- [x] Phạm vi — Đạt — chỉ `apps/api/src/modules/documents/documents.controller.ts` (+38 dòng); không đổi route, header thành công, mã HTTP, mã lỗi.
- [x] SE-F1 — Đạt — baseline `e040e08`: probe **sập** (`Unhandled 'error' event`, exit 1). PR: lỗi giữa chừng → chỉ cắt kết nối đó, tiến trình sống, request kế tiếp `200`; lỗi trước byte đầu → hàm ném lỗi, probe trả `500` JSON (ứng dụng thật đi qua `AllExceptionsFilter`).
- [x] SE-F2 — Đạt — client hủy sau 2000 byte → stream nguồn `destroyed = true`.
- [x] Không hồi quy — Đạt — tải bình thường `200`, đủ 5000/5000 byte, `Content-Type` giữ nguyên; SE đối chiếu byte với MinIO thật (358 889 byte) và 200/404/401 trước–sau.
- [x] Gate — Đạt — `typecheck`/`lint`/`build` (`--force`) api; `pnpm -C apps/api test` 83/83; CI `build` SUCCESS tại `d1873f6`; `mergeStateStatus` CLEAN.
- Đọc hiểu — Đạt — một hàm nhỏ `waitForFirstChunk` có chú thích; luồng "trước/sau byte đầu" giải thích được trong vài phút.
**Điều kiện (không chặn, gộp vào PR-B4):**
- MINOR `documents.controller.ts` (listener `error` mới): lỗi MinIO giữa chừng **không được log** → thêm `Logger.warn` với `documentId` + `error.message` (không nội dung).
- SUGGESTION: sau `waitForFirstChunk` có thể dùng `stream.pipeline(stream, res, cb)` thay `on('error')` + `on('close')` + `pipe` — tùy chọn.
**Ghi chú kiểm chứng:** lần chạy probe đầu của TL trên head PR cũng sập do `dist` còn bản cũ; TL `grep` xác nhận `dist` có `waitForFirstChunk` sau khi build lại rồi chạy lại → kết quả trên. Lỗi MinIO thật bị ngắt giữa chừng chưa tái hiện (không ngắt container dùng chung).
**Trạng thái** — Chờ Review (chờ CTO cho merge).

### Checklist vòng 3 — PR-B2 (chép từ mô tả [PR #39](https://github.com/duong2604/cat_gpt/pull/39), PR mở 21/11/2026 11:32)
**Task** — SE-021 · PR-B2 (`fix/api-session-stream-races`) · SHA đầu PR `711ccdc` · vòng 3
**Kết quả** — hai đua (refresh và chat) đã sửa; xác nhận bằng so sánh với build develop (cùng code chat/session).
**Checklist**
- [x] AC-chat: hai `POST /chat/stream` song song cùng hội thoại → **1×200 + 1×409** (`CHAT_STREAM_IN_PROGRESS`), DB có đúng một cặp tin mới. **Trước sửa (develop)**: `200,200`, DB 6 tin (cặp bị lặp). Bằng chứng: kịch bản `b2-race` chạy trên cả hai build.
- [x] AC-refresh (một phần đạt): hai `POST /auth/refresh` song song cùng token → **cả hai 204, phiên không bị thu hồi** (không có cảnh báo "dùng lại" trong pha đua), `GET /me` 200 với cookie của cả hai. Sau đó refresh bằng cookie vừa cấp → 204.
- [ ] AC-refresh (phần "cả hai token dùng tiếp được"): **đạt có giới hạn**. Ân hạn của thiết kế chỉ cho phép một bước: sau cuộc đua, token "trước đó" còn dùng được đúng một lần xoay tiếp theo; nếu lần xoay khác đã xảy ra trước, token còn lại bị coi là dùng lại và thu hồi phiên. Hành vi này **giống hệt develop** (cùng kịch bản cho cùng kết quả ở bước thứ 5), nên không phải hồi quy; đổi thiết kế ân hạn là quyết định riêng (ghi nhận, không làm trong PR này).
- [x] Đối chiếu route/HTTP/mã lỗi trước–sau: 409 `CHAT_STREAM_IN_PROGRESS` giữ nguyên; 401 `AUTH_REFRESH_INVALID` giữ nguyên; `/me`, `/auth/refresh` 204 giữ nguyên.
- [x] `pnpm turbo run typecheck lint build --force` — 8/8 thành công (lint 0 lỗi).
- [x] `pnpm -C apps/api test` — 83/83 pass.
- [ ] CI `build` tại SHA đầu PR — xem check của PR.
- [x] Dữ liệu thử dọn theo ID đã ghi: hội thoại thử `6b011e8652d96c6dc7cbcbab` đã xóa (204); user thử đã khóa `BLOCKED`. Không dùng tài khoản thật. Chạy với `LLM_PROVIDER=mock` (không gọi OpenAI).

**Kiểm tra đã chạy:** API thật (mock LLM) trên build PR và build develop; kịch bản đồng thời chat và refresh; `pnpm turbo run typecheck lint build --force`; `pnpm -C apps/api test`.
**Simplicity First** — đổi: một hàm `reserveStream`, một `classifyPresented`, `findRotatable`, `swapToken`; không abstraction, không dependency mới. Giới hạn: ân hạn một bước (đã ghi nhận ở trên).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
**Trạng thái** — Chờ Review (TL).

#### Review vòng 3 — PR-B2
**Task** — SE-021 PR-B2 · PR https://github.com/duong2604/cat_gpt/pull/39 · SHA đã review `711ccdc` (base `e040e08`) · vòng 3
**Kết luận** — **APPROVED WITH CONDITIONS**. **Không merge — chờ CTO.**
**Checklist** (TL đọc diff + kịch bản riêng ngoài repo `b2-race.mjs`, chạy cùng kịch bản trên PR và trên `develop` `e040e08`; API `dist` cổng 4100, LLM mock)
- [x] Phạm vi — Đạt — `chat/chat.service.ts`, `sessions/sessions.service.ts`; route, mã HTTP, mã lỗi không đổi (`409 CHAT_STREAM_IN_PROGRESS`, `401 AUTH_REFRESH_INVALID`).
- [x] SE-F4/TL-F3 — Đạt — `reserveStream` đặt chỗ đồng bộ ngay sau `await` cuối (send: sau `getOwnedOrThrow`/`create`; regenerate: trước khi xóa câu trả lời cũ), giải phóng trong `finally` của `send`/`regenerate`; `409` ném trước `try` nên không giải phóng chỗ của request khác. 2 stream song song cùng hội thoại: **PR `200`+`409`, 4 tin** · develop `200`+`200`, 6 tin. Dừng gửi ngay sau `regenerate` (cửa sổ đặt chỗ): PR → `STOPPED` (trước đây là no-op).
- [x] SE-F3/TL-F2 — Đạt trong phạm vi — CAS `tokenHash` trong `findOneAndUpdate`; bên thua đọc lại, ân hạn → xoay tiếp, ngoài ân hạn → `401` **không thu hồi**; tối đa 3 lần. 2 refresh song song cùng token: **PR `204`/`204`, mỗi token dùng được 1 lần trong ân hạn, phiên còn sống** · develop `204`/`204` rồi **phiên bị thu hồi** (`401` mọi bước sau).
- [x] Gate — Đạt — `typecheck`/`lint`/`build` (`--force`) api; test 83/83; CI SUCCESS tại `711ccdc`; CLEAN.
- Đọc hiểu — Đạt — `classifyPresented`/`findRotatable`/`swapToken` tách rõ; chú thích nói đúng hành vi.
**Điều kiện / còn mở (không chặn PR này):**
- MAJOR (chuyển sang **PR-B3, cần CTO**): ân hạn 30 s chỉ một bước. Nếu trình duyệt giữ refresh cookie của bên thắng (sau đó là `previousTokenHash`), lần refresh kế (~15 phút sau, ngoài ân hạn) bị coi là dùng lại → thu hồi phiên. Có cả trên develop (develop còn thu hồi ngay). Hướng đề xuất: nhánh ân hạn không xoay thêm (chỉ cấp access token, giữ refresh cookie), gộp với TL-F1.
- TL-F1 (thu hồi khi secret lạ) vẫn còn — đúng phạm vi, thuộc PR-B3.
**Dữ liệu thử của TL** — 2 tài khoản `tl-smoke-b2-*` (`6b011f91608199ab3abe4dc8`, `6b011fb7354c32526e414154`) `BLOCKED`; hội thoại thử đã xóa theo chủ sở hữu (riêng lần chạy develop: phiên bị thu hồi làm bước dọn trả `401` → TL mở khóa tạm tài khoản tạm, in danh sách hội thoại của nó, xóa `6b011fb8354c32526e414156`, khóa lại). Cùng lượt đó dọn hội thoại sót của SE-020 `6b01193245444726dd40d929` (tài khoản tạm `6b0118ed45444726dd40d924`) → `204`, khóa lại.
**Trạng thái** — Chờ Review (chờ CTO cho merge).

### Checklist vòng 4 — PR-B4 (chép từ mô tả [PR #40](https://github.com/duong2604/cat_gpt/pull/40), PR mở 21/11/2026 11:39)
**Task** — SE-021 · PR-B4 (`refactor/api-cleanup`) · SHA đầu PR `a5cb975` · vòng 4
**Kết quả** — dọn code, không đổi route/contract/hành vi nghiệp vụ.
**Checklist**
- [x] Giới hạn 20/phút vẫn hoạt động sau khi bỏ `sendLog`: lần gửi thứ 21 trong một phút → **429** (API thật, mock LLM).
- [x] Upload TXT (qua `addJob`) → 201, READY; tóm tắt (đường `signal` đã đổi) → 202, READY.
- [x] Upload DOCX hợp lệ (hằng DOCX chung) → READY; DOCX hỏng → **FAILED `DOCUMENT_UNREADABLE`** (ánh xạ không đổi).
- [x] Log khi bóc tách thất bại: `WARN documentId=… bóc tách lỗi: Error: <thông điệp>` — không có nội dung tài liệu.
- [x] Xóa tài liệu (qua `addJob`) → 204 cho cả ba tài liệu thử.
- [x] Payload index idempotent: upload hợp lệ thành công trên collection/index đã tồn tại (không lỗi từ `createPayloadIndex`).
- [x] Đối chiếu route/HTTP/mã lỗi trước–sau: không đổi route; 201/202/204 giữ nguyên; 429 giữ mã `TOO_MANY_REQUESTS`.
- [x] `pnpm turbo run typecheck lint build --force` — 8/8, lint **0 cảnh báo** (đã sửa import thừa).
- [x] `pnpm -C apps/api test` — 83/83 pass.
- [ ] CI `build` tại SHA đầu PR — xem check của PR.
- [x] Dữ liệu thử dọn theo ID đã ghi: 3 tài liệu đã xóa; hội thoại thử đã xóa (204); user thử đã khóa `BLOCKED`. Chạy với `LLM_PROVIDER=mock`; embedding dùng OpenAI như hiện có (upload hợp lệ).

**Kiểm tra đã chạy:** API thật (mock LLM) với kịch bản 10 bước; `pnpm turbo run typecheck lint build --force`; `pnpm -C apps/api test`.
**Simplicity First** — không abstraction mới; helper `addJob` và hằng chung chỉ gom code trùng; không dependency mới. Giới hạn: như mục "Lệch so với chỉ thị".

🤖 Generated with [Claude Code](https://claude.com/claude-code)

#### Review vòng 4 — PR-B4 và merge B1/B2/B4
**Căn cứ merge:** chỉ thị CTO "Autonomous Backend Review & Merge" 21/11/2026 — TL tự review/merge PR SE-021 đạt gate.
**PR-B4** — PR https://github.com/duong2604/cat_gpt/pull/40 · SHA đã review `a5cb975` · **APPROVED WITH CONDITIONS**
- [x] Phạm vi — Đạt — 4 tệp `apps/api/src` (chat.service, document-processor, documents.service, vector-store.service); +47/−70.
- [x] TL-F4 — Đạt — bỏ `assertRateLimit`/`sendLog`/`RATE_*`; guard vẫn chặn: 20 × `200` rồi `429 TOO_MANY_REQUESTS`. Thông điệp 429 SE nêu "đổi" thực tế không đổi: guard luôn chạy trước và chặn trước service với cùng ngưỡng, nên phản hồi cũ cũng là của guard.
- [x] TL-F5/SE-F6 — Đạt — DOCX hỏng → `FAILED DOCUMENT_UNREADABLE` (mapping giữ); 1 dòng WARN có `documentId`. **MINOR** `document-processor.ts` (log mới): in nguyên `error.message` của parser (vd. "[xmldom error] element parse error: … attribute value no end"); parser có thể chèn mảnh dữ liệu → cắt ≤ 200 ký tự, một dòng → PR-B5.
- [x] TL-F7 — Đạt một phần — `DOCX_MIME_TYPE` dùng chung; `addJob` cho upload/delete; `enqueueSummary` giữ nguyên vì gộp bước gỡ job cũ trong cùng ngân sách timeout — chấp nhận.
- ~ TL-F8 — Chấp nhận — `LlmStreamOptions.signal` là bắt buộc (`llm.provider.ts:12`) nên vẫn truyền `new AbortController().signal`, có chú thích; bỏ biến thừa. Không đáng đổi interface.
- [x] SE-F14 — Đạt — `createPayloadIndex` chạy mỗi lần `ensureCollection`; TXT READY trên collection đã có (idempotent). SE-F15 — Đạt — xóa `countByDocumentId` (không có caller trong `src`).
- [x] Gate — typecheck/lint (0 cảnh báo)/build `--force`, test 83/83, CI SUCCESS tại `a5cb975`, CLEAN sau khi #38/#39 merge.
- [x] Runtime (bản `develop` 3e9abe7 + #40 merge cục bộ, code giống hệt `310ee02` — `git diff` rỗng): giới hạn tốc độ, TXT READY, DOCX hỏng, tóm tắt READY, tải về khớp byte; dọn 2 tài liệu + 20 hội thoại theo ID; tài khoản tạm `6b0121cfb165510ff7bd34c8` `BLOCKED`.
**Merge** (mỗi PR: head = SHA đã review, CI SUCCESS, MERGEABLE/CLEAN, `--match-head-commit`):
- #38 `d1873f6` → `7433ce3` · #39 `711ccdc` → `3e9abe7` · #40 `a5cb975` → `310ee02`.
- PR #39 có **giới hạn đã biết** (ân hạn 30 s một bước): tiêu chí "2 refresh song song không làm mất phiên" chỉ **đạt trong cửa sổ đua**, ghi **Partial** ở F01; phần còn lại thuộc PR-B3. Không phải hồi quy (develop cũ thu hồi ngay) nên không chặn merge.
**Xác minh sau merge** (`develop` `3e9abe7`, rồi cây code tương đương `310ee02`): typecheck/lint/build, test 83/83; probe B1 (sống sau lỗi giữa chừng); race B2 (`200`+`409`, `STOPPED`, phiên còn sau 2 refresh); hồi quy 27/27 (auth, CRUD hội thoại, Dừng, tài liệu, RAG, `insufficientEvidence`, xóa → Qdrant 0). Dữ liệu thử dọn; tài khoản tạm `6b0121914ed23c5f5f8e287e`, `6b0121984ed23c5f5f8e2887` `BLOCKED`.
**Còn mở:** PR-B5 (log tải về; cắt log parser), PR-B3 (phân tích trước). Bảng flow: [backend-refactor-se021.md](../reports/backend-refactor-se021.md).
**Trạng thái** — Đang làm (B tiếp tục).

### Checklist vòng 5 — PR-B5 ([PR #41](https://github.com/duong2604/cat_gpt/pull/41), PR mở 21/11/2026 11:51)
SE bàn giao (mô tả PR): (a) WARN `documentId=<id> tải về lỗi giữa chừng: <name>: <message>` khi đã gửi dữ liệu — probe: có dòng WARN, health `200` sau đó; (b) log bóc tách một dòng ≤ 200 ký tự, mapping không đổi; build 6/6, lint 0 cảnh báo, test 83/83, CI SUCCESS.

#### Review vòng 5 — PR-B5
**PR** #41 · SHA đã review `adac390` (base `310ee02`) · **APPROVED** — merge `--match-head-commit` → `develop` @ `646fcb4`.
- [x] Phạm vi — Đạt — `documents.controller.ts` (+Logger, log trong nhánh đã gửi dữ liệu), `document-processor.ts` (`replace(/\s+/g, ' ').slice(0, 200)`); không đổi route/mã/mapping.
- [x] Điều kiện B1 — Đạt — probe TL: dòng `WARN [DocumentsController] documentId=mid tải về lỗi giữa chừng: Error: minio reset mid-stream`; các ca B1 khác giữ nguyên. Lỗi trước byte đầu không log trùng (filter ghi stack ở mức 500).
- [x] MINOR B4 — Đạt — chuỗi 30 dòng có thẻ XML → 200 ký tự, không còn xuống dòng.
- [x] Gate — typecheck/lint/build `--force`, test 83/83, CI SUCCESS, CLEAN. Sau merge: cây `apps` của `develop` `646fcb4` giống hệt `adac390` (`git diff` rỗng) → kết quả kiểm trên head áp dụng cho develop.

## Phản hồi UI
Không áp dụng.
