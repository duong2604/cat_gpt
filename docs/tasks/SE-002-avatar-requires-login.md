# SE-002 — Ảnh đại diện chỉ xem được khi đã đăng nhập

Trạng thái: Đang làm
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,5 ngày làm việc
Phụ thuộc: Không. **Merge sau buổi demo 20/11/2026** ([workflow 9.2](../project/workflow.md#92-điều-kiện-chặn-merge) điều 5); làm và bàn giao được ngay
Hạn bàn giao review: Chờ chốt (đề xuất 23/11/2026) · Hạn hoàn tất: Chờ chốt (đề xuất 24/11/2026)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng giao rà quyền và cho phép đưa phần đã rõ sang `Sẵn sàng` (yêu cầu TL-003); hạn chờ khách hàng + CTO chốt
SHA cơ sở: `origin/develop` @ `dbc4d85` (`06a5a83` → `dbc4d85` chỉ thêm tài liệu TL-003, không đổi `apps/`)
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Người chưa đăng nhập không mở được ảnh đại diện của nhân viên, kể cả khi có đường link. Người đã đăng nhập vẫn thấy ảnh như hiện tại ở Hồ sơ, thanh bên và trang quản trị.

## Output
- PR từ `fix/avatar-requires-login` vào `develop`.
- Code: bỏ phục vụ tĩnh `useStaticAssets` ở `apps/api/src/main.ts`; thêm endpoint `GET /api/v1/files/*` (yêu cầu đăng nhập, không `@Public()`) đọc file qua `LocalStorageProvider` (giữ chặn path traversal ở `resolveKey`), trả `Cache-Control: private, max-age=3600`. Giữ nguyên dạng URL `getPublicUrl` để web không phải đổi.
- Tài liệu: [access-control.md](../design/access-control.md) KT-1 → "Đã sửa" + dòng ma trận; `module-1-auth.md` phần ảnh đại diện nếu có mô tả phục vụ tĩnh.

## Phạm vi
- **Làm:** như Output.
- **Không làm:** phân quyền xem ảnh theo phòng ban/đồng nghiệp ([CS-4](../design/access-control.md#4-chính-sách-đã-chốt) — mặc định mọi người đã đăng nhập đều xem được); chuyển sang MinIO; đổi giao diện tải ảnh.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 (rà quyền, cách ly dữ liệu cá nhân); khoảng trống [KT-1](../design/access-control.md#3-khoảng-trống-đã-xác-minh) đã xác minh: `curl` không cookie tới `/api/v1/files/avatars/<uuid>.png` → `200` qua cả cổng 4000 và 3000.
- Basic Design: [access-control mục 1](../design/access-control.md#1-nguyên-tắc-đang-áp-dụng-đã-xác-minh-trong-code) (mọi endpoint yêu cầu đăng nhập trừ ngoại lệ đã duyệt).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Chưa đăng nhập mở URL ảnh → `401`, không trả nội dung ảnh, qua cả `localhost:4000` và `localhost:3000` | KT-1 | `curl -i` không cookie |
| AC2 | Đã đăng nhập (USER khác chủ ảnh và ADMIN) → `200`, đúng `Content-Type`, `Cache-Control: private` | CS-4 mặc định | `curl -i` kèm cookie 2 tài khoản |
| AC3 | Ảnh đã xóa → `404`; key có `..` hoặc ngoài thư mục lưu → `404`/`400`, không đọc file ngoài `uploads` | Bảo mật | `curl` với `..%2F..%2Fpackage.json` |
| AC4 | UI: ảnh vẫn hiện ở Hồ sơ, menu người dùng ở thanh bên, danh sách quản trị; tải ảnh mới và xóa ảnh vẫn chạy | Không hồi quy Module 1 | UI admin + USER, ảnh chụp |
| AC5 | Checklist hai vai đủ | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC6 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt; chỉ đổi file trong phạm vi | Quy ước repo | Lệnh; `git diff --stat origin/develop...HEAD` |

## Quyết định còn mở
Không chặn. CS-4 có thể thu hẹp quyền xem ảnh sau; task này chỉ chặn người chưa đăng nhập.

## Kết quả review
Chưa có bàn giao.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
