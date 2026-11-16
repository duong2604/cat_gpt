# Danh sách task

Mục lục task theo ID. Quy ước, phân công và cách nhận task: [workflow mục 3](../project/workflow.md#3-nơi-lưu-task), [mục 3.1](../project/workflow.md#31-phân-công-và-nhận-task); cột Tiến độ theo [mục 11](../project/workflow.md#11-theo-dõi-tiến-độ). TL cập nhật bảng mỗi khi tạo task, đổi trạng thái hoặc đổi hạn. Senior Dev cập nhật khi nhận task (`Đang làm`) và khi bàn giao (`Chờ Review`).

Cập nhật: 16/11/2026.

**Mở phiên mới:** prompt [Team Leader](../project/onboarding/team-leader.md) · [Senior Dev](../project/onboarding/senior-dev.md) (CTO xác nhận dùng được 15/11/2026). Báo cáo ngày: [daily/](../reports/daily/README.md).

| ID | Task | Người phụ trách | Ưu tiên | Hạn bàn giao review | Hạn hoàn tất | Trạng thái | Tiến độ |
|---|---|---|---|---|---|---|---|
| [TL-001](TL-001-chat-integration-scope.md) | Khoanh phạm vi tích hợp Chat | TL | P1 | 15/11/2026 | Không đặt | Done | Hoàn tất 15/11 — Đúng hạn (bàn giao đúng hạn; khách hàng duyệt cùng ngày) |
| [SE-001](SE-001-chat-integration.md) | Tích hợp luồng Chat từ preview | Senior Dev | P1 | 18/11/2026 | 19/11/2026 | Done | Hoàn tất 15/11 — Sớm (vòng 1 Cần sửa, vòng 2 đạt; merge PR #5 → `develop` @ `8732458`) |
| [TL-002](TL-002-chat-demo-acceptance.md) | Nghiệm thu bản demo Chat | TL | P1 | 19/11/2026 | 20/11/2026 | Chờ Review | Đúng kế hoạch — đã gửi khách hàng link + checklist UI 15/11 (sớm 4 ngày); giữ `Chờ Review` đến khi khách hàng thử UI |
| [TL-003](TL-003-access-ui-release-audit.md) | Dọn nhánh local, rà quyền và chuẩn UI/phát hành | TL | P1 | 15/11/2026 | Không đặt | Chờ Review | Vòng 3 bàn giao 15/11 (chốt thu hồi phiên khi đổi email, quy trình khôi phục admin riêng, SE-005 trước SE-006); chờ khách hàng xác nhận + chốt R1, Q1 |
| [SE-002](SE-002-avatar-requires-login.md) | Ảnh đại diện chỉ chính chủ xem được | Senior Dev | P1 | 23/11/2026 | 24/11/2026 | Done | Hoàn tất 16/11 — Sớm (merge PR #3 → `develop` @ `1674425`, xác minh @ `d6832e0`) |
| [SE-003](SE-003-release-mode-navigation.md) | Chế độ phát hành `demo`/`staff` và menu theo vai trò | Senior Dev | P1 | 25/11/2026 | 26/11/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-002; merge sau demo 20/11 |
| [SE-005](SE-005-login-limit-shared-ip.md) | Kiểm chứng và sửa giới hạn đăng nhập/request khi nhiều tài khoản dùng chung IP | Senior Dev | P1 | Dự kiến 27/11/2026 | Dự kiến 30/11/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-003, trước SE-006; mốc chưa duyệt |
| [SE-006](SE-006-account-admin-rules.md) | Quy tắc quản trị tài khoản: đặt lại mật khẩu, đổi email, trường hiển thị, công cụ khôi phục admin | Senior Dev | P1 | Dự kiến 02/12/2026 | Dự kiến 03/12/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-005; mốc chưa duyệt; R1 chờ chốt (không chặn code) |
| [SE-004](SE-004-ui-consistency.md) | Chỉnh giao diện nhất quán theo chuẩn UI | Senior Dev | P2 | Dự kiến 04/12/2026 | Dự kiến 07/12/2026 | **Sẵn sàng** | Chưa bắt đầu — làm sau SE-006; mốc chưa duyệt |
| [SE-007](SE-007-openai-provider.md) | Tích hợp OpenAI cho Chat (Responses API, streaming) | Senior Dev | P1 | Chờ chốt | Chờ chốt | Done | Hoàn tất 16/11 — Sớm (merge PR #4 → `develop` @ `d6832e0`; khách hàng cho merge trước demo) |
| [2026-11-15-reorganize-project-docs](2026-11-15-reorganize-project-docs.md) | Refactor `docs/`, quy trình làm việc và onboarding TL / Senior Dev | TL | P1 | 15/11/2026 | Không đặt hạn | Chờ Review | Đã bàn giao vòng 7 ngày 15/11; chờ khách hàng + CTO duyệt |
| [2026-11-15-preview-progress-review](../project/preview-progress-review.md) | Audit tiến độ so với báo cáo 27/10/2026 (lịch sử checklist ở mục 5 của báo cáo) | TL | P1 | 15/11/2026 | Không đặt hạn | Chờ Review | Đã bàn giao vòng 2 ngày 15/11; chờ khách hàng + CTO duyệt |
| [TL-004](TL-004-thesis-source-pack.md) | Bộ tài liệu nguồn cho báo cáo đồ án (`docs/thesis/`, Markdown) | TL | P1 | 19/11/2026 (vòng có SE-008); cập nhật sau tích hợp 25/11/2026 | Chờ chốt | Chờ Review | Vòng 4 bàn giao 16/11 (sớm so với 25/11): SE-002/SE-007 → đã tích hợp trong bộ nguồn; còn B13 (chụp lại ảnh); chờ khách hàng + CTO |
| [SE-008](SE-008-thesis-implementation-evidence.md) | Tài liệu đồ án: hiện thực Module 1–2 + bảng bằng chứng kiểm thử | Senior Dev | P1 | 18/11/2026 | 19/11/2026 | Done | Hoàn tất 15/11 — Sớm (vòng 1 Cần sửa, vòng 2 đạt; merge PR #5 → `develop` @ `8732458`) |
| [TL-005](TL-005-thesis-word-draft.md) | Dựng bản Word nháp báo cáo đồ án từ bộ nguồn `da66569` | TL (phiên AI viết Word) | P1 | Chờ chốt (đề xuất 18/11); cập nhật 25/11/2026 | Chờ chốt | Sẵn sàng | Chưa bắt đầu — Chưa đánh giá (chờ chốt hạn nháp) |

Hai hồ sơ `2026-11-15-…` lập trước quy ước ID `TL-` / `SE-` nên giữ ID và đường dẫn cũ.

## Tài liệu theo dõi

| Tài liệu | Trạng thái |
|---|---|
| [Kế hoạch demo Chat](../project/plan.md) (lịch sử review ở mục 7) | M0–M3 đạt (Chat trên `develop` @ `fbffd5b`); demo chốt 20/11 trên máy trình chiếu (localhost); còn mở giờ demo (D1) |
| [Báo cáo tiến độ demo](../reports/demo-progress.md) | Cập nhật cuối mỗi ngày làm việc |
| [Ma trận phân quyền](../design/access-control.md) | Đã duyệt; CS-1…CS-6 đã chốt 15/11 |
| [Chuẩn giao diện và tiêu chí phát hành](../design/ui-release-standards.md) | Đã duyệt (Be Vietnam Pro); tiêu chí R-1…R-10 cho 500 nhân sự |
