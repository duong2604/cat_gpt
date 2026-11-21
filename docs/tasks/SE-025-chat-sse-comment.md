# SE-025 — Sửa chú thích lý do dùng SSE tự viết (`chat.controller.ts`)

Trạng thái: Done (không còn cần) — 22/11/2026: SE-029 (`29160c4`) xóa `sse-stream.ts` và viết lại chú thích `ChatController` đúng cơ chế Native Streaming; không còn chú thích "`@Sse()` chỉ hỗ trợ GET".
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 0,1 ngày
Phụ thuộc: không. Không chen trước SE-005 (hạn 27/11) nếu xung đột — làm khi rảnh giữa các bước đo
Hạn bàn giao review: 22/11/2026 · Hạn hoàn tất: 22/11/2026
Chốt: 21/11/2026 — chỉ thị CTO "Chat Module Convention Review" mục 3; [báo cáo Chat mục 10.3–10.4](../reports/chat-module-structural-review.md)
SHA cơ sở: `origin/develop` mới nhất

## Vấn đề [CODE]
`apps/api/src/modules/chat/chat.controller.ts:22-23` ghi "không dùng `@Sse()` vì decorator đó chỉ hỗ trợ GET". **Sai** với NestJS 12.2.0: `@Sse(path, { method })` nhận method bất kỳ (`@nestjs/common/decorators/http/sse.decorator.js`).

## Việc cần làm
PR `docs/api-chat-sse-comment` — **chỉ sửa chú thích** JSDoc trên `ChatController`, nêu đúng lý do giữ `SseStream` tự viết:
1. `@Sse()` của NestJS tự thêm dòng `id: N` vào mỗi event; parser web (`apps/web/src/features/chat/stream.ts`) chỉ nhận khối bắt đầu bằng `data: ` → dùng `@Sse()` phải đổi contract wire.
2. Cần heartbeat (NestJS không có).
3. Kiểm quyền/khóa stream trước khi mở stream để lỗi trả JSON đúng mã.
Ngắn gọn (≤ 5 dòng), không tham chiếu PR/ngày.

## Không được thay đổi
Mọi dòng lệnh; `sse-stream.ts`; tệp khác.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Diff chỉ chú thích trong `chat.controller.ts` | `git diff --stat`, đọc diff |
| AC2 | Nội dung đúng 3 lý do trên | Đọc diff |
| AC3 | typecheck/lint/build, test hiện có, CI | Lệnh + CI |

## Kết quả review
22/11/2026 — Đóng: phạm vi đã được SE-029 bao trùm (kiểm `origin/develop` `29160c4`: `chat.controller.ts` dòng 21–24, `sse-stream.ts` không còn).

## Lịch sử review
Chưa có.

## Phản hồi UI
Không áp dụng.
