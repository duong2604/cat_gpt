# Báo cáo tiến độ demo Chat

Theo mốc của [plan.md](../project/plan.md#2-mốc). TL cập nhật cuối mỗi ngày làm việc và ngay khi phát hiện nguy cơ trễ mốc; mục mới nhất ở trên, giữ các mục cũ ([workflow mục 11](../project/workflow.md#11-theo-dõi-tiến-độ)).

## Cập nhật 15/11/2026 (chốt ngày demo và nơi chạy)

Cơ sở: `origin/develop` @ `8666859` (code Chat như `fbffd5b`; sau đó chỉ có commit tài liệu). Khách hàng chốt:
- **D1:** demo **20/11/2026**; giờ cụ thể khách hàng cập nhật sau.
- **D3:** khách hàng chạy sẵn CAT GPT trên **máy trình chiếu**, mở Chat qua http://localhost:3000. Không cần task triển khai.
- TL-002 giữ `Chờ Review` đến khi khách hàng thử UI.

| Mốc | Hạn | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|---|
| M0–M3 | 15/11–19/11 | Đạt 15/11 | — |
| M4 Demo | **20/11** (giờ: Chờ chốt) | Đúng kế hoạch | Khách hàng (thử UI, báo giờ); TL (gửi SHA bản chạy + checklist trước demo) |

| Task | Trạng thái | Tiến độ |
|---|---|---|
| [SE-001](../tasks/SE-001-chat-integration.md) | Done 15/11 | Sớm |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Chờ Review (đến khi khách hàng thử UI) | Đúng kế hoạch |

Cần khách hàng chốt: **giờ demo** ngày 20/11.

## Cập nhật 15/11/2026 (Chat lên `develop`)

Cơ sở: `origin/develop` @ `fbffd5b` (merge PR #2). SE-001 bàn giao và đạt review trong ngày; Chat đã có trên `develop`, nội dung trả lời vẫn là văn bản mẫu.

### Theo mốc

| Mốc | Hạn | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|---|
| M0 Tài liệu + TL-001 | 15/11 | Đạt 15/11 | — |
| M1 Chốt phạm vi | 16/11 | Đạt 15/11 | — |
| M2 SE-001 bàn giao | 18/11 | Đạt 15/11 — sớm 3 ngày | — |
| M3 Chat lên `develop` + gửi link và checklist | 19/11 | Đạt 15/11 — sớm 4 ngày | — |
| M4 Demo | 20/11 (giờ: Chờ chốt) | Đúng kế hoạch | **Khách hàng** (thử checklist, chốt giờ D1 và nơi thử D3) |

### Thử được ngay
- **Trên `develop` @ `fbffd5b`:** đăng nhập, hồ sơ, quản trị người dùng và **Trò chuyện** (http://localhost:3000/chat sau khi chạy theo [README](../../README.md#chạy-dự-án)). Checklist thao tác Chat: [SE-001](../tasks/SE-001-chat-integration.md#checklist-nghiệm-thu) (phần "Checklist UI dự kiến cho khách hàng").

### Task

| Task | Trạng thái | Tiến độ |
|---|---|---|
| [TL-001](../tasks/TL-001-chat-integration-scope.md) | Done 15/11 | Đúng hạn |
| [SE-001](../tasks/SE-001-chat-integration.md) | Done 15/11 | Sớm (hạn hoàn tất 19/11) |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Chờ Review (khách hàng thử) | Đúng kế hoạch |

Không còn nguy cơ trễ mốc 20/11 từ phía code. Việc còn lại trước demo: khách hàng thử checklist; TL chạy lại checklist trên máy demo.

### Cần khách hàng / CTO chốt
1. **D1 — Giờ demo** ngày 20/11.
2. **D3 — Thử bản Chat ở đâu?** Hiện dùng mặc định (chạy trên máy, mở http://localhost:3000). Cần link mở được từ xa thì báo trước 18/11 (thêm ~1 ngày triển khai, cần tài khoản hosting).

## Cập nhật 15/11/2026 (sau quyết định của khách hàng)

Cơ sở: `origin/develop` @ `6f9d3e4`. Khách hàng chốt: duyệt TL-001 và Q3; demo đầu tiên dùng phản hồi mẫu; giữ Module 3–4 ở preview; mốc demo dự kiến **20/11/2026**, giờ chốt sau ([plan mục 5](../project/plan.md#5-quyết-định-còn-mở)).

### Theo mốc

| Mốc | Hạn | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|---|
| M0 Tài liệu + TL-001 | 15/11 | Đạt 15/11 | — |
| M1 Chốt phạm vi | 16/11 | Đạt 15/11 — sớm 1 ngày | — |
| M2 SE-001 bàn giao | 18/11 | Đúng kế hoạch — SE-001 `Sẵn sàng`, dự kiến bàn giao 17/11 | **Senior Dev** |
| M3 Chat lên `develop` + gửi khách hàng link và checklist | 19/11 | Đúng kế hoạch — chờ M2 | TL |
| M4 Demo | 20/11 (giờ: Chờ chốt) | Đúng kế hoạch | Khách hàng (chốt giờ) |

### Thử được ngay
Không đổi so với mục dưới: Module 1 trên `develop`; Chat chỉ xem trước được trên preview.

### Task

| Task | Trạng thái | Tiến độ |
|---|---|---|
| [TL-001](../tasks/TL-001-chat-integration-scope.md) | Done 15/11 | Đúng hạn |
| [SE-001](../tasks/SE-001-chat-integration.md) | Sẵn sàng | Đúng kế hoạch (dự kiến 17/11 ≤ hạn 18/11) |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Nháp (chờ SE-001) | Đúng kế hoạch |

Dự phòng: đủ cho một vòng `Cần sửa`. Bàn giao muộn hơn 17/11 kèm cần sửa, hoặc vòng sửa thứ hai → `Có nguy cơ trễ` mốc 20/11.

### Cần khách hàng / CTO chốt
1. **D1 — Giờ demo** ngày 20/11.
2. **D3 — Thử bản Chat ở đâu?** Chưa có môi trường chung. Mặc định: chạy trên máy anh/chị hoặc máy demo, mở http://localhost:3000; TL gửi link commit và hướng dẫn chạy. Nếu cần một đường link mở được từ xa, cần thêm việc triển khai (~1 ngày, cần tài khoản hosting) — xin chốt trước 18/11.

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
