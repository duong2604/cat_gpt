# Báo cáo tiến độ demo Chat

Theo mốc của [plan.md](../project/plan.md#2-mốc). Chi tiết từng ngày: [báo cáo ngày](daily/README.md). TL cập nhật cuối mỗi ngày làm việc và ngay khi phát hiện nguy cơ trễ mốc; mục mới nhất ở trên, giữ các mục cũ ([workflow mục 11](../project/workflow.md#11-theo-dõi-tiến-độ)).

## Cập nhật 16/11/2026 (tích hợp sớm PR #3, PR #4)

Chi tiết: [16/11 vòng 3](daily/2026-11-16.md#vòng-3--0058).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Đúng kế hoạch — máy trình chiếu giữ `34b465d` (không theo `develop`) |
| SE-002, SE-007 | **Done 16/11** — merge `1674425`, `d6832e0` (khách hàng cho tích hợp sớm), xác minh trên `develop` |
| SE-003 (PR #6) | Chờ Senior Dev ghép `develop` (có PR #4) — hạn 25/11 |
| TL-004 vòng 4, TL-005 | Có thể làm sớm: bộ nguồn cập nhật theo `d6832e0`; Word nháp chờ mở phiên |

## Cập nhật 15/11/2026 (SE-007 đạt kỹ thuật; bộ nguồn đồ án)

Chi tiết: [15/11 vòng 4](daily/2026-11-15.md#vòng-4--1900).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 (giờ chờ chốt) | Đúng kế hoạch — bản `34b465d` không đổi |
| Sau demo 23–24/11: PR #3 / SE-002 → PR #4 / SE-007 | Cả hai đạt review TL; SE-007 khách hàng xác nhận đạt kỹ thuật 15/11; chờ tích hợp |
| TL-004 bộ nguồn đồ án | Vòng 1 Chờ Review; dự kiến bộ nguồn 19/11, cập nhật sau tích hợp 25/11 (hạn chờ chốt) |
| SE-008 tài liệu hiện thực + bằng chứng | Sẵn sàng; dự kiến bàn giao 18/11, trước SE-003 (hạn SE-003 25/11 không đổi) |

## Cập nhật 15/11/2026 (SE-002 đạt review — báo cáo ngày)

Từ 15/11/2026 chi tiết hằng ngày ở [báo cáo ngày](daily/README.md); mục này chỉ tóm tắt theo mốc. Chi tiết: [15/11 vòng 1](daily/2026-11-15.md#vòng-1--1720).

| Mốc | Tình trạng |
|---|---|
| M0–M3 | Đạt 15/11 |
| M4 Demo 20/11 (giờ chờ chốt) | Đúng kế hoạch — bản `34b465d` không đổi |
| Sau demo: SE-002 | Bàn giao 15/11, TL review đạt; merge dự kiến 23/11 (hạn hoàn tất 24/11) |
| Sau demo: SE-003 | Sẵn sàng; hạn 25/11 / 26/11 |
| Sau demo: SE-005, SE-006, SE-004 | Sẵn sàng; lịch dự kiến, chưa duyệt |

## Cập nhật 15/11/2026 (TL-003 vòng 3 — xếp lại task sau demo)

Bản demo 20/11 **không đổi** (code `fbffd5b`, máy trình chiếu `34b465d`); giờ demo chờ chốt. Senior Dev đã nhận phạm vi mới của SE-002 (commit local `977c03d`; PR #3 mở, trên GitHub còn `02f31f5`, chưa bàn giao).

| Thứ tự | Task | Trạng thái | Bàn giao / hoàn tất | Tiến độ |
|---|---|---|---|---|
| 1 | [SE-002](../tasks/SE-002-avatar-requires-login.md) ảnh chỉ chính chủ | **Đang làm** | 23/11 / 24/11 | Đúng kế hoạch |
| 2 | [SE-003](../tasks/SE-003-release-mode-navigation.md) bản `demo`/`staff` | Sẵn sàng | 25/11 / 26/11 | Đúng kế hoạch |
| 3 | [SE-005](../tasks/SE-005-login-limit-shared-ip.md) đăng nhập chung IP | Sẵn sàng | Dự kiến 27/11 / 30/11 | Chưa bắt đầu |
| 4 | [SE-006](../tasks/SE-006-account-admin-rules.md) quản trị tài khoản + công cụ khôi phục | Sẵn sàng | Dự kiến 02/12 / 03/12 | Chưa bắt đầu |
| 5 | [SE-004](../tasks/SE-004-ui-consistency.md) giao diện nhất quán | Sẵn sàng | Dự kiến 04/12 / 07/12 | Chưa bắt đầu |

Cần khách hàng / CTO chốt: giờ demo (D1); R1 — người phê duyệt và người thực hiện [khôi phục admin](../design/access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt); Q1 — chặn tạm theo IP khi dò mật khẩu ([SE-005](../tasks/SE-005-login-limit-shared-ip.md#quyết-định-còn-mở)); duyệt mốc dự kiến SE-005, SE-006, SE-004.

## Cập nhật 15/11/2026 (quyết định quyền và UI — TL-003 vòng 2)

Bản demo 20/11 **không đổi** (code `fbffd5b`, máy trình chiếu chạy `34b465d`); giờ demo chờ chốt. Khách hàng duyệt TL-003, chốt CS-1…CS-6 và font Be Vietnam Pro.

| Task | Trạng thái | Hạn bàn giao / hoàn tất | Tiến độ |
|---|---|---|---|
| [SE-002](../tasks/SE-002-avatar-requires-login.md) ảnh chỉ chính chủ | **Đang làm** (từ 15/11) | 23/11 / 24/11 | Đúng kế hoạch — phạm vi đổi 15/11, Senior Dev điều chỉnh |
| [SE-003](../tasks/SE-003-release-mode-navigation.md) bản `demo`/`staff` | Sẵn sàng | 25/11 / 26/11 | Đúng kế hoạch |
| [SE-006](../tasks/SE-006-account-admin-rules.md) quy tắc quản trị tài khoản | Sẵn sàng | Chờ chốt (đề xuất 27/11 / 28/11) | — |
| [SE-005](../tasks/SE-005-login-limit-shared-ip.md) đăng nhập chung IP | Sẵn sàng | Chờ chốt (đề xuất 28/11 / 29/11) | — |
| [SE-004](../tasks/SE-004-ui-consistency.md) giao diện nhất quán | Sẵn sàng | Chờ chốt (đề xuất 30/11 / 01/12) | — |

Mọi task merge **sau buổi demo 20/11**. Khách hàng thử được SE-002 từ 24/11, SE-003 từ 26/11 (sau khi TL merge và xác minh trên `develop`).

Cần khách hàng / CTO chốt: giờ demo (D1); hạn SE-006, SE-005, SE-004.

## Cập nhật 15/11/2026 (rà quyền, UI và phát hành — TL-003)

Cơ sở kiểm tra: `origin/develop` @ `06a5a83` (code giống bản demo `fbffd5b`). **Bản demo 20/11 không đổi**: không có thay đổi code; các task mới chỉ merge sau buổi demo.

- **Không có lỗi phân quyền hay lỗi chặn demo.** Nhân viên không xem được hội thoại của người khác; quản trị viên quản lý tài khoản nhưng không đọc được nội dung Chat. Chi tiết: [ma trận phân quyền](../design/access-control.md).
- **Cần sửa trước khi mở cho nhân viên:** ảnh đại diện mở được khi chưa đăng nhập ([SE-002](../tasks/SE-002-avatar-requires-login.md)); ẩn tính năng chưa sẵn sàng ở bản nhân viên ([SE-003](../tasks/SE-003-release-mode-navigation.md)); đăng nhập bị giới hạn 5 lần/phút cho mỗi IP — 500 người chung mạng công ty sẽ bị chặn ([tiêu chí R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự)).
- Task: TL-003 `Chờ Review`; SE-002, SE-003 `Sẵn sàng` (Senior Dev nhận ngay, merge sau 20/11); SE-004 `Nháp`.

Cần khách hàng / CTO chốt: CS-1…CS-6 ([access-control mục 4](../design/access-control.md#4-chính-sách-đã-chốt)), U1 (chuẩn giao diện, font Be Vietnam Pro), hạn SE-002/SE-003 (đề xuất 23–26/11), giờ demo (D1).

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
