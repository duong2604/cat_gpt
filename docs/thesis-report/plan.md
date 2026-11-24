# Kế hoạch tổng thể — Thesis Roadmap V1.1

## 1. Mục tiêu

Hoàn thành báo cáo đồ án tốt nghiệp CAT_GPT bằng tiếng Việt, đúng quy định trình bày của Khoa CNTT — Trường ĐH Giao thông Vận tải, 60–80 trang (mục tiêu 75, chưa tính phụ lục), nội dung kỹ thuật trung thực và có minh chứng.

Ưu tiên: nội dung chính xác → văn phong học thuật tự nhiên → minh chứng có thật → sơ đồ khớp hệ thống → trích dẫn kiểm chứng được → chỉnh sửa trực tiếp được trong Word → review từng phần.

Tài liệu quản lý chỉ là công cụ; không mở rộng thủ tục hay task ngoài roadmap này.

## 2. Phạm vi đề tài cần đối chiếu

Phạm vi dưới đây là **cam kết theo đề tài**, không phải tuyên bố đã hoàn thành. Trạng thái thực tế từng chức năng do TH-002 xác định bằng nhãn ở [format-standard mục 4](format-standard.md#4-nhãn-trạng-thái-hiện-thực).

| Module | Chức năng |
|---|---|
| 1 — Xác thực và quản lý người dùng | Đăng nhập/đăng xuất; thông tin cá nhân; đổi mật khẩu; quản lý phiên; quản trị tài khoản; phân quyền; khóa/mở khóa |
| 2 — Trợ lý hội thoại AI | Tạo/quản lý hội thoại; gửi/nhận tin nhắn; phản hồi thời gian thực; lưu lịch sử; tích hợp LLM |
| 3 — Quản lý tài liệu | Tải lên/tải xuống/quản lý; metadata và trạng thái xử lý; tìm kiếm, xóa; xử lý bất đồng bộ; trích xuất văn bản, chia đoạn, embedding, lưu vector |
| 4 — Khai thác tài liệu bằng AI | Hỏi đáp theo tài liệu (RAG); trích dẫn nguồn; chọn phạm vi tài liệu; tóm tắt; xử lý khi không đủ thông tin; đánh giá RAG tiếng Việt |
| Ngoài cam kết chính | Module 5 dịch tài liệu; OCR tài liệu ảnh/scan; triển khai quy mô sản xuất lớn |

## 3. Roadmap — 6 giai đoạn, 24 task

Thứ tự mặc định **tuần tự**; không chạy song song trừ khi Project Owner quyết định. Task tương lai chỉ là kế hoạch, chưa phải quyền thực thi.

| Giai đoạn | Task | Kết quả | Trang |
|---|---|---|---|
| 1 — Khởi tạo và chuẩn bị | [TH-001](tasks/TH-001.md) Khởi tạo kế hoạch và workflow · [TH-002](tasks/TH-002.md) Audit mã nguồn và tài liệu · [TH-003](tasks/TH-003.md) Thiết lập Word · [TH-004](tasks/TH-004.md) Phần đầu và Mở đầu | Bộ quản lý; báo cáo hiện trạng + Report Baseline; file Word chuẩn; phần đầu | 9 |
| 2 — Chương 1 | [TH-005](tasks/TH-005.md) 1.1–1.3 · [TH-006](tasks/TH-006.md) 1.4–1.5 · [TH-007](tasks/TH-007.md) 1.6–1.7 | Cơ sở lý thuyết và công nghệ | 12 |
| 3 — Chương 2 | [TH-008](tasks/TH-008.md) 2.1–2.2 · [TH-009](tasks/TH-009.md) 2.3 · [TH-010](tasks/TH-010.md) 2.4 · [TH-011](tasks/TH-011.md) 2.5–2.6 · [TH-012](tasks/TH-012.md) 2.7 · [TH-013](tasks/TH-013.md) 2.8–2.10 | Phân tích và thiết kế, sơ đồ | 22 |
| 4 — Chương 3 | [TH-014](tasks/TH-014.md) 3.1–3.2 · [TH-015](tasks/TH-015.md) 3.3 · [TH-016](tasks/TH-016.md) 3.4 · [TH-017](tasks/TH-017.md) 3.5–3.7 | Hiện thực, ảnh giao diện thật | 18 |
| 5 — Chương 4 | [TH-018](tasks/TH-018.md) 4.1–4.2 · [TH-019](tasks/TH-019.md) 4.3 · [TH-020](tasks/TH-020.md) 4.4 · [TH-021](tasks/TH-021.md) 4.5–4.6 | Kiểm thử, thực nghiệm RAG, đánh giá | 10 |
| 6 — Hoàn thiện | [TH-022](tasks/TH-022.md) Phần cuối · [TH-023](tasks/TH-023.md) Review toàn bộ · [TH-024](tasks/TH-024.md) Nghiệm thu và xuất bản | Kết luận, TLTK, phụ lục; báo cáo hoàn chỉnh; bộ bàn giao | 4 |
| | | **Tổng** | **75** |

Phân bổ trang chi tiết theo mục: [outline.md](outline.md#phân-bổ-trang-theo-task).

## 4. Phụ thuộc

```
TH-001 → TH-002 → TH-003 → TH-004 → TH-005 → … → TH-024   (chuỗi mặc định)
```

Phụ thuộc nội dung quan trọng (ngoài chuỗi):

| Task | Cần kết quả của | Lý do |
|---|---|---|
| TH-004 (Mở đầu, phần "Cấu trúc báo cáo") | TH-002 | Phạm vi thực tế quyết định cách viết mục tiêu và phạm vi |
| TH-007, TH-008 … TH-021 | TH-002 (Report Baseline, nhãn trạng thái) | Mọi mô tả hiện thực/kiểm thử dựa trên baseline đã duyệt |
| TH-004 … TH-022 | TH-003 | Chỉ soạn vào file Word đã chuẩn hóa |
| TH-014 … TH-017 | TH-008 … TH-013 | Chương 3 hiện thực theo thiết kế ở Chương 2 |
| TH-020 | TH-012, TH-017 | Thực nghiệm đánh giá chính pipeline RAG đã mô tả |
| TH-022 | TH-021 | Kết luận tổng hợp đánh giá |
| TH-023 | TH-004 … TH-022 | Review toàn bộ |
| TH-024 | TH-023 | Chỉ xuất bản sau review toàn bộ |

## 5. Mốc

Ngày nộp chưa được ghi nhận ([decisions — OPEN-005](decisions.md#vấn-đề-còn-mở)). Mốc dưới đây là cổng chất lượng, ngày do Project Owner chốt.

| Mốc | Điều kiện đạt |
|---|---|
| M1 — Sẵn sàng viết | TH-001 … TH-003 `APPROVED`: có Report Baseline và file Word chuẩn |
| M2 — Xong lý thuyết | TH-004 … TH-007 `APPROVED` |
| M3 — Xong thiết kế | TH-008 … TH-013 `APPROVED`, file nguồn sơ đồ đầy đủ |
| M4 — Xong hiện thực | TH-014 … TH-017 `APPROVED` |
| M5 — Xong đánh giá | TH-018 … TH-021 `APPROVED` |
| M6 — Bàn giao | TH-022 … TH-024 `APPROVED`: DOCX, PDF, file nguồn sơ đồ |

## 6. Khu vực làm việc

| Nơi | Nội dung | Lên GitHub |
|---|---|---|
| `docs/thesis-report/` (repo) | Tài liệu quản lý, đặc tả task, báo cáo thực hiện, file nguồn sơ đồ (khi task giao) | Có, qua PR |
| `docs/thesis/` (repo) | Bộ nguồn TL-004 — chỉ đọc | Không sửa |
| `D:\workspace\CAT_GPT_Thesis\` (local, tạo ở TH-003) | `CAT_GPT_DATN.docx`, `references\`, `assets\`, `diagrams\`, `backups\`, `exports\`, `scripts\` | **Không** |

## 7. Fast-track V1.2 (24/11/2026)

Thực thi được gộp thành FT-001 → FT-003 trong cùng phiên để có bản Word V0.1 đầy đủ, sau đó Project Owner và ChatGPT review tổng thể (FT-004, chưa cấp quyền). Roadmap 24 task và outline V1.0 giữ nguyên làm checklist phạm vi ([DEC-020](decisions.md#quyết-định-đã-phê-duyệt)). Trạng thái: [progress.md](progress.md#fast-track-v12).
