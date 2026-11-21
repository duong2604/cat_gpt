# SE-005 — Kiểm chứng và sửa giới hạn đăng nhập/request khi nhiều tài khoản dùng chung IP

Trạng thái: **Tạm dừng — CTO HOLD (22/11/2026)**: AC5 NOT PASS (sự cố dữ liệu — [báo cáo](../reports/incident-se005-data-2026-11-22.md)). Chờ CTO duyệt kế hoạch khôi phục R0–R5 → TL khôi phục → SE đo lại trên SHA cuối + kiểm 429 và thông báo tiếng Việt trên trình duyệt + hồi quy → TL review. Commit `86bd326` giữ local (nhánh `fix/shared-ip-throttling`, worktree `cat_gpt-se5`), chưa push/PR.
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1,5 ngày làm việc (0,5 script kiểm chứng; 1 sửa giới hạn + chạy lại)
Phụ thuộc: làm sau [SE-003](SE-003-release-mode-navigation.md), **trước** [SE-006](SE-006-account-admin-rules.md) (khách hàng xếp lại 15/11/2026); **chặn thử nội bộ** ([R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự)). Không ảnh hưởng demo 20/11
Hạn bàn giao review: Dự kiến 27/11/2026 (thứ Sáu) · Hạn hoàn tất: Dự kiến 30/11/2026 (thứ Hai) — chưa duyệt
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng duyệt TL-003 (gồm tiêu chí R-3) và yêu cầu task riêng kiểm chứng giới hạn đăng nhập khi nhiều tài khoản dùng chung IP
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Nhân viên trong cùng mạng công ty (cùng một IP ra ngoài) đăng nhập và dùng hệ thống đầu giờ không bị chặn `429`, trong khi việc dò mật khẩu vẫn bị chặn.

## Bối cảnh (TL đã xác minh 15/11/2026, `06a5a83`)
- `POST /auth/login`: `@Throttle` **5 lần/phút/IP** → TL bị `429` khi đăng nhập 3 tài khoản thử liên tiếp ([KT-3](../design/access-control.md#3-khoảng-trống-đã-xác-minh)).
- Mọi API khác: `ThrottlerGuard` toàn cục **120 request/phút/IP** (`app.module.ts`) — cả công ty chung IP sẽ cùng chia 120 request/phút. Chỉ `/health` được bỏ qua.
- `trust proxy` đã có cấu hình (`TRUST_PROXY`) — dùng khi chạy sau proxy.

## Kịch bản kiểm chứng
Chạy từ **một máy** (một IP), chế độ `demo`, script `apps/api/scripts/shared-ip-check.mjs` (Node chuẩn, không thêm thư viện). Chạy **trước khi sửa** (SHA cơ sở) và **sau khi sửa**, cùng tham số.

| Bước | Nội dung | Tham số mặc định |
|---|---|---|
| Chuẩn bị | Tạo N tài khoản nhân viên **hợp lệ** `loadtest+NNN@catgpt.local` qua API admin (cùng mật khẩu thử) | N = 200 |
| A. Đăng nhập dồn | Mỗi tài khoản đăng nhập 1 lần, rải đều trong T phút, tối đa C yêu cầu song song | T = 5 phút; C = 20 |
| B. Thao tác | Mỗi tài khoản đã đăng nhập, trong 5 phút, cứ ~10 giây gọi 1 trong `GET /me`, `GET /me/sessions`, `GET /conversations`; 10% tài khoản gửi 1 tin Chat mỗi phút (≈ 1.200 request/phút từ một IP) | — |
| Bậc đồng thời | Lặp A + B với C = 10, 20, 50 (bậc 50 để biết giới hạn, không bắt buộc đạt) | — |
| Dọn | Khóa toàn bộ `loadtest+…` | — |

**Đo và in ra** theo từng bước và bậc: tổng request; tỷ lệ `2xx`, `401`, `429`, `5xx`; p50/p95 thời gian đăng nhập và thao tác.

**Ngưỡng đạt (sau khi sửa, C = 20):** tài khoản hợp lệ bị từ chối `429` = **0%**; `5xx` < 1%; đăng nhập p95 ≤ 1 s. Trước khi sửa: ghi tỷ lệ `429` để làm bằng chứng tái hiện.

**Xác nhận chống dò mật khẩu vẫn hoạt động** (sau khi sửa, chạy song song với bước B để chứng minh không ảnh hưởng người dùng hợp lệ):
1. Một email nhập sai mật khẩu 5 lần trong 15 phút → lần 6 `429` (kể cả khi mật khẩu đúng) với thông báo đã dịch; hết 15 phút đăng nhập lại được.
2. Một email khác cùng IP đăng nhập đúng ngay sau đó → `200`.
3. Dò rải: một IP thử sai trên 100 email khác nhau (mỗi email 1 lần) trong 1 phút → bị chặn khi vượt ngưỡng số lần **sai** theo IP (đề xuất 30 lần sai/phút/IP); ghi lại ảnh hưởng tới tài khoản hợp lệ cùng IP (xem Q1).
4. Tỷ lệ `429` của tài khoản hợp lệ trong bước B vẫn 0%.

## Output
- PR từ `fix/shared-ip-throttling` vào `develop`.
- Script kiểm chứng như trên; kết quả trước/sau ghi vào bàn giao (bảng số liệu).
- **Sửa giới hạn:**
  - Đăng nhập: chặn theo **email** (5 lần **sai**/15 phút/email); theo IP chỉ đếm lần **sai** (đề xuất 30/phút/IP) cộng trần tổng rộng (đề xuất 300 lần/phút/IP).
  - API đã đăng nhập: giới hạn theo **người dùng** (đề xuất 120 request/phút/người); request chưa đăng nhập giữ giới hạn theo IP.
  - Ngưỡng đặt qua biến môi trường, có giá trị mặc định; ghi `.env.example`. Giữ giới hạn Chat 20 tin/phút/người (SE-001).
- Tài liệu: [access-control](../design/access-control.md) KT-3 → "Đã sửa"; [ui-release-standards R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) hiện trạng; `module-1-auth.md` phần giới hạn đăng nhập.

## Phạm vi
- **Làm:** như Output.
- **Không làm:** lưu bộ đếm dùng chung nhiều instance (Redis — R-4, chờ hạ tầng); khóa tài khoản sau nhiều lần sai; CAPTCHA.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026; [R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) (đã duyệt): 200 đăng nhập/5 phút từ một IP không bị `429`; chống dò mật khẩu theo tài khoản.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | **Trước khi sửa:** kịch bản A + B (C = 20) có `429` — ghi tỷ lệ | Tái hiện KT-3 | Đầu ra script |
| AC2 | **Sau khi sửa,** C = 20: `429` tài khoản hợp lệ 0%, `5xx` < 1%, đăng nhập p95 ≤ 1 s; ghi thêm số liệu C = 10 và C = 50 | R-3 | Đầu ra script |
| AC3 | Chống dò mật khẩu: bước 1–4 của kịch bản đạt | R-3 | `curl` + đầu ra script |
| AC4 | Giới hạn Chat 20 tin/phút/người vẫn đúng (SE-001 AC7) | Không hồi quy | `curl` 21 request |
| AC5 | Tài khoản `loadtest+…` đã khóa; ghi số lượng | Dữ liệu thử | Đầu ra script + màn quản trị |
| AC6 | Checklist hai vai đủ | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC7 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q1 | Một máy trong mạng công ty dò mật khẩu trên nhiều email → chặn theo IP sẽ ảnh hưởng người khác cùng IP. Chấp nhận chặn tạm cả IP? | Chặn tạm 5 phút **chỉ các lần đăng nhập sai** từ IP đó; đăng nhập đúng vẫn qua; ghi log cảnh báo | Chờ khách hàng + CTO (không chặn phần còn lại) |
| H1 | Mốc (dự kiến) | Bàn giao 27/11, hoàn tất 30/11 | Chờ duyệt |

Ngưỡng ở Output là đề xuất của TL; đổi được qua biến môi trường.

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
