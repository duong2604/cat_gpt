# Kế hoạch demo Chat

Trạng thái: Đã chốt phạm vi và mốc dự kiến (khách hàng, 15/11/2026) · Chat đã lên `develop` @ `fbffd5b` (15/11) · Còn mở: giờ demo (D1), môi trường để khách hàng thử (D3)
Người lập: TL · Lập: 15/11/2026 · Cơ sở: `origin/develop` @ `6f9d3e4`, `origin/preview/module-2-4-demo` @ `b2a4b22`
Vai trò: **khách hàng và CTO chốt phạm vi và deadline**; TL ghi lại, giao task và điều phối ([workflow mục 1](workflow.md#1-vai-trò)). Tiến độ hằng ngày: [báo cáo tiến độ demo](../reports/demo-progress.md).

## 1. Mục tiêu demo (theo trải nghiệm trên giao diện)

Trên bản `develop` chạy tại http://localhost:3000, người xem thấy được:

1. **Đăng nhập và tài khoản** (đã có trên `develop`): đăng nhập, đổi ngôn ngữ / giao diện tối, hồ sơ, phiên đăng nhập, quản trị người dùng.
2. **Trò chuyện với trợ lý** ([SE-001](../tasks/SE-001-chat-integration.md)): mở Trò chuyện → gửi câu hỏi → câu trả lời hiện dần từng phần → bấm Dừng giữa chừng → bấm Tạo lại → tải lại trang hoặc đăng nhập lại vẫn mở được hội thoại cũ.
3. **Nội dung trả lời là văn bản mẫu (giả lập)**, không liên quan câu hỏi; việc hiện dần từng phần là thật. *Đã chốt 15/11/2026 (D2): demo đầu tiên dùng phản hồi mẫu.*

Ngoài mục tiêu demo: Tài liệu và Hỏi đáp tài liệu (Module 3–4) vẫn hiện "Đang phát triển" trên `develop`; bản giao diện minh họa giữ ở nhánh preview ([audit mục 3.3–3.4](preview-progress-review.md#33-module-3--quản-lý-tài-liệu-hình-79)). *Đã chốt 15/11/2026 (audit Q2).*

## 2. Mốc

Mốc demo dự kiến **thứ Sáu 20/11/2026** (giờ chốt sau). Hạn tính ngược từ mốc này, theo ngày làm việc (thứ Hai – thứ Sáu).

| Mốc | Nội dung | Điều kiện đạt | Hạn | Tình trạng |
|---|---|---|---|---|
| M0 | Tài liệu quy trình, audit, plan lên `develop`; TL-001 bàn giao | Commit có trên `origin/develop` | 15/11/2026 | Đạt 15/11 (`6f9d3e4`) |
| M1 | Chốt phạm vi | Duyệt [TL-001](../tasks/TL-001-chat-integration-scope.md), chốt Q3, D2 → SE-001 `Sẵn sàng` | 16/11/2026 | Đạt 15/11 |
| M2 | Senior Dev bàn giao SE-001 | PR nhắm `develop`, checklist đủ, `Chờ Review` | **18/11/2026** (dự kiến 17/11) | Đạt 15/11 — sớm 3 ngày (PR #2, `b01be16`) |
| M3 | Chat có trên `develop` | [TL-002](../tasks/TL-002-chat-demo-acceptance.md): review đạt, merge, xác minh; gửi khách hàng link bản chạy + checklist UI | **19/11/2026** | Đạt 15/11 — sớm 4 ngày (merge `fbffd5b`; đã gửi link + checklist) |
| M4 | Demo | Khách hàng đã thử checklist UI; không có tiêu chí chưa đạt | **20/11/2026** (dự kiến), giờ: Chờ chốt | Chưa đến hạn |

Dự phòng: bàn giao dự kiến 17/11, sớm hơn hạn M2 một ngày, đủ cho **một** vòng `Cần sửa` (review và sửa trong 18/11, merge 19/11). Vòng sửa thứ hai hoặc bàn giao sau 17/11 kèm `Cần sửa` → `Có nguy cơ trễ` mốc 20/11; TL báo ngay khi xảy ra.

## 3. Thứ tự công việc, ước lượng và phụ thuộc

| Thứ tự | Task | Người phụ trách | Ước lượng | Phụ thuộc | Hạn bàn giao review / hoàn tất | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | [TL-001 — Khoanh phạm vi tích hợp Chat](../tasks/TL-001-chat-integration-scope.md) | TL | 0,5 ngày | Không | 15/11 / — | Done 15/11 |
| 2 | [SE-001 — Tích hợp luồng Chat từ preview](../tasks/SE-001-chat-integration.md) | Senior Dev | 2 ngày (16–17/11) | Không còn phụ thuộc chặn | 18/11 / 19/11 | Done 15/11 |
| 3 | [TL-002 — Nghiệm thu bản demo Chat](../tasks/TL-002-chat-demo-acceptance.md) | TL | 0,5 ngày/vòng | SE-001 (đã Done) | 19/11 / 20/11 | **Chờ Review** (khách hàng thử) |

Đường găng: SE-001 → TL-002 → demo 20/11. Không có task AI thật trong mốc này (D2). Nếu sau này cần AI thật, TL tạo task provider riêng cho mốc sau (ước lượng 2–3 ngày, cần chọn nhà cung cấp — audit Q4).

## 4. Rủi ro

| Rủi ro | Ảnh hưởng | Phương án |
|---|---|---|
| SE-001 cần hơn một vòng sửa | Trễ M3, sát mốc demo | TL review trong ngày nhận bàn giao; báo nguy cơ trễ ngay trong báo cáo tiến độ |
| Chưa có môi trường chung (D3) | Khách hàng chỉ thử được trên máy đã cài dự án | Chốt D3 trước 18/11; mặc định chạy local |
| Thiết bị demo khác máy kiểm thử | Lỗi môi trường trong buổi demo | Chạy lại toàn bộ checklist UI trên máy demo trước buổi demo (TL-002 AC3) |

## 5. Quyết định còn mở

| # | Câu hỏi | Ảnh hưởng | Đề xuất của TL | Chốt (khách hàng + CTO) |
|---|---|---|---|---|
| **D1** | **Ngày giờ demo?** | Hạn M2–M4 | — | **Ngày dự kiến 20/11/2026** (khách hàng, 15/11); **giờ: Chờ chốt** |
| **D2** | **Demo có bắt buộc AI trả lời thật không?** | Có → thêm task provider | Không bắt buộc | **Không** — demo đầu tiên dùng phản hồi mẫu (khách hàng, 15/11) |
| Q3 | Xác nhận đề xuất mặc định mục 3 Module 2 và đưa giới hạn 20 tin/phút/người vào SE-001 | Điều kiện SE-001 `Sẵn sàng` | Đồng ý cả hai | **Đồng ý** (khách hàng, 15/11) |
| **D3** | **Khách hàng thử bản Chat ở đâu?** Hiện chưa có môi trường chung, chỉ chạy được local | "Link bản chạy" ở TL-002 | Mặc định: chạy `develop` trên máy khách hàng hoặc máy demo, mở http://localhost:3000 (TL gửi kèm link commit và hướng dẫn chạy). Nếu cần một đường link mở được từ xa → thêm task triển khai riêng (khoảng 1 ngày, cần tài khoản hosting), làm song song với SE-001 | Chờ chốt, trước 18/11 |

Câu hỏi từ audit: Q1 (tích hợp Chat với nội dung giả lập trước) — **đã chốt có** cùng D2; Q2 (giữ demo Module 3–4 ở preview) — **đã chốt có**; Q4 (chọn LLM) — chưa cần cho mốc này. Xem [audit mục 1](preview-progress-review.md#1-kết-luận-và-quyết-định-cần-chốt).

## 6. Điều phối

- 15/11: TL-001 `Done`; SE-001 chuyển `Sẵn sàng`, Senior Dev nhận theo [workflow mục 3.1](workflow.md#31-phân-công-và-nhận-task) ở phiên kế tiếp.
- Khi SE-001 sang `Chờ Review`: TL review trong ngày (TL-002); đạt → merge, xác minh trên `develop`, gửi khách hàng link bản chạy và checklist UI ngắn.
- 15/11: SE-001 bàn giao và review đạt trong ngày; merge PR #2 → `develop` @ `fbffd5b`; SE-001 `Done`; TL-002 gửi khách hàng link + checklist, `Chờ Review`. Trước demo: chạy lại checklist trên máy demo.
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

#### Review vòng 1
Khách hàng (15/11/2026): duyệt TL-001 và Q3; demo đầu tiên dùng phản hồi mẫu (D2 = không); giữ Module 3–4 ở preview (audit Q2); lấy 20/11 làm mốc dự kiến, giờ demo chốt sau; chuyển SE-001 sang `Sẵn sàng`; khi nghiệm thu xong gửi link bản chạy và checklist UI ngắn.

### Checklist vòng 2
**Task hoặc yêu cầu** — Kế hoạch demo Chat · `develop` `6f9d3e4` · vòng 2
**Kết luận** — Ghi các quyết định đã chốt, đặt hạn từ mốc 20/11, bỏ nhánh AI thật (M3b) khỏi mốc này, thêm D3 (môi trường thử).
**Checklist**
- [x] Ghi chốt D2, Q3, audit Q1–Q2 kèm ngày và người chốt — mục 1, 5
- [x] Mốc 20/11 dự kiến, giờ `Chờ chốt` — mục 2, 5 (D1)
- [x] Hạn M2 18/11, M3 19/11 tính ngược từ 20/11, có dự phòng một vòng sửa — mục 2
- [x] Bỏ M3b / task provider khỏi mốc này theo D2 — mục 2, 3
- [x] SE-001 `Sẵn sàng`, TL-001 `Done` — mục 3; [mục lục task](../tasks/README.md)
- [ ] D3 (khách hàng thử ở đâu) — chờ chốt; phát sinh vì yêu cầu "link bản chạy" mà chưa có môi trường chung
- [ ] Giờ demo — chờ chốt

**Trạng thái và bước tiếp theo** — Đã chốt phạm vi và mốc dự kiến; chờ chốt D1 (giờ) và D3.
