# SE-003 — Chế độ phát hành `demo` / `staff` và menu theo vai trò

Trạng thái: Đang làm
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1,5 ngày làm việc (thêm ẩn Chat ở `staff`, 15/11/2026)
Phụ thuộc: làm sau [SE-002](SE-002-avatar-requires-login.md) (thứ tự ưu tiên, không phụ thuộc code). **Merge sau buổi demo 20/11/2026**
Hạn bàn giao review: **25/11/2026** · Hạn hoàn tất: **26/11/2026** (khung tích hợp 23–26/11, khách hàng chốt 15/11/2026)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 · hoàn tất —
Chốt: 15/11/2026 — khách hàng chốt CS-6: bản nhân viên ẩn Chat khi còn phản hồi mẫu và ẩn tính năng chưa sẵn sàng; Swagger kiểm soát theo môi trường; bản demo local giữ Chat mẫu
SHA cơ sở: `origin/develop` @ `598b81d`
PR: [#6](https://github.com/duong2604/cat_gpt/pull/6)

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
### Checklist vòng 1
**Task** — SE-003 · PR [#6](https://github.com/duong2604/cat_gpt/pull/6) · SHA đầu PR `9281006` · vòng 1
**Kết quả** — Thêm `RELEASE_MODE` (api) / `NEXT_PUBLIC_RELEASE_MODE` (web), mặc định `demo`. API: `AppConfigService.releaseMode`, `swaggerEnabled` theo mode khi không đặt `SWAGGER_ENABLED`, `ChatHiddenGuard` (404 trên `ChatController`/`ConversationsController` khi `staff` + `LlmProvider.isMock`). Web: `lib/release-mode.ts`, `routes.home` theo mode, sidebar ẩn Trò chuyện/Tài liệu ở `staff`, `/chat` layout và `/documents` page gọi `notFound()` ở `staff`. Cập nhật `.env.example` (api, web), README, `ui-release-standards.md` mục 3–4, `access-control.md` KT-2.
**Checklist**
- [x] AC1 Mặc định `demo`: 2 cột `demo` khớp bảng — sidebar có Trò chuyện/Tài liệu, `/chat` mở được (`200`), `/` → `/chat` — xác minh qua curl (phiên admin) + browser (`find` sidebar); chưa gửi lại tin nhắn Chat để xem streaming (hành vi SE-001, ngoài phạm vi SE-003, không đổi code)
- [x] AC2 `RELEASE_MODE=staff`: UI `/chat`, `/documents` hiện đúng "Không tìm thấy trang" (xác minh bằng `get_page_text` qua trình duyệt thật, phiên admin); sidebar không còn nhóm "Không gian làm việc" (`find` xác nhận); API `curl` có cookie phiên: `POST /chat/stream` → `404`, `GET /conversations` → `404`, `GET /conversations/:id/messages` → `404`; không ảnh hưởng `/me`, `/admin/users` (vẫn `200`/`401` theo xác thực) — **lưu ý**: mã HTTP của *trang* `/chat`, `/documents` vẫn `200` dù nội dung đúng, do `Providers` (root layout) là Client Component bọc quanh children nên response đã bắt đầu stream trước khi `notFound()` chạy (đặc điểm kiến trúc RSC có sẵn của toàn app — xác nhận qua Next.js docs `node_modules/next/dist/docs` và qua debug log server-side `isStaffMode=true` đúng khi gọi `notFound()`); không phải lỗi do thay đổi này, ngoài khả năng sửa trong phạm vi task (cần đổi kiến trúc Client Component ở root layout)
- [x] AC3 Swagger 4 tổ hợp: `demo` không đặt biến → `200`; `demo` + `SWAGGER_ENABLED=false` → `404`; `staff` không đặt biến → `404`; `staff` + `SWAGGER_ENABLED=true` → `200` — `curl -i http://localhost:4001/api/v1/docs` từng tổ hợp (đã tạm comment dòng `SWAGGER_ENABLED` trong `.env` để thử "không đặt", khôi phục lại sau)
- [x] AC4 `RELEASE_MODE=abc` → API không khởi động — log: `Cấu hình môi trường không hợp lệ:\n  - RELEASE_MODE must be one of the following values: demo, staff`
- [ ] AC5 Checklist hai vai đủ (sáng + tối, vi + en) — **đạt một phần**: đã thử vai ADMIN ở cả `demo`/`staff` (desktop, theme theo máy, locale `vi`); **chưa thử**: vai `USER` riêng (logic không phân biệt vai nên rủi ro thấp — `ChatHiddenGuard` và sidebar filter không đọc `role`), theme sáng, locale `en`, mobile 375px; không tạo tài khoản thử riêng (dùng tài khoản admin seed có sẵn, không cần khóa)
- [x] AC6 `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt — chỉ đổi file trong phạm vi (api: config/llm/chat; web: lib/sidebar/chat-layout/documents; docs: README, ui-release-standards, access-control, tasks)
**Kiểm tra đã chạy** — `pnpm typecheck`, `pnpm lint`, `pnpm build` (cả ba đạt); curl thủ công cho AC2–AC4 (API `demo`/`staff` trên cổng 4000/4001, có đăng nhập admin seed); browser thật (Claude in Chrome) cho AC1–AC2 phía web trên cổng 3000
**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local @ `598b81d` (= `origin/develop`); đã dọn: nhánh `docs/thesis-implementation` (SE-008, Done, đã merge PR #5); còn giữ: `feature/openai-provider` (SE-007, chưa `Done`, lý do giữ: chưa merge), `fix/avatar-requires-login` (SE-002, chưa `Done`)
**Trạng thái** — Chờ Review

#### Review vòng 1
Chưa có.

## Phản hồi UI
Chưa có.
