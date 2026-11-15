# SE-003 — Chế độ phát hành `demo` / `staff` và menu theo vai trò

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1,5 ngày làm việc (thêm ẩn Chat ở `staff`, 15/11/2026)
Phụ thuộc: làm sau [SE-002](SE-002-avatar-requires-login.md) (thứ tự ưu tiên, không phụ thuộc code). **Merge sau buổi demo 20/11/2026**
Hạn bàn giao review: **25/11/2026** · Hạn hoàn tất: **26/11/2026** (khung tích hợp 23–26/11, khách hàng chốt 15/11/2026)
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng chốt CS-6: bản nhân viên ẩn Chat khi còn phản hồi mẫu và ẩn tính năng chưa sẵn sàng; Swagger kiểm soát theo môi trường; bản demo local giữ Chat mẫu
SHA cơ sở: `origin/develop` @ SHA khi nhận task (ghi lúc chuyển `Đang làm`)
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Cùng một mã nguồn chạy được hai chế độ: `demo` (giống hệt bản demo 20/11, có Chat mẫu) và `staff` (bản nhân viên thử nội bộ, không có tính năng chưa sẵn sàng). Menu chỉ hiện mục người dùng được phép và được dùng.

## Output
- PR từ `feature/release-mode` vào `develop`.
- Code:
  - Biến môi trường `RELEASE_MODE=demo|staff`, **mặc định `demo`**: API đọc qua `AppConfigService` (validate trong `env.validation.ts`, giá trị sai → không khởi động); web đọc `NEXT_PUBLIC_RELEASE_MODE` cùng giá trị. Ghi vào `.env.example` của cả hai app.
  - Chế độ `staff`:
    - **Chat ẩn khi nhà cung cấp LLM là bản mẫu** (`MockLlmProvider`): thanh bên không có mục Trò chuyện; `/chat`, `/chat/<id>` → trang 404 của app; API `POST /chat/stream`, `conversations/*` → `404`. Trang sau đăng nhập (`routes.home`) chuyển về `/profile` khi Chat bị ẩn.
    - **Tài liệu ẩn:** thanh bên không có mục Tài liệu; `/documents` → trang 404.
  - **Swagger theo môi trường:** `SWAGGER_ENABLED` đặt riêng cho từng môi trường; không đặt thì mặc định `true` ở `demo`, `false` ở `staff`.
  - Chế độ `demo`: không đổi gì so với `develop` hiện tại.
  - Nhóm "Quản trị" chỉ hiện với `ADMIN` ở cả hai chế độ (đã có — giữ, đưa vào kiểm tra).
- Tài liệu: [ui-release-standards mục 3](../design/ui-release-standards.md#3-chế-độ-phát-hành-và-tính-năng-hiển-thị) cột hiện trạng; [access-control](../design/access-control.md) KT-2 → "Đã sửa"; `README.md` mục chạy dự án ghi biến mới và cách chạy từng chế độ.

## Phạm vi
- **Làm:** như Output.
- **Không làm:** gắn LLM thật; bỏ SĐT khỏi màn quản trị ([SE-006](SE-006-account-admin-rules.md)); chỉnh giao diện ([SE-004](SE-004-ui-consistency.md)); tiêu chí tải R-3…R-8.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 — [CS-6](../design/access-control.md#4-chính-sách-đã-chốt).
- Thiết kế: [ui-release-standards mục 3](../design/ui-release-standards.md#3-chế-độ-phát-hành-và-tính-năng-hiển-thị); [access-control KT-2](../design/access-control.md#3-khoảng-trống-đã-xác-minh).

## Checklist nghiệm thu
Kiểm tra bằng **cả hai vai** — nhân viên (tài khoản thử riêng của task) và admin — ở **cả hai chế độ**, desktop + mobile 375px. Ghi kết quả theo bảng dưới (mỗi ô: thấy gì + ảnh hoặc mã HTTP).

| Kiểm tra | `demo` · nhân viên | `demo` · admin | `staff` · nhân viên | `staff` · admin |
|---|---|---|---|---|
| **Màn vào sau đăng nhập** | `/chat` | `/chat` | `/profile` | `/profile` |
| **Menu** | Trò chuyện, Tài liệu (Đang phát triển) | + Quản trị › Người dùng | Không có Trò chuyện, Tài liệu (chỉ còn menu tài khoản → Hồ sơ) | Quản trị › Người dùng |
| **Mở trực tiếp** `/chat`, `/chat/<id>` | Mở được | Mở được | Trang "Không tìm thấy trang"; API `404` | Như nhân viên |
| **Mở trực tiếp** `/documents` | Trang "Đang phát triển" | Như nhân viên | "Không tìm thấy trang" | Như nhân viên |
| **Mở trực tiếp** `/admin/users` | "Không có quyền truy cập"; API `403` | Mở được | "Không có quyền truy cập"; API `403` | Mở được |
| **Mở trực tiếp** `/profile` | Mở được | Mở được | Mở được | Mở được |

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Không đặt biến (mặc định `demo`): 2 cột `demo` khớp bảng và giống `2636714` (gửi Chat → phản hồi mẫu chạy dần) | Giữ bản demo | UI so với ảnh TL-003 |
| AC2 | `RELEASE_MODE=staff`: 2 cột `staff` khớp bảng | CS-6 | UI + `curl` (`POST /chat/stream`, `GET /conversations` → `404`) |
| AC3 | **Swagger** `/api/v1/docs`: `demo` không đặt biến → `200`; `demo` + `SWAGGER_ENABLED=false` → `404`; `staff` không đặt biến → `404`; `staff` + `SWAGGER_ENABLED=true` → `200` | CS-6 | `curl -i` 4 cấu hình |
| AC4 | `RELEASE_MODE=abc` → API không khởi động, lỗi rõ | Cấu hình an toàn | Chạy thử |
| AC5 | Checklist hai vai đủ (sáng + tối, vi + en); tài khoản thử đã khóa | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC6 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt; chỉ đổi file trong phạm vi | Quy ước repo | Lệnh |

## Quyết định còn mở
Không có. CS-6 đã chốt 15/11/2026.

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
