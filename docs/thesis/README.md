# Bộ tài liệu nguồn cho báo cáo đồ án

Điểm vào cho người (hoặc AI) viết báo cáo đồ án tốt nghiệp bằng Word. Bộ này **chỉ là nguồn**: nội dung đã đối chiếu với code, PR và hồ sơ kiểm thử, kèm đường dẫn để kiểm chứng. File Word do sinh viên tạo sau.

Trạng thái bộ nguồn: **Vòng 1 — Chờ Review** (đề cương chương + trạng thái module + danh sách còn thiếu). Hồ sơ: [TL-004](../tasks/TL-004-thesis-source-pack.md), phần Senior Dev: [SE-008](../tasks/SE-008-thesis-implementation-evidence.md).

## 1. Phiên bản cơ sở

| Mục | Giá trị |
|---|---|
| Ngày chốt nguồn | 15/11/2026 (giờ VN) |
| `origin/develop` | `6ed0fbc` — code ứng dụng trùng `fbffd5b` (merge PR #2, Chat); các commit sau chỉ đổi tài liệu |
| Bản demo 20/11/2026 | `34b465d` (code `fbffd5b`), chạy local trên máy trình chiếu — không đổi |
| PR mở, đã đạt review TL, chờ tích hợp sau demo (23–24/11) | PR #3 / SE-002 @ `d60864a` → PR #4 / SE-007 @ `e1fda76` (theo thứ tự này) |
| Nhánh demo Module 3–4 | `origin/preview/module-2-4-demo` @ `b2a4b22` — giao diện dữ liệu giả, không tính là hiện thực |

Khi `develop` thay đổi, cập nhật bảng này và mục 3 trước khi dùng bộ nguồn.

## 2. Thứ tự đọc

1. **README này** — phiên bản, trạng thái module, phần còn thiếu.
2. [01-outline-and-sources.md](01-outline-and-sources.md) — đề tài, mục tiêu, phạm vi, bố cục chương, nguồn và tài liệu tham khảo, quy định trình bày của Khoa.
3. [02-requirements-and-design.md](02-requirements-and-design.md) — bài toán, yêu cầu, tác nhân, phân quyền, kiến trúc, dữ liệu, API, luồng.
4. `03-implementation.md` — hiện thực Module 1–2 (*đang soạn — [SE-008](../tasks/SE-008-thesis-implementation-evidence.md), dự kiến 18/11*).
5. [04-validation-and-results.md](04-validation-and-results.md) — kiểm thử, kết quả, danh mục hình, hạn chế, hướng phát triển.

**Quy ước diễn giải** (áp dụng cho mọi file):
- **Thiết kế dự kiến** = ghi trong tài liệu thiết kế, chưa chắc đã có code. **Hiện thực đã kiểm chứng** = có code tại SHA ghi rõ và có ca kiểm thử/ảnh. Khi viết Word, không trình bày thiết kế dự kiến như đã làm xong.
- Không dùng tỷ lệ % hoàn thành hay số liệu tải khi bộ nguồn không có cách tính và bằng chứng.
- Đánh dấu `CẦN BỔ SUNG` = chưa có nguồn; người viết Word để trống hoặc hỏi sinh viên, không tự điền.

## 3. Trạng thái module tại SHA cơ sở

Bốn mức tích hợp: **Đã tích hợp** (có trên `develop`, đã kiểm thử) · **Đã kiểm thử trên PR, chưa tích hợp** · **Chỉ có demo** (giao diện dữ liệu giả, nhánh preview) · **Hướng phát triển** (chưa có code).

| Module / phần | Phạm vi theo đề cương | Kết quả đã xác minh | Trạng thái tích hợp | Nguồn | Phần còn thiếu |
|---|---|---|---|---|---|
| **1 — Xác thực & quản lý người dùng** | Đăng nhập/đăng xuất, thông tin cá nhân, đổi mật khẩu, quản lý phiên; admin quản lý tài khoản, khóa/mở khóa, phân quyền | Đăng nhập email + mật khẩu, access 15 phút + refresh 7 ngày (cookie httpOnly, rotation), phiên lưu MongoDB, khóa tài khoản có hiệu lực ở request kế tiếp, hồ sơ + ảnh, đổi mật khẩu, đăng xuất từ xa, quản trị người dùng (tạo, sửa, đổi vai trò, khóa/mở, đặt lại mật khẩu); USER bị chặn trang/API quản trị | **Đã tích hợp** — PR #1 (merge 27/10/2026) | [module-1-auth.md](../design/module-1-auth.md); [access-control.md mục 2](../design/access-control.md#2-ma-trận-vai-trò--màn-hình--thao-tác--dữ-liệu--khi-thiếu-quyền) (kiểm tra @ `06a5a83`) | Unit test Module 1 (repo chưa có); bắt đổi mật khẩu lần đầu (để sau) |
| 1 — Ảnh đại diện chỉ chính chủ xem được | (Bảo mật dữ liệu cá nhân — chính sách CS-4) | Ảnh trả `401` khi chưa đăng nhập, `404` với người khác; admin DTO bỏ `avatarUrl` | **Đã kiểm thử trên PR, chưa tích hợp** — PR #3 @ `d60864a`, TL review đạt | [SE-002](../tasks/SE-002-avatar-requires-login.md) | Tích hợp 23/11 + xác minh trên `develop` |
| **2 — Trợ lý hội thoại (AI Chat)** | Tạo/quản lý hội thoại (đổi tên, xóa), gửi/nhận tin nhắn, streaming, lưu lịch sử | Gửi tin → phản hồi hiện dần qua SSE, Dừng (lưu phần đã sinh `STOPPED`), Tạo lại, đổi tên, xóa, tìm kiếm, mở lại hội thoại; hội thoại người khác → `404`; giới hạn 20 tin/phút/người. **Nội dung trả lời là văn bản mẫu** (`MockLlmProvider`) | **Đã tích hợp** — PR #2 / SE-001, merge `fbffd5b` (15/11/2026) | [module-2-chat.md](../design/module-2-chat.md); [SE-001](../tasks/SE-001-chat-integration.md#lịch-sử-review) | Unit test luồng Chat trên `develop` (chưa có) |
| 2 — Trả lời bằng OpenAI thật | LLM qua API hoặc Ollama (đề cương — công nghệ) | Provider OpenAI Responses API (`gpt-5.4-mini`), `mock` vẫn mặc định; ba kết thúc Hoàn tất / Bị cắt (1.000 token) / Đã dừng giữ đúng nhãn sau khi mở lại; Dừng đóng kết nối tới provider (test server giả lập); 12 unit test | **Đã kiểm thử trên PR, chưa tích hợp** — PR #4 @ `e1fda76`, TL review đạt, khách hàng xác nhận đạt kỹ thuật 15/11 | SE-007 trên PR #4: [`docs/tasks/SE-007-openai-provider.md` @ `e1fda76`](https://github.com/duong2604/cat_gpt/blob/e1fda76/docs/tasks/SE-007-openai-provider.md) | Tích hợp 24/11 (sau PR #3) + xác minh trên `develop`; Ollama/chạy nội bộ: chưa làm |
| **3 — Quản lý tài liệu** | Tải lên/xuống, metadata, tìm kiếm, xóa, trạng thái; pipeline bất đồng bộ bóc tách → chunking → embedding → vector DB | `develop`: chỉ trang "Đang phát triển". Preview: giao diện với dữ liệu nằm trong trình duyệt, không gửi tệp lên máy chủ | **Chỉ có demo** (preview `b2a4b22`) | [preview-progress-review.md mục 3.3](../project/preview-progress-review.md#33-module-3--quản-lý-tài-liệu-hình-79) | Toàn bộ backend; Function Spec + Basic Design Module 3 |
| **4 — Khai thác tài liệu bằng AI (RAG)** | Tóm tắt, hỏi–đáp kèm trích dẫn, tối ưu tiếng Việt | Preview: câu trả lời chọn theo từ khóa trên dữ liệu mẫu, trích nguồn có thể sai | **Chỉ có demo** (preview `b2a4b22`) | [preview-progress-review.md mục 3.4](../project/preview-progress-review.md#34-module-4--khai-thác-tài-liệu-bằng-ai-hình-1014) | Embedding, vector DB, truy hồi, LLM, khung đánh giá |
| Đánh giá RAG tiếng Việt; Docker/Nginx | Khung đánh giá, so sánh embedding; đóng gói Docker | Chưa có | **Hướng phát triển** | [đề cương — 01 mục 3](01-outline-and-sources.md#3-phạm-vi) | Toàn bộ |
| **5 — Dịch tài liệu** (mở rộng) | Dịch đa ngôn ngữ, giữ định dạng | Chưa có | **Hướng phát triển** (ngoài cam kết) | Đề cương | — |

Báo cáo 27/10/2026 ghi Module 3–4 "Hoàn thành 80%"; audit 15/11 không tìm thấy cách tính hay code phía máy chủ cho mức này ([audit mục 2](../project/preview-progress-review.md#2-bảng-đối-chiếu-tiến-độ)). Báo cáo đồ án **không dùng** con số này.

## 4. Ánh xạ chương → nguồn

Bố cục tạm thời, chờ chốt ([01 mục 5](01-outline-and-sources.md#5-đề-xuất-bố-cục-chương)).

| Chương (đề xuất) | Nguồn chính trong bộ | Nguồn gốc để kiểm chứng |
|---|---|---|
| Mở đầu | [01 mục 1–4](01-outline-and-sources.md) | Đề cương (ngoài repo) |
| Chương 1 — Tổng quan và cơ sở lý thuyết | [01 mục 7](01-outline-and-sources.md#7-tài-liệu-tham-khảo-đề-xuất) | Tài liệu tham khảo ngoài; `CẦN BỔ SUNG` phần khảo sát của sinh viên |
| Chương 2 — Phân tích yêu cầu và thiết kế | [02](02-requirements-and-design.md) | [module-1-auth.md](../design/module-1-auth.md), [module-2-chat.md](../design/module-2-chat.md), [access-control.md](../design/access-control.md), [overview-and-decisions.md mục 3](../project/overview-and-decisions.md#3-quyết-định-kiến-trúc-chung-23102026) |
| Chương 3 — Hiện thực hệ thống | `03-implementation.md` (SE-008) | Code tại SHA cơ sở; PR #1–#4 |
| Chương 4 — Kiểm thử và đánh giá | [04](04-validation-and-results.md) | Hồ sơ SE-001, SE-002, SE-007, TL-003; `evidence/` (SE-008) |
| Kết luận và kiến nghị | [04 mục 5–6](04-validation-and-results.md#5-hạn-chế) + mục 3 ở trên | — |
| Phụ lục | Hướng dẫn cài đặt: [README.md gốc](../../README.md#chạy-dự-án) | — |

## 5. Phần còn thiếu

| # | Thiếu | Ảnh hưởng chương | Ai xử lý | Khi nào |
|---|---|---|---|---|
| G1 | `03-implementation.md`, bảng ca kiểm thử, ảnh ổn định trong repo | 3, 4 | Senior Dev ([SE-008](../tasks/SE-008-thesis-implementation-evidence.md)) | Bàn giao 18/11 |
| G2 | Xác nhận bản đề cương đã duyệt (T1) và bố cục chương (T2) | Mở đầu, toàn bộ | Khách hàng + CTO | Chờ chốt |
| G3 | Trạng thái SE-002, SE-007 trên `develop` | 2, 3, 4 | TL (merge PR #3 → PR #4, xác minh) | 23–24/11; cập nhật bộ nguồn 25/11 |
| G4 | Nội dung khảo sát/nghiên cứu (LLM, RAG, embedding, vector DB) — báo cáo 27/10 ghi "Hoàn thành" nhưng không có tài liệu trong repo | 1 | Sinh viên cung cấp | `CẦN BỔ SUNG` |
| G5 | Module 3–4 chưa có hiện thực; khung đánh giá RAG, Docker chưa có | 3, 4, Kết luận | Theo plan sau demo (khách hàng + CTO chốt) | Chưa có lịch |
| G6 | Số liệu tải (500 nhân sự, tiêu chí R-1…R-10) chưa đo | 4 | [SE-005](../tasks/SE-005-login-limit-shared-ip.md) và task sau | Dự kiến 27/11 trở đi |
| G7 | Unit test: `develop` chưa có file `*.spec.ts`; 12 test của SE-007 nằm trên PR #4 | 4 | Tích hợp PR #4; test Module 1–2 là việc sau | 24/11 (SE-007) |
| G8 | Lời cảm ơn, thông tin bìa (lớp, khóa, năm), danh mục viết tắt | Phần đầu | Sinh viên | `CẦN BỔ SUNG` |
| G9 | Sơ đồ phải vẽ bằng phần mềm thiết kế và nộp kèm file nguồn (quy định Khoa) — bộ nguồn có sơ đồ Mermaid, cần xuất/vẽ lại | 2 | Sinh viên khi làm Word | Khi làm Word |
