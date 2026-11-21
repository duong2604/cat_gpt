# SE-021 — Backend Codebase Audit & Refactoring (`apps/api`)

Trạng thái: Sẵn sàng (giai đoạn A — audit). Giai đoạn B (refactor) mở theo từng PR sau khi TL duyệt phạm vi
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: A 0,5 ngày; B theo phạm vi duyệt (mỗi PR ≤ 0,5 ngày)
Phụ thuộc: làm **sau** khi bàn giao [SE-020](SE-020-dependency-security-patch-r2.md) (cùng phiên SE; không làm song song trên cùng nhánh). Không chặn bởi nghiệm thu M1–M4 ở giai đoạn A (chỉ đọc code)
Hạn bàn giao review: A — 21/11/2026 trong ngày nếu kịp, không thì phiên sau · B — Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
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
| Q1 | Quyền merge PR refactor (B) | Chờ CTO cho phép từng PR | Chờ CTO |

## Kết quả review
Chưa có. Review độc lập của TL: [báo cáo ngày 21/11](../reports/daily/2026-11-21.md) (vòng 6) và mục "TL independent findings" dưới đây.

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

## Phản hồi UI
Không áp dụng.
