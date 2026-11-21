# SE-024 — Tạo lại thất bại: thông báo cho người dùng (B10-M2)

Trạng thái: Nháp (backlog — CTO giữ MINOR)
Người phụ trách: Senior Dev · Ưu tiên: P3 · Ước lượng: 0,25 ngày
Phụ thuộc: sau SE-023 (cùng luồng Tạo lại); không gộp PR với SE-023
Hạn bàn giao review: Không đặt · Hạn hoàn tất: Không đặt
Chốt: chưa — TL chuyển `Sẵn sàng` khi xếp lịch
Liên quan: [báo cáo Chat](../reports/chat-module-structural-review.md) mục 8.7, 9

## Vấn đề [CODE]
Từ PR-B10 (#50, `2569caf`): Tạo lại bị lỗi (LLM hoặc truy hồi) → server gửi `done` mang câu trả lời cũ; web (`apps/web/src/features/chat/chat-stream-provider.tsx`, `regenerate` ẩn câu cũ, `done` → `appendMessage`) hiện lại câu cũ **không có thông báo** — người dùng thấy văn bản đang sinh biến mất mà không biết vì sao.

## Hướng (chốt khi xếp lịch)
Web nhận biết `done` trả về đúng tin đang bị thay (cùng `id`) trong luồng Tạo lại mà không phải do người dùng bấm Dừng → hiện toast "Không tạo lại được, đã giữ câu trả lời cũ". Ưu tiên giải pháp chỉ ở web, không đổi API contract; nếu cần trường mới trong event phải trình CTO.

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Chưa có.
