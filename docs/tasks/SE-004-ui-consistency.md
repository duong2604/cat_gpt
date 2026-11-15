# SE-004 — Chỉnh giao diện nhất quán theo chuẩn UI

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 1,5 ngày làm việc
Phụ thuộc: làm sau [SE-006](SE-006-account-admin-rules.md) (thứ tự SE-002 → SE-003 → SE-005 → SE-006 → SE-004); cần SE-003 đã merge (sửa cùng `app-sidebar.tsx`, `layout.tsx`)
Hạn bàn giao review: Dự kiến 04/12/2026 (thứ Sáu) · Hạn hoàn tất: Dự kiến 07/12/2026 (thứ Hai) — chưa duyệt
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng duyệt Be Vietnam Pro, yêu cầu chuẩn hóa các màn đang dùng trước, bàn giao kèm ảnh trước/sau
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Các màn đang dùng hiển thị tiếng Việt đồng đều trên mọi máy, dùng được trên điện thoại, câu chữ đúng quyền thực tế.

## Output
- PR từ `feature/ui-consistency` vào `develop`.
- Code — chỉ các màn đang dùng: **Đăng nhập, Chat, Hồ sơ (3 tab), Quản trị người dùng**:
  1. Font **Be Vietnam Pro** (400/500/600, subset `vietnamese` + `latin`) qua `next/font/google` ở `apps/web/src/app/layout.tsx`, gán `--font-sans` trong `globals.css`; dự phòng `system-ui`.
  2. Đối chiếu từng màn với [chuẩn mục 1](../design/ui-release-standards.md#1-chuẩn-dùng-chung) (token màu, khoảng cách, component, câu thông báo) và sửa chỗ lệch.
  3. Quản trị người dùng trên mobile (< `md`): thao tác "…" của mọi dòng nhìn thấy và bấm được, trang không cuộn ngang.
  4. Hồ sơ: bỏ câu "Thông tin hiển thị với đồng nghiệp trong hệ thống" (trái CS-4); đề xuất "Thông tin cá nhân của bạn." — cả `vi` và `en`.
- Tài liệu: cột "Hiện trạng" ở [ui-release-standards mục 1–2](../design/ui-release-standards.md#1-chuẩn-dùng-chung).

## Phạm vi
- **Làm:** như Output.
- **Không làm:** màn Tài liệu, màn mới; đổi màu chủ đạo, logo, bố cục Chat.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 — duyệt Be Vietnam Pro, chuẩn hóa màn đang dùng trước; [CS-4](../design/access-control.md#4-chính-sách-đã-chốt).
- Thiết kế: [ui-release-standards mục 1–2](../design/ui-release-standards.md#1-chuẩn-dùng-chung) (đã duyệt).

## Checklist nghiệm thu
**Bàn giao bắt buộc kèm ảnh trước/sau** (trước = `develop` lúc nhận task, sau = đầu PR) cho 4 màn × **desktop và mobile 375px**, và **checklist thao tác** chạy bằng **tài khoản nhân viên và tài khoản admin**.

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Be Vietnam Pro áp dụng toàn app; dấu chồng (ặ, ỗ, ữ) ở tiêu đề, nút, badge không bị cắt | Chuẩn mục 1 | `font-family` computed; ảnh trước/sau |
| AC2 | 4 màn khớp chuẩn mục 1; mỗi chỗ đã sửa có ảnh trước/sau | Chuẩn mục 1 | Bảng ảnh trong bàn giao |
| AC3 | Quản trị người dùng 375px: thấy và bấm được "…" mọi dòng, không cuộn ngang | Chuẩn mục 2 | Ảnh mobile (admin) |
| AC4 | Câu chữ Hồ sơ theo CS-4, đủ `vi` + `en` | CS-4 | Ảnh + diff `messages/*.json` |
| AC5 | Checklist thao tác — **nhân viên** (desktop + mobile): đăng nhập sai/đúng → gửi Chat (chế độ `demo`) → sửa hồ sơ → xem phiên đăng nhập → mở `/admin/users` thấy "Không có quyền truy cập". **Admin** (desktop + mobile): đăng nhập → tạo, sửa, khóa/mở khóa một tài khoản thử → đổi theme sáng/tối → đổi ngôn ngữ | Yêu cầu 15/11 | Mỗi bước: mở ở đâu → làm gì → thấy gì + ảnh |
| AC6 | Chế độ `demo` vẫn giữ luồng Chat mẫu; không đổi hành vi ngoài giao diện | Giữ bản demo | Ảnh so sánh |
| AC7 | Checklist hai vai đủ | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC8 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| U1 | Chuẩn giao diện và font Be Vietnam Pro | Đồng ý | **Đồng ý** — khách hàng, 15/11/2026 |
| H1 | Mốc (dự kiến) | Bàn giao 04/12, hoàn tất 07/12 | Chờ duyệt |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
