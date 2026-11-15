# 04 — Kiểm thử, kết quả và hướng phát triển

Cơ sở: `origin/develop` @ `6ed0fbc` (code = `fbffd5b`) · Người lập: TL (tổng hợp) · Trạng thái: **Khung vòng 1** — bảng ca kiểm thử đầy đủ và ảnh do [SE-008](../tasks/SE-008-thesis-implementation-evidence.md) lập trong `evidence/`, TL tổng hợp vào đây sau review (dự kiến 19/11).

## 1. Phương pháp và môi trường

- **Cách kiểm thử:** mỗi task có checklist nghiệm thu với nguồn yêu cầu và cách kiểm tra; Senior Dev tự kiểm tra khi bàn giao, TL kiểm tra lại độc lập khi review PR, rồi xác minh lại trên `develop` sau khi merge ([workflow mục 2, 9](../project/workflow.md#9-nghiệm-thu-kỹ-thuật-tl)). Kiểm thử phân quyền dùng **hai tài khoản cùng vai** + một tài khoản khác vai.
- **Công cụ:** trình duyệt (UI), `curl` với cookie riêng từng tài khoản (API, SSE), script Node (SSE, dừng sau N đoạn), Vitest (unit test — chỉ có trên PR #4), `pnpm build` / `typecheck` / `lint`.
- **Môi trường:** máy phát triển Windows, Node.js ≥ 22, MongoDB Atlas; API http://localhost:4000, web http://localhost:3000 (khi review song song dùng cổng 4200/3200).
- **Dữ liệu thử:** tài khoản riêng từng task (`se001.test@`, `audit.nv2@`, `se002.a@`/`se002.b@`, `se007.a@`/`se007.b@` thuộc miền `catgpt.local`), khóa lại sau kiểm thử; không dùng dữ liệu thật.
- **Không có:** kiểm thử tải, kiểm thử tự động end-to-end, unit test cho Module 1–2 trên `develop` (G6, G7 trong [README](README.md#5-phần-còn-thiếu)).

## 2. Phiên bản đã kiểm thử

| Phiên bản | Nội dung | Nơi kiểm thử | Hồ sơ |
|---|---|---|---|
| `develop` @ `06a5a83` (code = `fbffd5b`) | Module 1 + Module 2 (mock) — rà phân quyền | TL, 15/11 | [TL-003](../tasks/TL-003-access-ui-release-audit.md), [access-control](../design/access-control.md) |
| PR #2 @ `b01be16` → merge `fbffd5b` | Tích hợp Chat | SE + TL, 15/11; xác minh lại trên `develop` | [SE-001](../tasks/SE-001-chat-integration.md#lịch-sử-review) |
| `34b465d` (code `fbffd5b`) | Bản demo 20/11 | Khách hàng trên máy trình chiếu | [TL-002](../tasks/TL-002-chat-demo-acceptance.md) |
| PR #3 @ `d60864a` | Ảnh đại diện chỉ chính chủ | SE + TL, 15/11 — **chưa tích hợp** | [SE-002](../tasks/SE-002-avatar-requires-login.md#lịch-sử-review) |
| PR #4 @ `e1fda76` | OpenAI provider, nhãn "bị cắt" | SE + TL, 15/11 — **chưa tích hợp** | SE-007 @ [`e1fda76`](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md) |

## 3. Kết quả kiểm thử (tổng hợp từ hồ sơ hiện có)

Bảng chi tiết theo mã ca `TC-M1-nn` / `TC-M2-nn` (vai trò, bước, mong đợi, thực tế, SHA, nguồn): `evidence/test-cases.md` — **đang lập ở SE-008**. Dưới đây là kết quả đã có trong hồ sơ, đủ để viết Chương 4 ở mức tổng quát.

### 3.1. Module 1 — tài khoản và phân quyền [Đã tích hợp]

| Nhóm | Kết quả thực tế | Nguồn |
|---|---|---|
| Chưa đăng nhập | Mọi trang trong app chuyển `/login?next=…`; API `401 AUTH_UNAUTHENTICATED` | [access-control mục 2](../design/access-control.md#2-ma-trận-vai-trò--màn-hình--thao-tác--dữ-liệu--khi-thiếu-quyền) |
| Nhân viên vào trang/API quản trị | UI "Không có quyền truy cập"; 6 thao tác API → `403 FORBIDDEN` | như trên |
| Hồ sơ | Sửa được thông tin của mình; gửi `role`/`email` → `400 VALIDATION_FAILED` | như trên |
| Phiên | Đăng xuất từ xa được; thu hồi phiên người khác → `404 SESSION_NOT_FOUND` | như trên |
| Khóa tài khoản | Request kế tiếp → `401 AUTH_ACCOUNT_BLOCKED`, refresh → `401` | như trên |
| Đổi vai trò | Có hiệu lực ngay trên phiên đang mở (`403` → `200` → `403`) | như trên |
| Tự khóa / tự đổi vai trò mình | `400 USER_CANNOT_MODIFY_SELF` | như trên |
| Kịch bản lúc phát triển (23/10) | Đăng nhập đúng/sai, refresh rotation, dùng lại token trong ân hạn, avatar hợp lệ/không hợp lệ, 17 màn hình UI — chạy trên FerretDB, **chưa chạy lại toàn bộ với Atlas** | [module-1 §7](../design/module-1-auth.md#7-kiểm-thử-đã-làm) |

### 3.2. Module 2 — Chat [Đã tích hợp, nội dung mẫu]

| Nhóm | Kết quả thực tế | Nguồn |
|---|---|---|
| Gửi + streaming | Câu trả lời hiện dần, nút Gửi đổi thành Dừng | [SE-001 review vòng 1](../tasks/SE-001-chat-integration.md#review-vòng-1) |
| Dừng | Phần đã sinh lưu `STOPPED`, nhãn "Đã dừng" | như trên |
| Tạo lại | Câu trả lời mới chạy dần, lưu `COMPLETED` (xác minh lại trên `develop` sau merge) | [SE-001 Kết quả review](../tasks/SE-001-chat-integration.md#kết-quả-review) |
| Mở lại hội thoại | Tải lại trang / đăng nhập lại vẫn thấy đủ tin | SE-001 |
| Cách ly dữ liệu | 7 thao tác của NV1 trên hội thoại NV2 → `404 CONVERSATION_NOT_FOUND`; admin cũng không đọc được | [access-control mục 2](../design/access-control.md#2-ma-trận-vai-trò--màn-hình--thao-tác--dữ-liệu--khi-thiếu-quyền) |
| Giới hạn 20 tin/phút/người | Lần gửi thứ 21 trong một phút → `429 TOO_MANY_REQUESTS`; tài khoản khác cùng máy không bị ảnh hưởng; câu hỏi > 4.000 ký tự → `400` | [SE-001 review vòng 1](../tasks/SE-001-chat-integration.md#review-vòng-1) AC7 |

### 3.3. Đã kiểm thử trên PR, chưa tích hợp

**PR #3 — ảnh đại diện (SE-002):** chưa đăng nhập → `401`; người khác và admin → `404`; chính chủ xem được, ảnh tải trước thay đổi vẫn hiển thị. Nguồn: [SE-002](../tasks/SE-002-avatar-requires-login.md#lịch-sử-review).

**PR #4 — OpenAI (SE-007),** model `gpt-5.4-mini`, giới hạn 1.000 token; trạng thái sau khi mở lại hội thoại:

| Trường hợp | Phản hồi mẫu (`mock`) | OpenAI thật | Token vào / ra |
|---|---|---|---|
| Trả lời xong | `COMPLETED`, 423 ký tự | `COMPLETED`, 34 ký tự | 76 / 17 |
| Chạm giới hạn | `TRUNCATED`, giữ 187 ký tự | `TRUNCATED`, giữ 3.551 ký tự | 132 / 1.000 (script); 91 / 1.000 (UI) |
| Bấm Dừng | `STOPPED`, 46 ký tự | `STOPPED`, 23 ký tự | **Không nhận được usage cho lượt đó** (request đã hủy) |

- Hủy ở kết nối: unit test dùng SDK `openai` thật nối tới server SSE giả lập trên máy; khi hủy sau 5 đoạn, server nhận đóng kết nối trong < 300 ms và ngừng gửi (< 50/200 sự kiện).
- 12/12 unit test; `typecheck` 4/4, `lint` 3/3, `build` 3/3. Khách hàng xác nhận đạt nghiệm thu kỹ thuật vòng 2 ngày 15/11/2026.
- Nguồn: SE-007 @ [`e1fda76`](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md#checklist-vòng-2); [báo cáo ngày 15/11 vòng 3](../reports/daily/2026-11-15.md#vòng-3--1830).

## 4. Danh mục hình

Quy ước: đánh số theo chương khi đưa vào Word (ví dụ Hình 4.3); ở đây dùng mã ổn định `Hm<module>-<nn>`. Đường dẫn ảnh trong repo do SE-008 lập.

| Mã | Chú thích | Màn hình | Vai trò | SHA | Đường dẫn | Tình trạng |
|---|---|---|---|---|---|---|
| H1-xx | Đăng nhập, hồ sơ, phiên, quản trị người dùng, chặn quyền | `/login`, `/profile`, `/admin/users` | NV, QTV | `develop` | `images/m1-*.png` | `CẦN BỔ SUNG` — SE-008 |
| H2-xx | Chat streaming, Dừng, Tạo lại, mở lại hội thoại | `/chat`, `/chat/<id>` | NV | `develop` | `images/m2-*.png` | `CẦN BỔ SUNG` — SE-008 |
| H2-yy | Nhãn "Câu trả lời bị cắt…" (OpenAI) | `/chat/<id>` | NV thử | PR #4 `e1fda76` | `images/m2-*.png` | Có ảnh tạm 768 px (chưa vào repo) — SE-008 chọn hoặc chụp lại |

Hình 1–14 của báo cáo 27/10 (ngoài repo): commit dùng để chụp **không xác định được**; Hình 7–14 là giao diện dữ liệu giả ([audit mục 5](../project/preview-progress-review.md#5-checklist-kiểm-chứng-của-tl)). Không tái sử dụng làm bằng chứng kiểm thử.

## 5. Hạn chế

- Nội dung trả lời trên `develop` (và bản demo 20/11) là **văn bản mẫu**, không liên quan câu hỏi; LLM thật mới có trên PR #4.
- Module 3–4 chưa có hiện thực phía máy chủ; chưa có khung đánh giá RAG, chưa đóng gói Docker.
- Chưa có unit test cho Module 1–2 trên `develop`; chưa kiểm thử tải cho mục tiêu 500 nhân sự.
- Kiểm thử Module 1 ban đầu chạy trên FerretDB; kiểm tra phân quyền sau đó chạy trên Atlas (TL-003) nhưng chưa chạy lại toàn bộ kịch bản 23/10.
- Swagger bật mặc định; chưa có chế độ phát hành `staff` (KT-2, SE-003).

## 6. Hướng phát triển

Theo thứ tự đã chốt sau demo: tích hợp PR #3 → PR #4 (23–24/11); SE-003 chế độ phát hành; SE-005 giới hạn đăng nhập khi dùng chung IP; SE-006 quy tắc quản trị tài khoản; SE-004 giao diện nhất quán ([mục lục task](../tasks/README.md)). Theo đề cương: Module 3 (tài liệu + pipeline), Module 4 (RAG có trích dẫn), khung đánh giá tiếng Việt, Docker/Nginx on-premise, chạy LLM nội bộ (Ollama), Module 5 dịch tài liệu.
