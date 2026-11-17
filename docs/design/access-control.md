# Ma trận phân quyền

> Trạng thái: **Đã duyệt** kết quả rà soát; chính sách CS-1…CS-6 **đã chốt** (khách hàng, 15/11/2026 — [mục 4](#4-chính-sách-đã-chốt)). Lập qua [TL-003](../tasks/TL-003-access-ui-release-audit.md).
> Cột **Loại** dưới đây ghi hiện trạng trên `develop` lúc kiểm tra; hành vi đích theo mục 4 và các task SE. Kiểm tra trên `develop` @ `06a5a83` (code giống bản demo `fbffd5b`), API http://localhost:4000, web http://localhost:3000.
> Tài khoản kiểm tra: admin seed (`ADMIN`), nhân viên thử NV1 `se001.test@catgpt.local` và NV2 `audit.nv2@catgpt.local` (`USER`). Hai tài khoản thử được khóa lại sau kiểm tra; hệ thống chưa có xóa cứng người dùng.

Ký hiệu cột **Loại**: **XM** = hành vi đã xác minh (lệnh hoặc UI, có kết quả); **KT** = khoảng trống cần sửa (có task); **CS** = chính sách đã chốt ở mục 4, hành vi hiện tại khác chính sách → có task.

## 1. Nguyên tắc đang áp dụng (đã xác minh trong code)

- Mọi endpoint yêu cầu đăng nhập, trừ `POST /auth/login|refresh|logout` và `GET /health` (`JwtAuthGuard` toàn cục + `@Public()`).
- Mỗi request đọc lại người dùng và phiên trong DB (`jwt.strategy.ts`): tài khoản bị khóa hoặc phiên bị thu hồi bị chặn **ngay**, vai trò mới có hiệu lực **ngay** (không chờ token hết hạn).
- Vai trò chỉ có `ADMIN` và `USER`. `RolesGuard` chỉ gắn ở `admin/users` (`@Roles(ADMIN)`).
- **Quyền quản trị tài khoản tách khỏi quyền đọc nội dung:** dữ liệu Chat lọc theo `userId` của người gọi (`getOwnedOrThrow`), không có ngoại lệ cho `ADMIN` và không có API quản trị nào đọc hội thoại. Hội thoại của người khác luôn trả `404 CONVERSATION_NOT_FOUND` (không lộ việc tồn tại). Tài liệu (Module 3–4) chưa có trên `develop`; quyền đọc tài liệu sẽ cấp theo **chính sách dữ liệu riêng**, không suy ra từ vai trò `ADMIN` (CS-1).
- Lớp giao diện (`AdminGuard`, ẩn nhóm "Quản trị" trên thanh bên) chỉ là UX; quyền thật do API kiểm tra.

## 2. Ma trận vai trò → màn hình → thao tác → dữ liệu → khi thiếu quyền

| Vai trò | Màn hình | Thao tác | Dữ liệu được xem / sửa | Khi thiếu quyền (UI / API) | Loại | Bằng chứng |
|---|---|---|---|---|---|---|
| Chưa đăng nhập | `/login` | Đăng nhập | — | Sai mật khẩu: thông báo "Email hoặc mật khẩu không đúng." | XM | UI ảnh chụp |
| Chưa đăng nhập | Mọi trang trong app (`/chat`, `/profile`, `/admin/users`) | Mở trực tiếp | Không | UI: chuyển `/login?next=…`. API: `401 AUTH_UNAUTHENTICATED` cho `/me`, `/me/sessions`, `/conversations`, `/admin/users`, `POST /chat/stream` | XM | UI `/chat` → `/login?next=%2Fchat`; curl |
| Chưa đăng nhập | — | Mở URL ảnh đại diện `/api/v1/files/avatars/:file` | Không | `401 AUTH_UNAUTHENTICATED`, không trả nội dung ảnh, qua cả cổng API và web | XM | [SE-002](../tasks/SE-002-avatar-requires-login.md) checklist vòng 1 |
| USER/ADMIN | — | Mở URL ảnh đại diện của người khác (`avatarKey` không khớp) | Không | `404` như ảnh không tồn tại — kể cả cho admin, không lộ việc file có tồn tại hay không | XM | [SE-002](../tasks/SE-002-avatar-requires-login.md) checklist vòng 1 |
| USER | `/chat`, `/chat/<id>` | Gửi, dừng, tạo lại, đổi tên, xóa, tìm hội thoại **của mình** | Hội thoại + tin nhắn của mình | — | XM | SE-001 review vòng 1; trạng thái trống "Chưa có cuộc trò chuyện nào." |
| USER | `/chat/<id của người khác>` | Xem, đọc tin, đổi tên, xóa, dừng, tạo lại, gửi tiếp vào hội thoại | Không | UI: "Không tìm thấy cuộc trò chuyện". API: cả 7 thao tác → `404 CONVERSATION_NOT_FOUND`; hội thoại NV2 giữ nguyên tiêu đề; danh sách của NV1 không chứa hội thoại NV2 | XM | curl NV1 → hội thoại NV2; UI NV1 mở `/chat/<id admin>` |
| USER | `/profile` › Thông tin | Sửa họ tên, SĐT, phòng ban; tải/xóa ảnh | Hồ sơ của mình | Gửi `role` hoặc `email` → `400 VALIDATION_FAILED` (không tự nâng quyền, không tự đổi email) | XM | curl `PATCH /me` |
| USER | `/profile` › Mật khẩu | Đổi mật khẩu (cần mật khẩu hiện tại) | Mật khẩu của mình | — | XM (code) | `change-password.dto.ts` |
| USER | `/profile` › Phiên đăng nhập | Xem, đăng xuất từng thiết bị / tất cả thiết bị khác | Phiên của mình (thiết bị, IP, thời gian) | Thu hồi phiên của người khác → `404 SESSION_NOT_FOUND`; admin vẫn đăng nhập | XM | curl NV1 `DELETE /me/sessions/<phiên admin>` |
| USER | `/admin`, `/admin/users` | Mở trực tiếp | Không | UI: "Không có quyền truy cập — Trang này chỉ dành cho quản trị viên."; thanh bên không có nhóm "Quản trị". API: `403 FORBIDDEN` cho xem danh sách, xem chi tiết, tạo, sửa vai trò (kể cả của mình), khóa, đặt lại mật khẩu | XM | UI NV1; curl 6 thao tác |
| USER | `/documents` | Mở | Trang giữ chỗ "Đang phát triển" | — | XM | UI; ẩn ở bản nhân viên (CS-6, [SE-003](../tasks/SE-003-release-mode-navigation.md)) |
| USER | API `/documents` ([SE-011](../tasks/SE-011-documents-txt-backend.md)) | Tải lên, xem danh sách/chi tiết, tải xuống, xóa | Tài liệu của mình (lọc theo `userId`) | — | XM | SE-011 checklist vòng 1 (T1, T9) |
| USER/ADMIN | API `/documents/:id`, `/documents/:id/download`, `DELETE /documents/:id` của người khác | Xem chi tiết, tải xuống, xóa | Không — **không có ngoại lệ cho ADMIN** (M3-2, CS-1) | `404 DOCUMENT_NOT_FOUND` cho cả USER khác vai và ADMIN; chưa đăng nhập → `401`; danh sách không chứa tài liệu của người khác | XM | SE-011 checklist vòng 1 (T7): 2 tài khoản cùng vai (A/B) + admin, curl 3 thao tác mỗi vai |
| USER/ADMIN | API `/documents` ở chế độ `staff` | Mọi thao tác | Không | `404` như route không tồn tại (giống `ChatHiddenGuard`, không phân biệt mock/thật — Tài liệu luôn ẩn ở `staff` theo CS-6) | XM | SE-011 checklist vòng 1 — `RELEASE_MODE=staff`, `GET`/`POST /documents` → `404` |
| ADMIN | `/admin/users` | Xem danh sách, tìm, lọc vai trò/trạng thái | Email, họ tên, SĐT, phòng ban, vai trò, trạng thái, lần đăng nhập cuối của **mọi** tài khoản; không có `passwordHash` lẫn `avatarUrl` (bỏ khỏi `AdminUserDto`, [SE-002](../tasks/SE-002-avatar-requires-login.md) — đã sửa). SĐT còn ở DTO, đích (CS-4) là [SE-006](../tasks/SE-006-account-admin-rules.md) | — | **CS-4** (ảnh: đã sửa) → [SE-006](../tasks/SE-006-account-admin-rules.md) (SĐT) | curl `GET /admin/users` (danh sách khóa trường) |
| ADMIN | `/admin/users` | Tạo tài khoản, sửa thông tin (gồm email), đổi vai trò | Tài khoản người khác | Tự đổi vai trò của mình → `400 USER_CANNOT_MODIFY_SELF`; hạ quyền admin cuối cùng → `400 USER_LAST_ADMIN` (code); email trùng → `USER_EMAIL_EXISTS` (code). Đổi email chưa có xác nhận, nhật ký, xử lý phiên | XM; đổi email **CS-3** → [SE-006](../tasks/SE-006-account-admin-rules.md) | curl; `admin-users.service.ts` |
| ADMIN | `/admin/users` | Khóa / mở khóa | Trạng thái tài khoản | Tự khóa mình → `400 USER_CANNOT_MODIFY_SELF`. Khóa có hiệu lực ngay: request kế tiếp của NV2 → `401 AUTH_ACCOUNT_BLOCKED`, refresh → `401` | XM | curl |
| ADMIN | `/admin/users` | Đổi vai trò USER ↔ ADMIN | Vai trò | Hiệu lực ngay trên phiên đang mở: NV2 `403` → `200` sau khi nâng, `403` lại sau khi hạ | XM | curl |
| ADMIN | `/admin/users` | Đặt lại mật khẩu | Mật khẩu người khác, thu hồi mọi phiên của họ | **Không chặn** đặt lại cho admin khác hoặc cho chính mình qua trang quản trị (không cần mật khẩu hiện tại). Đích: chặn cả hai | **CS-2** → [SE-006](../tasks/SE-006-account-admin-rules.md) | `admin-users.service.ts` `resetPassword` (không chạy thử trên admin để giữ phiên demo) |
| ADMIN | `/chat/<id của nhân viên>` | Xem, đọc tin | Không | UI/API như USER: `404 CONVERSATION_NOT_FOUND`; danh sách của admin không chứa hội thoại nhân viên. Một admin vừa được nâng quyền (NV2) cũng chỉ thấy hội thoại của mình | XM | curl admin → hội thoại NV2 |
| ADMIN | `/profile` | Như USER | Hồ sơ của mình | — | XM | UI |
| Mọi vai trò | Swagger `/api/v1/docs` | Mở | Danh sách API | Bật mặc định (`SWAGGER_ENABLED=true`), không cần đăng nhập để xem | **KT** (phát hành) | `env.validation.ts`; kiểm soát theo môi trường ([SE-003](../tasks/SE-003-release-mode-navigation.md)) |

## 3. Khoảng trống đã xác minh

| # | Khoảng trống | Ảnh hưởng | Mức | Xử lý |
|---|---|---|---|---|
| KT-1 | ~~Ảnh đại diện phục vụ tĩnh, không cần đăng nhập~~ — **Đã sửa**: `GET /api/v1/files/avatars/:file` yêu cầu đăng nhập và chỉ trả file khi `avatarKey` của người gọi khớp đúng key (CS-4 — chính chủ, không phải "mọi người đã đăng nhập"); người khác/admin/key sai/file đã xóa → `404` như nhau. Đọc qua `LocalStorageProvider.getAbsolutePath` (giữ chặn path traversal), `Cache-Control: private, no-store`. Màn quản trị và `GET /admin/users` bỏ luôn `avatarUrl` (`AdminUserDto`) | Đã khắc phục | — | [SE-002](../tasks/SE-002-avatar-requires-login.md) — Đã sửa, bàn giao `Chờ Review` |
| KT-2 | Swagger bật mặc định | Lộ danh sách API ở bản nhân viên | Thấp | Đã sửa — [SE-003](../tasks/SE-003-release-mode-navigation.md): `SWAGGER_ENABLED` không đặt → tắt ở `staff` |
| KT-3 | Đăng nhập giới hạn **5 lần/phút/IP** (`@Throttle` ở `auth.controller.ts`); mọi API khác giới hạn chung **120 request/phút/IP** (`ThrottlerGuard` toàn cục, `app.module.ts`) | 500 nhân sự sau cùng một IP công ty (NAT) sẽ bị `429` khi đăng nhập đầu giờ và cùng chia 120 request/phút khi dùng. TL gặp `429` đăng nhập ngay khi kiểm tra với 3 tài khoản | **Chặn thử nội bộ** | [SE-005](../tasks/SE-005-login-limit-shared-ip.md) kiểm chứng và sửa; tiêu chí [R-3](ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) |
| KT-4 | Giới hạn Chat (20 tin/phút/người) và trạng thái stream lưu trong bộ nhớ một tiến trình API; còn trùng hai lớp (`ChatThrottlerGuard` + `ChatService.assertRateLimit`) | Chạy nhiều instance thì giới hạn và nút Dừng không đúng | Chặn mở rộng | Tiêu chí [R-4](ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) |

Không phát hiện lỗi phân quyền chặn demo hoặc cho phép đọc/sửa dữ liệu người khác qua API đã đăng nhập.

## 4. Chính sách đã chốt

Khách hàng chốt 15/11/2026 (duyệt TL-003). Cột **Phương án / làm rõ** là đề xuất của TL để thực hiện quyết định; TL nghiệm thu theo cột này.

| # | Quyết định | Phương án / làm rõ | Task |
|---|---|---|---|
| CS-1 | Admin quản trị tài khoản. Quyền admin **không** tự cấp quyền đọc Chat hoặc tài liệu của nhân viên. Quyền tài liệu cấp theo chính sách dữ liệu riêng | Giữ như hiện tại (đã xác minh). Mọi API nội dung lọc theo người gọi; không có ngoại lệ theo vai trò. Module 3 (CTO 16/11/2026): tài liệu **chỉ chủ sở hữu** đọc/tải/xóa; admin không đọc; tài liệu người khác trả `404` — [module-3-documents.md](module-3-documents.md#1-quyết-định-đã-chốt) M3-2 | Không cần sửa code; điều kiện chặn merge [workflow 9.2](../project/workflow.md#92-điều-kiện-chặn-merge) điều 2 |
| CS-2 | Trang quản trị **chặn đặt lại mật khẩu cho chính mình hoặc cho admin khác**. Giữ luồng tự đổi mật khẩu trong Hồ sơ. Khôi phục admin qua **quy trình riêng** (khách hàng, 15/11/2026: thay luồng hạ quyền → đặt lại → nâng quyền) | API `POST /admin/users/:id/reset-password` → `400 USER_CANNOT_RESET_ADMIN` khi đích là chính mình, có vai trò `ADMIN`, **hoặc vừa bị hạ từ `ADMIN` trong 24 giờ** (chặn đường vòng hạ quyền rồi đặt lại); UI ẩn "Đặt lại mật khẩu" ở các dòng đó. Khôi phục admin: [mục 4.1](#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt) | [SE-006](../tasks/SE-006-account-admin-rules.md) |
| CS-3 | Admin **được** đổi email đăng nhập của nhân viên, có **xác nhận**, **kiểm tra email trùng** và **nhật ký thay đổi**. **Đổi email → thu hồi mọi phiên** của nhân viên đó (khách hàng chốt 15/11/2026) | Hộp thoại xác nhận nêu email cũ → mới; trùng → `409`/`USER_EMAIL_EXISTS` (đã có ở DB, giữ); nhật ký ghi người đổi, người bị đổi, giá trị cũ/mới, thời điểm; sau khi đổi, mọi phiên của nhân viên bị thu hồi — request kế tiếp `401`, đăng nhập lại bằng email mới | [SE-006](../tasks/SE-006-account-admin-rules.md) |
| CS-4 | Nhân viên **chỉ xem hồ sơ của mình**. Admin chỉ xem trường cần cho quản trị tài khoản. **SĐT và ảnh** chỉ hiển thị trong màn quản trị khi có nghiệp vụ cụ thể | Hiện chưa có nghiệp vụ → màn quản trị và API `admin/users` **bỏ SĐT và ảnh** (giữ email, họ tên, phòng ban, vai trò, trạng thái, lần đăng nhập cuối). File ảnh đại diện chỉ **chính chủ** mở được | [SE-002](../tasks/SE-002-avatar-requires-login.md) (ảnh), [SE-006](../tasks/SE-006-account-admin-rules.md) (SĐT), [SE-004](../tasks/SE-004-ui-consistency.md) (câu chữ Hồ sơ) |
| CS-5 | Quy mô thử nội bộ 500 nhân sự | Ngưỡng ở [tiêu chí R-1…R-10](ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự); hạ tầng còn chờ (chưa chốt nơi chạy) | [SE-005](../tasks/SE-005-login-limit-shared-ip.md) (đăng nhập chung IP) |
| CS-6 | Bản nhân viên **ẩn Chat** khi còn phản hồi mẫu và ẩn tính năng chưa sẵn sàng; **Swagger kiểm soát theo môi trường**; bản demo local giữ Chat mẫu | Chế độ `staff`: ẩn Chat, Tài liệu; Swagger theo `SWAGGER_ENABLED` của từng môi trường (mặc định tắt ở `staff`) | [SE-003](../tasks/SE-003-release-mode-navigation.md) |

### 4.1. Quy trình khôi phục tài khoản admin (đề xuất — chờ duyệt)

Thay luồng "admin khác hạ quyền → đặt lại → nâng quyền" (khách hàng bỏ ngày 15/11/2026). Bắt buộc có và **đã diễn tập trước đợt thử nội bộ** ([R-10](ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự)). Công cụ làm ở [SE-006](../tasks/SE-006-account-admin-rules.md).

**Khi dùng:** một admin không đăng nhập được (quên mật khẩu, tài khoản bị khóa, mất thiết bị) và không tự đổi được qua Hồ sơ. Admin khác **không** đặt lại mật khẩu qua web (CS-2).

| Vai | Ai (đề xuất) | Quyền |
|---|---|---|
| Người yêu cầu | Chính admin mất truy cập, hoặc trưởng bộ phận của họ | Mở phiếu yêu cầu khôi phục (mã phiếu) |
| Người phê duyệt | **CTO** hoặc người CTO ủy quyền bằng văn bản; không được là người thực hiện | Duyệt phiếu sau khi xác minh danh tính |
| Người thực hiện | Người vận hành có quyền vào máy chủ, nằm trong **danh sách do CTO chỉ định** (ít nhất 2 người) | Chạy lệnh khôi phục trên máy chủ; không có đường web |

**Các bước**
1. Người yêu cầu mở phiếu: tài khoản cần khôi phục, lý do.
2. Người phê duyệt xác minh danh tính qua **kênh thứ hai** (gặp trực tiếp hoặc gọi lại số điện thoại đã đăng ký trước), ghi kết quả vào phiếu, duyệt.
3. Người thực hiện chạy trên máy chủ: `pnpm --filter @cat-gpt/api admin:recover --email <email> --ticket <mã phiếu> --approved-by <email người duyệt>`. Lệnh: kiểm tra tài khoản tồn tại và có vai trò `ADMIN` (không nâng quyền tài khoản thường); đặt **mật khẩu tạm ngẫu nhiên** (in một lần, không lưu); đặt trạng thái `ACTIVE`; **buộc đổi mật khẩu ở lần đăng nhập đầu**; thu hồi mọi phiên; ghi nhật ký.
4. Người thực hiện giao mật khẩu tạm trực tiếp cho admin qua kênh riêng (không qua email/chat chung).
5. Admin đăng nhập, đổi mật khẩu ngay; người thực hiện đóng phiếu, đính bản ghi nhật ký.

**Nhật ký:** `audit_logs` bản ghi `ADMIN_RECOVERED` gồm tài khoản, mã phiếu, người duyệt, người thực hiện (tài khoản hệ điều hành + máy), thời điểm; không ghi mật khẩu. Phiếu lưu cùng nhật ký.

**Diễn tập (trước thử nội bộ):** trên môi trường thử, với tài khoản admin thử; đi đủ 5 bước; biên bản ghi người tham gia, thời gian từng bước, bản ghi nhật ký, vấn đề gặp. Lặp lại khi đổi người thực hiện hoặc hạ tầng.

**Cần khách hàng + CTO chốt (R1):** người phê duyệt, danh sách người thực hiện, kênh xác minh danh tính, nơi lưu phiếu.

## 5. Cách kiểm tra lại

Script kiểm tra quyền chạy với 3 tài khoản (admin + 2 nhân viên) qua curl; kết quả đầy đủ ghi trong [TL-003 checklist vòng 1](../tasks/TL-003-access-ui-release-audit.md#checklist-vòng-1). Lưu ý: đăng nhập bị giới hạn 5 lần/phút/IP (KT-3), chạy lại cần chờ 60 giây giữa các đợt.
