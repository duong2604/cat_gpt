# SE-026 — POC: Chat SSE dùng NestJS `@Sse()` (không merge)

Trạng thái: Sẵn sàng — **POC / EVALUATION — AWAITING CTO DECISION**
Người phụ trách: Senior Dev · Ưu tiên: P1 (chỉ thị CTO "Evaluate NestJS Built-in SSE") · Ước lượng: 0,5 ngày
Phụ thuộc: không. SE-005 (hạn 27/11) tiếp tục sau POC — báo TL nếu ảnh hưởng hạn
Hạn bàn giao review: 22/11/2026 · Hạn hoàn tất: theo quyết định CTO
Chốt: 21/11/2026 — chỉ thị CTO "Evaluate NestJS Built-in SSE"; đánh giá TL: [báo cáo Chat mục 12](../reports/chat-module-structural-review.md)
SHA cơ sở: `origin/develop` @ `83704bc`

## Ràng buộc (CTO)
Nhánh riêng `poc/api-chat-nest-sse` (worktree riêng), **push nhánh, KHÔNG mở PR vào `develop`, KHÔNG merge**. Giữ POST endpoint; không đổi schema, request body, nghiệp vụ Chat; không thêm unit test (spec hiện có chỉ chỉnh wiring nếu chữ ký đổi).

## Bằng chứng framework TL đã kiểm (NestJS 12.2.0, probe `nest-sse-wire.mjs`)
- `@Sse(path, { method: RequestMethod.POST })` chạy được; handler `async` ném lỗi **trước** khi trả Observable → filter trả JSON đúng mã (đã thấy `404`).
- Mã mặc định POST = **201** (hiện tại 200).
- Mọi event có `data` được gán `id: N` (tự tăng); `{ comment: 'ping' }` → `: ping` **không** có `id`. Đầu stream có thêm `\n`.
- Observable `error` sau khi đã gửi header → `event: error\ndata: Internal server error` (khác `{type:'error',code}` hiện tại).
- Client ngắt → framework hủy đăng ký (teardown chạy) + `@SseSignal()` abort. Không có heartbeat sẵn.

## Việc POC
1. **Controller:** `@Sse('chat/stream', { method: RequestMethod.POST })` và `@Sse('conversations/:id/regenerate', …)`; giữ guard, `@ApiProduces`; **giữ mã 200** (kiểm `@HttpCode(HttpStatus.OK)` có tác dụng với `@Sse`; nếu không, ghi rõ và đề xuất). Handler `async` trả `Observable<MessageEvent>`. `stop` không đổi.
2. **ChatService:** tách pha **trước stream** (kiểm quyền/tài liệu, `reserveStream`, lưu tin USER — lỗi ở đây phải ra JSON như hiện tại: 400/404/409) khỏi **producer** (Observable chạy phần stream). Producer phát `{ data: <ChatStreamEvent> }`; lỗi trong stream vẫn phát `{ type: 'error', code }` **như dữ liệu** (không `subscriber.error`). Teardown → `controller.abort()`.
3. **Khóa `inFlight` — rủi ro bắt buộc xử lý:** NestJS **không subscribe** producer nếu client ngắt sau khi handler đã chạy xong nhưng trước khi subscribe → khóa giữ vĩnh viễn (409 tới khi khởi động lại). Phải giải phóng khóa trong mọi đường (dùng `@SseSignal()` hoặc cách tương đương) — mô tả cách làm trong báo cáo POC.
4. **Heartbeat 15 s:** `merge` với `interval` phát `{ comment: 'ping' }`, dừng khi producer kết thúc. Trên nhánh POC được phép một biến môi trường **chỉ để kiểm** rút ngắn chu kỳ (ghi rõ).
5. **Xóa** `sse-stream.ts`.
6. **Web** `apps/web/src/features/chat/stream.ts`: parser đọc từng dòng trong khối — gom các dòng `data:`, bỏ qua `id:`, `event:`, dòng `:`; chạy được với **cả** định dạng cũ và mới.

## Báo cáo POC (SE gửi TL)
Diff (`git diff --stat` + toàn văn), số dòng thêm/bớt mỗi tệp; cách giải phóng khóa; mã HTTP thực tế; wire mẫu (`curl -N`); kết quả tự chạy; điểm chưa làm được.

## TL kiểm chứng (trên nhánh POC, DB `cat_gpt_loadtest`)
| # | Hạng mục | Cách |
|---|---|---|
| V1 | Streaming, lưu tin, Stop, Regenerate, đồng thời 200+409, LLM lỗi, RAG, phân quyền | `f03-verify` (15 ca) — script TL cập nhật parser theo dòng |
| V2 | RAG insufficient / truy hồi lỗi | `rag-runtime` 14 ca |
| V3 | Client ngắt giữa chừng → `STOPPED`, khóa nhả | `sse-disconnect` 5 ca |
| V4 | Ngắt **trước khi subscribe** → khóa nhả | kịch bản mới của TL (ngắt ngay sau khi gửi request) |
| V5 | Heartbeat có trên wire, không có `id` | `curl -N` với chu kỳ rút ngắn |
| V6 | Contract: mã 200, `Content-Type`, payload JSON từng event giống hệt; lỗi trước stream JSON (400/404/409/429) | So sánh wire `develop` vs POC |
| V7 | Web: chat, Dừng, Tạo lại chạy trong trình duyệt với parser mới | Web dev trỏ API POC |
| V8 | typecheck/lint/build, test hiện có | Lệnh |

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Chưa có.
