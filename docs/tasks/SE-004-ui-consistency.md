# SE-004 — Chỉnh giao diện nhất quán theo chuẩn UI

Trạng thái: Nháp (chờ khách hàng + CTO duyệt [chuẩn giao diện](../design/ui-release-standards.md) và CS-4)
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 1 ngày làm việc
Phụ thuộc: duyệt `ui-release-standards.md` mục 1; [CS-4](../design/access-control.md#4-chính-sách-cần-khách-hàng--cto-chốt) cho câu chữ Hồ sơ; làm sau [SE-003](SE-003-release-mode-navigation.md)
Hạn bàn giao review: Chờ chốt · Hạn hoàn tất: Chờ chốt
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: —
SHA cơ sở: `origin/develop` @ `06a5a83` (cập nhật khi chuyển `Sẵn sàng`)
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Giao diện hiển thị tiếng Việt đồng đều trên mọi máy, dùng được trên điện thoại ở mọi màn hình, câu chữ không hứa tính năng chưa có.

## Output
- PR từ `feature/ui-consistency` vào `develop`.
- Code:
  1. Font: nạp **Be Vietnam Pro** (400/500/600, subset `vietnamese` + `latin`) bằng `next/font/google` ở `apps/web/src/app/layout.tsx`, gán `--font-sans` trong `globals.css`; dự phòng `system-ui`.
  2. Quản trị người dùng trên mobile (< `md`): cột thao tác "…" luôn nhìn thấy (ví dụ cố định cột cuối hoặc chuyển dạng thẻ), không phải cuộn ngang để thao tác.
  3. Câu chữ Hồ sơ "Thông tin hiển thị với đồng nghiệp trong hệ thống" → sửa theo CS-4 (đề xuất: "Thông tin này hiển thị với quản trị viên."), cả `vi` và `en`.
- Tài liệu: cập nhật cột "Hiện trạng" ở [ui-release-standards mục 1–2](../design/ui-release-standards.md#1-chuẩn-dùng-chung).

## Phạm vi
- **Làm:** 3 mục trên.
- **Không làm:** đổi màu chủ đạo, logo, bố cục Chat; thêm màn hình danh bạ.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 (chuẩn hóa font tiếng Việt, theme, spacing, component, thông báo).
- Thiết kế: [ui-release-standards mục 1–2](../design/ui-release-standards.md#1-chuẩn-dùng-chung) (Chờ Review).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Font Be Vietnam Pro áp dụng toàn app; dấu chồng (ặ, ỗ, ữ) ở tiêu đề, nút, badge không bị cắt | UI mục 1 | DevTools `font-family` computed; ảnh chụp 4 màn hình |
| AC2 | Quản trị người dùng ở 375px: thấy và bấm được "…" của mọi dòng, trang không cuộn ngang | UI mục 2 | Ảnh mobile |
| AC3 | Câu chữ Hồ sơ theo CS-4, đủ `vi` + `en` | CS-4 | Ảnh + diff `messages/*.json` |
| AC4 | Chế độ `demo` vẫn giống bản demo ngoài 3 thay đổi trên | Giữ bản demo | Ảnh so sánh |
| AC5 | Checklist hai vai đủ | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC6 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| U1 | Duyệt chuẩn giao diện mục 1 (gồm font Be Vietnam Pro) | Đồng ý | Chờ khách hàng + CTO |
| CS-4 | Ai xem được SĐT, phòng ban, ảnh của người khác | Admin xem toàn bộ; nhân viên chỉ thấy của mình | Chờ khách hàng + CTO |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
