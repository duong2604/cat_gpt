# SE-003 — Chế độ phát hành `demo` / `staff` và menu theo vai trò

Trạng thái: Sẵn sàng (phần đã rõ; phần Chat ở bản nhân viên chờ CS-6)
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: sau [SE-002](SE-002-avatar-requires-login.md) theo thứ tự ưu tiên (không phụ thuộc code). **Merge sau buổi demo 20/11/2026**
Hạn bàn giao review: Chờ chốt (đề xuất 25/11/2026) · Hạn hoàn tất: Chờ chốt (đề xuất 26/11/2026)
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng giao đề xuất ẩn tính năng chưa sẵn sàng ở bản nhân viên, giữ Chat mẫu ở bản demo (yêu cầu TL-003); hạn chờ chốt
SHA cơ sở: `origin/develop` @ `06a5a83`
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Cùng một mã nguồn chạy được hai chế độ: `demo` (giống hệt bản demo 20/11, có Chat mẫu) và `staff` (bản cho nhân viên thử nội bộ, ẩn tính năng chưa sẵn sàng). Menu chỉ hiện mục người dùng được phép dùng.

## Output
- PR từ `feature/release-mode` vào `develop`.
- Code:
  - Biến môi trường `RELEASE_MODE=demo|staff`, **mặc định `demo`**: API đọc qua `AppConfigService` (validate trong `env.validation.ts`); web đọc `NEXT_PUBLIC_RELEASE_MODE` (cùng giá trị, ghi trong `.env.example` của cả hai app).
  - Chế độ `staff`: thanh bên **không có mục Tài liệu**; `/documents` → trang 404 của app; Swagger tắt khi `SWAGGER_ENABLED` không đặt rõ (`staff` → mặc định `false`).
  - Chế độ `demo`: không đổi gì so với `develop` hiện tại.
  - Nhóm "Quản trị" chỉ hiện với `ADMIN` (đã có — giữ, thêm vào kiểm tra).
- Tài liệu: [ui-release-standards mục 3](../design/ui-release-standards.md#3-chế-độ-phát-hành-và-tính-năng-hiển-thị) cập nhật cột hiện trạng; [access-control](../design/access-control.md) KT-2 → "Đã sửa"; `README.md` mục chạy dự án ghi biến mới.

## Phạm vi
- **Làm:** như Output.
- **Không làm:** ẩn Chat ở chế độ `staff` (chờ [CS-6](../design/access-control.md#4-chính-sách-cần-khách-hàng--cto-chốt) — chốt xong TL bổ sung AC và chuyển lại `Sẵn sàng`); chỉnh giao diện ([SE-004](SE-004-ui-consistency.md)); tiêu chí tải R-3…R-8.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 (ẩn tính năng chưa sẵn sàng khỏi bản nhân viên; giữ Chat mẫu ở bản demo).
- Thiết kế: [ui-release-standards mục 3](../design/ui-release-standards.md#3-chế-độ-phát-hành-và-tính-năng-hiển-thị); [access-control KT-2](../design/access-control.md#3-khoảng-trống-đã-xác-minh).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Không đặt biến (mặc định `demo`): thanh bên, `/documents`, `/chat`, Swagger giống `06a5a83` | Giữ bản demo | UI so với ảnh TL-003; `curl /api/v1/docs` → 200 |
| AC2 | `staff`: thanh bên chỉ có Trò chuyện (+ Quản trị với admin); `/documents` mở trực tiếp → trang "Không tìm thấy trang" | UI mục 3 | UI USER + ADMIN |
| AC3 | `staff`: `/api/v1/docs` → 404; đặt `SWAGGER_ENABLED=true` thì bật lại | KT-2 | `curl` |
| AC4 | USER không thấy nhóm Quản trị ở cả hai chế độ; mở `/admin/users` → "Không có quyền truy cập"; API `403` | access-control mục 2 | UI + `curl` |
| AC5 | Giá trị `RELEASE_MODE` sai → API không khởi động, báo lỗi rõ | Cấu hình an toàn | Chạy với `RELEASE_MODE=abc` |
| AC6 | Checklist hai vai đủ (desktop + mobile, sáng + tối, vi + en) | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC7 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt; chỉ đổi file trong phạm vi | Quy ước repo | Lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| CS-6 | Bản nhân viên (`staff`) có hiển thị Chat khi câu trả lời vẫn là văn bản mẫu? | Ẩn Chat ở `staff` (thanh bên + `/chat` → 404 + API `chat/*`, `conversations/*` → 404) cho tới khi có AI thật | Chờ khách hàng + CTO |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
