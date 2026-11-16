# Bộ tài liệu nguồn cho báo cáo đồ án

Điểm vào cho người (hoặc AI) viết báo cáo đồ án tốt nghiệp bằng Word. Bộ này **chỉ là nguồn**: nội dung đã đối chiếu với code, PR và hồ sơ kiểm thử, kèm đường dẫn để kiểm chứng. File Word do sinh viên tạo sau.

Trạng thái bộ nguồn: **Vòng 4 — Chờ Review** (16/11/2026): SE-002 (PR #3) và SE-007 (PR #4) đã tích hợp và TL xác minh trên `develop` @ `d6832e0` — [TL-004 checklist vòng 4](../tasks/TL-004-thesis-source-pack.md#checklist-vòng-4). Vòng 3 — khách hàng duyệt (15/11/2026) tại `develop` @ SHA ghi trong [TL-004 checklist vòng 3](../tasks/TL-004-thesis-source-pack.md#checklist-vòng-3); đủ nguồn cho cả 4 chương (Chương 3 + bằng chứng từ SE-008). Vòng 1 CTO duyệt (`2f003a0`); vòng 2 (`71e1263`) đọc hai file khách hàng chỉ định. Còn chờ: ảnh chụp lại trên `develop` (B13); chế độ `demo`/`staff` khi SE-003 (PR #6) tích hợp. Đề cương: bản khách hàng chỉ định 15/11/2026 (file sửa 30/09/2026) — căn cứ phê duyệt chưa có (B1).

## 1. Phiên bản cơ sở

| Mục | Giá trị |
|---|---|
| Ngày chốt nguồn | 16/11/2026 (giờ VN) — vòng 4 |
| `origin/develop` | code ứng dụng `d6832e0` (merge PR #4 / SE-007, sau merge PR #3 / SE-002 `1674425`, 16/11/2026); các commit sau đó chỉ đổi tài liệu. Vòng 3 dùng `8732458` (code `fbffd5b`) |
| Bản demo 20/11/2026 | `34b465d` (code `fbffd5b`), chạy local trên máy trình chiếu — không đổi |
| Đã tích hợp 16/11/2026 (sớm, theo yêu cầu khách hàng) | PR #3 / SE-002 @ `d60864a` → merge `1674425`; PR #4 / SE-007 @ `e1fda76` → merge `d6832e0` |
| PR mở | PR #6 / SE-003 (chế độ `demo`/`staff`) — chưa tích hợp, chưa đưa vào bộ nguồn |
| Nhánh demo Module 3–4 | `origin/preview/module-2-4-demo` @ `b2a4b22` — giao diện dữ liệu giả, không tính là hiện thực |

Khi `develop` thay đổi, cập nhật bảng này và mục 3 trước khi dùng bộ nguồn.

## 2. Thứ tự đọc

1. **README này** — phiên bản, trạng thái module, phần còn thiếu.
2. [01-outline-and-sources.md](01-outline-and-sources.md) — đề tài, mục tiêu, phạm vi, bố cục chương, **nguồn và quy định áp dụng cho từng chương**, tài liệu tham khảo, quy định trình bày Q1–Q15 (có số trang PDF).
   - Bản chép nguồn gốc: [sources/](sources/README.md) — [đề cương](sources/de-cuong-datn.md), [quy định trình bày](sources/quy-dinh-trinh-bay-datn.md) (đã lược thông tin cá nhân; bản gốc chỉ trên máy).
3. [02-requirements-and-design.md](02-requirements-and-design.md) — bài toán, yêu cầu, tác nhân, phân quyền, kiến trúc, dữ liệu, API, luồng.
4. [03-implementation.md](03-implementation.md) — hiện thực Module 1–2 (Senior Dev, [SE-008](../tasks/SE-008-thesis-implementation-evidence.md), TL review đạt, merge `8732458`); bằng chứng: [evidence/test-cases.md](evidence/test-cases.md), ảnh trong [images/](images/).
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
| 1 — Ảnh đại diện chỉ chính chủ xem được | (Bảo mật dữ liệu cá nhân — chính sách CS-4) | Ảnh trả `401` khi chưa đăng nhập, `404` với người khác; admin DTO bỏ `avatarUrl` | **Đã tích hợp** — PR #3 @ `d60864a`, merge `1674425` (16/11/2026); TL xác minh trên `develop` @ `d6832e0` | [SE-002](../tasks/SE-002-avatar-requires-login.md); [báo cáo ngày 16/11 vòng 3](../reports/daily/2026-11-16.md#vòng-3--0058) | Ảnh chụp lại trên `develop` (B13) |
| **2 — Trợ lý hội thoại (AI Chat)** | Tạo/quản lý hội thoại (đổi tên, xóa), gửi/nhận tin nhắn, streaming, lưu lịch sử | Gửi tin → phản hồi hiện dần qua SSE, Dừng (lưu phần đã sinh `STOPPED`), Tạo lại, đổi tên, xóa, tìm kiếm, mở lại hội thoại; hội thoại người khác → `404`; giới hạn 20 tin/phút/người. **Nội dung trả lời là văn bản mẫu** (`MockLlmProvider`) | **Đã tích hợp** — PR #2 / SE-001, merge `fbffd5b` (15/11/2026) | [module-2-chat.md](../design/module-2-chat.md); [SE-001](../tasks/SE-001-chat-integration.md#lịch-sử-review) | Unit test luồng Chat trên `develop` (chưa có) |
| 2 — Trả lời bằng OpenAI thật | LLM qua API hoặc Ollama (đề cương — công nghệ) | Provider OpenAI Responses API (`gpt-5.4-mini`), `mock` vẫn mặc định; ba kết thúc Hoàn tất / Bị cắt (1.000 token) / Đã dừng giữ đúng nhãn sau khi mở lại; Dừng đóng kết nối tới provider (test server giả lập); 12 unit test | **Đã tích hợp** — PR #4 @ `e1fda76`, merge `d6832e0` (16/11/2026); TL xác minh trên `develop` (mock; OpenAI thật đã thử ở vòng review trên cùng code) | [SE-007](../tasks/SE-007-openai-provider.md#lịch-sử-review); [báo cáo ngày 16/11 vòng 3](../reports/daily/2026-11-16.md#vòng-3--0058) | Ảnh chụp lại (B13); Ollama/chạy nội bộ: chưa làm |
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
| Chương 1 — Tổng quan và cơ sở lý thuyết | [01 mục 7](01-outline-and-sources.md#7-tài-liệu-tham-khảo-đề-xuất) (R1–R35, theo mục 1.2–1.5) | Bài báo, RFC, tài liệu chính thức; `CẦN BỔ SUNG` khảo sát cá nhân S1–S5 |
| Chương 2 — Phân tích yêu cầu và thiết kế | [02](02-requirements-and-design.md) | [module-1-auth.md](../design/module-1-auth.md), [module-2-chat.md](../design/module-2-chat.md), [access-control.md](../design/access-control.md), [overview-and-decisions.md mục 3](../project/overview-and-decisions.md#3-quyết-định-kiến-trúc-chung-23102026) |
| Chương 3 — Hiện thực hệ thống | [03](03-implementation.md) (gồm sơ đồ D9) | Code tại SHA cơ sở; PR #1–#4 |
| Chương 4 — Kiểm thử và đánh giá | [04](04-validation-and-results.md) | Hồ sơ SE-001, SE-002, SE-007, TL-003; `evidence/` (SE-008) |
| Kết luận và kiến nghị | [04 mục 5–6](04-validation-and-results.md#5-hạn-chế) + mục 3 ở trên | — |
| Phụ lục | Hướng dẫn cài đặt: [README.md gốc](../../README.md#chạy-dự-án) | — |

## 5. Phần còn thiếu

| # | Thiếu | Ảnh hưởng chương | Ai xử lý | Khi nào |
|---|---|---|---|---|
| G1 | ~~`03-implementation.md`, bảng ca kiểm thử, ảnh ổn định trong repo~~ — **xong** 15/11 (SE-008 `Done`, merge `8732458`) | 3, 4 | Senior Dev | Xong |
| G2 | Căn cứ phê duyệt đề cương: file chỉ định (30/09/2026) có 4 ô ký trống | Mở đầu | Sinh viên | `CẦN BỔ SUNG` — mục 6 |
| G3 | ~~Trạng thái SE-002, SE-007 trên `develop`~~ — **xong** 16/11 (merge `1674425`, `d6832e0`; bộ nguồn vòng 4) | 2, 3, 4 | TL | Xong |
| G4 | Khảo sát cá nhân S1–S5 (hiện trạng, so sánh giải pháp, tiêu chí chọn công nghệ/LLM, so sánh embedding). Nguồn lý thuyết R1–R35 đã có | 1 | Sinh viên cung cấp | `CẦN BỔ SUNG` — [01 mục 7.5](01-outline-and-sources.md#75-khảo-sát-cá-nhân--sinh-viên-cần-bổ-sung) |
| G5 | Module 3–4 chưa có hiện thực; khung đánh giá RAG, Docker chưa có | 3, 4, Kết luận | Theo plan sau demo (khách hàng + CTO chốt) | Chưa có lịch |
| G6 | Số liệu tải (500 nhân sự, tiêu chí R-1…R-10) chưa đo | 4 | [SE-005](../tasks/SE-005-login-limit-shared-ip.md) và task sau | Dự kiến 27/11 trở đi |
| G7 | Unit test: `develop` có 12 test của SE-007 (`openai-llm.provider.spec.ts`, 12/12 đạt @ `d6832e0`); Module 1–2 chưa có unit test | 4 | Test Module 1–2 là việc sau | Chưa có lịch |
| G8 | Lời cảm ơn; năm trên bìa; danh mục viết tắt (lập từ báo cáo) | Phần đầu | Sinh viên | `CẦN BỔ SUNG` — mục 6 |
| G9 | Sơ đồ phải vẽ bằng phần mềm thiết kế và nộp kèm file nguồn (quy định Khoa): D1–D4 có Mermaid cần xuất/vẽ lại; D5–D10 cần vẽ mới (gồm use case tổng quát) | 2, 3 | Sinh viên khi làm Word (TL cung cấp nội dung) | [02 mục 9](02-requirements-and-design.md#9-sơ-đồ-file-nguồn-hiện-có-và-việc-cần-xuất--vẽ-lại) |

## 6. Danh sách `CẦN BỔ SUNG` cho người viết Word

Người (hoặc AI) viết Word **để chỗ trống** đúng dạng `[CẦN BỔ SUNG: <mã> — <nội dung>]` tại vị trí ghi dưới đây; không tự viết thay.

| Mã | Vị trí trong báo cáo | Nội dung cần cung cấp | Người phụ trách | Khi nào |
|---|---|---|---|---|
| B1 | Mở đầu (căn cứ đề tài) | Căn cứ phê duyệt đề cương: bản có chữ ký hoặc xác nhận của GVHD/Khoa (file chỉ định để trống ô ký) | Sinh viên | Trước khi viết Word |
| B2 | Lời cảm ơn | Toàn bộ nội dung | Sinh viên | Khi viết Word |
| B3 | Bìa, bìa phụ | Năm ghi trên bìa ("Hà Nội – 20.."); các trường khác đã có ở [01 mục 1](01-outline-and-sources.md#1-đề-tài) | Sinh viên | Khi viết Word |
| B4 | Mở đầu, 1.1 | S1 hiện trạng tra cứu tài liệu; S2 so sánh giải pháp sẵn có | Sinh viên | Trước khi viết Chương 1 |
| B5 | 1.4, 1.2 | S3 tiêu chí chọn công nghệ (khảo sát 21–26/09); S4 tiêu chí chọn LLM | Sinh viên | Trước khi viết Chương 1 |
| B6 | 1.3, Kết luận | S5 so sánh embedding tiếng Việt — chỉ viết như kế hoạch (chưa có thực nghiệm) | Sinh viên (sau Module 4) | Hướng phát triển |
| B7 | Chương 2 — hình thiết kế | Vẽ/xuất D1–D10 bằng phần mềm thiết kế và nộp file nguồn trên CD (Q12) | Sinh viên (TL cung cấp nội dung Mermaid) | Khi viết Word |
| B8 | Chương 3 | ~~Nội dung hiện thực Module 1–2~~ — **xong**: [03](03-implementation.md) | Senior Dev — SE-008 | Xong 15/11 |
| B9 | Chương 4 — ca kiểm thử, hình | ~~Bảng ca kiểm thử + ảnh~~ — **xong**: [04 mục 3–4](04-validation-and-results.md#3-kết-quả-kiểm-thử) | Senior Dev — SE-008; TL tổng hợp | Xong 15/11 |
| B10 | ~~Chương 2–4 — trạng thái SE-002, SE-007~~ | **Xong** 16/11 — đã đổi sang "đã tích hợp" kèm SHA merge (vòng 4) | TL | Xong |
| B11 | Chương 4 — số liệu tải, unit test Module 1–2 | Chưa có số liệu; không viết số | TL / Senior Dev (SE-005 và task sau) | Chưa có lịch |
| B12 | Danh mục viết tắt | Lập từ thuật ngữ thực dùng trong báo cáo (Q13) | Người viết Word | Khi viết Word |
| B13 | Chương 4 — hình | Chụp lại ≥ 1280 px trên `develop` sau tích hợp: ảnh đại diện chính chủ (PR #3), Chat stream OpenAI, nhãn "bị cắt", nhãn "Đã dừng"; mobile 375 px nếu cần. Đến lúc đó H1-07, H1-08, H2-05 dùng tạm, H2-04 không dùng | TL | Chờ máy đủ bộ nhớ chạy web + API; trước 25/11/2026 |
