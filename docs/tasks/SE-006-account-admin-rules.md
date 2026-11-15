# SE-006 — Quy tắc quản trị tài khoản: đặt lại mật khẩu, đổi email, trường hiển thị, khôi phục admin

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc: làm sau [SE-003](SE-003-release-mode-navigation.md) (thứ tự ưu tiên; cùng sửa màn quản trị với SE-002 — nhận sau khi SE-002 merge). **Bắt buộc trước thử nội bộ** (R-1, R-10)
Hạn bàn giao review: Chờ chốt (đề xuất 27/11/2026) · Hạn hoàn tất: Chờ chốt (đề xuất 28/11/2026)
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng chốt CS-2, CS-3, CS-4 và yêu cầu ghi rõ phương án khôi phục tài khoản admin trước đợt thử nội bộ
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Admin quản trị được tài khoản nhân viên nhưng không chiếm được tài khoản admin khác, mọi thay đổi định danh có xác nhận và nhật ký, màn quản trị chỉ hiện trường cần thiết, và luôn có đường khôi phục khi admin mất quyền truy cập.

## Output
- PR từ `feature/account-admin-rules` vào `develop`.
- Code:
  1. **CS-2 — Đặt lại mật khẩu:** `POST /admin/users/:id/reset-password` → `400` mã mới `USER_CANNOT_RESET_ADMIN` khi đích là **chính mình** hoặc tài khoản **vai trò `ADMIN`**; UI ẩn "Đặt lại mật khẩu" ở các dòng đó. Luồng Hồ sơ › Mật khẩu giữ nguyên.
  2. **CS-3 — Đổi email nhân viên:** hộp thoại xác nhận nêu email cũ → mới; email trùng → thông báo đã dịch (`USER_EMAIL_EXISTS`, đã có); khi email đổi thật: **thu hồi mọi phiên** của nhân viên đó (request kế tiếp `401`, đăng nhập lại bằng email mới).
  3. **Nhật ký thay đổi:** collection `audit_logs` ghi `actorId`, `targetId`, `action` (`USER_EMAIL_CHANGED`, `USER_ROLE_CHANGED`, `USER_STATUS_CHANGED`, `USER_PASSWORD_RESET`, `ADMIN_RECOVERED`), giá trị cũ/mới (không ghi mật khẩu), thời điểm. Chưa cần màn xem nhật ký; xem được qua DB.
  4. **CS-4 — Trường ở màn quản trị:** API `admin/users` và màn quản trị bỏ **số điện thoại** (ảnh đã bỏ ở SE-002). Giữ email, họ tên, phòng ban, vai trò, trạng thái, lần đăng nhập cuối. Admin không nhập/sửa SĐT của nhân viên (nhân viên tự sửa ở Hồ sơ).
  5. **Khôi phục admin** ([CS-2](../design/access-control.md#4-chính-sách-đã-chốt), R-10): lệnh `pnpm --filter @cat-gpt/api admin:recover <email>` chạy trên máy chủ có quyền DB — đặt mật khẩu tạm in ra màn hình một lần, đảm bảo vai trò `ADMIN` + trạng thái `ACTIVE`, thu hồi mọi phiên, ghi `ADMIN_RECOVERED`. Không có đường web tương đương.
- Tài liệu: [access-control](../design/access-control.md) dòng ma trận + mục 4 cột Task → "Đã làm"; `module-1-auth.md` phần quản trị; `README.md` mục vận hành: quy trình khôi phục admin (giữ ≥ 2 admin hoạt động; quên mật khẩu → admin khác hạ quyền → đặt lại → nâng lại; mất hết admin → `admin:recover`).

## Phạm vi
- **Làm:** như Output.
- **Không làm:** màn xem nhật ký; vai trò kiểm toán; xác minh email mới qua thư; ảnh đại diện (SE-002).

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 — [CS-2, CS-3, CS-4](../design/access-control.md#4-chính-sách-đã-chốt); [R-10](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự).
- Hiện trạng (TL xác minh 15/11/2026): `resetPassword` không kiểm tra đích; `update` cho đổi email, có `USER_EMAIL_EXISTS`, không thu hồi phiên, không nhật ký; `admin-seed.service.ts` chỉ tạo admin khi DB chưa có admin nào.

## Checklist nghiệm thu
Tài khoản: admin A, admin B (thử), nhân viên N (thử). Desktop + mobile cho UI.

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | A đặt lại mật khẩu cho **chính A** → `400 USER_CANNOT_RESET_ADMIN`; cho **B** → `400`; cho **N** → `204`, N bị đăng xuất mọi thiết bị | CS-2 | `curl` |
| AC2 | UI: dòng của A và B không có mục "Đặt lại mật khẩu"; dòng N có | CS-2 | Ảnh |
| AC3 | A đổi email N: có hộp thoại xác nhận email cũ → mới; email trùng → thông báo đã dịch, không đổi | CS-3 | UI + ảnh |
| AC4 | Sau khi đổi email: phiên cũ của N → `401`; đăng nhập bằng email cũ thất bại, email mới thành công | CS-3 | `curl` |
| AC5 | `audit_logs` có bản ghi cho đổi email, đổi vai trò, khóa/mở khóa, đặt lại mật khẩu — đúng người, giá trị cũ/mới, không có mật khẩu | CS-3 | Truy vấn DB, trích kết quả |
| AC6 | `GET /admin/users` không có `phone`, `avatarUrl`; màn quản trị và hộp thoại sửa không có SĐT, ảnh; `/me` của N vẫn có SĐT | CS-4 | `curl` + ảnh |
| AC7 | **Diễn tập khôi phục:** A quên mật khẩu → B hạ A xuống USER → đặt lại → nâng lại ADMIN → A đăng nhập được. Chạy `admin:recover` cho A → mật khẩu tạm dùng được, phiên cũ bị thu hồi, có `ADMIN_RECOVERED` | R-10 | Ghi từng bước + kết quả |
| AC8 | Không hạ được admin cuối cùng; không tự khóa/tự đổi vai trò (giữ hành vi hiện tại) | access-control mục 2 | `curl` |
| AC9 | Checklist hai vai đủ; dữ liệu thử (B, N) khóa lại sau kiểm tra | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC10 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| H1 | Hạn bàn giao / hoàn tất (ngoài khung 23–26/11) | 27/11 / 28/11 | Chờ khách hàng + CTO |

Cách xử lý phiên khi đổi email (thu hồi mọi phiên) và phương án khôi phục admin là đề xuất của TL để thực hiện CS-2/CS-3 — ghi ở [access-control mục 4](../design/access-control.md#4-chính-sách-đã-chốt); khách hàng có thể đổi khi review, không chặn task.

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
