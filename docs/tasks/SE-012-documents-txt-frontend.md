# SE-012 — Lát TXT, giao diện: trang Tài liệu thật

Trạng thái: Sẵn sàng — TL chuyển 18/11/2026 (SE-011 merge `abc5a55`; SE-003 đã merge `783a8a3`)
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc: [SE-011](SE-011-documents-txt-backend.md) — **Done**, merge `abc5a55`; [SE-003](SE-003-release-mode-navigation.md) — Done, merge `783a8a3`; **không còn phụ thuộc chặn**
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-012 triển khai frontend lát TXT
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

**Thử nghiệm skills:** task pilot số 2 ([TL-010](TL-010-engineering-guide-skills-pilot.md)) — đọc [engineering-guide](../project/engineering-guide.md) và `apps/web/AGENTS.md` trước khi làm.

## Mục tiêu
Nhân viên mở Tài liệu, tải lên tệp TXT, thấy trạng thái tự chuyển tới "Sẵn sàng", tìm theo tên, tải xuống và xóa — trên dữ liệu thật của API SE-011.

## Output
- PR từ `feature/module-3-documents-txt-web` vào `develop`.
- `apps/web/src/features/documents/` (`api.ts`, `hooks.ts`, `components/`) và route `/documents` theo [thiết kế mục 11](../design/module-3-documents.md#11-giao-diện-se-012); dùng lại component preview khi hợp, không dùng `fake-data`.
- `messages/{vi,en}.json`: nhãn trạng thái, thông báo cho mọi mã lỗi mục 7.

## Phạm vi
- Làm: danh sách (desktop bảng, mobile thẻ), tải lên, tìm theo tên, lọc trạng thái, nhãn trạng thái tự cập nhật, chi tiết (kể cả mã lỗi khi `FAILED`), tải xuống, xóa có xác nhận.
- Không làm: xem trước nội dung, tóm tắt, hỏi đáp (Module 4); bật Tài liệu ở chế độ `staff` (giữ ẩn theo SE-003).

## Nguồn yêu cầu
- [module-3-documents.md](../design/module-3-documents.md) mục 2, 5, 7, 11; [chuẩn giao diện](../design/ui-release-standards.md#1-chuẩn-dùng-chung).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Luồng chính trên API thật: tải lên TXT → "Đang chờ" → "Đang xử lý" → "Sẵn sàng" (không tải lại trang) → tìm theo tên → tải xuống (tệp mở được, đúng tên) → xóa (biến mất ngay) | FR-M3-01…07 | GIF/ảnh |
| AC2 | Tệp sai loại / quá cỡ → thông báo đã dịch (vi, en); tài liệu `FAILED` hiện nhãn lỗi đã dịch | Thiết kế mục 7 | Ảnh |
| AC3 | Chỉ gọi lại danh sách định kỳ khi còn `PENDING`/`PROCESSING`; hết thì dừng | Thiết kế mục 11 | Tab Network |
| AC4 | Trạng thái trống / đang tải / lỗi API; desktop + 375 px; sáng + tối; vi + en | Workflow 9.1 | Ảnh |
| AC5 | Tài khoản B không thấy tài liệu của A; mở trực tiếp link tải của A → không tải được | M3-2 | Ảnh / Network |
| AC6 | Chế độ `staff` vẫn ẩn Tài liệu; chế độ `demo` không đổi luồng Chat | SE-003, bản demo | Ảnh |
| AC7 | Checklist hai vai đủ; dữ liệu thử đã xóa | Workflow 9.1 | Bàn giao 6.1 |
| AC8 | CI xanh; `pnpm build`, `typecheck`, `lint` đạt | Quy ước repo | Link run |

**Bàn giao bổ sung (Simplicity First):** 5 dòng như [SE-011](SE-011-documents-txt-backend.md#checklist-nghiệm-thu).

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| — | Không có | — | — |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review

## Phản hồi UI
Chưa có.
