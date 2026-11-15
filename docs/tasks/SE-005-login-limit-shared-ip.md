# SE-005 — Kiểm chứng và sửa giới hạn đăng nhập/request khi nhiều tài khoản dùng chung IP

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1,5 ngày làm việc (0,5 script kiểm chứng; 1 sửa giới hạn + chạy lại)
Phụ thuộc: làm sau [SE-006](SE-006-account-admin-rules.md) (thứ tự ưu tiên); **chặn thử nội bộ** ([R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự)). Không ảnh hưởng demo 20/11
Hạn bàn giao review: Chờ chốt (đề xuất 28/11/2026) · Hạn hoàn tất: Chờ chốt (đề xuất 29/11/2026)
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

## Output
- PR từ `fix/shared-ip-throttling` vào `develop`.
- **Script kiểm chứng** `apps/api/scripts/shared-ip-check.mjs` (Node chuẩn, không thêm thư viện): tạo N tài khoản thử có tiền tố `loadtest+` qua API admin, đăng nhập lần lượt từ một máy trong T phút, mỗi tài khoản gọi thêm `GET /me` và `GET /conversations` K lần; in số `2xx`/`401`/`429`/`5xx`; cuối cùng **khóa** các tài khoản thử. Tham số qua dòng lệnh, mặc định N=200, T=5, K=3.
- **Chạy trước khi sửa** (trên SHA cơ sở) và ghi kết quả — bằng chứng tái hiện.
- **Sửa giới hạn:**
  - Đăng nhập: chống dò mật khẩu theo **email** (5 lần **sai**/15 phút/email → `429`), cộng giới hạn IP rộng (mặc định 300 lần/phút/IP).
  - API đã đăng nhập: giới hạn theo **người dùng** (mặc định 120 request/phút/người); request chưa đăng nhập giữ giới hạn theo IP.
  - Ngưỡng đặt qua biến môi trường, có giá trị mặc định; ghi `.env.example`.
  - Giữ nguyên giới hạn Chat 20 tin/phút/người (SE-001).
- **Chạy lại sau khi sửa** và ghi kết quả.
- Tài liệu: [access-control](../design/access-control.md) KT-3 → "Đã sửa"; [ui-release-standards R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) hiện trạng; `module-1-auth.md` phần giới hạn đăng nhập.

## Phạm vi
- **Làm:** như Output.
- **Không làm:** lưu bộ đếm dùng chung nhiều instance (Redis — R-4, chờ hạ tầng); khóa tài khoản sau nhiều lần sai; CAPTCHA.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026; [R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) (đã duyệt): 200 đăng nhập/5 phút từ một IP không bị `429`; chống dò mật khẩu theo tài khoản.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Kết quả **trước khi sửa** (SHA cơ sở): có `429` khi N=200 | Tái hiện KT-3 | Đầu ra script |
| AC2 | **Sau khi sửa**, N=200, T=5, K=3 từ một máy: 0 `429`, 0 `5xx`, mọi đăng nhập `200` | R-3 | Đầu ra script |
| AC3 | Một email sai mật khẩu 6 lần trong 15 phút → lần 6 `429` với thông báo đã dịch; **email khác cùng IP** đăng nhập ngay sau đó vẫn `200` | R-3 | `curl` |
| AC4 | Một người dùng gửi > 120 request/phút → `429`; người khác cùng IP không bị ảnh hưởng | R-3 | Script hoặc `curl` lặp |
| AC5 | Giới hạn Chat 20 tin/phút/người vẫn đúng (SE-001 AC7) | Không hồi quy | `curl` 21 request |
| AC6 | Tài khoản thử `loadtest+…` đã khóa sau khi chạy; ghi số lượng | Dữ liệu thử | Đầu ra script + màn quản trị |
| AC7 | Checklist hai vai đủ | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC8 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| H1 | Hạn bàn giao / hoàn tất (ngoài khung 23–26/11) | 28/11 / 29/11 | Chờ khách hàng + CTO |

Ngưỡng mặc định ở Output là đề xuất của TL theo R-3; đổi được qua biến môi trường, không chặn task.

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
