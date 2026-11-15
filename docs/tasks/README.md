# Danh sách task

Mục lục task theo ID. Quy ước, phân công và cách nhận task: [workflow mục 3](../project/workflow.md#3-nơi-lưu-task), [mục 3.1](../project/workflow.md#31-phân-công-và-nhận-task); cột Tiến độ theo [mục 11](../project/workflow.md#11-theo-dõi-tiến-độ). TL cập nhật bảng mỗi khi tạo task, đổi trạng thái hoặc đổi hạn. Senior Dev cập nhật khi nhận task (`Đang làm`) và khi bàn giao (`Chờ Review`).

Cập nhật: 15/11/2026.

**Mở phiên mới:** prompt [Team Leader](../project/onboarding/team-leader.md) · [Senior Dev](../project/onboarding/senior-dev.md) (CTO xác nhận dùng được 15/11/2026). Báo cáo ngày: [daily/](../reports/daily/README.md).

| ID | Task | Người phụ trách | Ưu tiên | Hạn bàn giao review | Hạn hoàn tất | Trạng thái | Tiến độ |
|---|---|---|---|---|---|---|---|
| [TL-001](TL-001-chat-integration-scope.md) | Khoanh phạm vi tích hợp Chat | TL | P1 | 15/11/2026 | Không đặt | Done | Hoàn tất 15/11 — Đúng hạn (bàn giao đúng hạn; khách hàng duyệt cùng ngày) |
| [SE-001](SE-001-chat-integration.md) | Tích hợp luồng Chat từ preview | Senior Dev | P1 | 18/11/2026 | 19/11/2026 | Done | Hoàn tất 15/11 — Sớm (bàn giao + review đạt 15/11; merge PR #2 → `develop` @ `fbffd5b`) |
| [TL-002](TL-002-chat-demo-acceptance.md) | Nghiệm thu bản demo Chat | TL | P1 | 19/11/2026 | 20/11/2026 | Chờ Review | Đúng kế hoạch — đã gửi khách hàng link + checklist UI 15/11 (sớm 4 ngày); giữ `Chờ Review` đến khi khách hàng thử UI |
| [TL-003](TL-003-access-ui-release-audit.md) | Dọn nhánh local, rà quyền và chuẩn UI/phát hành | TL | P1 | 15/11/2026 | Không đặt | Chờ Review | Vòng 3 bàn giao 15/11 (chốt thu hồi phiên khi đổi email, quy trình khôi phục admin riêng, SE-005 trước SE-006); chờ khách hàng xác nhận + chốt R1, Q1 |
| [SE-002](SE-002-avatar-requires-login.md) | Ảnh đại diện chỉ chính chủ xem được | Senior Dev | P1 | 23/11/2026 | 24/11/2026 | **Chờ Review** | Senior Dev đã bàn giao 15/11 (PR #3, sớm 8 ngày); chờ TL review — merge sau demo 20/11 |
| [SE-003](SE-003-release-mode-navigation.md) | Chế độ phát hành `demo`/`staff` và menu theo vai trò | Senior Dev | P1 | 25/11/2026 | 26/11/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-002; merge sau demo 20/11 |
| [SE-005](SE-005-login-limit-shared-ip.md) | Kiểm chứng và sửa giới hạn đăng nhập/request khi nhiều tài khoản dùng chung IP | Senior Dev | P1 | Dự kiến 27/11/2026 | Dự kiến 30/11/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-003, trước SE-006; mốc chưa duyệt |
| [SE-006](SE-006-account-admin-rules.md) | Quy tắc quản trị tài khoản: đặt lại mật khẩu, đổi email, trường hiển thị, công cụ khôi phục admin | Senior Dev | P1 | Dự kiến 02/12/2026 | Dự kiến 03/12/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-005; mốc chưa duyệt; R1 chờ chốt (không chặn code) |
| [SE-004](SE-004-ui-consistency.md) | Chỉnh giao diện nhất quán theo chuẩn UI | Senior Dev | P2 | Dự kiến 04/12/2026 | Dự kiến 07/12/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-006; mốc chưa duyệt |
| [2026-11-15-reorganize-project-docs](2026-11-15-reorganize-project-docs.md) | Refactor `docs/`, quy trình làm việc và onboarding TL / Senior Dev | TL | P1 | 15/11/2026 | Không đặt hạn | Chờ Review | Đã bàn giao vòng 7 ngày 15/11; chờ khách hàng + CTO duyệt |
| [2026-11-15-preview-progress-review](../project/preview-progress-review.md) | Audit tiến độ so với báo cáo 27/10/2026 (lịch sử checklist ở mục 5 của báo cáo) | TL | P1 | 15/11/2026 | Không đặt hạn | Chờ Review | Đã bàn giao vòng 2 ngày 15/11; chờ khách hàng + CTO duyệt |
| [TL-004](TL-004-thesis-source-pack.md) | Bộ tài liệu nguồn cho báo cáo đồ án (`docs/thesis/`, Markdown) | TL | P1 | 19/11/2026 (vòng có SE-008); cập nhật sau tích hợp 25/11/2026 | Chờ chốt | Chờ Review | Vòng 2 bàn giao 15/11 (đọc đề cương + quy định khách hàng chỉ định; Q1–Q15; nguồn Chương 1; 12 mục CẦN BỔ SUNG) — Sớm |
| [SE-008](SE-008-thesis-implementation-evidence.md) | Tài liệu đồ án: hiện thực Module 1–2 + bảng bằng chứng kiểm thử | Senior Dev | P1 | 18/11/2026 | 19/11/2026 | **Chờ Review** | Vòng 1 TL yêu cầu sửa (bảo mật + 2 nhận định sai + chú thích ảnh + liên kết gãy); Senior Dev bàn giao vòng 2 cùng ngày 15/11 (PR #5); chờ TL review lại — làm trước SE-003, hạn SE-003 không đổi |

**SE-007** (OpenAI cho Chat, PR #4 @ `e1fda76`): hồ sơ nằm trong PR, dòng mục lục vào `develop` khi merge. Trạng thái **Chờ Review — đã đạt kỹ thuật, chờ tích hợp sau demo** (khách hàng xác nhận 15/11/2026); thứ tự tích hợp 23–24/11: PR #3 (SE-002) → PR #4 (SE-007).

Hai hồ sơ `2026-11-15-…` lập trước quy ước ID `TL-` / `SE-` nên giữ ID và đường dẫn cũ.

## Tài liệu theo dõi

| Tài liệu | Trạng thái |
|---|---|
| [Kế hoạch demo Chat](../project/plan.md) (lịch sử review ở mục 7) | M0–M3 đạt (Chat trên `develop` @ `fbffd5b`); demo chốt 20/11 trên máy trình chiếu (localhost); còn mở giờ demo (D1) |
| [Báo cáo tiến độ demo](../reports/demo-progress.md) | Cập nhật cuối mỗi ngày làm việc |
| [Ma trận phân quyền](../design/access-control.md) | Đã duyệt; CS-1…CS-6 đã chốt 15/11 |
| [Chuẩn giao diện và tiêu chí phát hành](../design/ui-release-standards.md) | Đã duyệt (Be Vietnam Pro); tiêu chí R-1…R-10 cho 500 nhân sự |
