# SE-027 — Parser SSE phía web theo chuẩn (độc lập SE-026)

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,25 ngày
Phụ thuộc: không — **độc lập với SE-026**; TL được review/merge khi đạt hồi quy, không chờ SE-026
Hạn bàn giao review: 22/11/2026 · Hạn hoàn tất: 22/11/2026
Chốt: 21/11/2026 — CTO "SSE Architecture Final Evaluation" mục 2 (APPROVED)
SHA cơ sở: `origin/develop` mới nhất (`83704bc`)
Liên quan: [báo cáo Chat mục 12–13](../reports/chat-module-structural-review.md)

## Vấn đề [CODE]
`apps/web/src/features/chat/stream.ts:41-45` tách khối theo `\n\n` rồi chỉ nhận khối **bắt đầu** bằng `data: ` → khối có `id:`/`event:` trước `data:` bị bỏ (định dạng NestJS `@Sse()`: `id: 1\ndata: {...}`); không xử lý CRLF/CR, nhiều dòng `data:`, `data:` không có dấu cách.

## Việc cần làm — PR `fix/web-sse-parser` (chỉ `apps/web`)
Parser theo đặc tả SSE (WHATWG "event stream interpretation"), viết gọn trong `stream.ts` (không thêm thư viện, không tệp/abstraction mới trừ khi tách một hàm thuần nhỏ trong cùng tệp):
1. Chuẩn hóa xuống dòng: CRLF, LF, CR; giữ phần dư giữa các network chunk (kể cả khi `\r\n` bị cắt giữa 2 chunk).
2. Dòng trống → kết thúc event; dòng bắt đầu `:` → comment, bỏ qua (`: ping`).
3. `field: value` — bỏ **một** dấu cách sau `:` nếu có; dòng không có `:` → field = cả dòng, value rỗng.
4. `data` → nối nhiều dòng bằng `\n`; `event` → lưu tên; `id`, `retry` → đọc và bỏ qua (không dùng `Last-Event-ID`, không resume).
5. Khi kết thúc event: không có `data` → bỏ qua. `event` rỗng/`message` → `JSON.parse(data)` → `onEvent(ChatStreamEvent)`. `event: error` (NestJS ghi khi Observable lỗi, data là text) → `onEvent({ type: 'error', code: ErrorCode.INTERNAL_ERROR })`. Tên event khác → bỏ qua.
6. **Không đổi** `ChatStreamEvent`, chữ ký `streamChat`, xử lý 401 → refresh → gửi lại **một lần trước khi stream mở** (cơ chế xác thực hiện có — giữ), xử lý `signal` hủy.
7. **Không** tự gửi lại POST khi mất kết nối giữa stream; không thêm reconnect.
Không đụng UI/thành phần khác.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Định dạng hiện tại (`data: {...}\n\n`, `: ping`) chạy như cũ | Trình duyệt trên `develop` API |
| AC2 | Định dạng NestJS (`\n` đầu, `id: N\ndata: {...}`, `event: error`) | Trình duyệt trên API POC SE-026 (khi có) hoặc probe TL |
| AC3 | CRLF/CR, nhiều dòng `data:`, `data:` không dấu cách, event bị cắt giữa chunk (kể cả giữa `\r` và `\n`) | Probe TL gọi hàm parse với dữ liệu dựng sẵn (không thêm unit test vào repo) |
| AC4 | Chat thường, Dừng, Tạo lại, RAG, lỗi LLM hiển thị đúng; không gửi lại POST khi ngắt | Trình duyệt thật (TL), tab Network |
| AC5 | typecheck/lint/build web; CI | Lệnh + CI |
| AC6 | Diff chỉ `apps/web/src/features/chat/stream.ts` | `git diff --stat` |

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Chưa có.
