# Danh sách task

Mục lục task theo ID. Quy ước, phân công và cách nhận task: [workflow mục 3](../project/workflow.md#3-nơi-lưu-task), [mục 3.1](../project/workflow.md#31-phân-công-và-nhận-task); cột Tiến độ theo [mục 11](../project/workflow.md#11-theo-dõi-tiến-độ). TL cập nhật bảng mỗi khi tạo task, đổi trạng thái hoặc đổi hạn. Senior Dev cập nhật khi nhận task (`Đang làm`) và khi bàn giao (`Chờ Review`).

Cập nhật: 15/11/2026.

| ID | Task | Người phụ trách | Ưu tiên | Hạn bàn giao review | Hạn hoàn tất | Trạng thái | Tiến độ |
|---|---|---|---|---|---|---|---|
| [TL-001](TL-001-chat-integration-scope.md) | Khoanh phạm vi tích hợp Chat | TL | P1 | 15/11/2026 | Không đặt | Done | Hoàn tất 15/11 — Đúng hạn (bàn giao đúng hạn; khách hàng duyệt cùng ngày) |
| [SE-001](SE-001-chat-integration.md) | Tích hợp luồng Chat từ preview | Senior Dev | P1 | 18/11/2026 | 19/11/2026 | **Chờ Review** | Senior Dev đã bàn giao 15/11 (PR #2); chờ TL review — sớm hơn dự kiến (17/11) |
| [TL-002](TL-002-chat-demo-acceptance.md) | Nghiệm thu bản demo Chat | TL | P1 | 19/11/2026 | 20/11/2026 | Nháp | Đúng kế hoạch — dự kiến review 18/11 sau khi SE-001 bàn giao; chặn bởi SE-001 |
| [2026-11-15-reorganize-project-docs](2026-11-15-reorganize-project-docs.md) | Refactor `docs/`, quy trình làm việc và onboarding TL / Senior Dev | TL | P1 | 15/11/2026 | Không đặt hạn | Chờ Review | Đã bàn giao vòng 7 ngày 15/11; chờ khách hàng + CTO duyệt |
| [2026-11-15-preview-progress-review](../project/preview-progress-review.md) | Audit tiến độ so với báo cáo 27/10/2026 (lịch sử checklist ở mục 5 của báo cáo) | TL | P1 | 15/11/2026 | Không đặt hạn | Chờ Review | Đã bàn giao vòng 2 ngày 15/11; chờ khách hàng + CTO duyệt |

Hai hồ sơ `2026-11-15-…` lập trước quy ước ID `TL-` / `SE-` nên giữ ID và đường dẫn cũ.

## Tài liệu theo dõi

| Tài liệu | Trạng thái |
|---|---|
| [Kế hoạch demo Chat](../project/plan.md) (lịch sử review ở mục 7) | Đã chốt phạm vi và mốc dự kiến 20/11; còn mở giờ demo (D1) và môi trường thử (D3) |
| [Báo cáo tiến độ demo](../reports/demo-progress.md) | Cập nhật cuối mỗi ngày làm việc |
