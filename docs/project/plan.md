# Kế hoạch demo Chat

Trạng thái: Chờ Review (khách hàng + CTO)
Người lập: TL · Lập: 15/11/2026 · Cơ sở: `origin/develop` @ `a860437`, `origin/preview/module-2-4-demo` @ `b2a4b22`
Vai trò: **khách hàng và CTO chốt phạm vi và deadline**; TL ghi lại, giao task và điều phối ([workflow mục 1](workflow.md#1-vai-trò)). Tiến độ hằng ngày: [báo cáo tiến độ demo](../reports/demo-progress.md).

## 1. Mục tiêu demo (theo trải nghiệm trên giao diện)

Trên bản `develop` chạy tại http://localhost:3000, người xem thấy được:

1. **Đăng nhập và tài khoản** (đã có trên `develop`): đăng nhập, đổi ngôn ngữ / giao diện tối, hồ sơ, phiên đăng nhập, quản trị người dùng.
2. **Trò chuyện với trợ lý** (cần [SE-001](../tasks/SE-001-chat-integration.md)): mở Trò chuyện → gửi câu hỏi → câu trả lời hiện dần từng phần → bấm Dừng giữa chừng → bấm Tạo lại → tải lại trang hoặc đăng nhập lại vẫn mở được hội thoại cũ.
3. **Nội dung trả lời:** mặc định là **văn bản mẫu (giả lập)**, không liên quan câu hỏi; việc hiện dần từng phần là thật. Có AI trả lời thật hay không do quyết định D2.

Ngoài mục tiêu demo: Tài liệu và Hỏi đáp tài liệu (Module 3–4) vẫn hiện "Đang phát triển" trên `develop`; bản giao diện minh họa của hai module này ở nhánh preview, chưa có xử lý thật ([audit mục 3.3–3.4](preview-progress-review.md#33-module-3--quản-lý-tài-liệu-hình-79)).

## 2. Mốc

Ngày ví dụ giả định khách hàng chốt M1 vào thứ Hai 16/11/2026, tính theo ngày làm việc (thứ Hai – thứ Sáu). Hạn chính thức chưa chốt.

| Mốc | Nội dung | Điều kiện đạt | Hạn | Ví dụ nếu chốt 16/11 |
|---|---|---|---|---|
| M0 | Tài liệu quy trình, audit, plan lên `develop`; TL-001 bàn giao | Commit có trên `origin/develop` | 15/11/2026 | 15/11 |
| M1 | Chốt phạm vi | Khách hàng/CTO duyệt [TL-001](../tasks/TL-001-chat-integration-scope.md), chốt Q3, D1, D2 → SE-001 `Sẵn sàng` | Chờ chốt | 16/11 |
| M2 | Senior Dev bàn giao SE-001 | PR nhắm `develop`, checklist đủ, `Chờ Review` | Chờ chốt | M1 + 2 ngày → 18/11 |
| M3 | Chat có trên `develop` | [TL-002](../tasks/TL-002-chat-demo-acceptance.md): review đạt, merge, xác minh, gửi checklist UI cho khách hàng | Chờ chốt | M2 + 0,5–1 ngày → 19/11 |
| M3b | *(chỉ khi D2 = AI thật)* AI trả lời thật | Task provider (mục 3) `Done` | Chờ chốt | M3 + 2–3 ngày → 24/11 |
| M4 | Demo | Khách hàng thử checklist UI trước buổi demo; không có tiêu chí chưa đạt | **D1 — Chờ chốt** | Sớm nhất 20/11 (giả lập) hoặc 25/11 (AI thật) |

Mỗi vòng `Cần sửa` cộng thêm khoảng 0,5–1 ngày vào M2–M3.

## 3. Thứ tự công việc, ước lượng và phụ thuộc

| Thứ tự | Task | Người phụ trách | Ước lượng | Phụ thuộc | Trạng thái |
|---|---|---|---|---|---|
| 1 | [TL-001 — Khoanh phạm vi tích hợp Chat](../tasks/TL-001-chat-integration-scope.md) | TL | 0,5 ngày | Không | Chờ Review |
| 2 | [SE-001 — Tích hợp luồng Chat từ preview](../tasks/SE-001-chat-integration.md) | Senior Dev | 2 ngày | TL-001 duyệt + Q3 (chặn) | Nháp |
| 3 | [TL-002 — Nghiệm thu bản demo Chat](../tasks/TL-002-chat-demo-acceptance.md) | TL | 0,5 ngày/vòng | SE-001 `Chờ Review` (chặn) | Nháp |
| 3b | *Tích hợp provider AI thật* — **chưa tạo task**; TL tạo `SE-002` nếu D2 = bắt buộc | Senior Dev | 2–3 ngày | D2; chọn nhà cung cấp/mô hình (audit Q4) và có khóa API hoặc máy chạy mô hình; SE-001 xong (dùng chung `LlmProvider`) | — |

Đường găng: M1 → SE-001 → TL-002 → demo. Chỉ có một Senior Dev nên SE-002 (nếu có) chạy sau SE-001.

## 4. Rủi ro

| Rủi ro | Ảnh hưởng | Phương án |
|---|---|---|
| M1 chốt muộn | Toàn bộ mốc dời theo, vì SE-001 chưa được bắt đầu | TL nhắc trong báo cáo cuối ngày; mọi việc chuẩn bị của TL đã xong |
| D2 = AI thật chốt muộn hoặc chưa có khóa API | M3b trễ, demo trễ | Chốt D2 cùng M1; nếu chưa có khóa API trước M3, demo bằng nội dung giả lập |
| Chưa có môi trường chung | Demo chạy trên máy cá nhân (`pnpm dev`) | Chạy thử toàn bộ checklist UI trên máy demo trước buổi demo (TL-002 AC3) |

## 5. Quyết định còn mở

| # | Câu hỏi | Ảnh hưởng | Đề xuất của TL | Chốt (khách hàng + CTO) |
|---|---|---|---|---|
| **D1** | **Ngày giờ demo?** | Hạn M2–M4 của mọi task | Không sớm hơn M3 + 1 ngày để khách hàng tự thử trước | |
| **D2** | **Demo có bắt buộc AI trả lời thật không?** | Có → thêm task `SE-002` (mốc M3b, +2–3 ngày) và phải chốt nhà cung cấp/mô hình (audit Q4) | Không bắt buộc: demo với nội dung giả lập, ghi rõ trên checklist; AI thật làm sau ([audit Q1](preview-progress-review.md#1-kết-luận-và-quyết-định-cần-chốt)) | |
| Q3 | Xác nhận đề xuất mặc định mục 3 Module 2 làm yêu cầu đã duyệt, và đưa giới hạn 20 tin/phút/người vào SE-001 | Điều kiện để SE-001 sang `Sẵn sàng` | Đồng ý cả hai ([TL-001](../tasks/TL-001-chat-integration-scope.md#quyết-định-còn-mở)) | |

Câu hỏi từ audit liên quan: Q1 (tích hợp Chat với nội dung giả lập trước — trùng D2), Q2 (giữ demo Module 3–4 ở preview — kế hoạch này đang giả định **có**, TL-001 đã loại trừ Module 3–4), Q4 (chọn LLM — chỉ cần khi D2 = có). Xem [audit mục 1](preview-progress-review.md#1-kết-luận-và-quyết-định-cần-chốt).

## 6. Điều phối

- Trong lúc chờ D1, D2: TL đã hoàn thành TL-001 và soạn sẵn SE-001; khi M1 được chốt, TL chuyển SE-001 sang `Sẵn sàng` cùng ngày và ghi hạn vào [mục lục task](../tasks/README.md).
- Sau khi chốt D1: TL điền hạn bàn giao review và hạn hoàn tất cho SE-001, TL-002 (và SE-002 nếu có) ngược từ ngày demo.
- Báo cáo tiến độ cập nhật cuối mỗi ngày làm việc và ngay khi có nguy cơ trễ mốc ([workflow mục 11](workflow.md#11-theo-dõi-tiến-độ)).

## 7. Lịch sử review

### Checklist vòng 1
**Task hoặc yêu cầu** — Kế hoạch demo Chat · `develop` `a860437` · vòng 1
**Kết luận** — Plan có mục tiêu theo trải nghiệm UI, mốc M0–M4, thứ tự việc, ước lượng, phụ thuộc, rủi ro và 2 quyết định mở D1, D2 (kèm Q3 từ TL-001).
**Checklist**
- [x] Mục tiêu demo viết theo thao tác trên giao diện — mục 1
- [x] Mốc, thứ tự việc, phụ thuộc, ước lượng từng task — mục 2, 3
- [x] D1 (ngày giờ demo) và D2 (AI thật bắt buộc?) ghi là quyết định mở; hạn chưa chốt ghi `Chờ chốt` — mục 2, 5
- [x] Nhánh AI thật: thêm task provider vào mốc M3b nếu D2 = có — mục 2, 3
- [x] Dẫn tới mục audit liên quan — mục 1, 5
- [ ] Ngày ví dụ ở mục 2 — chỉ là ước tính giả định chốt 16/11, không phải hạn đã chốt
- [ ] Khách hàng và CTO chốt phạm vi, D1, D2, Q3 — chờ

**Trạng thái và bước tiếp theo** — Chờ Review.
