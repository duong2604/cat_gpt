# SE-002 — Ảnh đại diện chỉ xem được khi đã đăng nhập

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,75 ngày làm việc (tăng 0,25 do phạm vi chính chủ + bỏ ảnh ở màn quản trị, 15/11/2026)
Phụ thuộc: Không. **Merge sau buổi demo 20/11/2026** ([workflow 9.2](../project/workflow.md#92-điều-kiện-chặn-merge) điều 5); làm và bàn giao được ngay
Hạn bàn giao review: **23/11/2026** · Hạn hoàn tất: **24/11/2026** (khung tích hợp 23–26/11, khách hàng chốt 15/11/2026)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 · hoàn tất —
Chốt: 15/11/2026 — khách hàng duyệt TL-003, chốt CS-4 (ảnh chỉ chính chủ; màn quản trị chỉ hiện ảnh khi có nghiệp vụ) và giao SE-002 ngay
SHA cơ sở: `origin/develop` @ `dbc4d85` (`06a5a83` → `dbc4d85` chỉ thêm tài liệu TL-003, không đổi `apps/`)
PR: https://github.com/duong2604/cat_gpt/pull/3 (nhắm `develop`) · SHA đầu PR `977c03d`

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
**Chuẩn bị bắt buộc:** trên `develop` (trước khi chuyển sang nhánh PR), cho tài khoản nhân viên A tải một ảnh và ghi lại URL — "**ảnh cũ**". Trên nhánh PR, A tải thêm một ảnh khác — "**ảnh mới**" (ghi URL; ảnh cũ bị thay nên kiểm tra ảnh cũ **trước** khi tải ảnh mới). Tài khoản: A (chính chủ, USER), B (USER khác), admin.

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | **URL ảnh trực tiếp, chưa đăng nhập** → `401`, không trả nội dung ảnh — cho cả ảnh cũ và ảnh mới, qua cả `localhost:4000` và `localhost:3000` | KT-1 | `curl -i` không cookie, 2 URL × 2 cổng |
| AC2 | **Chính chủ A** → `200`, đúng `Content-Type`, `Cache-Control: private, no-store` — ảnh cũ (trước khi tải ảnh mới) và ảnh mới | CS-4 | `curl -i` kèm cookie A |
| AC3 | **Tài khoản khác** B và **admin** mở URL ảnh của A → `404` (cả ảnh cũ và ảnh mới) | CS-4 | `curl -i` kèm cookie B, admin |
| AC4 | Sau khi A xóa ảnh hoặc thay ảnh: URL cũ → `404` với cả A; key có `..` hoặc ngoài thư mục lưu → `404`, không đọc file ngoài `uploads` | Bảo mật | `curl`, gồm `..%2F..%2Fpackage.json` |
| AC5 | UI chính chủ: ảnh hiện ở Hồ sơ và menu người dùng; tải ảnh mới, xóa ảnh vẫn chạy (nhân viên + admin, desktop + mobile) | Không hồi quy Module 1 | Ảnh chụp |
| AC6 | UI quản trị: danh sách và hộp thoại sửa người dùng không hiện ảnh; `GET /admin/users` không có `avatarUrl` | CS-4 | Ảnh chụp; `curl` |
| AC7 | Checklist hai vai đủ | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC8 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt; chỉ đổi file trong phạm vi | Quy ước repo | Lệnh; `git diff --stat origin/develop...HEAD` |

## Quyết định còn mở
Không có. CS-4 đã chốt 15/11/2026.

## Kết quả review
Senior Dev bàn giao vòng 1 ngày 15/11/2026, PR #3 nhắm `develop`, SHA đầu PR `977c03d`. Chờ TL review.

## Lịch sử review
### Checklist vòng 1
**Task** — SE-002 · PR https://github.com/duong2604/cat_gpt/pull/3 · SHA đầu PR `977c03d` · vòng 1
**Kết quả** — Bỏ `useStaticAssets`; thêm `GET /api/v1/files/avatars/:file` (yêu cầu đăng nhập, chỉ chính chủ) trong `apps/api/src/modules/storage/files.controller.ts`; `LocalStorageProvider.getAbsolutePath` (tái dùng `resolveKey`); `AdminUserDto` (bỏ `avatarUrl`) ở `packages/shared` + `UserPresenter.toAdminDto` + `AdminUsersController`/`Service`; web `features/admin-users` chuyển sang `AdminUserDto`, bỏ `UserAvatar` khỏi danh sách.
**Checklist**
- [x] AC1 Chưa đăng nhập, cả ảnh cũ và ảnh mới, 2 cổng → `401` — Đạt — `curl -i` không cookie: ảnh cũ (`ab3f0679-…`) và ảnh mới (`2536fef4-…`) đều `401` qua `:4000` và `:3000`
- [x] AC2 Chính chủ A → `200`, đúng `Content-Type`, `Cache-Control: private, no-store` — Đạt — `curl -i -b a.jar`: ảnh cũ và ảnh mới đều `200 image/png`, `Cache-Control: private, no-store`
- [x] AC3 Tài khoản khác B và admin → `404` cho cả ảnh cũ và ảnh mới — Đạt — `curl -i -b b.jar` / `-b admin.jar`: cả 2 ảnh × 2 tài khoản đều `404`
- [x] AC4 Ảnh cũ sau khi A tải ảnh mới (bị thay) → `404` kể cả với A; path traversal → `404` — Đạt — `curl -b a.jar` ảnh cũ → `404`; `curl -b a.jar .../avatars/..%2F..%2Fpackage.json` → `404`, không đọc được `package.json`
- [x] AC5 UI chính chủ: ảnh hiện ở Hồ sơ + menu thanh bên; tải/xóa ảnh vẫn chạy (nhân viên + admin) — Đạt — UI: đăng nhập A, ảnh hiện ở `/profile` và sidebar sau khi tải; admin tải/xóa ảnh riêng qua API đều `201`/`200`. **Chưa xác minh**: mobile 375px — công cụ đổi kích thước cửa sổ không hoạt động trong môi trường kiểm tra này (như SE-001)
- [x] AC6 UI quản trị không hiện ảnh; `GET /admin/users` không có `avatarUrl` — Đạt — UI: danh sách và hộp thoại "Chỉnh sửa người dùng" không có avatar dù A đang có ảnh; `curl -b admin.jar /admin/users` → JSON không chứa chuỗi `avatarUrl`
- [x] AC7 Checklist hai vai đủ — Đạt — xem khối "Checklist hai vai" bên dưới
- [x] AC8 `pnpm build/typecheck/lint` đạt; chỉ đổi file trong phạm vi — Đạt — cả 3 lệnh ở gốc repo pass; `git diff --stat origin/develop` chỉ gồm `main.ts`, `storage/*`, `admin-users/*`, `users/user.presenter.ts`, `packages/shared/src/types.ts`, `features/admin-users/*`

**Checklist hai vai** (workflow 9.1)
- [x] Quyền: ca được phép — A xem ảnh của mình (200, bằng chứng AC2); ca bị từ chối — chưa đăng nhập `401` (AC1), khác chủ/admin `404` (AC3), ảnh đã thay `404` (AC4)
- [x] Đường dẫn trực tiếp tới ảnh không có quyền → `404` đồng nhất, không phân biệt lý do (AC3, AC4)
- [x] Trạng thái trống/tải/lỗi/thành công — không đổi giao diện tải ảnh (ngoài phạm vi); nút "Tải ảnh lên"/"Xóa ảnh" vẫn hoạt động như cũ
- [x] Desktop, tối, vi — ảnh chụp AC5/AC6 (môi trường: dark mode, tiếng Việt). **Chưa xác minh**: mobile 375px, sáng, en — lý do như AC5; không đổi UI theo theme/ngôn ngữ nên rủi ro thấp
- [x] Ma trận quyền / chuẩn giao diện đã cập nhật — [access-control.md](../design/access-control.md) KT-1, dòng ma trận ảnh (mục 2), dòng `/admin/users` (mục 2)
- [x] Dữ liệu thử đã dọn — tài khoản `se002.a@catgpt.local`, `se002.b@catgpt.local` (tên nhận diện được): ảnh đã xóa, tài khoản đã khóa (`Khóa tài khoản` qua UI); admin tự xóa ảnh test của mình

**Kiểm tra đã chạy** — `pnpm build`, `pnpm typecheck`, `pnpm lint` (gốc repo) đều pass; `curl` theo từng AC ở trên (2 tài khoản thử A/B + admin, 2 ảnh cũ/mới, 2 cổng)
**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local @ `dbc4d85` trước khi tạo nhánh; không có nhánh/worktree cũ cần dọn (SE-001 đã dọn ở phiên trước)
**Trạng thái** — Chờ Review

#### Review vòng 1
Chưa có — chờ TL.

## Phản hồi UI
Chưa có.
