# SE-028 — POC phương án C: Chat SSE bằng NestJS Native Streaming Responses (không merge)

Trạng thái: Sẵn sàng — **POC / EVALUATION — AWAITING CTO DECISION**
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,5 ngày
Phụ thuộc: sau SE-026 (dùng lại phần tách pha trước stream của POC B). **Không trì hoãn SE-005 quá hạn 27/11** — báo TL nếu vượt 0,5 ngày
Hạn bàn giao review: 22/11/2026 · Hạn hoàn tất: theo quyết định CTO
Chốt: 21/11/2026 — CTO "Extend SSE Architecture Evaluation"; TL xác nhận khả thi, nâng cấp cô lập được ([báo cáo Chat mục 14](../reports/chat-module-structural-review.md))
SHA cơ sở: `origin/develop` @ `11106c8` (đã có parser SE-027)

## Ràng buộc
Nhánh `poc/api-chat-native-stream`, worktree riêng, push nhánh, **KHÔNG PR vào `develop`, KHÔNG merge**. **Không nâng dependency trên `develop`.** Giữ POST, HTTP 200, body, event `meta`/`delta`/`done`/`error`, schema, nghiệp vụ, auth/throttle. Không thêm unit test (spec chỉ chỉnh wiring). Không reconnect/resume/`Last-Event-ID`.

## Nâng cấp dependency (chỉ trên nhánh POC)
`apps/api/package.json`: `@nestjs/core`, `@nestjs/common`, `@nestjs/testing` → **`12.5.1` chính xác** (khớp `@nestjs/platform-express` 12.5.1 đang cài); cập nhật `pnpm-lock.yaml`. Không đổi gói khác. Báo diff lockfile (số gói đổi) và kết quả build/test sau nâng cấp **trước** khi sửa Chat (commit riêng).

## Việc POC
1. Controller: `@Post` + `@HttpCode(HttpStatus.OK)` + `@Header('Content-Type','text/event-stream; charset=utf-8')`, `@Header('Cache-Control','no-cache, no-transform')`, `@Header('X-Accel-Buffering','no')`; handler `async`: chạy pha trước stream (dùng lại `prepareSend`/`prepareRegenerate` của POC B) rồi trả **`ReadableStream`** (không dùng async generator — tài liệu NestJS: generator đang chờ `await` chỉ dừng khi await xong; LLM có lúc im lặng).
2. `ReadableStream`: `start()` chạy luồng stream; mỗi event `enqueue('data: ' + JSON.stringify(event) + '\n\n')` — **wire giống hệt hiện tại** (không `id:`, không byte đầu); heartbeat `': ping\n\n'` mỗi 15 s (biến môi trường chỉ-POC để rút chu kỳ được phép); `cancel()` → `abort()` LLM + xóa heartbeat; kết thúc → `close()`; nhả `inFlight` ở `finally` của luồng stream.
3. **Khóa `inFlight` khi ngắt trước khi trả stream / trước chunk đầu** — chứng minh bằng runtime (tài liệu NestJS: "When the client goes away, also before the first chunk, Nest stops the stream" — cần kiểm khi ngắt **trong lúc handler còn chạy pha trước stream**). Nếu NestJS không gọi `cancel()` trong trường hợp đó → nêu cách nhả khóa và kiểm.
4. Lỗi trong stream vẫn gửi `{type:'error', code}` dạng `data` (không để stream ném lỗi — NestJS sẽ cắt kết nối đột ngột).
5. Xóa `sse-stream.ts`.
6. Ghi rõ: backpressure của NestJS chỉ có tác dụng nếu producer tôn trọng `desiredSize`/`pull()`; POC có làm hay không và lý do.

## Báo cáo POC (SE gửi TL)
SHA; diff (`--stat` + số dòng từng tệp, tách commit nâng cấp và commit Chat); kết quả build/test sau nâng cấp; wire mẫu `curl -N`; cách nhả khóa; điểm chưa làm.

## TL kiểm chứng (như SE-026)
V1 `f03-verify` 15 · V2 `rag-runtime` 14 · V3 `sse-disconnect` 5 · V4 `sse-early-abort` 16 ca + `early-probe` · V5 heartbeat · V6 `wire-compare` (so với A) · V7 trình duyệt (parser SE-027) · V8 build/lint/test · V9 không race/tin trùng · **V10 hồi quy toàn API sau nâng cấp** (`se020-review` 27 bước — auth, phiên, tài liệu, admin).

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Không áp dụng.
