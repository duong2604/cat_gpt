# SE-023 — Tạo lại: nhất quán dữ liệu khi thay câu trả lời (B10-M1)

Trạng thái: Sẵn sàng — **giai đoạn 1: phân tích + thiết kế** (chưa code; TL duyệt thiết kế trước)
Người phụ trách: Senior Dev · Ưu tiên: P1 (MAJOR — CTO nâng mức 21/11/2026) · Ước lượng: thiết kế 0,25 ngày; triển khai theo phương án được duyệt
Phụ thuộc: không chặn. Không trì hoãn SE-005 quá hạn 27/11
Hạn bàn giao review: thiết kế 22/11/2026 · Hạn hoàn tất: Không đặt — theo phương án được duyệt
Chốt: 21/11/2026 — CTO Review Verdict SE-022, mục "Follow-up bắt buộc / B10-M1"
SHA cơ sở: `origin/develop` @ `86b9f3f`
Liên quan: [báo cáo Chat](../reports/chat-module-structural-review.md) mục 8.7, 9 · F03 (PARTIAL)

## Vấn đề [CODE]
`ChatService.saveAnswer` (`apps/api/src/modules/chat/chat.service.ts` @ `86b9f3f`) khi Tạo lại thành công thực hiện **hai thao tác ghi độc lập**: `createMessage(câu mới)` → `deleteMessage(câu cũ)` → `touch`. MongoDB lỗi (mất kết nối, timeout, failover) hoặc tiến trình dừng **giữa** hai lệnh → hội thoại có 2 câu trả lời liên tiếp. Hệ quả: `regenerate` đọc 2 tin cuối (`recentMessages(…, 2)`), thấy `ASSISTANT, ASSISTANT` → `400 CHAT_NOTHING_TO_REGENERATE` mãi mãi cho hội thoại đó; lịch sử gửi LLM chứa 2 câu trả lời. Không có cơ chế tự phục hồi. Codebase hiện **không** dùng transaction MongoDB.

## Giai đoạn 1 — Phân tích (SE bàn giao thiết kế, KHÔNG code)
Đề xuất **ít nhất một** phương án an toàn (khuyến khích so sánh 2–3), mỗi phương án đánh giá:
1. **Atomicity:** trạng thái nào người dùng/DB có thể thấy nếu lỗi ở từng bước; có tạo trạng thái trung gian nhìn thấy được không.
2. **Concurrency:** tương tác với khóa `inFlight`, Dừng, xóa hội thoại giữa chừng, 2 tab.
3. **Retry:** thao tác có idempotent không; retry ở đâu, bao nhiêu lần, có thể gây ghi đôi không.
4. **Failure recovery:** dữ liệu đã lỡ hỏng (2 câu trả lời) được xử lý thế nào khi đọc/Tạo lại lần sau.
5. **Ràng buộc:** không đổi schema, không đổi API contract (route, mã lỗi, hình dạng SSE `meta/delta/done/error`, `MessageDto`); nếu phương án cần đổi `id` câu trả lời hoặc `createdAt` — nêu rõ tác động tới web (`chat-stream-provider.tsx`: `regenerate` ẩn câu cũ, `done` → `appendMessage`).
6. **Yêu cầu hạ tầng:** ví dụ transaction cần replica set — kiểm môi trường dev/demo/loadtest có đáp ứng không (bằng chứng, không suy đoán).
7. **Cách TL failure-injection được** (vd biến môi trường/điểm lỗi tạm trong bản build kiểm thử, hoặc ngắt Mongo) — chỉ trên DB `cat_gpt_loadtest`.

Hướng gợi ý để SE đánh giá (không bắt buộc chọn): (a) transaction MongoDB bao `create + delete + touch`; (b) ghi một tài liệu — cập nhật tại chỗ tin cũ thành nội dung mới (một lệnh, nguyên tử theo document); (c) phục hồi phía đọc — `regenerate` coi mọi tin `ASSISTANT` sau tin `USER` cuối là câu cần thay; (d) kết hợp.

Bàn giao giai đoạn 1: mục "Thiết kế" trong file này (hoặc tài liệu riêng dẫn link) + đề xuất phương án chọn; trạng thái giữ `Đang làm`, báo TL.

## Giai đoạn 2 — Triển khai (chỉ sau khi TL duyệt thiết kế)
PR riêng `fix/api-regenerate-consistency` từ `develop` mới nhất; **không** gộp B10-M2 (SE-024) hay refactor cấu trúc.

## Không được thay đổi
Schema `messages`/`conversations`; API contract; chính sách bảo mật; `inFlight` trong bộ nhớ; hành vi SE-F9 (Dừng/lỗi khi Tạo lại → câu cũ còn, `done` mang câu cũ).

## Checklist nghiệm thu (giai đoạn 2)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Lỗi Mongo ở bất kỳ bước nào của việc thay câu trả lời không để lại trạng thái làm hỏng Tạo lại/lịch sử (theo phương án duyệt) | TL failure injection trên `cat_gpt_loadtest` |
| AC2 | Dữ liệu đã lỡ có 2 câu trả lời liên tiếp được xử lý (nếu phương án có phục hồi) | TL dựng dữ liệu hỏng trên `cat_gpt_loadtest` |
| AC3 | Không đổi API contract/schema | Đọc diff + `f03-verify` |
| AC4 | Hồi quy Chat: `f03-verify` 15/15, `rag-runtime` 12/12, race 200+409 | Kịch bản TL |
| AC5 | typecheck/lint/build, test hiện có, CI | Lệnh + CI |

## Thiết kế
Chưa có.

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Không áp dụng.
