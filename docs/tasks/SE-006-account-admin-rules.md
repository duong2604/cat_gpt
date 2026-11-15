# SE-006 — Quy tắc quản trị tài khoản: đặt lại mật khẩu, đổi email, trường hiển thị, khôi phục admin

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2,5 ngày làm việc (thêm quy trình khôi phục riêng + buộc đổi mật khẩu, 15/11/2026)
Phụ thuộc: làm sau [SE-005](SE-005-login-limit-shared-ip.md) (khách hàng xếp lại 15/11/2026); cần SE-002 đã merge (cùng sửa màn quản trị). **Bắt buộc trước thử nội bộ** (R-1, R-10)
Hạn bàn giao review: Dự kiến 02/12/2026 (thứ Tư) · Hạn hoàn tất: Dự kiến 03/12/2026 (thứ Năm) — chưa duyệt
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng chốt CS-2, CS-3 (gồm **thu hồi mọi phiên khi đổi email**), CS-4; yêu cầu quy trình khôi phục admin riêng thay luồng hạ quyền → nâng quyền
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

## Phần sẵn sàng và phần chờ R1
| Phần | Trạng thái |
|---|---|
| Output 1–4 (chặn đặt lại mật khẩu admin + đường vòng 24 giờ, đổi email có xác nhận + thu hồi phiên, nhật ký `audit_logs`, bỏ SĐT ở màn quản trị) | **Sẵn sàng** — quyết định đã chốt (CS-2, CS-3, CS-4) |
| Output 5 — lệnh `admin:recover` (tham số `--ticket`, `--approved-by`, buộc đổi mật khẩu, nhật ký) và diễn tập trên máy dev (AC7) | **Sẵn sàng** — không phụ thuộc người cụ thể |
| Người phê duyệt, danh sách người thực hiện, kênh xác minh danh tính, nơi lưu phiếu; **diễn tập chính thức** trên môi trường thử có biên bản (R-10) | **Chờ R1** — khách hàng + CTO chốt; không chặn code và bàn giao task này |

## Mục tiêu
Admin quản trị được tài khoản nhân viên nhưng không chiếm được tài khoản admin khác, mọi thay đổi định danh có xác nhận và nhật ký, màn quản trị chỉ hiện trường cần thiết, và luôn có đường khôi phục khi admin mất quyền truy cập.

## Output
- PR từ `feature/account-admin-rules` vào `develop`.
- Code:
  1. **CS-2 — Đặt lại mật khẩu:** `POST /admin/users/:id/reset-password` → `400` mã mới `USER_CANNOT_RESET_ADMIN` khi đích là **chính mình**, có vai trò **`ADMIN`**, hoặc **vừa bị hạ từ `ADMIN` trong 24 giờ** (tra `audit_logs`; chặn đường vòng hạ quyền rồi đặt lại); UI ẩn "Đặt lại mật khẩu" ở các dòng đó. Luồng Hồ sơ › Mật khẩu giữ nguyên.
  2. **CS-3 — Đổi email nhân viên (đã chốt):** hộp thoại xác nhận nêu email cũ → mới; email trùng → thông báo đã dịch (`USER_EMAIL_EXISTS`, đã có); khi email đổi thật: **thu hồi mọi phiên** của nhân viên đó (request kế tiếp `401`, đăng nhập lại bằng email mới).
  3. **Nhật ký thay đổi:** collection `audit_logs` ghi `actorId`, `targetId`, `action` (`USER_EMAIL_CHANGED`, `USER_ROLE_CHANGED`, `USER_STATUS_CHANGED`, `USER_PASSWORD_RESET`, `ADMIN_RECOVERED`), giá trị cũ/mới (không ghi mật khẩu), thời điểm. Chưa cần màn xem nhật ký; xem được qua DB.
  4. **CS-4 — Trường ở màn quản trị:** API `admin/users` và màn quản trị bỏ **số điện thoại** (ảnh đã bỏ ở SE-002). Giữ email, họ tên, phòng ban, vai trò, trạng thái, lần đăng nhập cuối. Admin không nhập/sửa SĐT của nhân viên (nhân viên tự sửa ở Hồ sơ).
  5. **Công cụ khôi phục admin** theo [quy trình riêng](../design/access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt): lệnh `pnpm --filter @cat-gpt/api admin:recover --email <email> --ticket <mã phiếu> --approved-by <email người duyệt>` chạy trên máy chủ — chỉ áp dụng tài khoản đang là `ADMIN`; đặt mật khẩu tạm ngẫu nhiên in một lần; `ACTIVE`; **buộc đổi mật khẩu ở lần đăng nhập đầu** (cờ `mustChangePassword`: API trả mã riêng, web chuyển thẳng tới Hồ sơ › Mật khẩu, chặn màn khác tới khi đổi); thu hồi mọi phiên; ghi `ADMIN_RECOVERED` (mã phiếu, người duyệt, người thực hiện = tài khoản hệ điều hành + máy). Không có đường web tương đương.
- Tài liệu: [access-control](../design/access-control.md) dòng ma trận + mục 4 cột Task → "Đã làm"; `module-1-auth.md` phần quản trị; `README.md` mục vận hành: cách chạy `admin:recover`, dẫn tới [quy trình khôi phục](../design/access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt).

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
| AC1 | A đặt lại mật khẩu cho **chính A** → `400 USER_CANNOT_RESET_ADMIN`; cho **B** → `400`; hạ B xuống USER rồi đặt lại ngay → `400` (đường vòng 24 giờ); cho **N** → `204`, N bị đăng xuất mọi thiết bị | CS-2 | `curl` |
| AC2 | UI: dòng của A và B không có mục "Đặt lại mật khẩu"; dòng N có | CS-2 | Ảnh |
| AC3 | A đổi email N: có hộp thoại xác nhận email cũ → mới; email trùng → thông báo đã dịch, không đổi | CS-3 | UI + ảnh |
| AC4 | Sau khi đổi email: **mọi phiên** của N (2 thiết bị/trình duyệt) → `401` ở request kế tiếp; đăng nhập bằng email cũ thất bại, email mới thành công | CS-3 (đã chốt) | `curl` 2 cookie jar |
| AC5 | `audit_logs` có bản ghi cho đổi email, đổi vai trò, khóa/mở khóa, đặt lại mật khẩu — đúng người, giá trị cũ/mới, không có mật khẩu | CS-3 | Truy vấn DB, trích kết quả |
| AC6 | `GET /admin/users` không có `phone`, `avatarUrl`; màn quản trị và hộp thoại sửa không có SĐT, ảnh; `/me` của N vẫn có SĐT | CS-4 | `curl` + ảnh |
| AC7 | **Diễn tập công cụ khôi phục** trên máy dev theo 5 bước của [quy trình](../design/access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt) (vai thử: TL phê duyệt, Senior Dev thực hiện): lệnh từ chối tài khoản không phải `ADMIN`; mật khẩu tạm dùng được một lần rồi buộc đổi; phiên cũ bị thu hồi; `audit_logs` có `ADMIN_RECOVERED` đủ trường. Diễn tập chính thức trên môi trường thử thuộc R-10 (sau khi chốt R1) | R-10 | Ghi từng bước + kết quả |
| AC8 | Không hạ được admin cuối cùng; không tự khóa/tự đổi vai trò (giữ hành vi hiện tại) | access-control mục 2 | `curl` |
| AC9 | Checklist hai vai đủ; dữ liệu thử (B, N) khóa lại sau kiểm tra | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC10 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| R1 | Người phê duyệt, danh sách người thực hiện, kênh xác minh danh tính, nơi lưu phiếu của [quy trình khôi phục](../design/access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt) | CTO phê duyệt; 2 người vận hành do CTO chỉ định; gọi lại số đã đăng ký; phiếu lưu cùng hồ sơ vận hành | Chờ khách hàng + CTO — **không chặn** code; chặn diễn tập chính thức (R-10) |
| H1 | Mốc (dự kiến) | Bàn giao 02/12, hoàn tất 03/12 | Chờ duyệt |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
