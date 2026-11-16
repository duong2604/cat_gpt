# 04 — Kiểm thử, kết quả và hướng phát triển

Cơ sở: `origin/develop` @ `8732458` (code ứng dụng = `fbffd5b`) · Người lập: TL (tổng hợp từ [SE-008](../tasks/SE-008-thesis-implementation-evidence.md) và hồ sơ task) · Trạng thái: **Chờ Review (vòng 4, 16/11/2026)** — PR #3 → `1674425`, PR #4 → `d6832e0` đã tích hợp; code ứng dụng `d6832e0`

## 1. Phương pháp và môi trường

- **Cách kiểm thử:** mỗi task có checklist nghiệm thu với nguồn yêu cầu và cách kiểm tra; Senior Dev tự kiểm tra khi bàn giao, TL kiểm tra lại độc lập khi review PR, rồi xác minh lại trên `develop` sau khi merge ([workflow mục 2, 9](../project/workflow.md#9-nghiệm-thu-kỹ-thuật-tl)). Kiểm thử phân quyền dùng **hai tài khoản cùng vai** + một tài khoản khác vai.
- **Công cụ:** trình duyệt (UI), `curl` với cookie riêng từng tài khoản (API, SSE), script Node (SSE, dừng sau N đoạn), Vitest (unit test — `openai-llm.provider.spec.ts`, vào `develop` cùng PR #4), `pnpm build` / `typecheck` / `lint`.
- **Môi trường:** máy phát triển Windows, Node.js ≥ 22, MongoDB Atlas; API http://localhost:4000, web http://localhost:3000 (khi review song song dùng cổng 4200/3200).
- **Dữ liệu thử:** tài khoản riêng từng task (`se001.test@`, `audit.nv2@`, `se002.a@`/`se002.b@`, `se007.a@`/`se007.b@` thuộc miền `catgpt.local`), khóa lại sau kiểm thử; không dùng dữ liệu thật.
- **Không có:** kiểm thử tải, kiểm thử tự động end-to-end, unit test cho Module 1 và luồng Chat trên `develop` (B11 trong [README](README.md#6-danh-sách-cần-bổ-sung-cho-người-viết-word)).

## 2. Phiên bản đã kiểm thử

| Phiên bản | Nội dung | Nơi kiểm thử | Hồ sơ |
|---|---|---|---|
| `develop` @ `06a5a83` (code = `fbffd5b`) | Module 1 + Module 2 (mock) — rà phân quyền | TL, 15/11 | [TL-003](../tasks/TL-003-access-ui-release-audit.md), [access-control](../design/access-control.md) |
| PR #2 @ `b01be16` → merge `fbffd5b` | Tích hợp Chat | SE + TL, 15/11; xác minh lại trên `develop` | [SE-001](../tasks/SE-001-chat-integration.md#lịch-sử-review) |
| `34b465d` (code `fbffd5b`) | Bản demo 20/11 | Khách hàng trên máy trình chiếu | [TL-002](../tasks/TL-002-chat-demo-acceptance.md) |
| PR #3 @ `d60864a` | Ảnh đại diện chỉ chính chủ | SE + TL, 15/11; merge `1674425`, TL xác minh trên `develop` @ `d6832e0` 16/11 | [SE-002](../tasks/SE-002-avatar-requires-login.md#lịch-sử-review) |
| PR #4 @ `e1fda76` | OpenAI provider, nhãn "bị cắt" | SE + TL, 15/11; merge `d6832e0`, TL xác minh trên `develop` 16/11 | [SE-007](../tasks/SE-007-openai-provider.md#lịch-sử-review) |

## 3. Kết quả kiểm thử

Nguồn chi tiết: [evidence/test-cases.md](evidence/test-cases.md) (Senior Dev, [SE-008](../tasks/SE-008-thesis-implementation-evidence.md), TL review đạt vòng 2, merge PR #5 → `develop` @ `8732458`). Bảng dưới là bản tổng hợp để đưa vào Chương 4; mỗi dòng giữ mã ca để tra lại bước thử và nguồn gốc. Cột **Phiên bản**: SHA chạy kiểm thử (`2f003a0`, `06a5a83`, `fbffd5b` đều cùng code ứng dụng với `develop` hiện tại; `d60864a` = PR #3; `e1fda76` = PR #4).

### 3.1. Module 1 — tài khoản và phân quyền [Đã tích hợp]

| Mã ca | Vai trò | Nội dung kiểm thử | Kết quả | Phiên bản | Hình |
|---|---|---|---|---|---|
| TC-M1-01 | Khách | Đăng nhập đúng → `200`, cookie access/refresh/`cat_session` | Đạt | `2f003a0` | H1-01 |
| TC-M1-02 | Khách | Đăng nhập sai / email không tồn tại → `401 AUTH_INVALID_CREDENTIALS` | Đạt phần thông báo lỗi; thời gian phản hồi đồng đều **chỉ kiểm qua code** (M1-08), chưa đo | `06a5a83` | — |
| TC-M1-03 | Khách | `GET /me` chưa đăng nhập → `401 AUTH_UNAUTHENTICATED` | Đạt | `2f003a0` | — |
| TC-M1-04 | ADMIN → NV | Khóa tài khoản đang mở phiên → bị đưa về `/login`, thông báo bị khóa, không chờ token hết hạn | Đạt | `2f003a0` | H1-06 |
| TC-M1-05 | NV | Tab Phiên đăng nhập: thiết bị hiện tại; đăng xuất từ xa | Đạt (đăng xuất từ xa: theo [TL-003](../tasks/TL-003-access-ui-release-audit.md)) | `2f003a0` | H1-03 |
| TC-M1-06 | NV | Vào thẳng `/admin/users` → "Không có quyền truy cập" | Đạt | `2f003a0` | H1-04 |
| TC-M1-07 | NV | `GET /admin/users` → `403 FORBIDDEN` | Đạt | `2f003a0` | — |
| TC-M1-08 | NV | Hồ sơ cá nhân, khu vực ảnh đại diện | Đạt | `2f003a0` | H1-02 |
| — | ADMIN | Danh sách quản lý người dùng | Đạt (minh họa) | `2f003a0` | H1-05 |

Kết quả rà phân quyền đầy đủ (hai nhân viên + một admin, mọi thao tác) ở [access-control mục 2](../design/access-control.md#2-ma-trận-vai-trò--màn-hình--thao-tác--dữ-liệu--khi-thiếu-quyền); kịch bản lúc phát triển 23/10 ở [module-1 §7](../design/module-1-auth.md#7-kiểm-thử-đã-làm) (chạy trên FerretDB).

### 3.2. Module 2 — Chat [Đã tích hợp, nội dung mẫu]

| Mã ca | Vai trò | Nội dung kiểm thử | Kết quả | Phiên bản | Hình |
|---|---|---|---|---|---|
| TC-M2-01 | NV | Gửi câu hỏi khi chưa có hội thoại → tạo hội thoại, chữ hiện dần, `COMPLETED` | Đạt | `2f003a0` | H2-01 |
| TC-M2-02 | NV | Bấm Dừng khi đang stream → `STOPPED`, giữ phần đã sinh, nhãn "Đã dừng" | Đạt theo [SE-001 review](../tasks/SE-001-chat-integration.md#review-vòng-1) (API: `STOPPED`, 91 ký tự); **chưa có ảnh** chuẩn — `CẦN BỔ SUNG` B13 | `fbffd5b` | — |
| TC-M2-03 | NV | Tạo lại → câu trả lời mới, `COMPLETED` | Đạt | `2f003a0` | H2-02 |
| TC-M2-04 | NV | Đăng xuất/đăng nhập lại, mở hội thoại cũ → đủ lịch sử | Đạt | `2f003a0` | H2-01 |
| TC-M2-05 | NV khác | Đọc hội thoại người khác → `404 CONVERSATION_NOT_FOUND` | Đạt | `2f003a0` | — |
| TC-M2-06 | NV | Lần gửi thứ 21 trong một phút → `429`; người khác cùng máy không bị ảnh hưởng | Đạt | `fbffd5b` | — |
| TC-M2-07 | NV | Lỗi LLM giữa chừng (`/error`) → `ERROR`, nhãn lỗi, Tạo lại được | Đạt | `2f003a0` | H2-03 |

### 3.3. Kiểm thử trên PR, đã tích hợp và xác minh lại trên `develop`

Các ca dưới đây chạy trên đầu PR (cột Phiên bản). PR #3 → `1674425`, PR #4 → `d6832e0` (16/11/2026); TL xác minh lại trên `develop` @ `d6832e0`: TC-M1-09…11 (`401` chưa đăng nhập, `200` + `private, no-store` chính chủ, `404` người khác và admin), TC-M2-08 với mock (`COMPLETED`(364) → `TRUNCATED`(284) → `STOPPED`(53) ký tự, đúng sau khi mở lại), unit test 12/12 (TC-M2-10) — [báo cáo ngày 16/11 vòng 3](../reports/daily/2026-11-16.md#vòng-3--0058). TC-M1-12, TC-M2-09, TC-M2-11 (OpenAI thật) không chạy lại trên `develop`; code không đổi khi merge.

| Mã ca | Vai trò | Nội dung kiểm thử | Kết quả | Phiên bản | Hình |
|---|---|---|---|---|---|
| TC-M1-09 | Khách | Mở ảnh đại diện chưa đăng nhập → `401` | Đạt | PR #3 `d60864a` | — |
| TC-M1-10 | NV chính chủ | Mở ảnh của mình → `200`, `Cache-Control: private, no-store` | Đạt | PR #3 `d60864a` | H1-07 |
| TC-M1-11 | NV khác / ADMIN | Mở ảnh của người khác → `404` như nhau | Đạt | PR #3 `d60864a` | — |
| TC-M1-12 | NV | Đăng xuất rồi tải lại URL ảnh → `401` thật, không lấy từ cache | Đạt | PR #3 `d60864a` | — |
| TC-M2-08 | NV | Ba kết thúc với mock: `COMPLETED`(423) → `TRUNCATED`(187) → `STOPPED`(46) ký tự, đúng sau khi mở lại | Đạt | PR #4 `e1fda76` | — |
| TC-M2-09 | NV | Ba kết thúc với OpenAI `gpt-5.4-mini`: `COMPLETED`(34) → `TRUNCATED`(3.551, chạm 1.000 token) → `STOPPED`(23) | Đạt | PR #4 `e1fda76` | H2-04 |
| TC-M2-10 | — (unit test) | Hủy `signal` → kết nối HTTP tới provider đóng < 300 ms, server giả lập ngừng gửi (< 50/200 sự kiện) | Đạt | PR #4 `e1fda76` | — |
| TC-M2-11 | NV | Bấm Dừng khi chờ OpenAI → **không nhận được usage cho lượt đó** | Đạt | PR #4 `e1fda76` | — |

**Token khi thử OpenAI thật** (PR #4, `gpt-5.4-mini`; log API chỉ ghi số token, không ghi nội dung): câu ngắn 76 vào / 17 ra; bài dài chạm giới hạn 132 / 1.000 (script) và 91 / 1.000 (UI); lượt Dừng không có usage. Unit test PR #4: 12/12 (chạy lại trên `develop` @ `d6832e0`: 12/12). Nguồn: SE-007 @ [`e1fda76`](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md#checklist-vòng-2).

### 3.4. Kiểm tra mã nguồn

`pnpm build` 3/3, `pnpm typecheck` 4/4, `pnpm lint` 3/3 tại `fbffd5b` (SE-001) và `e1fda76` (SE-007). `develop` chưa có unit test cho Module 1–2 (B11).

## 4. Danh mục hình

Đề xuất số hình cho Chương 4 khi dựng Word: tên hình đặt **phía dưới** hình, đánh số theo chương (Q8, Q9 — QĐ tr. 2–3 §2.4). Ảnh do hệ thống tự chụp bằng dữ liệu thử (tài khoản `*@catgpt.local`), không phải hình sao chép. Tất cả ảnh đã được TL mở và đối chiếu khi review SE-008.

| Mã | Đề xuất trong Word | Chú thích | Màn hình | Vai trò | SHA chạy | Ảnh | Dùng |
|---|---|---|---|---|---|---|---|
| H1-01 | Hình 4.1 | Màn hình đăng nhập (sau khi đăng xuất) | `/login` | Khách | `2f003a0` | [m1-01-login.png](images/m1-01-login.png) | Có |
| H1-02 | Hình 4.2 | Hồ sơ cá nhân — tab Thông tin, khu vực ảnh đại diện | `/profile` | Nhân viên | `2f003a0` | [m1-02-profile-info.png](images/m1-02-profile-info.png) | Có |
| H1-03 | Hình 4.3 | Hồ sơ cá nhân — tab Phiên đăng nhập | `/profile` | Nhân viên | `2f003a0` | [m1-03-profile-sessions.png](images/m1-03-profile-sessions.png) | Có |
| H1-04 | Hình 4.4 | Nhân viên mở trang quản trị — "Không có quyền truy cập" | `/admin/users` | Nhân viên | `2f003a0` | [m1-04-admin-denied.png](images/m1-04-admin-denied.png) | Có |
| H1-05 | Hình 4.5 | Quản lý người dùng — tìm kiếm, lọc vai trò/trạng thái (cột Người dùng hiện ảnh hoặc chữ cái đầu) | `/admin/users` | Quản trị viên | `2f003a0` | [m1-05-admin-users-list.png](images/m1-05-admin-users-list.png) | Có |
| H1-06 | Hình 4.6 | Tài khoản bị khóa bị đưa về trang đăng nhập ngay | `/login` | Nhân viên | `2f003a0` | [m1-06-account-blocked.png](images/m1-06-account-blocked.png) | Có |
| H2-01 | Hình 4.7 | Hội thoại mở lại — câu trả lời mẫu dạng danh sách, dòng "Đây là câu trả lời mẫu…" | `/chat/[id]` | Nhân viên | `2f003a0` | [m2-01-chat-reopened.png](images/m2-01-chat-reopened.png) | Có |
| H2-02 | Hình 4.8 | Tạo lại câu trả lời — nội dung mới có khối mã | `/chat/[id]` | Nhân viên | `2f003a0` | [m2-02-chat-regenerate.png](images/m2-02-chat-regenerate.png) | Có |
| H2-03 | Hình 4.9 | Lỗi khi sinh câu trả lời (`/error`) — nhãn lỗi và nút Tạo lại | `/chat/[id]` | Nhân viên | `2f003a0` | [m2-03-chat-error.png](images/m2-03-chat-error.png) | Có |
| H1-07 | Hình 4.10 | Ảnh đại diện chính chủ [PR #3] | `/profile` | Quản trị viên thử | PR #3 `d60864a` | [m1-07-avatar-admin-pr3.png](images/m1-07-avatar-admin-pr3.png) (768 × 348) | Tạm — chụp lại sau tích hợp (B13) |
| H1-08 | Hình 4.11 | Hồ sơ trên màn hình hẹp sau khi xóa ảnh [PR #3] | `/profile` | Quản trị viên thử | PR #3 `d60864a` | [m1-08-avatar-mobile-pr3.png](images/m1-08-avatar-mobile-pr3.png) (238 × 432) | Tạm (B13) |
| H2-04 | Hình 4.12 | Câu trả lời đang hiện dần (streaming) bằng OpenAI `gpt-5.4-mini`: con trỏ nhấp nháy, nút Dừng, biểu tượng đang tải ở danh sách hội thoại | `/chat/[id]` | Quản trị viên (admin mặc định) | `develop` `783a8a3` | [m2-04-openai-stream.jpg](images/m2-04-openai-stream.jpg) (1536 × 695) | Dùng — B13 (17/11/2026) |
| H2-05 | Hình 4.13 | Nhãn "Câu trả lời bị cắt do đạt giới hạn độ dài" — chạm 1.000 token (log: `output_tokens=1000 end=max_output_tokens`), trạng thái lưu `TRUNCATED` | `/chat/[id]` | Quản trị viên | `develop` `783a8a3` | [m2-05-openai-truncated.jpg](images/m2-05-openai-truncated.jpg) (1536 × 695) | Dùng — B13 |
| H2-06 | Hình 4.14 | Nhãn "Đã dừng" sau khi bấm Dừng — phần đã sinh được giữ, trạng thái lưu `STOPPED`, không có dòng log usage | `/chat/[id]` | Quản trị viên | `develop` `783a8a3` | [m2-06-stopped.jpg](images/m2-06-stopped.jpg) (1536 × 695) | Dùng — B13 |
| (cũ) | — | Ảnh tạm chụp trên PR #4: `m2-04-openai-stream-pr4.png`, `m2-05-openai-truncated-pr4.png` | — | — | PR #4 `e1fda76` | `images/` | **Thay bằng H2-04, H2-05 ở trên** — giữ tệp để truy vết |

Ảnh `m1-07`, `m1-08` hiển thị email tài khoản thử của TL (`tlrev.admin@catgpt.local`) và `m2-04`, `m2-05` hiển thị `se007.a@catgpt.local` — đều là tài khoản thử, đã khóa. B13 (17/11/2026, TL): đã chụp lại trên `develop` @ `783a8a3` (API bản build, `LLM_PROVIDER=openai`, giao diện tiếng Việt, câu hỏi chủ đề công khai) — H2-04, H2-05, H2-06 ở 1536 × 695; hội thoại thử đã xóa sau khi chụp. **Còn lại:** H1-07, H1-08 (ảnh đại diện) vẫn là ảnh tạm 768 px chụp trên PR #3 — chưa chụp lại vì cần tải ảnh lên tài khoản thử trên trình duyệt; mobile 375 px chưa chụp (công cụ trình duyệt của TL không thu được cửa sổ) — `CẦN BỔ SUNG` nếu báo cáo cần.

Hình 1–14 của báo cáo 27/10 (ngoài repo): commit dùng để chụp **không xác định được**; Hình 7–14 là giao diện dữ liệu giả ([audit mục 5](../project/preview-progress-review.md#5-checklist-kiểm-chứng-của-tl)). Không dùng làm bằng chứng kiểm thử.

## 5. Hạn chế

- Nội dung trả lời trên `develop` (và bản demo 20/11) là **văn bản mẫu**, không liên quan câu hỏi; LLM thật (OpenAI) đã tích hợp (PR #4 → `d6832e0`), bật bằng `LLM_PROVIDER=openai`; mặc định vẫn `mock`.
- Module 3–4 chưa có hiện thực phía máy chủ; chưa có khung đánh giá RAG, chưa đóng gói Docker.
- Chưa có unit test cho Module 1 và luồng Chat trên `develop`; chưa kiểm thử tải cho mục tiêu 500 nhân sự.
- Kiểm thử Module 1 ban đầu chạy trên FerretDB; kiểm tra phân quyền sau đó chạy trên Atlas (TL-003) nhưng chưa chạy lại toàn bộ kịch bản 23/10.
- Swagger bật mặc định; chưa có chế độ phát hành `staff` (KT-2, SE-003).

## 6. Hướng phát triển

Theo thứ tự đã chốt sau demo: ~~tích hợp PR #3 → PR #4~~ (xong 16/11); SE-003 chế độ phát hành; SE-005 giới hạn đăng nhập khi dùng chung IP; SE-006 quy tắc quản trị tài khoản; SE-004 giao diện nhất quán ([mục lục task](../tasks/README.md)). Theo đề cương: Module 3 (tài liệu + pipeline), Module 4 (RAG có trích dẫn), khung đánh giá tiếng Việt, Docker/Nginx on-premise, chạy LLM nội bộ (Ollama), Module 5 dịch tài liệu.
