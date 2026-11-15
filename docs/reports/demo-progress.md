# Báo cáo tiến độ demo Chat

Theo mốc của [plan.md](../project/plan.md#2-mốc). TL cập nhật cuối mỗi ngày làm việc và ngay khi phát hiện nguy cơ trễ mốc; mục mới nhất ở trên, giữ các mục cũ ([workflow mục 11](../project/workflow.md#11-theo-dõi-tiến-độ)).

## Cập nhật 15/11/2026 (cuối ngày)

Cơ sở: `origin/develop` @ `a860437` (trước đợt tài liệu). Báo cáo này nằm trong chính đợt tài liệu được tích hợp vào `develop`; SHA tích hợp ghi trong báo cáo gửi khách hàng và ở lần cập nhật kế tiếp.

### Theo mốc

| Mốc | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|
| M0 Tài liệu + TL-001 | **Đạt** — tài liệu quy trình, audit, plan, task tích hợp vào `develop` cùng báo cáo này; TL-001 đã bàn giao | Khách hàng + CTO review |
| M1 Chốt phạm vi | Đang chờ — cần duyệt TL-001 và chốt Q3, D1, D2 | **Khách hàng + CTO** |
| M2 SE-001 bàn giao | Chưa bắt đầu — chờ M1 | Senior Dev (sau khi TL chuyển `Sẵn sàng`) |
| M3 Chat lên `develop` | Chưa bắt đầu — chờ M2 | TL |
| M3b AI thật | Chỉ áp dụng nếu D2 = có | — |
| M4 Demo | Chưa có ngày (D1) | Khách hàng + CTO |

### Thử được ngay
- **Trên `develop`:** đăng nhập, hồ sơ, phiên đăng nhập, quản trị người dùng — mở http://localhost:3000 sau khi chạy theo [README](../../README.md#chạy-dự-án). Checklist thao tác: [audit mục 4](../project/preview-progress-review.md#4-checklist-trải-nghiệm-cho-khách-hàng).
- **Chat:** chưa có trên `develop`. Có thể xem trước trên nhánh preview (nội dung trả lời là văn bản mẫu) theo cách mở ở [audit mục 4](../project/preview-progress-review.md#4-checklist-trải-nghiệm-cho-khách-hàng).

### Task

| Task | Trạng thái | Tiến độ | Ghi chú |
|---|---|---|---|
| [TL-001](../tasks/TL-001-chat-integration-scope.md) | Chờ Review | Đúng kế hoạch — bàn giao 15/11, đúng hạn bàn giao review | Phát hiện: Chat cần 3 phần nằm trong commit demo Module 3–4 (đã có cách tách); thiếu giới hạn 20 tin/phút/người so với thiết kế |
| [SE-001](../tasks/SE-001-chat-integration.md) | Nháp | Chưa đánh giá (chờ chốt hạn) | Đã soạn xong; sẵn sàng giao ngay khi M1 chốt |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Nháp | Chưa đánh giá (chờ chốt hạn) | Chờ SE-001 |

Nguy cơ trễ: chưa xác định được vì chưa có ngày demo. Mỗi ngày M1 chưa chốt, mốc demo sớm nhất lùi một ngày làm việc (sớm nhất hiện tại: 20/11 nếu chốt 16/11, nội dung giả lập).

### Cần khách hàng / CTO chốt
1. **D1 — Ngày giờ demo.**
2. **D2 — Demo có bắt buộc AI trả lời thật không?** Có → thêm khoảng 2–3 ngày và cần chọn nhà cung cấp AI.
3. **Q3 — Duyệt phạm vi Chat** ([TL-001](../tasks/TL-001-chat-integration-scope.md#quyết-định-còn-mở)): đồng ý các đề xuất mặc định của Module 2 (gồm 3 thư viện hiển thị markdown) và thêm giới hạn 20 tin/phút cho mỗi người dùng.
