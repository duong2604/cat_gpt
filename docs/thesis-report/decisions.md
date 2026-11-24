# Quyết định

Các quyết định dưới đây do **Project Owner (sinh viên) phê duyệt** thông qua cố vấn ChatGPT, không phải do Thesis Agent tự đưa ra. Nguồn: Master Instruction V1.0 (mục 16.5), Amendment V1.1, chỉ thị "Resume TH-001 — Project Owner Authorization", "TH-001 — Review vòng 1" và "Thesis Roadmap V1.2 — Fast-track" (24/11/2026). Toàn văn Amendment V1.1 không được gửi vào phiên TH-001; nội dung V1.1 lấy từ các chỉ thị trên và bản ghi bàn giao trong repo.

Quyết định mới chỉ được thêm khi Project Owner xác nhận rõ ràng; đề xuất chưa duyệt ghi `PROPOSED`, vấn đề chờ ghi `PENDING`.

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
| DEC-008 | Review Gate bắt buộc sau mỗi task; chỉ Project Owner quyết định `APPROVED` ([workflow mục 2](workflow.md#2-review-gate)) | V1.0 | 24/11/2026 |
| DEC-009 | Workflow TH không tự ý thay đổi mã nguồn ứng dụng | V1.0 | 24/11/2026 |
| DEC-010 | Trích dẫn theo IEEE dạng số — quy ước dự án, không phải quy định của trường | V1.0 | 24/11/2026 |
| DEC-011 | Bàn giao bằng **nhánh riêng + PR vào `develop`**, Thesis Agent không tự merge — *sửa đổi V1.1, thay "push trực tiếp lên develop" trong V1.0* | V1.0 → V1.1 | 24/11/2026 |
| DEC-012 | Phiên TH-001 chỉ thực hiện TH-001 | V1.0 | 24/11/2026 |
| DEC-013 | Tái sử dụng bộ nguồn TL-004 ([docs/thesis/](../thesis/README.md), Handover Baseline `c34410b`) làm đầu vào; workflow TH chỉ đọc, không sửa; nội dung được kiểm chứng tại TH-002 trước khi dùng | Chuyển giao PR #56 (merge `e8cefed`) | 24/11/2026 |
| DEC-014 | Trách nhiệm dựng Word chuyển từ TL-005 (`CANCELLED — Superseded by Thesis Roadmap V1.1`) sang workflow TH (TH-003 trở đi); không còn luồng Word song song | Chuyển giao PR #56 | 24/11/2026 |
| DEC-015 | Outline V1.0 thay thế bố cục 4 chương ngày 15/11/2026 về định hướng soạn thảo; bản cũ giữ làm tham khảo; không mở rộng phạm vi phát triển phần mềm | V1.1; bản ghi bàn giao TL-004 | 24/11/2026 |
| DEC-016 | Baseline đề cương: file đề cương ĐATN `.docx` tại `D:\workspace\` — [SRC-002](source-register.md#1-nguồn-đầu-vào). Chọn file: `CONFIRMED_BY_PROJECT_OWNER`; phê duyệt GVHD: `PENDING_CONFIRMATION` ([OPEN-001](#vấn-đề-còn-mở)); nội dung: `AVAILABLE_UNVERIFIED`. Không dùng hai bản đề cương khác trên máy | Review vòng 1 (CR-002) | 24/11/2026 |
| DEC-017 | Source Baseline Lock: Handover `c34410b` · Audit = SHA đầy đủ `origin/develop` khi bắt đầu TH-002 · Report = sau khi TH-002 `APPROVED` ([workflow mục 6](workflow.md#6-source-baseline-lock)) | V1.1 | 24/11/2026 |
| DEC-018 | File nguồn sơ đồ (dạng văn bản/chỉnh sửa được) lưu trong `docs/thesis-report/diagrams/`; ảnh xuất và tài liệu Word lưu local (`D:\workspace\CAT_GPT_Thesis\`). Thư mục chỉ tạo khi task có sơ đồ được cấp quyền | Review vòng 1 (CR-005, từ PROP-001) | 24/11/2026 |
| DEC-019 | Báo cáo audit TH-002 lưu tại `docs/thesis-report/audit/TH-002-audit.md`; chỉ tạo khi thực hiện TH-002 | Review vòng 1 (CR-005, từ PROP-002) | 24/11/2026 |
| DEC-020 | Fast-track V1.2: gộp thực thi thành FT-001 (chuẩn bị, nguồn, Word), FT-002 (soạn toàn bộ), FT-003 (kiểm tra, bàn giao V0.1), FT-004 (review sau khi đọc — chưa cấp quyền). Thay quy định thực thi tuần tự và STOP sau từng task; giữ nguyên trung thực học thuật, phạm vi, định dạng, Human Edit Protection, Git, bảo mật. 24 task TH giữ làm checklist phạm vi và tiêu chí | Chỉ thị Fast-track V1.2 | 24/11/2026 |
| DEC-021 | V0.1 dùng Audit Baseline `e8cefed` làm baseline kỹ thuật tạm thời, chưa nghiệm thu; Report Baseline chính thức xác nhận ở FT-004 | Chỉ thị Fast-track V1.2 | 24/11/2026 |

## Đề xuất chưa phê duyệt

Hiện không có. (PROP-001 → DEC-018, PROP-002 → DEC-019.)

## Vấn đề còn mở

| ID | Vấn đề | Ảnh hưởng | Trạng thái | Xử lý tại |
|---|---|---|---|---|
| OPEN-001 | Phê duyệt đề cương của GVHD: ô ký trong file baseline còn trống | Mở đầu, bìa, phạm vi | PENDING_CONFIRMATION | Sinh viên cung cấp căn cứ; trước TH-004 |
| OPEN-002 | Chọn file đề cương baseline trong 3 file trên máy | — | **CLOSED** 24/11/2026 — đã xác định file baseline ([DEC-016](#quyết-định-đã-phê-duyệt)) | — |
| OPEN-003 | Nội dung sinh viên tự cung cấp: lời cảm ơn, năm trên bìa, khảo sát thực trạng/so sánh giải pháp (S1–S5 trong bộ nguồn) | TH-004, TH-005 | PENDING | Trước task tương ứng |
| OPEN-004 | Định dạng chưa có trong quy định: đánh số trang phần đầu, chi tiết bìa, style caption, bảng, đoạn mã | Toàn báo cáo | PENDING | TH-003 |
| OPEN-005 | Ngày nộp báo cáo và lịch mốc M1–M6 | Lập lịch | PENDING | Project Owner |
| OPEN-006 | Mục 3.6 (đóng gói/triển khai) và 4.4 (thực nghiệm RAG, so sánh embedding) phụ thuộc hiện thực thực tế; nếu TH-002 cho thấy `NOT_IMPLEMENTED` thì cần quyết định cách viết | Ch.3, Ch.4 | PENDING | Sau TH-002 |
| OPEN-007 | Công cụ vẽ sơ đồ chính thức (Q12): V0.1 dùng PlantUML (nguồn `diagrams/*.puml`); cần chốt công cụ và xác nhận GVHD có yêu cầu riêng không | Ch.2, Ch.3 | PENDING | FT-004 |
