# Ma trận phân quyền

> Trạng thái: **Chờ Review** (TL soạn qua [TL-003](../tasks/TL-003-access-ui-release-audit.md), 15/11/2026). Kiểm tra trên `develop` @ `06a5a83` (code giống bản demo `fbffd5b`), API http://localhost:4000, web http://localhost:3000.
> Tài khoản kiểm tra: admin seed (`ADMIN`), nhân viên thử NV1 `se001.test@catgpt.local` và NV2 `audit.nv2@catgpt.local` (`USER`). Hai tài khoản thử được khóa lại sau kiểm tra; hệ thống chưa có xóa cứng người dùng.

Ký hiệu cột **Loại**: **XM** = hành vi đã xác minh (lệnh hoặc UI, có kết quả); **KT** = khoảng trống cần sửa (có task); **CS** = chính sách cần khách hàng + CTO chốt (mục 4).

## 1. Nguyên tắc đang áp dụng (đã xác minh trong code)

- Mọi endpoint yêu cầu đăng nhập, trừ `POST /auth/login|refresh|logout` và `GET /health` (`JwtAuthGuard` toàn cục + `@Public()`).
- Mỗi request đọc lại người dùng và phiên trong DB (`jwt.strategy.ts`): tài khoản bị khóa hoặc phiên bị thu hồi bị chặn **ngay**, vai trò mới có hiệu lực **ngay** (không chờ token hết hạn).
- Vai trò chỉ có `ADMIN` và `USER`. `RolesGuard` chỉ gắn ở `admin/users` (`@Roles(ADMIN)`).
- **Quyền quản trị tài khoản tách khỏi quyền đọc nội dung:** dữ liệu Chat lọc theo `userId` của người gọi (`getOwnedOrThrow`), không có ngoại lệ cho `ADMIN` và không có API quản trị nào đọc hội thoại. Hội thoại của người khác luôn trả `404 CONVERSATION_NOT_FOUND` (không lộ việc tồn tại). Tài liệu (Module 3–4) chưa có trên `develop`; khi làm phải theo cùng nguyên tắc (mục 4, CS-1).
- Lớp giao diện (`AdminGuard`, ẩn nhóm "Quản trị" trên thanh bên) chỉ là UX; quyền thật do API kiểm tra.

## 2. Ma trận vai trò → màn hình → thao tác → dữ liệu → khi thiếu quyền

| Vai trò | Màn hình | Thao tác | Dữ liệu được xem / sửa | Khi thiếu quyền (UI / API) | Loại | Bằng chứng |
|---|---|---|---|---|---|---|
| Chưa đăng nhập | `/login` | Đăng nhập | — | Sai mật khẩu: thông báo "Email hoặc mật khẩu không đúng." | XM | UI ảnh chụp |
| Chưa đăng nhập | Mọi trang trong app (`/chat`, `/profile`, `/admin/users`) | Mở trực tiếp | Không | UI: chuyển `/login?next=…`. API: `401 AUTH_UNAUTHENTICATED` cho `/me`, `/me/sessions`, `/conversations`, `/admin/users`, `POST /chat/stream` | XM | UI `/chat` → `/login?next=%2Fchat`; curl |
| Chưa đăng nhập | — | Mở URL ảnh đại diện `/api/v1/files/avatars/<uuid>.png` | Không | `401 AUTH_UNAUTHENTICATED`, không trả nội dung ảnh, qua cả cổng API và web | XM | [SE-002](../tasks/SE-002-avatar-requires-login.md) checklist vòng 1: curl không cookie → `401`; đã đăng nhập → `200` |
| USER | `/chat`, `/chat/<id>` | Gửi, dừng, tạo lại, đổi tên, xóa, tìm hội thoại **của mình** | Hội thoại + tin nhắn của mình | — | XM | SE-001 review vòng 1; trạng thái trống "Chưa có cuộc trò chuyện nào." |
| USER | `/chat/<id của người khác>` | Xem, đọc tin, đổi tên, xóa, dừng, tạo lại, gửi tiếp vào hội thoại | Không | UI: "Không tìm thấy cuộc trò chuyện". API: cả 7 thao tác → `404 CONVERSATION_NOT_FOUND`; hội thoại NV2 giữ nguyên tiêu đề; danh sách của NV1 không chứa hội thoại NV2 | XM | curl NV1 → hội thoại NV2; UI NV1 mở `/chat/<id admin>` |
| USER | `/profile` › Thông tin | Sửa họ tên, SĐT, phòng ban; tải/xóa ảnh | Hồ sơ của mình | Gửi `role` hoặc `email` → `400 VALIDATION_FAILED` (không tự nâng quyền, không tự đổi email) | XM | curl `PATCH /me` |
| USER | `/profile` › Mật khẩu | Đổi mật khẩu (cần mật khẩu hiện tại) | Mật khẩu của mình | — | XM (code) | `change-password.dto.ts` |
| USER | `/profile` › Phiên đăng nhập | Xem, đăng xuất từng thiết bị / tất cả thiết bị khác | Phiên của mình (thiết bị, IP, thời gian) | Thu hồi phiên của người khác → `404 SESSION_NOT_FOUND`; admin vẫn đăng nhập | XM | curl NV1 `DELETE /me/sessions/<phiên admin>` |
| USER | `/admin`, `/admin/users` | Mở trực tiếp | Không | UI: "Không có quyền truy cập — Trang này chỉ dành cho quản trị viên."; thanh bên không có nhóm "Quản trị". API: `403 FORBIDDEN` cho xem danh sách, xem chi tiết, tạo, sửa vai trò (kể cả của mình), khóa, đặt lại mật khẩu | XM | UI NV1; curl 6 thao tác |
| USER | `/documents` | Mở | Trang giữ chỗ "Đang phát triển" | — | XM | UI; đề xuất ẩn ở bản nhân viên ([SE-003](../tasks/SE-003-release-mode-navigation.md)) |
| ADMIN | `/admin/users` | Xem danh sách, tìm, lọc vai trò/trạng thái | Email, họ tên, SĐT, phòng ban, ảnh, vai trò, trạng thái, lần đăng nhập cuối của **mọi** tài khoản; không có `passwordHash` | — | XM; phạm vi xem SĐT/phòng ban là **CS-4** | curl `GET /admin/users` (danh sách khóa trường) |
| ADMIN | `/admin/users` | Tạo tài khoản, sửa thông tin (gồm email), đổi vai trò | Tài khoản người khác | Tự đổi vai trò của mình → `400 USER_CANNOT_MODIFY_SELF`; hạ quyền admin cuối cùng → `400 USER_LAST_ADMIN` (code) | XM; đổi email là **CS-3** | curl; `admin-users.service.ts` |
| ADMIN | `/admin/users` | Khóa / mở khóa | Trạng thái tài khoản | Tự khóa mình → `400 USER_CANNOT_MODIFY_SELF`. Khóa có hiệu lực ngay: request kế tiếp của NV2 → `401 AUTH_ACCOUNT_BLOCKED`, refresh → `401` | XM | curl |
| ADMIN | `/admin/users` | Đổi vai trò USER ↔ ADMIN | Vai trò | Hiệu lực ngay trên phiên đang mở: NV2 `403` → `200` sau khi nâng, `403` lại sau khi hạ | XM | curl |
| ADMIN | `/admin/users` | Đặt lại mật khẩu | Mật khẩu người khác, thu hồi mọi phiên của họ | **Không chặn** đặt lại cho admin khác hoặc cho chính mình qua trang quản trị (không cần mật khẩu hiện tại) | **CS-2** | `admin-users.service.ts` `resetPassword` (không chạy thử trên admin để giữ phiên demo) |
| ADMIN | `/chat/<id của nhân viên>` | Xem, đọc tin | Không | UI/API như USER: `404 CONVERSATION_NOT_FOUND`; danh sách của admin không chứa hội thoại nhân viên. Một admin vừa được nâng quyền (NV2) cũng chỉ thấy hội thoại của mình | XM | curl admin → hội thoại NV2 |
| ADMIN | `/profile` | Như USER | Hồ sơ của mình | — | XM | UI |
| Mọi vai trò | Swagger `/api/v1/docs` | Mở | Danh sách API | Bật mặc định (`SWAGGER_ENABLED=true`), không cần đăng nhập để xem | **KT** (phát hành) | `env.validation.ts`; tắt ở bản nhân viên ([SE-003](../tasks/SE-003-release-mode-navigation.md)) |

## 3. Khoảng trống đã xác minh

| # | Khoảng trống | Ảnh hưởng | Mức | Xử lý |
|---|---|---|---|---|
| KT-1 | ~~Ảnh đại diện phục vụ tĩnh, không cần đăng nhập~~ — **Đã sửa**: endpoint `GET /api/v1/files/*` yêu cầu đăng nhập (`FilesController`, không `@Public()`), đọc qua `LocalStorageProvider.getAbsolutePath` (giữ chặn path traversal), `Cache-Control: private, max-age=3600` | Đã khắc phục | — | [SE-002](../tasks/SE-002-avatar-requires-login.md) — Đã sửa, bàn giao `Chờ Review` |
| KT-2 | Swagger bật mặc định | Lộ danh sách API ở bản nhân viên | Thấp | [SE-003](../tasks/SE-003-release-mode-navigation.md) |
| KT-3 | Đăng nhập giới hạn **5 lần/phút/IP** (`@Throttle` ở `auth.controller.ts`) | 500 nhân sự sau cùng một IP công ty (NAT) sẽ bị `429` khi đăng nhập đầu giờ. TL gặp ngay khi kiểm tra với 3 tài khoản | **Chặn thử nội bộ** | Tiêu chí phát hành [R-3](ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự); task tạo sau khi chốt CS-5 |
| KT-4 | Giới hạn Chat (20 tin/phút/người) và trạng thái stream lưu trong bộ nhớ một tiến trình API; còn trùng hai lớp (`ChatThrottlerGuard` + `ChatService.assertRateLimit`) | Chạy nhiều instance thì giới hạn và nút Dừng không đúng | Chặn mở rộng | Tiêu chí [R-4](ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) |

Không phát hiện lỗi phân quyền chặn demo hoặc cho phép đọc/sửa dữ liệu người khác qua API đã đăng nhập.

## 4. Chính sách cần khách hàng + CTO chốt

| # | Câu hỏi | Hiện trạng (đã xác minh) | Đề xuất của TL |
|---|---|---|---|
| CS-1 | Quản trị viên có được đọc nội dung Chat và tài liệu của nhân viên không (kiểm toán, điều tra)? | Không đọc được | Giữ **không**. Nếu cần kiểm toán: vai trò riêng (ví dụ `AUDITOR`), chỉ đọc, có nhật ký truy cập |
| CS-2 | Admin có được đặt lại mật khẩu cho **admin khác** và cho **chính mình** qua trang quản trị? | Được | Chặn cả hai: admin tự đổi qua Hồ sơ › Mật khẩu; đặt lại cho admin khác cần chính sách riêng |
| CS-3 | Admin có được đổi email đăng nhập của nhân viên? | Được (giao diện Hồ sơ ghi "Liên hệ quản trị viên nếu cần đổi email") | Giữ, ghi nhật ký thay đổi |
| CS-4 | Ai được xem SĐT, phòng ban, ảnh của người khác? | Chỉ admin xem qua trang quản trị; Hồ sơ ghi "Thông tin hiển thị với đồng nghiệp" nhưng chưa có màn hình đồng nghiệp | Admin xem toàn bộ; nhân viên chỉ thấy của mình cho tới khi có màn hình danh bạ. Sửa câu chữ ở [SE-004](../tasks/SE-004-ui-consistency.md) |
| CS-5 | Quy mô thử nội bộ: số người đăng nhập cùng lúc, có chung IP không, hạ tầng chạy ở đâu | Chỉ chạy local, một tiến trình API | Xem [tiêu chí 500 nhân sự](ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) |
| CS-6 | Bản nhân viên có hiển thị Chat khi câu trả lời vẫn là văn bản mẫu? | Chat bật cho mọi người | Ẩn Chat ở bản nhân viên cho tới khi có AI thật; bản demo giữ Chat mẫu ([SE-003](../tasks/SE-003-release-mode-navigation.md)) |

## 5. Cách kiểm tra lại

Script kiểm tra quyền chạy với 3 tài khoản (admin + 2 nhân viên) qua curl; kết quả đầy đủ ghi trong [TL-003 checklist vòng 1](../tasks/TL-003-access-ui-release-audit.md#checklist-vòng-1). Lưu ý: đăng nhập bị giới hạn 5 lần/phút/IP (KT-3), chạy lại cần chờ 60 giây giữa các đợt.
