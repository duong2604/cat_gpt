# Quyết định

Các quyết định dưới đây do **Project Owner (sinh viên) phê duyệt** thông qua cố vấn ChatGPT, không phải do Thesis Agent tự đưa ra. Nguồn: Master Instruction V1.0 (mục 16.5), Amendment V1.1 và chỉ thị "Resume TH-001 — Project Owner Authorization" (24/11/2026). Toàn văn Amendment V1.1 không được gửi vào phiên TH-001; các nội dung V1.1 dưới đây lấy từ chỉ thị Resume và bản ghi bàn giao trong repo.

## Quyết định đã phê duyệt

| ID | Quyết định | Nguồn | Ngày |
|---|---|---|---|
| DEC-001 | Báo cáo gồm bốn chương theo [outline.md](outline.md) | V1.0 | 24/11/2026 |
| DEC-002 | Dung lượng mục tiêu 75 trang, phạm vi 60–80 trang (chưa tính phụ lục) | V1.0 | 24/11/2026 |
| DEC-003 | Tài liệu quản lý tại **`docs/thesis-report/`** — *sửa đổi V1.1, thay `docs/thesis/` trong V1.0 để không chạm bộ nguồn TL-004* | V1.0 → V1.1 | 24/11/2026 |
| DEC-004 | Kế hoạch 6 giai đoạn, 24 nhiệm vụ ([plan.md](plan.md)) | V1.0 | 24/11/2026 |
| DEC-005 | Một file Word chính thức duy nhất tại local: `D:\workspace\CAT_GPT_Thesis\CAT_GPT_DATN.docx`; không sinh lại từ Markdown, không tách file theo chương | V1.0 | 24/11/2026 |
| DEC-006 | Ưu tiên Microsoft Word COM Automation (Python/pywin32 hoặc PowerShell) | V1.0 | 24/11/2026 |
| DEC-007 | Human Edit Protection bắt buộc ([workflow mục 5](workflow.md#5-human-edit-protection)) | V1.0 | 24/11/2026 |
| DEC-008 | Review Gate bắt buộc sau mỗi task ([workflow mục 2](workflow.md#2-review-gate)) | V1.0 | 24/11/2026 |
| DEC-009 | Workflow TH không tự ý thay đổi mã nguồn ứng dụng | V1.0 | 24/11/2026 |
| DEC-010 | Trích dẫn theo IEEE dạng số — quy ước dự án, không phải quy định của trường | V1.0 | 24/11/2026 |
| DEC-011 | Bàn giao TH-001 bằng **nhánh riêng + PR vào `develop`**, không tự merge — *sửa đổi V1.1, thay "push trực tiếp lên develop" trong V1.0* | V1.0 → V1.1 | 24/11/2026 |
| DEC-012 | Phiên TH-001 chỉ thực hiện TH-001 | V1.0 | 24/11/2026 |
| DEC-013 | Chuyển giao từ workflow TL: TL-004 bàn giao bộ nguồn (giữ `Chờ Review`), TL-005 `CANCELLED — Superseded by Thesis Roadmap V1.1`; `docs/thesis/` giữ nguyên, workflow TH chỉ đọc | PR #56, merge `e8cefed` | 24/11/2026 |
| DEC-014 | Source Baseline Lock: Handover `c34410b` · Audit = SHA `origin/develop` khi bắt đầu TH-002 · Report = sau khi TH-002 `APPROVED` ([workflow mục 6](workflow.md#6-source-baseline-lock)) | V1.1 | 24/11/2026 |
| DEC-015 | Outline V1.0 thay bố cục 4 chương ngày 15/11/2026 về định hướng soạn thảo; không mở rộng phạm vi phát triển phần mềm | Bản ghi bàn giao TL-004 (D3) | 24/11/2026 |

## Đề xuất chưa phê duyệt

| ID | Đề xuất | Trạng thái | Quyết định tại |
|---|---|---|---|
| PROP-001 | File nguồn sơ đồ (dạng văn bản: `.puml`, `.mmd`, `.drawio`) lưu trong `docs/thesis-report/diagrams/` để có lịch sử và review; ảnh xuất lưu `D:\workspace\CAT_GPT_Thesis\diagrams\` | PROPOSED | Trước TH-009 |
| PROP-002 | Báo cáo audit TH-002 lưu tại `docs/thesis-report/audit/TH-002-audit.md` | PROPOSED | Khi giao TH-002 |

## Vấn đề còn mở

| ID | Vấn đề | Ảnh hưởng | Trạng thái | Xử lý tại |
|---|---|---|---|---|
| OPEN-001 | Phê duyệt đề cương của GVHD: ô ký trong file baseline còn trống | Mở đầu, bìa, phạm vi | PENDING_CONFIRMATION | Sinh viên cung cấp căn cứ; trước TH-004 |
| OPEN-002 | Máy có 3 file đề cương; bản ghi bàn giao chọn `…_Decuong DATN.docx` làm baseline — cần sinh viên xác nhận | Mở đầu, phạm vi | PENDING_CONFIRMATION | TH-002 |
| OPEN-003 | Nội dung sinh viên tự cung cấp: lời cảm ơn, năm trên bìa, khảo sát thực trạng/so sánh giải pháp (S1–S5 trong bộ nguồn) | TH-004, TH-005 | PENDING | Trước task tương ứng |
| OPEN-004 | Định dạng chưa có trong quy định: đánh số trang phần đầu, chi tiết bìa, style caption, bảng, đoạn mã | Toàn báo cáo | PENDING | TH-003 |
| OPEN-005 | Ngày nộp báo cáo và lịch mốc M1–M6 | Lập lịch | PENDING | Project Owner |
| OPEN-006 | Mục 3.6 (đóng gói/triển khai) và 4.4 (thực nghiệm RAG, so sánh embedding) phụ thuộc hiện thực thực tế; nếu TH-002 cho thấy `NOT_IMPLEMENTED` thì cần quyết định cách viết | Ch.3, Ch.4 | PENDING | Sau TH-002 |
| OPEN-007 | Q12 — công cụ vẽ sơ đồ: CTO đã chấp nhận Mermaid cho bản nháp (17/11); cần biết GVHD có yêu cầu công cụ cụ thể không | Ch.2, Ch.3 | PENDING | Trước TH-009 |
