# Bảng ca kiểm thử và danh mục hình — Module 1–2

Lập bởi: Senior Dev ([SE-008](../../tasks/SE-008-thesis-implementation-evidence.md)) · Ngày: 15/11/2026 · TL tổng hợp sang [04-validation-and-results.md](../04-validation-and-results.md) sau review.

Quy ước: **Nguồn** dẫn tới hồ sơ gốc khi ca kiểm thử dùng lại kết quả đã có (ưu tiên theo yêu cầu task); ghi "Phiên này" khi ca được chạy lại trực tiếp trong phiên lập tài liệu này (15/11/2026), kèm lệnh/kết quả tóm tắt ở cột **Kết quả thực tế**. Máy chủ dùng để kiểm tra trực tiếp trong phiên này là tiến trình `pnpm dev` đang chạy sẵn trên `origin/develop` @ `2f003a0` (xác nhận qua hành vi `GET /api/v1/files/avatars/<key-không-tồn-tại>` trả `404` thô không kèm JSON — đúng route tĩnh của `develop`, chưa phải `FilesController` của PR #3), cổng API 4000 / web 3000. Dữ liệu thử: `se008.a@catgpt.local` (NV) — đã khóa (`BLOCKED`) và xóa hội thoại thử ngay sau khi lập xong; mật khẩu không ghi trong tài liệu này.

## 1. Module 1 — Xác thực, phiên, hồ sơ, quản trị

| Mã ca | Module | Vai trò | Bước thử | Kết quả mong đợi | Kết quả thực tế | SHA | Nguồn |
|---|---|---|---|---|---|---|---|
| TC-M1-01 | Xác thực | Khách | `POST /auth/login` email/mật khẩu đúng | `200` + cookie access/refresh/`cat_session` | `200`, trả hồ sơ người dùng, cookie được set | `2f003a0` | Phiên này (curl `admin@catgpt.local`) |
| TC-M1-02 | Xác thực | Khách | Đăng nhập sai mật khẩu / email không tồn tại | `401 AUTH_INVALID_CREDENTIALS`, thời gian phản hồi như nhau cho cả hai trường hợp | Đạt phần thông báo lỗi; thời gian phản hồi đồng đều chỉ kiểm qua code (M1-08: luôn chạy `verifyPassword` với `DUMMY_PASSWORD_HASH`), chưa đo | `06a5a83` | [module-1-auth §7](../../design/module-1-auth.md#7-kiểm-thử-đã-làm) |
| TC-M1-03 | Xác thực | Khách | Gọi `GET /me` khi chưa đăng nhập | `401 AUTH_UNAUTHENTICATED` | `{"statusCode":401,"code":"AUTH_UNAUTHENTICATED",...}` | `2f003a0` | Phiên này (curl không cookie) |
| TC-M1-04 | Quản trị tài khoản | ADMIN → NV | Admin khóa tài khoản NV đang có phiên mở trên trình duyệt, NV điều hướng trang kế tiếp | Chuyển `/login?reason=blocked`, không chờ access token hết hạn | Đạt — `se008.a` đang ở `/chat`, admin `PATCH .../status {BLOCKED}`, điều hướng `/chat` → chuyển ngay về `/login` với thông báo "Tài khoản của bạn đã bị khóa" | `2f003a0` | Phiên này — ảnh `m1-06` |
| TC-M1-05 | Phiên đăng nhập | NV | Mở `/profile` tab "Phiên đăng nhập" | Thấy thiết bị hiện tại (trình duyệt, IP, hoạt động gần nhất); đăng xuất từ xa thu hồi đúng phiên | Đạt (thiết bị hiện tại hiển thị đúng); đăng xuất-từ-xa hai thiết bị đã kiểm 23/10 và rà lại trong [TL-003](../../tasks/TL-003-access-ui-release-audit.md) | `2f003a0` | Phiên này (ảnh `m1-03`) + TL-003 |
| TC-M1-06 | Phân quyền UI | NV | Vào thẳng URL `/admin/users` | Màn "Không có quyền truy cập" | Đạt | `2f003a0` | Phiên này — ảnh `m1-04` |
| TC-M1-07 | Phân quyền API | NV | `GET /admin/users` | `403 FORBIDDEN` | `{"statusCode":403,"code":"FORBIDDEN",...}` | `2f003a0` | Phiên này (curl) |
| TC-M1-08 | Hồ sơ cá nhân | NV | Mở `/profile` tab "Thông tin" | Xem được họ tên/email/vai trò; khu vực tải ảnh đại diện | Đạt | `2f003a0` | Phiên này — ảnh `m1-02` |
| TC-M1-09 | Ảnh đại diện [PR #3] | Khách | `GET /files/avatars/:file` chưa đăng nhập (ảnh cũ và ảnh mới, cổng 4000 + 3000) | `401 AUTH_UNAUTHENTICATED` | Đạt | `d60864a` | [SE-002 Checklist vòng 1 — AC1](https://github.com/duong2604/cat_gpt/blob/d60864a/docs/tasks/SE-002-avatar-requires-login.md#checklist-vòng-1) |
| TC-M1-10 | Ảnh đại diện [PR #3] | NV (chính chủ) | Mở ảnh của chính mình | `200`, `Cache-Control: private, no-store` | Đạt | `d60864a` | [SE-002 Checklist vòng 1 — AC2](https://github.com/duong2604/cat_gpt/blob/d60864a/docs/tasks/SE-002-avatar-requires-login.md#checklist-vòng-1) |
| TC-M1-11 | Ảnh đại diện [PR #3] | NV khác / ADMIN | Mở ảnh của người khác (`avatarKey` không khớp) | `404` như nhau cho mọi vai, kể cả admin | Đạt | `d60864a` | [SE-002 Checklist vòng 1 — AC3, AC4](https://github.com/duong2604/cat_gpt/blob/d60864a/docs/tasks/SE-002-avatar-requires-login.md#checklist-vòng-1) |
| TC-M1-12 | Ảnh đại diện [PR #3] | NV | Đăng xuất → tải lại URL ảnh đang mở ở tab khác (cùng trình duyệt) | `401` thật (không phải lấy từ cache), menu đổi sang chữ cái đầu của người khác sau khi đăng nhập lại | Đạt — kiểm bằng Network tool 2 tab | `d60864a` | [SE-002 Checklist vòng 1 — AC5](https://github.com/duong2604/cat_gpt/blob/d60864a/docs/tasks/SE-002-avatar-requires-login.md#checklist-vòng-1) |

## 2. Module 2 — Trợ lý hội thoại (Chat)

| Mã ca | Module | Vai trò | Bước thử | Kết quả mong đợi | Kết quả thực tế | SHA | Nguồn |
|---|---|---|---|---|---|---|---|
| TC-M2-01 | Gửi + streaming | NV | Gửi câu hỏi tiếng Việt, chưa có hội thoại | Tạo hội thoại mới, chữ hiện dần, `COMPLETED` | Đạt — câu trả lời markdown (danh sách đánh số) hiện đầy đủ kèm dòng "Đây là câu trả lời mẫu từ chế độ giả lập…", tiêu đề hội thoại tự đặt từ câu hỏi | `2f003a0` | Phiên này — ảnh `m2-01` |
| TC-M2-02 | Dừng giữa chừng | NV | Gửi câu hỏi dài, bấm Dừng khi đang stream | `STOPPED`, giữ phần đã sinh, nhãn "Đã dừng" | **THIẾU — không tái lập được trong phiên này**: câu trả lời mẫu (`MockLlmProvider`) phát hết trong dưới 1 giây cho mọi câu hỏi thử (nội dung mẫu cố định, không phụ thuộc độ dài câu hỏi), ngắn hơn độ trễ của một lượt thao tác qua công cụ tự động hóa trình duyệt nên không bấm Dừng kịp lúc đang chạy; dùng lại kết quả bằng chữ đã có | `fbffd5b` | [SE-001 Review vòng 1](../../tasks/SE-001-chat-integration.md#review-vòng-1) |
| TC-M2-03 | Tạo lại | NV | Bấm "Tạo lại" trên câu trả lời cuối | Xóa câu trả lời cũ, sinh câu mới, `COMPLETED` | Đạt — lần 1 trả lại đúng nội dung cũ (ngẫu nhiên trùng, 1/5 mẫu), lần 2 ra nội dung khác (khối mã TypeScript) | `2f003a0` | Phiên này — ảnh `m2-02` |
| TC-M2-04 | Mở lại hội thoại | NV | Đăng xuất/đăng nhập lại, mở lại hội thoại cũ | Thấy đủ lịch sử tin nhắn | Đạt | `2f003a0` | Phiên này — ảnh `m2-01` |
| TC-M2-05 | Cách ly dữ liệu | NV khác | `GET /conversations/:id` với id hội thoại của người khác | `404 CONVERSATION_NOT_FOUND`, không phân biệt với "không tồn tại" | `{"statusCode":404,"code":"CONVERSATION_NOT_FOUND",...}` — `se008.a` đọc hội thoại của `admin` | `2f003a0` | Phiên này (curl, 2 tài khoản) |
| TC-M2-06 | Giới hạn tần suất | NV | Gửi tin nhắn lần thứ 21 trong một phút | `429 TOO_MANY_REQUESTS`; người khác cùng máy không bị ảnh hưởng | Đạt — kiểm 15/11 trước đó | `fbffd5b` | [SE-001 Review vòng 1 — AC7](../../tasks/SE-001-chat-integration.md#review-vòng-1) |
| TC-M2-07 | Lỗi LLM giữa chừng | NV | Gửi câu hỏi chứa `/error` | `ERROR`, UI hiện nhãn lỗi, nút Tạo lại vẫn dùng được | Đạt | `2f003a0` | Phiên này — ảnh `m2-03` |
| TC-M2-08 | Ba kết thúc [PR #4, mock] | NV | Hoàn tất / câu hỏi chứa `/limit` / bấm Dừng | `COMPLETED` / `TRUNCATED` + nhãn "bị cắt" (giữ cả sau khi mở lại) / `STOPPED` | Đạt — `COMPLETED`(423 ký tự) → `TRUNCATED`(187 ký tự) → `STOPPED`(46 ký tự) | `e1fda76` | [SE-007 Checklist vòng 2 — AC10](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md#checklist-vòng-2) |
| TC-M2-09 | Ba kết thúc [PR #4, OpenAI thật] | NV | Như trên, model `gpt-5.4-mini` | Như trên | Đạt — `COMPLETED`(34 ký tự, câu ngắn) → `TRUNCATED`(3.551 ký tự, bài dài 1.000 token) → `STOPPED`(23 ký tự) | `e1fda76` | [SE-007 Checklist vòng 2 — AC10](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md#checklist-vòng-2) — ảnh `m2-04`, `m2-05` |
| TC-M2-10 | Hủy ở kết nối provider [PR #4] | — (unit test) | Hủy `signal` khi SDK thật đang nối server SSE giả lập cục bộ | Kết nối HTTP tới provider đóng ngay, không đợi hết nội dung | Đạt — đóng dưới 300ms sau khi hủy, < 50/200 sự kiện đã gửi | `e1fda76` | [SE-007 Checklist vòng 2 — AC11](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md#checklist-vòng-2) |
| TC-M2-11 | Dừng không tính phí [PR #4] | NV | Bấm Dừng khi đang chờ OpenAI trả lời | Không có dòng log `usage` cho lượt đó (request đã hủy trước khi provider trả `response.completed`) | Đạt — 0 dòng log usage cho các lượt Dừng (script và UI) | `e1fda76` | [SE-007 Checklist vòng 1 — AC4](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md#checklist-vòng-1), [vòng 2](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md#checklist-vòng-2) |

## 3. Danh mục hình

Ảnh ở mã `m1-xx`/`m2-xx` chụp trực tiếp trong phiên lập tài liệu này (15/11/2026, desktop 1536×695, dữ liệu thử `se008.a@catgpt.local`/`admin@catgpt.local`). Ảnh `m1-07`, `m1-08`, `m2-04`, `m2-05` là ảnh TL chụp khi review PR #3/#4 (15/11/2026) — độ phân giải thấp hơn chuẩn ≥1280px desktop của task này (ghi đúng kích thước từng ảnh ở cột "Tình trạng"); giữ lại vì tái lập đòi hỏi chạy riêng server trên nhánh PR #3/#4, ngoài phạm vi tài liệu-và-ảnh của SE-008.

| Mã hình | Chú thích | Màn hình (route) | Vai trò | SHA chạy | Đường dẫn | Tình trạng |
|---|---|---|---|---|---|---|
| m1-01 | Màn đăng nhập (vừa đăng xuất) | `/login` | Khách | `2f003a0` | `images/m1-01-login.png` | Đạt |
| m1-02 | Hồ sơ cá nhân — tab Thông tin, khu vực ảnh đại diện | `/profile` | NV | `2f003a0` | `images/m1-02-profile-info.png` | Đạt |
| m1-03 | Hồ sơ cá nhân — tab Phiên đăng nhập, danh sách thiết bị | `/profile` | NV | `2f003a0` | `images/m1-03-profile-sessions.png` | Đạt |
| m1-04 | Chặn truy cập khi vào thẳng URL quản trị | `/admin/users` | NV | `2f003a0` | `images/m1-04-admin-denied.png` | Đạt |
| m1-05 | Danh sách quản lý người dùng — cột "Người dùng" hiện `UserAvatar` (ảnh hoặc chữ cái đầu khi chưa có ảnh; mọi tài khoản thử trong ảnh chưa có ảnh nên chỉ thấy chữ cái đầu); PR #3 mới bỏ cột ảnh này ở `AdminUserDto` | `/admin/users` | ADMIN | `2f003a0` | `images/m1-05-admin-users-list.png` | Đạt |
| m1-06 | Bị đăng xuất ngay sau khi admin khóa tài khoản | `/login` (chuyển hướng từ `/chat`) | NV | `2f003a0` | `images/m1-06-account-blocked.png` | Đạt |
| m1-07 | Hồ sơ cá nhân, ảnh đại diện chính chủ (admin thử) | `/profile` | ADMIN thử | PR #3 `d60864a` | `images/m1-07-avatar-admin-pr3.png` | Ảnh tạm 768×348 — SE-002/TL |
| m1-08 | Hồ sơ cá nhân, trạng thái sau khi xóa ảnh (mobile) | `/profile` | NV thử | PR #3 `d60864a` | `images/m1-08-avatar-mobile-pr3.png` | Ảnh tạm 238×432 (mobile) — SE-002/TL |
| m2-01 | Hội thoại mở lại — câu trả lời markdown (danh sách đánh số) kèm dòng "Đây là câu trả lời mẫu…" | `/chat/[id]` | NV | `2f003a0` | `images/m2-01-chat-reopened.png` | Đạt |
| m2-02 | Tạo lại câu trả lời — nội dung mới (khối mã TypeScript, markdown code block) | `/chat/[id]` | NV | `2f003a0` | `images/m2-02-chat-regenerate.png` | Đạt |
| m2-03 | Lỗi LLM giữa chừng (`/error`) — nhãn đỏ "Lỗi khi tạo câu trả lời" + nút Tạo lại | `/chat/[id]` | NV | `2f003a0` | `images/m2-03-chat-error.png` | Đạt |
| m2-04 | Chat đang stream bằng OpenAI thật | `/chat/[id]` | NV thử | PR #4 `e1fda76` | `images/m2-04-openai-stream-pr4.png` | **Không dùng trong báo cáo** — thanh bên có tiêu đề hội thoại lỗi mã hóa (rác từ lần thử `curl` trước đó); TL chụp lại sau tích hợp PR #4 |
| m2-05 | Nhãn "Câu trả lời bị cắt do đạt giới hạn độ dài" (OpenAI thật, chạm 1.000 token) | `/chat/[id]` | NV thử | PR #4 `e1fda76` | `images/m2-05-openai-truncated-pr4.png` | Ảnh tạm 768×320 — SE-007/TL |

**Chưa chụp:** trạng thái "Đã dừng" (mock lẫn OpenAI) ở độ phân giải ≥1280px — lý do ở TC-M2-02; mobile 375px cho mọi màn hình Module 1–2 — công cụ đổi kích thước cửa sổ không hoạt động trong môi trường kiểm tra này (như SE-001, SE-002); không có ảnh nào chứa khóa API, SĐT hoặc email thật — toàn bộ dùng tài khoản `*.test@catgpt.local` / `se00x.*@catgpt.local`, đã kiểm `grep -ri "sk-" docs/thesis` trả về rỗng.
