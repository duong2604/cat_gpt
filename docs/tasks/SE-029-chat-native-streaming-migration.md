# SE-029 — Migration Chat sang NestJS Native Streaming Responses

Trạng thái: Done — PR #54 → `29160c4` (22/11/2026 01:19, CTO duyệt merge); CI `develop` success
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,75 ngày
Phụ thuộc: không. SE-005 (hạn 27/11) làm ngay sau — báo TL nếu ảnh hưởng hạn
Hạn bàn giao review: 22/11/2026 · Hạn hoàn tất: theo CTO nghiệm thu
Chốt: 22/11/2026 — CTO "Migrate to NestJS Built-in Streaming" (APPROVED — phương án C). **Merge chỉ sau khi CTO phê duyệt** (không thuộc quyền tự merge của TL).
SHA cơ sở: `origin/develop` @ `11106c8`
Cơ sở: POC C `poc/api-chat-native-stream` (`75d06eb`, `45d9f79`) — [báo cáo Chat mục 14–16](../reports/chat-module-structural-review.md)

## Thiết kế (TL chốt)
```
ChatController (HTTP)            sse-response.ts (HTTP streaming adapter)        ChatService (nghiệp vụ)
 POST chat/stream  ──prepareSend──────────────────────────────────────────────►  prepareSend/prepareRegenerate → ChatTurn
                   ──toSseResponse(run, cancel)──► Response(ReadableStream)        (lỗi → JSON qua filter)
                                                    start: run(emit)  ─────────►  run(turn, emit): stream LLM/RAG, lưu, nhả khóa (finally)
                                                    cancel: cancel() ─────────►  cancel(turn): abort LLM
                                                    heartbeat ': ping', 'data: <json>\n\n', header SSE
```
1. **Dependency:** `@nestjs/core`, `@nestjs/common`, `@nestjs/testing` → **`12.5.1` chính xác** (= POC C, khớp `@nestjs/platform-express` 12.5.1). Không đổi gói khác. Commit riêng.
2. **`sse-response.ts`** (thay `sse-stream.ts`, cùng thư mục): một hàm thuần `toSseResponse(run: (emit) => Promise<void>, onCancel: () => void): Response` — tạo `ReadableStream<string>`: `start` gọi `run(emit)`, `emit` = `enqueue('data: ' + JSON.stringify(event) + '\n\n')` (bỏ qua nếu đã đóng), heartbeat `': ping\n\n'` mỗi 15 s, đóng stream khi `run` xong; `cancel` → dừng heartbeat + `onCancel()`. Trả `new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' } })`. **Nơi duy nhất biết định dạng SSE.** Không phụ thuộc Express, không rxjs.
3. **`ChatController`:** `@Post` giữ route; **bỏ `@Res`, `@Req`, `@Header`, `@HttpCode`** trên 2 route streaming; handler `async`: `const turn = await this.chat.prepareSend(...)` rồi `return toSseResponse((emit) => this.chat.run(turn, emit), () => this.chat.cancel(turn))`. Lỗi trước stream ném ra **trước** khi tạo `Response` → JSON đúng mã và `application/json`.
4. **`ChatService`:** `prepareSend`/`prepareRegenerate` (lấy từ POC, kiểu `ChatTurn` — đổi tên `StreamPlan`), `run(turn, emit)` (nhả khóa trong `finally`), `cancel(turn)` (abort). Không import Express/`Response`/`ReadableStream`. Lỗi sau khi stream bắt đầu vẫn phát `{type:'error', code}` như dữ liệu.
5. **Ngắt sớm:** **không** dùng `req.socket.destroyed`/`gone()`. Dựa vào NestJS hủy body (`cancel()`) khi client đi, kể cả trước chunk đầu → `abort` → câu trả lời lưu `STOPPED` (như bấm Dừng; với Tạo lại: câu cũ giữ nguyên) và khóa nhả trong `finally`. Nếu runtime cho thấy NestJS không gọi `cancel()` ở trường hợp nào → **dừng và báo TL**, không tự thêm workaround.
6. Xóa `sse-stream.ts`, `POC_SSE_HEARTBEAT_MS` và mọi chú thích sót của POC (`@Sse()`, Observable, "subscribe").
7. `chat.service.spec.ts`: chỉ đổi wiring (gọi `prepare*` + `run(turn, emit)`); không thêm/bớt `it`; nếu kỳ vọng nào đổi do hành vi đã duyệt (vd ngắt tab) → ghi rõ trong PR.
8. Cập nhật tài liệu thiết kế/API liên quan nếu có mô tả `SseStream`/`@Res` (grep `docs/`).

## Không được thay đổi
Route, body, mã HTTP (200 stream; 400/401/404/409/429 JSON), event `meta`/`delta`/`done`/`error` và payload, wire (`data: …`, không `id:`), schema, cơ chế lưu tin và Tạo lại (SE-F9, SE-023), throttle/guard, `inFlight` trong bộ nhớ, module khác. Không reconnect/resume/`Last-Event-ID`.

## Checklist nghiệm thu (TL kiểm, DB `cat_gpt_loadtest`)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Không còn lifecycle HTTP streaming tự viết; `ChatService` không phụ thuộc Express; adapter là nơi duy nhất định khung SSE | Đọc diff, grep `express`/`Response`/`ReadableStream` trong `chat.service.ts` |
| AC2 | HTTP 200 + `text/event-stream; charset=utf-8`; wire giống `develop` | `wire-compare` |
| AC3 | 404/409/400/401/429 trước stream: **JSON + `Content-Type: application/json`** | `wire-compare` (in Content-Type từng lỗi) |
| AC4 | Hồi quy Chat/RAG: `f03-verify` 15/15, `rag-runtime` 14/14 | Kịch bản TL |
| AC5 | Ngắt giữa stream → `STOPPED`, khóa nhả (`sse-disconnect` 5/5) | Kịch bản TL |
| AC6 | Ngắt sớm: khóa nhả (`sse-early-abort` 16 ca, 0×409); câu trả lời `STOPPED` hoặc không có lượt (không LLM sinh hết), không tin trùng (`early-probe`) | Kịch bản TL |
| AC7 | Stop / Regenerate / Regenerate+Stop / đồng thời 200+409 | `f03-verify` |
| AC8 | Heartbeat có trên wire, không `id:` | TL kiểm với hằng số rút ngắn tạm thời trong worktree review (không commit) |
| AC9 | Trình duyệt thật: chat, Dừng, Tạo lại, LLM lỗi, RAG, tải lại trang giữa stream | TL |
| AC10 | Không regression sau nâng NestJS: `se020-review` toàn API (kỳ vọng cũ đã ghi nhận được sửa riêng trong kịch bản TL) | Kịch bản TL |
| AC11 | typecheck/lint/build, test hiện có, CI tại SHA đầu PR; diff chỉ `apps/api/package.json`, `pnpm-lock.yaml`, `apps/api/src/modules/chat/*`, tài liệu liên quan | Lệnh + `git diff --stat` |

PR `refactor/api-chat-native-streaming` nhắm `develop`, mô tả 6.1 + trước/sau (cấu trúc, trách nhiệm, dependency). **Không merge** — TL review → báo CTO → CTO duyệt → TL merge.

## Kết quả review
22/11/2026 — CTO APPROVED merge (HEAD `018e941`, CI pass, đúng phạm vi). TL merge `29160c4`, `018e941` là tổ tiên của `origin/develop`, CI `develop` success. Nhánh remote đã xóa; SE dọn worktree/nhánh local.

## Lịch sử review
### PR #54 — TL review vòng 1 (SHA `af27bb7`, base `11106c8`) — **Cần sửa** (22/11 00:43)
| Tiêu chí | Kết quả | Bằng chứng TL |
|---|---|---|
| AC1 kiến trúc | Đạt | `sse-response.ts` (`toSseResponse`) là nơi duy nhất định khung SSE; controller trả `Response`, không `@Res`/`@Req`/`@Header`; `chat.service.ts` không import Express/`Response`/`ReadableStream`/rxjs (grep) |
| AC2 200 + wire | Đạt | `wire-compare`: 200 `text/event-stream; charset=utf-8`, `data:` không `id:`, payload/khóa `done` giống `develop` |
| AC3 lỗi trước stream JSON | **Đạt** | 404, 400, 400, 401, 409, 429 → `application/json` |
| AC4 Chat/RAG | Đạt | `f03-verify` 15/15; `rag-runtime` 14/14 |
| AC5 ngắt giữa stream | Đạt | `sse-disconnect` 5/5 |
| AC6 ngắt sớm | Đạt | `sse-early-abort` 16 ca khóa nhả (5 lần 409 tạm thời, nhả trong 2,3 s), không tin trùng; `early-probe` 5–100 ms → `STOPPED` lưu sau ~0,7 s (LLM bị hủy — lỗi cũ của A hết) |
| AC7 Stop/Regenerate/đồng thời | Đạt | trong `f03-verify` |
| AC8 heartbeat | Đạt | Sửa tạm `dist` (300 ms, không commit, build lại): 5 `: ping`, 0 `id:` |
| AC9 trình duyệt | Chưa chạy | Chạy ở vòng 2 trên SHA cuối |
| AC10 hồi quy toàn API (NestJS 12.5.1) | Đạt | `se020-review` 27/27 (kịch bản đã sửa 2 kỳ vọng cũ — bản trước lưu `se020-review.before-sef9.mjs`; trên `develop` cũng 27/27) |
| AC11 build/lint/test | Đạt (local) | 4/4, 0 cảnh báo, 83/83; CI đang chạy lúc review |
| Code không còn dùng (yêu cầu chủ dự án 22/11) | **Không đạt** | `ConversationsService.lastMessage` không còn ai gọi (từ PR-B10); `ConversationDocument`, `MessageDocument` không dùng; export không cần (`buildLlmMessages`, `CitationSchema`, `CONVERSATIONS_PAGE_SIZE` chỉ dùng trong chính tệp) |
| Đặt tên/định dạng | **Không đạt** | biến `plan` có kiểu `ChatTurn` (đổi `turn`); thụt lề khối `.finally` trong `sse-response.ts` |
Yêu cầu vòng 2: xóa code không còn dùng ở trên (kể cả `lastMessage` trong bản giả của spec), bỏ `export` thừa, đổi `plan` → `turn`, sửa thụt lề, rà chú thích; diff vòng 2 không đổi hành vi.

### PR #54 — TL review vòng 2 (SHA `e116a02` + nit `018e941`) — **Đạt — CHỜ CTO DUYỆT MERGE** (22/11 00:52)
| Tiêu chí | Kết quả | Bằng chứng TL |
|---|---|---|
| Code không còn dùng | Đạt | Xóa `ConversationsService.lastMessage` (+ bản giả trong spec), type `ConversationDocument`, `MessageDocument`, import `HydratedDocument`; bỏ `export` `buildLlmMessages`, `CitationSchema`, `CONVERSATIONS_PAGE_SIZE`. SE rà lại toàn module: các export/method còn lại đều có tham chiếu |
| Đặt tên/định dạng | Đạt | `plan` (kiểu `ChatTurn`) → `turn`; thụt lề `.finally`; nit 2 dòng trống → `018e941` (diff chỉ khoảng trắng) |
| Không đổi hành vi | Đạt | Diff vòng 2: 7 tệp +32/−45 trong `modules/chat`; spec chỉ đổi bản giả + tiêu đề 1 ca (không thêm/bớt `it`); `f03-verify` 15/15 và lỗi trước stream 404/400/400/401/409 `application/json` chạy lại trên `e116a02` |
| AC9 trình duyệt (SHA `018e941`) | **Đạt** | Web dev → API kiểm thử: chat `COMPLETED`; Dừng → `STOPPED` + nhãn; Tạo lại cùng `id`; Tạo lại + Dừng → câu cũ giữ; LLM lỗi → `ERROR` + nhãn; tải lại trang giữa stream → `STOPPED` |
| Build/lint/test, CI | Đạt | 4/4, 0 cảnh báo, 83/83; CI `build` pass tại `018e941`, `mergeStateStatus` CLEAN |
**AC1–AC11 đạt toàn bộ.** Không merge — chờ CTO phê duyệt theo chỉ thị.

## Phản hồi UI
Không áp dụng.
