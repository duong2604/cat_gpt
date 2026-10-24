# Module 1 — Xác thực & Quản lý người dùng

> Trạng thái: ✅ Hoàn thành code (23/10/2026) · Chờ review PR `feature/module-1-auth-user` → `develop`
> Phạm vi theo đề cương: đăng nhập/đăng xuất, thông tin cá nhân, đổi mật khẩu, quản lý phiên; quản trị viên quản lý tài khoản, khóa/mở khóa và phân quyền.

## 1. Yêu cầu đã chốt với sinh viên

| # | Câu hỏi | Quyết định |
|---|---|---|
| Q7 | Đăng nhập bằng gì? | **Email + mật khẩu**. Chưa đăng nhập thì mọi trang đều chuyển về màn hình đăng nhập |
| Q8 | Ai tạo tài khoản? | **Chỉ admin**. Không có trang tự đăng ký |
| Q9 | Chiến lược token | **Access token 15 phút + refresh token 7 ngày**, lưu trong cookie httpOnly, phiên lưu ở MongoDB (xem mục 2) |
| Q10 | Phân quyền | **2 vai trò: `ADMIN` / `USER`**, chưa cần RBAC chi tiết |
| Q11 | Quên mật khẩu qua email? | **Không làm**. Admin đặt lại mật khẩu hoặc khóa user. **Không cho phép xóa user** khỏi hệ thống |
| Q12 | Thông tin cá nhân | Họ tên, email, số điện thoại, phòng ban, avatar. Avatar **tạm lưu local**, đầu chờ cho MinIO |
| Q13 | Khóa user có đá ra ngay không? | **Có, ngay ở request kế tiếp** (cách 2, xem mục 2) |
| Q14 | Seed admin | Tự tạo admin từ biến môi trường khi hệ thống chưa có admin nào |
| — | Bắt đổi mật khẩu ở lần đăng nhập đầu? | **Để sau** |
| — | Phòng ban | Nhập text tự do (chưa có danh mục phòng ban) |

## 2. Quyết định kỹ thuật & lý do

### 2.1. Token: so sánh và lựa chọn

| Tiêu chí | A. Một JWT cố định 8 tiếng | **B. Access 15 phút + Refresh 7 ngày (đã chọn)** |
|---|---|---|
| Độ phức tạp | Rất đơn giản | Trung bình |
| Thu hồi token (logout, khóa user) | Không thu hồi được | Thu hồi được (refresh lưu trong DB) |
| Token bị lộ | Bị lợi dụng tối đa 8 tiếng | Tối đa 15 phút |
| Trải nghiệm | Bị đá ra sau 8 tiếng | Tự gia hạn ngầm |
| Quản lý phiên (đề cương yêu cầu) | Không đáp ứng | Có sẵn |

**Chi tiết triển khai:**
- Token nằm trong **cookie httpOnly**, `SameSite=Lax`. Không lưu localStorage để chống XSS. Cookie refresh chỉ gửi tới `/api/v1/auth/*`.
- Mỗi lần đăng nhập tạo một bản ghi trong collection `sessions`. Refresh token có dạng `<sessionId>.<secret>`; DB chỉ lưu **SHA-256** của secret.
- **Refresh token rotation:** mỗi lần refresh cấp token mới. Token cũ bị dùng lại sau **30 giây ân hạn** (dành cho trường hợp nhiều tab refresh cùng lúc) thì coi là bị đánh cắp và thu hồi phiên.
- **Gia hạn trượt:** hạn phiên được tính lại 7 ngày kể từ lần dùng gần nhất. TTL index của MongoDB tự dọn phiên hết hạn.

### 2.2. Khóa tài khoản có hiệu lực ngay

- Ở mỗi request, `JwtStrategy` kiểm tra **phiên còn hiệu lực** và **tài khoản chưa bị khóa** (một truy vấn có index). Nếu cần tối ưu thì sau này cache bằng Redis.
- Khi admin khóa user: thu hồi toàn bộ phiên của user đó. Request kế tiếp nhận 401 `AUTH_ACCOUNT_BLOCKED`, FE chuyển về `/login?reason=blocked`.

### 2.3. Các quyết định phát sinh khi code (sinh viên đã được thông báo)

| # | Quyết định | Lý do |
|---|---|---|
| M1-01 | Thêm cookie gợi ý **`cat_session`** (giá trị `"1"`, không chứa bí mật) | Cookie refresh chỉ có ở `/api/v1/auth` và access token hết hạn sau 15 phút, nên `proxy.ts` của Next không biết người dùng còn phiên hay không. Cookie này chỉ dùng để điều hướng; xác thực thật vẫn do API làm |
| M1-02 | Thêm các package mà shadcn bản mới bắt buộc: `radix-ui`, `cn`, `class-variance-authority`, `tw-animate-css`, `sonner` (toast) | Là dependency của các component shadcn |
| M1-03 | Tắt `cacheComponents` của Next.js 16 | Chế độ này bắt mọi chỗ đọc cookie phải bọc `<Suspense>`, quá phức tạp cho dashboard nội bộ |
| M1-04 | Dùng **font hệ thống** thay vì Google Fonts | Tiếng Việt hiển thị tốt, không phụ thuộc Internet khi chạy on-premise |
| M1-05 | Form đăng nhập dùng `method="post"` và khóa nút submit cho tới khi trang hydrate xong | Sửa lỗi phát hiện khi test: bấm đăng nhập trước khi JS tải xong thì mật khẩu bị đưa lên URL |
| M1-06 | Nhận diện ảnh avatar bằng **magic bytes** (JPG/PNG/WEBP, ≤ 2MB) | Không tin vào Content-Type mà client gửi lên |
| M1-07 | `StorageService` là lớp trừu tượng; hiện dùng `LocalStorageProvider` (thư mục `apps/api/uploads/`) | Đầu chờ MinIO: Module 3 thêm `MinioStorageProvider`, không sửa code nghiệp vụ |
| M1-08 | Đăng nhập luôn chạy bcrypt, kể cả khi email không tồn tại; chỉ báo "bị khóa" khi mật khẩu đúng | Chống dò tài khoản qua thời gian phản hồi hoặc thông báo lỗi |

### 2.4. Quy tắc an toàn khi quản trị

- Admin không tự khóa hoặc tự hạ quyền chính mình (`USER_CANNOT_MODIFY_SELF`).
- Luôn còn ít nhất **một admin đang hoạt động** (`USER_LAST_ADMIN`).
- Admin đặt lại mật khẩu → thu hồi mọi phiên của user đó. User tự đổi mật khẩu → thu hồi các phiên khác, giữ phiên hiện tại.
- Mật khẩu: 8–64 ký tự, có cả chữ và số. Hash bằng **bcrypt** (10 rounds).
- Giới hạn tần suất: đăng nhập **5 lần/phút/IP**, toàn API **120 request/phút/IP**.

## 3. Dữ liệu (MongoDB)

**`users`**: `email` (unique, chữ thường), `passwordHash` (mặc định không trả về khi query), `fullName`, `phone`, `department`, `avatarKey`, `role` (`ADMIN|USER`), `status` (`ACTIVE|BLOCKED`), `lastLoginAt`, `createdBy`, `createdAt`, `updatedAt`.

**`sessions`**: `userId`, `tokenHash`, `previousTokenHash`, `rotatedAt`, `userAgent`, `ip`, `lastUsedAt`, `expiresAt` (TTL index), `revokedAt`, `createdAt`.

## 4. API (prefix `/api/v1`)

| Nhóm | Endpoint |
|---|---|
| Auth | `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` |
| Cá nhân | `GET /me` · `PATCH /me` · `POST /me/avatar` · `DELETE /me/avatar` · `PATCH /me/password` |
| Phiên | `GET /me/sessions` · `DELETE /me/sessions/:id` · `DELETE /me/sessions` (đăng xuất các thiết bị khác) |
| Admin | `GET /admin/users` (tìm kiếm, lọc role/status, phân trang) · `POST /admin/users` · `GET /admin/users/:id` · `PATCH /admin/users/:id` · `PATCH /admin/users/:id/status` · `POST /admin/users/:id/reset-password` |
| Khác | `GET /health` · Swagger `GET /docs` |

Lỗi trả về theo một định dạng thống nhất `{ statusCode, code, message, details?, path, timestamp }`. `code` là mã trong `packages/shared/src/error-codes.ts`, được FE dịch theo ngôn ngữ đang chọn.

## 5. Màn hình

| Route | Nội dung |
|---|---|
| `/login` | Đăng nhập; hiện lý do khi bị đá ra (hết phiên / bị khóa / đã đăng xuất); có nút chuyển ngôn ngữ và giao diện sáng/tối |
| App shell | Sidebar thu gọn được (Trò chuyện, Tài liệu, Quản trị chỉ admin thấy), header có nút chuyển ngôn ngữ + dark mode, menu người dùng (Hồ sơ, Đăng xuất) |
| `/chat`, `/documents` | Trang giữ chỗ "Đang phát triển" (Module 2, 3) |
| `/profile` | 3 tab: Thông tin (kèm avatar) · Mật khẩu · Phiên đăng nhập (thiết bị, IP, lần hoạt động cuối, đăng xuất từ xa) |
| `/admin/users` | Bảng người dùng: tìm kiếm, lọc vai trò/trạng thái, phân trang; dialog tạo/sửa, đặt lại mật khẩu, khóa/mở khóa |

Responsive cho mobile (ẩn bớt cột trên màn hình nhỏ), hỗ trợ vi/en, dark mode.

## 6. Công việc đã thực hiện (23/10/2026)

| Commit | Nội dung |
|---|---|
| `e2131b8` | `chore: initial commit` trên `main` (README, `.gitignore`), tạo nhánh `develop` |
| `0510f64` | `chore: set up pnpm workspaces, Turborepo and shared package` |
| `c79e929` | `feat(api): add authentication and user management (module 1)` |
| `a9984fc` | `feat(api): add session hint cookie for web route guarding` |
| `2d154fa` | `feat(web): add app shell, login, profile and user management UI (module 1)` |
| `422b809` | `docs: add setup guide and authentication design notes` |

Nhánh: `feature/module-1-auth-user` (tách từ `develop`, đã push, **chưa merge**).

## 7. Kiểm thử đã làm

- `pnpm build`, `pnpm typecheck`, `pnpm lint` toàn monorepo: đều đạt.
- Kịch bản API bằng curl: đăng nhập đúng/sai, validate, tạo user, email trùng, mật khẩu yếu, tìm kiếm/lọc, USER gọi API admin (403), tự khóa/tự hạ quyền (bị chặn), khóa user (bị đá ra ngay, refresh thất bại, đăng nhập lại báo 403), đặt lại mật khẩu, refresh rotation, dùng lại token trong thời gian ân hạn, đăng xuất từ xa, upload avatar hợp lệ/không hợp lệ, đăng xuất.
- Duyệt UI bằng trình duyệt headless qua 17 màn hình: đăng nhập, validate, quản lý người dùng, email trùng, tìm kiếm, hồ sơ, phiên đăng nhập, dark mode + tiếng Anh, USER không thấy menu Quản trị, USER vào trang admin bị chặn, user bị khóa bị đá ra, mobile, đăng xuất.
- **Lưu ý:** môi trường phát triển của Claude không truy cập được Atlas, nên đã test bằng FerretDB (tương thích giao thức MongoDB). Cần chạy lại một lượt với Atlas thật.

## 8. Việc còn lại / nợ kỹ thuật

- [ ] Sinh viên chạy kiểm thử với MongoDB Atlas thật (đã sửa xong lỗi DNS ngày 24/10).
- [ ] Review và merge PR `feature/module-1-auth-user` → `develop`.
- [ ] (Để sau) Bắt đổi mật khẩu ở lần đăng nhập đầu sau khi admin tạo user hoặc đặt lại mật khẩu.
- [ ] (Để sau) Unit test cho AuthService, SessionsService, AdminUsersService.
- [ ] (Module 3) Thay `LocalStorageProvider` bằng `MinioStorageProvider`.
- [ ] (Tùy chọn) Cache trạng thái phiên/khóa bằng Redis khi đã có Redis.
