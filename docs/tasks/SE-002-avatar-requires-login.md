# SE-002 — Ảnh đại diện chỉ xem được khi đã đăng nhập

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,75 ngày làm việc (tăng 0,25 do phạm vi chính chủ + bỏ ảnh ở màn quản trị, 15/11/2026)
Phụ thuộc: Không. **Merge sau buổi demo 20/11/2026** ([workflow 9.2](../project/workflow.md#92-điều-kiện-chặn-merge) điều 5); làm và bàn giao được ngay
Hạn bàn giao review: **23/11/2026** · Hạn hoàn tất: **24/11/2026** (khung tích hợp 23–26/11, khách hàng chốt 15/11/2026)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 · hoàn tất —
Chốt: 15/11/2026 — khách hàng duyệt TL-003, chốt CS-4 (ảnh chỉ chính chủ; màn quản trị chỉ hiện ảnh khi có nghiệp vụ) và giao SE-002 ngay
SHA cơ sở: `origin/develop` @ `dbc4d85` (`06a5a83` → `dbc4d85` chỉ thêm tài liệu TL-003, không đổi `apps/`)
PR: <link, Senior Dev ghi khi bàn giao>

> **Phạm vi đổi ngày 15/11/2026 sau khi Senior Dev đã bắt đầu** (khách hàng chốt CS-4): ảnh chỉ **chính chủ** xem được — không còn "mọi người đã đăng nhập". Phần đã làm (bỏ `useStaticAssets`, endpoint có xác thực, `getAbsolutePath`) giữ nguyên; bổ sung kiểm tra chủ sở hữu và bỏ ảnh khỏi màn quản trị.

## Mục tiêu
Ảnh đại diện là dữ liệu cá nhân: chỉ chính chủ mở được, kể cả khi người khác có đường link. Chính chủ vẫn thấy ảnh ở Hồ sơ và menu người dùng trên thanh bên. Màn quản trị không hiện ảnh nhân viên (chưa có nghiệp vụ cần).

## Output
- PR từ `fix/avatar-requires-login` vào `develop`.
- Code:
  - Bỏ phục vụ tĩnh `useStaticAssets` ở `apps/api/src/main.ts`.
  - Endpoint `GET /api/v1/files/avatars/:file` (yêu cầu đăng nhập, không `@Public()`): chỉ trả file khi `avatarKey` của **người gọi** đúng bằng `avatars/:file`; mọi trường hợp khác (người khác, admin, file không tồn tại, key lạ, `..`) → `404` như nhau, không lộ việc file tồn tại. Đọc qua `LocalStorageProvider` (giữ chặn path traversal), `Cache-Control: private, no-store` (ảnh đổi hoặc bị xóa phải hết hiển thị ngay). Giữ dạng URL `getPublicUrl`.
  - Ảnh tải lên **trước** thay đổi (key cũ `avatars/<uuid>.<ext>` trong DB) tiếp tục hiển thị cho chính chủ, không cần chuyển dữ liệu.
  - Màn quản trị người dùng: không hiện ảnh (dùng chữ cái đầu như hiện tại khi không có ảnh); API `admin/users` không trả `avatarUrl` (bỏ khỏi DTO quản trị, giữ ở `/me`).
- Tài liệu: [access-control.md](../design/access-control.md) KT-1 → "Đã sửa" + dòng ma trận ảnh; `module-1-auth.md` phần ảnh đại diện nếu có mô tả phục vụ tĩnh.

## Phạm vi
- **Làm:** như Output.
- **Không làm:** bỏ SĐT khỏi màn quản trị ([SE-006](SE-006-account-admin-rules.md)); chuyển sang MinIO; đổi giao diện tải ảnh.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 — duyệt TL-003, [CS-4](../design/access-control.md#4-chính-sách-đã-chốt) (nhân viên chỉ xem hồ sơ của mình; ảnh chỉ hiện ở màn quản trị khi có nghiệp vụ cụ thể); khoảng trống [KT-1](../design/access-control.md#3-khoảng-trống-đã-xác-minh): `curl` không cookie tới `/api/v1/files/avatars/<uuid>.png` → `200` qua cả cổng 4000 và 3000.
- Basic Design: [access-control mục 1](../design/access-control.md#1-nguyên-tắc-đang-áp-dụng-đã-xác-minh-trong-code).

## Checklist nghiệm thu
**Dữ liệu thử riêng (bắt buộc):** tạo 2 tài khoản nhân viên chỉ dùng cho task này — A `se002.a@catgpt.local` (chính chủ), B `se002.b@catgpt.local` (nhân viên khác) — cùng admin seed. Không dùng tài khoản thử của task khác. Khóa A, B sau khi kiểm tra; ghi vào bàn giao.

**Ảnh theo phiên bản cũ:** chạy `pnpm dev` trên phiên bản **trước khi sửa** (`origin/develop` @ `2636714` hoặc SHA `develop` lúc bàn giao — chưa có commit SE-002), đăng nhập A, tải "**ảnh cũ**", ghi URL. Sau đó chuyển sang nhánh PR (cùng DB, cùng thư mục `uploads`), kiểm tra ảnh cũ; rồi A tải "**ảnh mới**" (ghi URL) và kiểm tra ảnh mới. Ảnh mới thay ảnh cũ, nên ảnh cũ phải kiểm tra **trước** khi tải ảnh mới.

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | **Chưa đăng nhập** mở URL ảnh trực tiếp → `401`, không trả nội dung ảnh — ảnh cũ và ảnh mới, cổng `4000` và `3000` | KT-1 | `curl -i` không cookie (4 lệnh) |
| AC2 | **Chính chủ A** → `200`, đúng `Content-Type`, `Cache-Control: private, no-store` — ảnh cũ (trước khi tải ảnh mới) và ảnh mới | CS-4 | `curl -i` cookie A |
| AC3 | **Nhân viên khác B** → `404` — ảnh cũ và ảnh mới | CS-4 | `curl -i` cookie B |
| AC4 | **Admin** → `404` — ảnh cũ và ảnh mới | CS-4 | `curl -i` cookie admin |
| AC5 | **Cùng trình duyệt:** A mở URL ảnh mới trong tab (thấy ảnh) → **đăng xuất** → tải lại tab đó → không thấy ảnh (`401`, không lấy từ cache). Đăng nhập lại bằng **B** trên cùng trình duyệt → tải lại tab → không thấy ảnh (`404`); menu người dùng hiện chữ cái đầu của B, không còn ảnh A | CS-4 | Trình duyệt + DevTools Network (trạng thái, không có "from cache"), ảnh chụp từng bước |
| AC6 | Sau khi A xóa ảnh hoặc thay ảnh: URL cũ → `404` với cả A; key có `..` hoặc ngoài thư mục lưu → `404`, không đọc file ngoài `uploads` | Bảo mật | `curl`, gồm `..%2F..%2Fpackage.json` |
| AC7 | UI chính chủ: ảnh hiện ở Hồ sơ và menu người dùng; tải ảnh mới, xóa ảnh vẫn chạy (nhân viên + admin, desktop + mobile) | Không hồi quy Module 1 | Ảnh chụp |
| AC8 | UI quản trị: danh sách và hộp thoại sửa người dùng không hiện ảnh; `GET /admin/users` không có `avatarUrl` | CS-4 | Ảnh chụp; `curl` |
| AC9 | Checklist hai vai đủ; tài khoản A, B đã khóa | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC10 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt; chỉ đổi file trong phạm vi | Quy ước repo | Lệnh; `git diff --stat origin/develop...HEAD` |

## Quyết định còn mở
Không có. CS-4 đã chốt 15/11/2026.

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
